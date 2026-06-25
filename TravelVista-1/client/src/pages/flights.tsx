import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navbar from "@/components/navbar";
import FlightResult from "@/components/flight-result";
import Footer from "@/components/footer";
import { Skeleton } from "@/components/ui/skeleton";
import type { Flight } from "@shared/schema";

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

  const handleSelectFlight = (flightId: number) => {
    setLocation(`/booking?flight=${flightId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-16">
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Flight Search Results
              </h2>
              <p className="text-lg text-gray-600">
                Compare and book the best flights for your journey
              </p>
              {from && to && (
                <p className="text-sm text-gray-500 mt-2">
                  Showing flights from {from} to {to}
                </p>
              )}
            </div>
            
            <div className="space-y-6">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-32 w-full rounded-lg" />
                  </div>
                ))
              ) : flights && flights.length > 0 ? (
                flights.map((flight) => (
                  <FlightResult
                    key={flight.id}
                    flight={flight}
                    onSelect={() => handleSelectFlight(flight.id)}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No flights found for your search criteria.</p>
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

export default Flights;
