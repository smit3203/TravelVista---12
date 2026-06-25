import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Compass, Plane, Hotel as HotelIcon, Check, ArrowRight, ArrowLeft, Tag, Calendar } from "lucide-react";
import type { Destination, Flight, Hotel } from "@shared/schema";

const CustomPackage = () => {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Selections state
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [nights, setNights] = useState<number>(5);

  // Queries
  const { data: destinations, isLoading: destsLoading } = useQuery<Destination[]>({
    queryKey: ["/api/destinations"]
  });

  const { data: flights, isLoading: flightsLoading } = useQuery<Flight[]>({
    queryKey: ["/api/flights"],
    enabled: step === 2
  });

  const { data: hotels, isLoading: hotelsLoading } = useQuery<Hotel[]>({
    queryKey: ["/api/hotels"],
    enabled: step === 3
  });

  // Filter flights matching selected destination country/city
  const filteredFlights = flights?.filter(flight => {
    if (!selectedDestination) return false;
    const destName = selectedDestination.name.toLowerCase();
    const destCountry = selectedDestination.country.toLowerCase();
    const arrival = flight.arrivalCity.toLowerCase();
    return arrival.includes(destName) || arrival.includes(destCountry);
  }) || [];

  // Filter hotels matching selected destination
  const filteredHotels = hotels?.filter(hotel => {
    if (!selectedDestination) return false;
    const destName = selectedDestination.name.toLowerCase();
    const location = hotel.location.toLowerCase();
    return location.includes(destName);
  }) || [];

  const handleDestinationSelect = (dest: Destination) => {
    setSelectedDestination(dest);
    setSelectedFlight(null);
    setSelectedHotel(null);
    setStep(2);
  };

  const handleFlightSelect = (flight: Flight) => {
    setSelectedFlight(flight);
    setStep(3);
  };

  const handleHotelSelect = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setStep(4);
  };

  // Pricing calculations
  const flightPrice = selectedFlight ? parseFloat(selectedFlight.price) : 0;
  const hotelPrice = selectedHotel ? parseFloat(selectedHotel.price) : 0;
  const originalTotal = flightPrice + (hotelPrice * nights);
  const discountAmount = Math.round(originalTotal * 0.15); // 15% discount
  const finalPrice = Math.round(originalTotal - discountAmount);

  const handleBookNow = () => {
    if (!selectedDestination || !selectedFlight || !selectedHotel) return;
    setLocation(
      `/booking?packageType=custom-package&flightId=${selectedFlight.id}&hotelId=${selectedHotel.id}&nights=${nights}&destination=${encodeURIComponent(selectedDestination.name)}`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="pt-16 flex-grow">
        {/* Header section */}
        <section className="bg-white border-b border-gray-100 py-8 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <Compass className="h-7 w-7 text-travel-blue" />
              Custom Package Builder
            </h1>
            <p className="text-gray-500 mt-1.5 text-sm">
              Design your dream trip by bundling flight & hotel stays together and save an instant **15% discount**!
            </p>

            {/* Stepper Progress Indicator */}
            <div className="mt-8 flex items-center justify-between max-w-2xl">
              {[
                { number: 1, label: "Destination", active: step >= 1 },
                { number: 2, label: "Flight", active: step >= 2 },
                { number: 3, label: "Hotel Stay", active: step >= 3 },
                { number: 4, label: "Summary & Save", active: step === 4 }
              ].map((s, idx) => (
                <div key={s.number} className="flex items-center flex-1 last:flex-initial">
                  <button
                    onClick={() => {
                      if (s.number < step) setStep(s.number as any);
                    }}
                    disabled={s.number > step}
                    className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold transition-colors ${
                      step === s.number
                        ? "bg-travel-blue text-white ring-4 ring-blue-100"
                        : s.active
                        ? "bg-green-500 text-white cursor-pointer"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {s.active && s.number < step ? <Check className="h-4 w-4" /> : s.number}
                  </button>
                  <span className="ml-2 text-xs font-bold text-gray-700 hidden sm:inline">{s.label}</span>
                  {idx < 3 && (
                    <div className={`h-1 flex-1 mx-4 rounded-full ${step > s.number ? "bg-green-500" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Step Contents */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          
          {/* STEP 1: DESTINATION SELECTION */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Step 1: Where do you want to go?</h2>
              {destsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-4 bg-white p-4 rounded-2xl border">
                      <Skeleton className="h-40 w-full rounded-xl" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {destinations?.map((dest) => (
                    <Card 
                      key={dest.id} 
                      className={`overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 border ${
                        selectedDestination?.id === dest.id ? "border-travel-blue ring-2 ring-blue-100" : "border-gray-150"
                      }`}
                      onClick={() => handleDestinationSelect(dest)}
                    >
                      <img src={dest.imageUrl} alt={dest.name} className="h-40 w-full object-cover" />
                      <CardContent className="p-4">
                        <div className="text-xs text-travel-blue font-bold uppercase tracking-wider">{dest.country}</div>
                        <h3 className="text-lg font-bold text-gray-900 mt-1">{dest.name}</h3>
                        <p className="text-gray-500 text-xs mt-1 line-clamp-2">{dest.description}</p>
                        <div className="mt-4 flex items-center justify-between text-xs text-gray-400 font-semibold border-t pt-3">
                          <span>Explore packages from</span>
                          <span className="text-travel-blue font-bold text-sm">₹{parseFloat(dest.price).toLocaleString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: FLIGHT SELECTION */}
          {step === 2 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Step 2: Choose your flight to {selectedDestination?.name}</h2>
                <Button variant="ghost" className="rounded-xl flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-900" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4" /> Back to Destinations
                </Button>
              </div>

              {flightsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white border rounded-2xl p-6 flex justify-between gap-4">
                      <Skeleton className="h-12 w-24" />
                      <Skeleton className="h-12 w-48" />
                      <Skeleton className="h-12 w-24" />
                    </div>
                  ))}
                </div>
              ) : filteredFlights.length > 0 ? (
                <div className="space-y-4 max-w-4xl">
                  {filteredFlights.map((flight) => (
                    <Card 
                      key={flight.id}
                      className={`hover:shadow-md transition-shadow cursor-pointer border ${
                        selectedFlight?.id === flight.id ? "border-travel-blue ring-2 ring-blue-100 bg-blue-50/10" : "border-gray-150"
                      }`}
                      onClick={() => handleFlightSelect(flight)}
                    >
                      <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-50 p-3 rounded-2xl">
                            <Plane className="h-6 w-6 text-travel-blue transform -rotate-45" />
                          </div>
                          <div>
                            <div className="text-base font-bold text-gray-900">{flight.airline}</div>
                            <div className="text-xs text-gray-400 mt-0.5">Flight {flight.flightNumber}</div>
                          </div>
                        </div>

                        {/* Connection timelines */}
                        <div className="flex items-center gap-6 text-center">
                          <div>
                            <div className="text-sm font-extrabold text-gray-900">{flight.departureTime}</div>
                            <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{flight.departureCity}</div>
                          </div>
                          <div className="text-gray-300 font-light text-xs flex flex-col items-center">
                            <span>{flight.duration}</span>
                            <div className="w-16 h-[2px] bg-gray-200 my-1 relative">
                              <span className="w-1.5 h-1.5 rounded-full bg-travel-blue absolute -top-[3px] left-1/2 transform -translate-x-1/2"></span>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-travel-blue">{flight.stops}</span>
                          </div>
                          <div>
                            <div className="text-sm font-extrabold text-gray-900">{flight.arrivalTime}</div>
                            <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{flight.arrivalCity}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                          <div>
                            <div className="text-lg font-extrabold text-travel-blue">₹{parseFloat(flight.price).toLocaleString()}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase">One-Way Passenger</div>
                          </div>
                          <Button className="bg-travel-blue hover:bg-travel-dark-blue text-white rounded-xl text-xs font-semibold px-4">
                            Select Flight
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white border border-gray-150 rounded-2xl max-w-4xl p-6">
                  <Plane className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-gray-700">No flights found</h3>
                  <p className="text-gray-400 text-sm mt-1 max-w-sm mx-auto">
                    We couldn't find flight connections to {selectedDestination?.name} in database. Check other destinations!
                  </p>
                  <Button variant="outline" className="mt-4 rounded-xl text-xs font-semibold" onClick={() => setStep(1)}>
                    Select Different Destination
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: HOTEL STAYS */}
          {step === 3 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Step 3: Pick your stay in {selectedDestination?.name}</h2>
                  <p className="text-gray-400 text-xs mt-0.5">Filter matching accommodations</p>
                </div>
                <Button variant="ghost" className="rounded-xl flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-900" onClick={() => setStep(2)}>
                  <ArrowLeft className="h-4 w-4" /> Back to Flights
                </Button>
              </div>

              {/* Nights selector */}
              <Card className="max-w-4xl border-gray-150 mb-6 bg-white shadow-sm p-6">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-travel-blue" />
                    <span className="text-sm font-bold text-gray-700">Stay Duration</span>
                  </div>
                  <span className="text-travel-blue font-extrabold text-sm">{nights} Nights Stay</span>
                </div>
                <Slider
                  min={1}
                  max={14}
                  step={1}
                  value={[nights]}
                  onValueChange={(val) => setNights(val[0])}
                  className="py-2"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                  <span>1 night</span>
                  <span>14 nights max</span>
                </div>
              </Card>

              {hotelsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-4 bg-white p-4 rounded-2xl border">
                      <Skeleton className="h-40 w-full rounded-xl" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filteredHotels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl">
                  {filteredHotels.map((hotel) => (
                    <Card
                      key={hotel.id}
                      className={`overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 border flex flex-col justify-between ${
                        selectedHotel?.id === hotel.id ? "border-travel-blue ring-2 ring-blue-100" : "border-gray-150"
                      }`}
                      onClick={() => handleHotelSelect(hotel)}
                    >
                      <div>
                        <img src={hotel.imageUrl} alt={hotel.name} className="h-44 w-full object-cover" />
                        <CardContent className="p-5">
                          <h3 className="text-lg font-bold text-gray-900 leading-snug">{hotel.name}</h3>
                          <div className="flex items-center text-xs text-yellow-500 font-bold mt-1.5 gap-1">
                            <span>★</span>
                            <span>{hotel.rating}</span>
                          </div>
                          <div className="text-gray-500 text-xs mt-2 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-travel-blue shrink-0"></span>
                            {hotel.location}
                          </div>
                        </CardContent>
                      </div>

                      <div className="p-5 pt-0 border-t border-gray-50 bg-gray-50/50 flex justify-between items-center">
                        <div>
                          <span className="text-lg font-extrabold text-travel-blue">₹{parseFloat(hotel.price).toLocaleString()}</span>
                          <span className="text-gray-400 text-[10px] font-bold">/night</span>
                        </div>
                        <Button className="bg-travel-blue hover:bg-travel-dark-blue text-white rounded-xl text-xs font-semibold px-3 h-8">
                          Select Hotel
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white border border-gray-150 rounded-2xl max-w-4xl p-6">
                  <HotelIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-gray-700">No hotels found</h3>
                  <p className="text-gray-400 text-sm mt-1 max-w-sm mx-auto">
                    We couldn't find hotel stays in {selectedDestination?.name} in our database. Choose Santorini or Paris!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: BUNDLE SUMMARY */}
          {step === 4 && selectedDestination && selectedFlight && selectedHotel && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Step 4: Confirm Custom Bundle Details</h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-6xl">
                
                {/* Left Side: Custom Package details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Destination summary card */}
                  <Card className="border-gray-150 bg-white shadow-sm overflow-hidden flex flex-col sm:flex-row">
                    <img src={selectedDestination.imageUrl} alt={selectedDestination.name} className="h-32 sm:h-auto sm:w-48 object-cover" />
                    <CardContent className="p-5 flex-1">
                      <div className="text-xs text-travel-blue font-bold uppercase tracking-wider">{selectedDestination.country}</div>
                      <h3 className="text-lg font-extrabold text-gray-900">{selectedDestination.name}</h3>
                      <p className="text-gray-500 text-xs mt-1 line-clamp-3">{selectedDestination.description}</p>
                    </CardContent>
                  </Card>

                  {/* Flight summary card */}
                  <Card className="border-gray-150 bg-white shadow-sm p-5">
                    <h3 className="text-sm font-bold text-gray-900 border-b pb-2 flex items-center gap-1.5">
                      <Plane className="h-4 w-4 text-travel-blue transform -rotate-45" /> Flight details
                    </h3>
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-bold text-gray-900">{selectedFlight.airline}</div>
                        <div className="text-xs text-gray-400">Flight {selectedFlight.flightNumber} • {selectedFlight.stops}</div>
                      </div>
                      <div className="flex gap-4 items-center">
                        <div className="text-xs text-right">
                          <div className="font-extrabold text-gray-900">{selectedFlight.departureTime}</div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase">{selectedFlight.departureCity}</div>
                        </div>
                        <div className="text-gray-300 font-light text-[10px]">➜</div>
                        <div className="text-xs">
                          <div className="font-extrabold text-gray-900">{selectedFlight.arrivalTime}</div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase">{selectedFlight.arrivalCity}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-700">₹{parseFloat(selectedFlight.price).toLocaleString()}</div>
                        <span className="text-[9px] text-gray-400 font-bold uppercase">One-way</span>
                      </div>
                    </div>
                  </Card>

                  {/* Hotel summary card */}
                  <Card className="border-gray-150 bg-white shadow-sm p-5">
                    <h3 className="text-sm font-bold text-gray-900 border-b pb-2 flex items-center gap-1.5">
                      <HotelIcon className="h-4 w-4 text-travel-blue" /> Stay details
                    </h3>
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-bold text-gray-900">{selectedHotel.name}</div>
                        <div className="text-xs text-gray-400">★ {selectedHotel.rating} • {selectedHotel.location}</div>
                      </div>
                      <div className="text-xs text-gray-500 font-semibold">
                        <span>Duration: </span>
                        <span className="text-travel-blue font-bold">{nights} Nights Stay</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-700">₹{parseFloat(selectedHotel.price).toLocaleString()}</div>
                        <span className="text-[9px] text-gray-400 font-bold uppercase">/ night</span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Right Side: Price Bundle Invoice */}
                <div>
                  <Card className="border-gray-150 bg-white shadow-md rounded-2xl overflow-hidden sticky top-24">
                    <CardHeader className="bg-gradient-to-r from-travel-blue to-travel-dark-blue text-white p-5">
                      <CardTitle className="text-base font-extrabold flex items-center gap-1.5">
                        <Tag className="h-5 w-5" />
                        Bundle Invoice Summary
                      </CardTitle>
                      <CardDescription className="text-blue-100 text-xs font-medium">15% bundle discount applied!</CardDescription>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                      {/* Price breakdown */}
                      <div className="space-y-2 text-xs border-b pb-4">
                        <div className="flex justify-between text-gray-500 font-medium">
                          <span>Flight tickets</span>
                          <span>₹{flightPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-500 font-medium">
                          <span>Hotel stay ({nights} nights)</span>
                          <span>₹{(hotelPrice * nights).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-900 font-extrabold pt-2 border-t border-dashed">
                          <span>Original total</span>
                          <span>₹{originalTotal.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Savings panel */}
                      <div className="bg-green-50/60 border border-green-150 rounded-xl p-3.5 flex items-center justify-between text-xs text-green-700">
                        <div>
                          <div className="font-extrabold">Instant Savings!</div>
                          <p className="text-[10px] text-green-600 font-semibold mt-0.5">Custom bundle discount (15%)</p>
                        </div>
                        <span className="font-extrabold text-base">- ₹{discountAmount.toLocaleString()}</span>
                      </div>

                      {/* Final cost */}
                      <div className="flex justify-between items-baseline pt-2">
                        <span className="text-sm font-bold text-gray-900">Total Price</span>
                        <div className="text-right">
                          <span className="text-2xl font-extrabold text-travel-blue">₹{finalPrice.toLocaleString()}</span>
                          <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Inc. taxes & fees</p>
                        </div>
                      </div>

                      <Button 
                        onClick={handleBookNow}
                        className="w-full bg-travel-blue hover:bg-travel-dark-blue text-white font-semibold rounded-xl text-sm h-11 shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 mt-2"
                      >
                        Confirm & Proceed to Book <ArrowRight className="h-4 w-4" />
                      </Button>

                      <Button 
                        variant="ghost" 
                        onClick={() => setStep(3)}
                        className="w-full text-xs text-gray-400 hover:text-gray-700 font-semibold flex items-center justify-center gap-1"
                      >
                        <ArrowLeft className="h-3 w-3" /> Back and edit selections
                      </Button>
                    </CardContent>
                  </Card>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CustomPackage;
