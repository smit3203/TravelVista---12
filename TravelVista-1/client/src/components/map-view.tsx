import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Hotel } from "@shared/schema";

// Fix Leaflet's default icon path resolving bugs in bundlers like Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapViewProps {
  hotels: Hotel[];
  activeLocation?: string;
}

// Coordinates map for destinations in seed data
const COORDINATES_MAP: Record<string, [number, number]> = {
  bali: [-8.4095, 115.1889],
  indonesia: [-8.4095, 115.1889],
  paris: [48.8566, 2.3522],
  france: [48.8566, 2.3522],
  tokyo: [35.6762, 139.6503],
  japan: [35.6762, 139.6503],
};

const MapView = ({ hotels, activeLocation }: MapViewProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);

  // Get coordinates based on active location string (case-insensitive)
  const getMapCenter = (): { center: [number, number]; zoom: number } => {
    if (activeLocation) {
      const locLower = activeLocation.toLowerCase();
      for (const [key, coords] of Object.entries(COORDINATES_MAP)) {
        if (locLower.includes(key)) {
          return { center: coords, zoom: 11 };
        }
      }
    }
    
    // Default to a balanced world view centering on Europe/Asia transition
    return { center: [20, 30], zoom: 2 };
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const { center, zoom } = getMapCenter();

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      scrollWheelZoom: true,
      zoomControl: true,
    });

    // Load OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Create a group layer for markers to easily clear/rebuild them
    const markerGroup = L.layerGroup().addTo(map);

    mapRef.current = map;
    markerGroupRef.current = markerGroup;

    return () => {
      map.remove();
      mapRef.current = null;
      markerGroupRef.current = null;
    };
  }, []);

  // Update map viewport and markers when hotels list or location filter changes
  useEffect(() => {
    const map = mapRef.current;
    const markerGroup = markerGroupRef.current;
    if (!map || !markerGroup) return;

    // Clear previous markers
    markerGroup.clearLayers();

    if (hotels.length === 0) return;

    const bounds: L.LatLngTuple[] = [];

    // Add markers for each hotel
    hotels.forEach((hotel) => {
      let hotelCoords: [number, number] = [0, 0];
      const locationLower = hotel.location.toLowerCase();

      // Resolve coordinates based on hotel location text
      let found = false;
      for (const [key, coords] of Object.entries(COORDINATES_MAP)) {
        if (locationLower.includes(key)) {
          // Add minor jitter so multiple markers in the same city don't stack directly on top of each other
          const jitterLat = (Math.random() - 0.5) * 0.05;
          const jitterLng = (Math.random() - 0.5) * 0.05;
          hotelCoords = [coords[0] + jitterLat, coords[1] + jitterLng];
          found = true;
          break;
        }
      }

      if (!found) return;

      bounds.push(hotelCoords);

      // Create Popup Content with HTML styling
      const popupContent = `
        <div style="font-family: Arial, sans-serif; padding: 4px; min-width: 150px;">
          <h4 style="margin: 0 0 4px 0; font-weight: bold; color: #111827; font-size: 13px;">${hotel.name}</h4>
          <p style="margin: 0 0 6px 0; color: #4B5563; font-size: 11px; font-weight: 500;">${hotel.location}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #E5E7EB; pt: 6px; margin-top: 6px;">
            <span style="font-weight: 800; color: #3b82f6; font-size: 13px;">₹${parseFloat(hotel.price).toLocaleString()}</span>
            <span style="font-weight: bold; color: #EAB308; font-size: 11px;">★ ${hotel.rating}</span>
          </div>
        </div>
      `;

      // Create and add Marker
      L.marker(hotelCoords)
        .bindPopup(popupContent)
        .addTo(markerGroup);
    });

    // Adjust map zoom/fit bounds if we have plotted markers
    if (bounds.length > 0) {
      if (bounds.length === 1) {
        map.setView(bounds[0], 12);
      } else {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    } else {
      const { center, zoom } = getMapCenter();
      map.setView(center, zoom);
    }
  }, [hotels, activeLocation]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full rounded-2xl border border-gray-150 shadow-inner overflow-hidden min-h-[350px] md:min-h-[450px]"
      style={{ zIndex: 1 }}
    />
  );
};

export default MapView;
