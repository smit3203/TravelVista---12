import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navbar from "@/components/navbar";
import DestinationCard from "@/components/destination-card";
import Footer from "@/components/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, IndianRupee } from "lucide-react";
import type { Destination } from "@shared/schema";
import { useState } from "react";

const Destinations = () => {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: destinations, isLoading } = useQuery<Destination[]>({
    queryKey: ['/api/destinations'],
  });

  const handleBookNow = (destination: Destination) => {
    setLocation(`/booking?destination=${destination.name}`);
  };

  const filteredDestinations = destinations?.filter(destination =>
    destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    destination.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const featuredDestinations = destinations?.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-16">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-r from-travel-blue to-travel-dark-blue text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Explore Amazing Destinations
              </h1>
              <p className="text-xl mb-8">
                Discover breathtaking locations around the world with TravelStud
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search destinations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg text-gray-900"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Destinations */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Featured Destinations
              </h2>
              <p className="text-lg text-gray-600">
                Hand-picked destinations that offer unforgettable experiences
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </Card>
                ))
              ) : (
                featuredDestinations?.map((destination) => (
                  <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="relative">
                      <img 
                        src={destination.imageUrl} 
                        alt={destination.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-travel-blue text-white">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold">{destination.name}</h3>
                        <div className="flex items-center text-travel-blue">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">{destination.country}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{destination.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-green-600 font-semibold">
                          <IndianRupee className="h-4 w-4 mr-1" />
                          From ₹{destination.price}
                        </div>
                        <Button 
                          onClick={() => handleBookNow(destination)}
                          className="bg-travel-blue hover:bg-travel-dark-blue"
                        >
                          Book Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </section>

        {/* All Destinations */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                All Destinations
              </h2>
              <p className="text-lg text-gray-600">
                {filteredDestinations?.length} destinations available
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              ) : filteredDestinations && filteredDestinations.length > 0 ? (
                filteredDestinations.map((destination) => (
                  <DestinationCard
                    key={destination.id}
                    destination={destination}
                    onBookNow={() => handleBookNow(destination)}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">No destinations found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose TravelStud?
              </h2>
              <p className="text-lg text-gray-600">
                We make travel planning easy and enjoyable
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-travel-blue text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Best Destinations</h3>
                <p className="text-gray-600">Carefully selected destinations with authentic experiences</p>
              </div>
              
              <div className="text-center">
                <div className="bg-travel-blue text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <IndianRupee className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
                <p className="text-gray-600">Competitive pricing with no hidden fees</p>
              </div>
              
              <div className="text-center">
                <div className="bg-travel-blue text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Expert Service</h3>
                <p className="text-gray-600">Personalized service from travel experts</p>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
};

export default Destinations;