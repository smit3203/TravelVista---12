import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Plane, Hotel, Briefcase } from "lucide-react";

const SearchTabs = () => {
  const [, setLocation] = useLocation();
  const [flightSearch, setFlightSearch] = useState({
    from: "",
    to: "",
    departure: "",
    return: ""
  });
  const [hotelSearch, setHotelSearch] = useState({
    destination: "",
    checkin: "",
    checkout: "",
    guests: ""
  });
  const [packageSearch, setPackageSearch] = useState({
    destination: "",
    duration: "",
    budget: ""
  });

  const handleFlightSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (flightSearch.from) params.append('from', flightSearch.from);
    if (flightSearch.to) params.append('to', flightSearch.to);
    if (flightSearch.departure) params.append('departure', flightSearch.departure);
    if (flightSearch.return) params.append('return', flightSearch.return);
    setLocation(`/flights?${params.toString()}`);
  };

  const handleHotelSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (hotelSearch.destination) params.append('destination', hotelSearch.destination);
    if (hotelSearch.checkin) params.append('checkin', hotelSearch.checkin);
    if (hotelSearch.checkout) params.append('checkout', hotelSearch.checkout);
    if (hotelSearch.guests) params.append('guests', hotelSearch.guests);
    setLocation(`/hotels?${params.toString()}`);
  };

  const handlePackageSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (packageSearch.destination) params.append('destination', packageSearch.destination);
    if (packageSearch.duration) params.append('duration', packageSearch.duration);
    if (packageSearch.budget) params.append('budget', packageSearch.budget);
    setLocation(`/packages?${params.toString()}`);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent className="p-6">
        <Tabs defaultValue="flights" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="flights" className="flex items-center gap-2">
              <Plane className="h-4 w-4" />
              Flights
            </TabsTrigger>
            <TabsTrigger value="hotels" className="flex items-center gap-2">
              <Hotel className="h-4 w-4" />
              Hotels
            </TabsTrigger>
            <TabsTrigger value="packages" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Packages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flights">
            <form onSubmit={handleFlightSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="from">From</Label>
                  <Input
                    id="from"
                    placeholder="Departure City"
                    value={flightSearch.from}
                    onChange={(e) => setFlightSearch({...flightSearch, from: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="to">To</Label>
                  <Input
                    id="to"
                    placeholder="Arrival City"
                    value={flightSearch.to}
                    onChange={(e) => setFlightSearch({...flightSearch, to: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="departure">Departure</Label>
                  <Input
                    id="departure"
                    type="date"
                    value={flightSearch.departure}
                    onChange={(e) => setFlightSearch({...flightSearch, departure: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="return">Return</Label>
                  <Input
                    id="return"
                    type="date"
                    value={flightSearch.return}
                    onChange={(e) => setFlightSearch({...flightSearch, return: e.target.value})}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-travel-blue hover:bg-travel-dark-blue">
                Search Flights
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="hotels">
            <form onSubmit={handleHotelSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    id="destination"
                    placeholder="City or Hotel Name"
                    value={hotelSearch.destination}
                    onChange={(e) => setHotelSearch({...hotelSearch, destination: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="checkin">Check-in</Label>
                  <Input
                    id="checkin"
                    type="date"
                    value={hotelSearch.checkin}
                    onChange={(e) => setHotelSearch({...hotelSearch, checkin: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="checkout">Check-out</Label>
                  <Input
                    id="checkout"
                    type="date"
                    value={hotelSearch.checkout}
                    onChange={(e) => setHotelSearch({...hotelSearch, checkout: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="guests">Guests</Label>
                  <Select value={hotelSearch.guests} onValueChange={(value) => setHotelSearch({...hotelSearch, guests: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select guests" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Guest</SelectItem>
                      <SelectItem value="2">2 Guests</SelectItem>
                      <SelectItem value="3">3 Guests</SelectItem>
                      <SelectItem value="4">4+ Guests</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full bg-travel-blue hover:bg-travel-dark-blue">
                Search Hotels
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="packages">
            <form onSubmit={handlePackageSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="pkg-destination">Destination</Label>
                  <Input
                    id="pkg-destination"
                    placeholder="Where do you want to go?"
                    value={packageSearch.destination}
                    onChange={(e) => setPackageSearch({...packageSearch, destination: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Select value={packageSearch.duration} onValueChange={(value) => setPackageSearch({...packageSearch, duration: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3-5">3-5 Days</SelectItem>
                      <SelectItem value="6-10">6-10 Days</SelectItem>
                      <SelectItem value="11-15">11-15 Days</SelectItem>
                      <SelectItem value="15+">15+ Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="budget">Budget Range</Label>
                  <Select value={packageSearch.budget} onValueChange={(value) => setPackageSearch({...packageSearch, budget: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="500-1000">₹500 - ₹1000</SelectItem>
                      <SelectItem value="1000-2000">₹1000 - ₹2000</SelectItem>
                      <SelectItem value="2000-5000">₹2000 - ₹5000</SelectItem>
                      <SelectItem value="5000+">₹5000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full bg-travel-blue hover:bg-travel-dark-blue">
                Search Packages
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SearchTabs;
