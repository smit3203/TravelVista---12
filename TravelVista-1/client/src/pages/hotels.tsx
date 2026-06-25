import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navbar from "@/components/navbar";
import HotelCard from "@/components/hotel-card";
import Footer from "@/components/footer";
import { Skeleton } from "@/components/ui/skeleton";
import type { Hotel } from "@shared/schema";

const Hotels = () => {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const destination = searchParams.get('destination') || '';

  const { data: hotels, isLoading } = useQuery<Hotel[]>({
    queryKey: ['/api/hotels'],
  });

  const handleBookNow = (hotelId: number) => {
    setLocation(`/booking?hotel=${hotelId}`);
  };

  const filteredHotels = hotels?.filter(hotel => 
    !destination || hotel.location.toLowerCase().includes(destination.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-16">
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Hotel Search Results
              </h2>
              <p className="text-lg text-gray-600">
                Find the perfect accommodation for your stay
              </p>
              {destination && (
                <p className="text-sm text-gray-500 mt-2">
                  Showing hotels in {destination}
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))
              ) : filteredHotels && filteredHotels.length > 0 ? (
                filteredHotels.map((hotel) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    onBookNow={() => handleBookNow(hotel.id)}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">No hotels found for your search criteria.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
};

export default Hotels;
