import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navbar from "@/components/navbar";
import HotelCard from "@/components/hotel-card";
import Footer from "@/components/footer";
import { Skeleton } from "@/components/ui/skeleton";
import type { Hotel } from "@shared/schema";
import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Star, SlidersHorizontal, RotateCcw, MapPin } from "lucide-react";
import MapView from "@/components/map-view";

const AMENITIES_LIST = [
  "Free WiFi",
  "Infinity Pool",
  "Spa Services",
  "Restaurant",
  "Fitness Center",
  "Concierge",
  "Valet Parking",
  "Coffee Shop"
];

const Hotels = () => {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const destination = searchParams.get('destination') || '';

  const { data: hotels, isLoading } = useQuery<Hotel[]>({
    queryKey: ['/api/hotels'],
  });

  // Filter & Sort States
  const [sortBy, setSortBy] = useState<string>("recommended");
  const [maxPrice, setMaxPrice] = useState<number>(25000);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const [showMap, setShowMap] = useState<boolean>(false);

  const handleBookNow = (hotelId: number) => {
    setLocation(`/booking?hotel=${hotelId}`);
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const resetFilters = () => {
    setMaxPrice(25000);
    setMinRating(0);
    setSelectedAmenities([]);
  };

  // Filtered and Sorted Hotels using useMemo for efficiency
  const processedHotels = useMemo(() => {
    if (!hotels) return [];

    let result = hotels.filter(hotel => {
      // 1. Destination Match
      const matchesDestination = !destination || hotel.location.toLowerCase().includes(destination.toLowerCase());
      
      // 2. Price Filter
      const matchesPrice = parseFloat(hotel.price) <= maxPrice;
      
      // 3. Rating Filter
      const matchesRating = parseFloat(hotel.rating) >= minRating;
      
      // 4. Amenities Filter
      const matchesAmenities = selectedAmenities.every(amenity => 
        hotel.amenities.some(a => a.toLowerCase() === amenity.toLowerCase())
      );

      return matchesDestination && matchesPrice && matchesRating && matchesAmenities;
    });

    // Sort Logic
    if (sortBy === "price-asc") {
      result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortBy === "rating") {
      result.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    }

    return result;
  }, [hotels, destination, maxPrice, minRating, selectedAmenities, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="pt-16 flex-grow">
        {/* Header Hero Section */}
        <section className="bg-white border-b border-gray-100 py-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Hotel Stays & Accommodations
              </h1>
              <p className="text-gray-500 mt-1">
                Find luxury stays, boutique hotels, and budget resorts around the globe.
              </p>
              {destination && (
                <p className="text-sm font-semibold text-travel-blue mt-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-travel-blue"></span>
                  Showing accommodations in {destination}
                </p>
              )}
            </div>
            
            {/* Top Toolbar */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="md:hidden rounded-xl flex items-center gap-1 font-semibold text-sm"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
              
              <Button
                variant={showMap ? "default" : "outline"}
                className={`rounded-xl flex items-center gap-1.5 font-semibold text-sm transition-colors ${
                  showMap ? "bg-travel-blue text-white hover:bg-travel-dark-blue border-transparent" : "border-gray-200"
                }`}
                onClick={() => setShowMap(!showMap)}
              >
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">{showMap ? "Hide Map" : "Show Map"}</span>
                <span className="sm:hidden">{showMap ? "Hide" : "Map"}</span>
              </Button>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Sort By</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] bg-white border-gray-200 rounded-xl text-sm font-semibold">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border rounded-xl shadow-lg">
                    <SelectItem value="recommended" className="cursor-pointer rounded-lg hover:bg-gray-50">Recommended</SelectItem>
                    <SelectItem value="price-asc" className="cursor-pointer rounded-lg hover:bg-gray-50">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc" className="cursor-pointer rounded-lg hover:bg-gray-50">Price: High to Low</SelectItem>
                    <SelectItem value="rating" className="cursor-pointer rounded-lg hover:bg-gray-50">Highest Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Core Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Filter Sidebar (Desktop) */}
            <aside className={`w-full md:w-80 shrink-0 bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-6 ${showMobileFilters ? 'block' : 'hidden md:block'}`}>
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-travel-blue" />
                  Filters
                </h3>
                <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs font-semibold text-gray-400 hover:text-travel-blue hover:bg-blue-50/50 flex items-center gap-1 rounded-lg px-2">
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </Button>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <Label className="font-semibold text-gray-700">Max Budget (per night)</Label>
                  <span className="font-bold text-travel-blue">₹{maxPrice.toLocaleString()}</span>
                </div>
                <Slider
                  min={2000}
                  max={25000}
                  step={500}
                  value={[maxPrice]}
                  onValueChange={(val) => setMaxPrice(val[0])}
                  className="py-2"
                />
                <div className="flex justify-between text-[11px] text-gray-400 font-semibold">
                  <span>₹2,000</span>
                  <span>₹25,000+</span>
                </div>
              </div>

              {/* Star Rating Filter */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <Label className="font-semibold text-gray-700 block">Minimum Rating</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      type="button"
                      variant={minRating === rating ? "default" : "outline"}
                      className={`h-9 rounded-xl font-semibold text-xs transition-colors ${minRating === rating ? 'bg-travel-blue text-white hover:bg-travel-dark-blue' : ''}`}
                      onClick={() => setMinRating(rating)}
                    >
                      {rating === 0 ? "Any" : `${rating}★`}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Amenities Checklist */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <Label className="font-semibold text-gray-700 block">Amenities</Label>
                <div className="space-y-2.5">
                  {AMENITIES_LIST.map((amenity) => {
                    const isChecked = selectedAmenities.includes(amenity);
                    return (
                      <div key={amenity} className="flex items-center space-x-2.5 cursor-pointer" onClick={() => toggleAmenity(amenity)}>
                        <Checkbox 
                          id={`amenity-${amenity}`} 
                          checked={isChecked}
                          onCheckedChange={() => {}} // toggling is handled by the parent div onClick for better hit box
                          className="rounded-md border-gray-300"
                        />
                        <Label 
                          htmlFor={`amenity-${amenity}`} 
                          className="text-sm font-medium text-gray-600 cursor-pointer select-none"
                        >
                          {amenity}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* Hotel Cards Grid & Map View */}
            <main className="flex-grow flex-1 w-full">
              {showMap ? (
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left Column: Hotels List */}
                  <div className="w-full lg:w-1/2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="bg-white border rounded-2xl p-4 space-y-4">
                            <Skeleton className="h-48 w-full rounded-xl" />
                            <div className="space-y-2">
                              <Skeleton className="h-5 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                              <Skeleton className="h-4 w-full" />
                            </div>
                          </div>
                        ))
                      ) : processedHotels.length > 0 ? (
                        processedHotels.map((hotel) => (
                          <HotelCard
                            key={hotel.id}
                            hotel={hotel}
                            onBookNow={() => handleBookNow(hotel.id)}
                          />
                        ))
                      ) : (
                        <div className="col-span-full text-center py-20 bg-white border border-gray-150 rounded-3xl p-8">
                          <SlidersHorizontal className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <h3 className="text-lg font-bold text-gray-700">No hotels found</h3>
                          <p className="text-gray-400 text-sm mt-1 max-w-md mx-auto">
                            We couldn't find any accommodations matching your search.
                          </p>
                          <Button variant="outline" className="mt-4 rounded-xl text-sm font-semibold border-gray-250 hover:bg-gray-50" onClick={resetFilters}>
                            Clear All Filters
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Interactive Map */}
                  <div className="w-full lg:w-1/2 lg:sticky lg:top-24 h-[400px] lg:h-[calc(100vh-10rem)] min-h-[400px] z-10">
                    <MapView hotels={processedHotels} activeLocation={destination} />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-white border rounded-2xl p-4 space-y-4">
                        <Skeleton className="h-48 w-full rounded-xl" />
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    ))
                  ) : processedHotels.length > 0 ? (
                    processedHotels.map((hotel) => (
                      <HotelCard
                        key={hotel.id}
                        hotel={hotel}
                        onBookNow={() => handleBookNow(hotel.id)}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-20 bg-white border border-gray-150 rounded-3xl p-8">
                      <SlidersHorizontal className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-bold text-gray-700">No hotels found</h3>
                      <p className="text-gray-400 text-sm mt-1 max-w-md mx-auto">
                        We couldn't find any accommodations matching your search. Try resetting filters or choosing a different destination.
                      </p>
                      <Button variant="outline" className="mt-4 rounded-xl text-sm font-semibold border-gray-250 hover:bg-gray-50" onClick={resetFilters}>
                        Clear All Filters
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </main>

          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Hotels;
