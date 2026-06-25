import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navbar from "@/components/navbar";
import FlightResult from "@/components/flight-result";
import Footer from "@/components/footer";
import { Skeleton } from "@/components/ui/skeleton";
import type { Flight } from "@shared/schema";
import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, RotateCcw, Plane, Clock } from "lucide-react";

const AIRLINES_LIST = ["Singapore Airlines", "Emirates"];

const Flights = () => {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';

  const { data: flights, isLoading } = useQuery<Flight[]>({
    queryKey: ['/api/flights', from, to],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      
      const response = await fetch(`/api/flights?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch flights');
      return response.json();
    },
  });

  // Filter & Sort States
  const [sortBy, setSortBy] = useState<string>("price-asc");
  const [selectedStops, setSelectedStops] = useState<string>("any");
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("any");
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  const handleSelectFlight = (flightId: number) => {
    setLocation(`/booking?flight=${flightId}`);
  };

  const toggleAirline = (airline: string) => {
    setSelectedAirlines(prev =>
      prev.includes(airline)
        ? prev.filter(a => a !== airline)
        : [...prev, airline]
    );
  };

  const resetFilters = () => {
    setSelectedStops("any");
    setSelectedAirlines([]);
    setSelectedTimeSlot("any");
  };

  // Duration parser for sorting (e.g. "14h 30m" -> 870 mins)
  const parseDuration = (durationStr: string): number => {
    const hoursMatch = durationStr.match(/(\d+)h/);
    const minsMatch = durationStr.match(/(\d+)m/);
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const mins = minsMatch ? parseInt(minsMatch[1]) : 0;
    return hours * 60 + mins;
  };

  // Filtered and Sorted Flights using useMemo
  const processedFlights = useMemo(() => {
    if (!flights) return [];

    let result = flights.filter(flight => {
      // 1. Stops Filter
      let matchesStops = true;
      if (selectedStops === "non-stop") {
        matchesStops = flight.stops.toLowerCase().includes("non-stop") || flight.stops.toLowerCase().includes("0 stop");
      } else if (selectedStops === "1-stop") {
        matchesStops = flight.stops.toLowerCase().includes("1 stop");
      }

      // 2. Airlines Filter
      const matchesAirlines = selectedAirlines.length === 0 || selectedAirlines.includes(flight.airline);

      // 3. Departure Time Filter
      let matchesTime = true;
      const depHour = parseInt(flight.departureTime.split(":")[0]);
      if (selectedTimeSlot === "morning") {
        matchesTime = depHour >= 6 && depHour < 12;
      } else if (selectedTimeSlot === "afternoon") {
        matchesTime = depHour >= 12 && depHour < 18;
      } else if (selectedTimeSlot === "evening") {
        matchesTime = depHour >= 18 || depHour < 6;
      }

      return matchesStops && matchesAirlines && matchesTime;
    });

    // Sort Logic
    if (sortBy === "price-asc") {
      result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortBy === "duration") {
      result.sort((a, b) => parseDuration(a.duration) - parseDuration(b.duration));
    }

    return result;
  }, [flights, selectedStops, selectedAirlines, selectedTimeSlot, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="pt-16 flex-grow">
        {/* Header Hero Section */}
        <section className="bg-white border-b border-gray-100 py-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Flight Search Results
              </h1>
              <p className="text-gray-500 mt-1">
                Compare prices, schedules, and book the most convenient airlines.
              </p>
              {from && to && (
                <p className="text-sm font-semibold text-travel-blue mt-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-travel-blue rounded-full"></span>
                  Showing flights from {from} to {to}
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
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Sort By</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] bg-white border-gray-200 rounded-xl text-sm font-semibold">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border rounded-xl shadow-lg">
                    <SelectItem value="price-asc" className="cursor-pointer rounded-lg hover:bg-gray-50">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc" className="cursor-pointer rounded-lg hover:bg-gray-50">Price: High to Low</SelectItem>
                    <SelectItem value="duration" className="cursor-pointer rounded-lg hover:bg-gray-50">Shortest Duration</SelectItem>
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

              {/* Stops Filter */}
              <div className="space-y-3">
                <Label className="font-semibold text-gray-700 block">Stops</Label>
                <div className="flex flex-col gap-2">
                  {["any", "non-stop", "1-stop"].map((stopType) => (
                    <Button
                      key={stopType}
                      type="button"
                      variant={selectedStops === stopType ? "default" : "outline"}
                      className={`h-9 rounded-xl font-semibold text-xs justify-start px-3 transition-colors ${selectedStops === stopType ? 'bg-travel-blue text-white hover:bg-travel-dark-blue' : ''}`}
                      onClick={() => setSelectedStops(stopType)}
                    >
                      {stopType === "any" ? "Any Stops" : stopType === "non-stop" ? "Non-stop" : "1 Stop"}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Time Slots Filter */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <Label className="font-semibold text-gray-700 block">Departure Time</Label>
                <div className="flex flex-col gap-2">
                  {[
                    { id: "any", label: "Any Time" },
                    { id: "morning", label: "Morning (06:00 - 12:00)" },
                    { id: "afternoon", label: "Afternoon (12:00 - 18:00)" },
                    { id: "evening", label: "Evening (18:00 - 06:00)" }
                  ].map((slot) => (
                    <Button
                      key={slot.id}
                      type="button"
                      variant={selectedTimeSlot === slot.id ? "default" : "outline"}
                      className={`h-9 rounded-xl font-semibold text-xs justify-start px-3 transition-colors ${selectedTimeSlot === slot.id ? 'bg-travel-blue text-white hover:bg-travel-dark-blue' : ''}`}
                      onClick={() => setSelectedTimeSlot(slot.id)}
                    >
                      {slot.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Preferred Airlines Checklist */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <Label className="font-semibold text-gray-700 block">Airlines</Label>
                <div className="space-y-2.5">
                  {AIRLINES_LIST.map((airline) => {
                    const isChecked = selectedAirlines.includes(airline);
                    return (
                      <div key={airline} className="flex items-center space-x-2.5 cursor-pointer" onClick={() => toggleAirline(airline)}>
                        <Checkbox 
                          id={`airline-${airline}`} 
                          checked={isChecked}
                          onCheckedChange={() => {}} // toggling is handled by the parent div onClick
                          className="rounded-md border-gray-300"
                        />
                        <Label 
                          htmlFor={`airline-${airline}`} 
                          className="text-sm font-medium text-gray-600 cursor-pointer select-none"
                        >
                          {airline}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* Flight Results Grid */}
            <main className="flex-grow flex-1 w-full space-y-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white border rounded-2xl p-6 space-y-4">
                    <Skeleton className="h-20 w-full rounded-xl" />
                  </div>
                ))
              ) : processedFlights.length > 0 ? (
                processedFlights.map((flight) => (
                  <FlightResult
                    key={flight.id}
                    flight={flight}
                    onSelect={() => handleSelectFlight(flight.id)}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-20 bg-white border border-gray-150 rounded-3xl p-8">
                  <Plane className="h-12 w-12 text-gray-300 mx-auto mb-3 animate-pulse" />
                  <h3 className="text-lg font-bold text-gray-700">No flights found</h3>
                  <p className="text-gray-400 text-sm mt-1 max-w-md mx-auto">
                    We couldn't find any flights matching your search parameters. Try clearing filters or checking other routes.
                  </p>
                  <Button variant="outline" className="mt-4 rounded-xl text-sm font-semibold border-gray-250 hover:bg-gray-50" onClick={resetFilters}>
                    Clear All Filters
                  </Button>
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

export default Flights;
