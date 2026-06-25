import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import DestinationCard from "@/components/destination-card";
import PackageCard from "@/components/package-card";
import HotelCard from "@/components/hotel-card";
import Footer from "@/components/footer";
import { Skeleton } from "@/components/ui/skeleton";
import type { Destination, Package, Hotel } from "@shared/schema";

const Home = () => {
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (window.location.hash === "#about-us") {
      setTimeout(() => {
        const element = document.getElementById("about-us");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [window.location.hash]);

  const { data: destinations, isLoading: destinationsLoading } = useQuery<Destination[]>({
    queryKey: ['/api/destinations'],
  });

  const { data: packages, isLoading: packagesLoading } = useQuery<Package[]>({
    queryKey: ['/api/packages'],
  });

  const { data: hotels, isLoading: hotelsLoading } = useQuery<Hotel[]>({
    queryKey: ['/api/hotels'],
  });

  const handleBookNow = () => {
    setLocation('/booking');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Hero />
      
      {/* Popular Destinations */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 animate-fadeInUp">
              Popular Destinations
            </h2>
            <p className="text-lg text-gray-600 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              Discover amazing places around the world
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinationsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            ) : (
              destinations?.map((destination) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                  onBookNow={handleBookNow}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Packages */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Travel Packages
            </h2>
            <p className="text-lg text-gray-600">
              Complete travel experiences with flights, hotels, and activities
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packagesLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))
            ) : (
              packages?.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  package={pkg}
                  onBookNow={handleBookNow}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Hotels
            </h2>
            <p className="text-lg text-gray-600">
              Luxury accommodations for your perfect stay
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hotelsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))
            ) : (
              hotels?.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  onBookNow={handleBookNow}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about-us" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 animate-fadeInUp">
              About TravelVista
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              We are your trusted partner for unforgettable travel experiences. With years of expertise 
              in the travel industry, we provide personalized service and competitive prices to make 
              your dream vacation a reality.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-travel-blue text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">10+</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Years Experience</h3>
              <p className="text-gray-600">Over a decade of serving travelers worldwide</p>
            </div>
            
            <div className="text-center">
              <div className="bg-travel-blue text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">50+</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Destinations</h3>
              <p className="text-gray-600">Amazing destinations across the globe</p>
            </div>
            
            <div className="text-center">
              <div className="bg-travel-blue text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">24/7</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Support</h3>
              <p className="text-gray-600">Round-the-clock customer support</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
