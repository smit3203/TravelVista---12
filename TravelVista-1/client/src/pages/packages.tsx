import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navbar from "@/components/navbar";
import PackageCard from "@/components/package-card";
import Footer from "@/components/footer";
import { Skeleton } from "@/components/ui/skeleton";
import type { Package } from "@shared/schema";

const Packages = () => {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const destination = searchParams.get('destination') || '';
  const budget = searchParams.get('budget') || '';

  const { data: packages, isLoading } = useQuery<Package[]>({
    queryKey: ['/api/packages'],
  });

  const handleBookNow = (packageId: number) => {
    setLocation(`/booking?package=${packageId}`);
  };

  const filteredPackages = packages?.filter(pkg => {
    let matches = true;
    
    if (destination) {
      matches = matches && pkg.destination.toLowerCase().includes(destination.toLowerCase());
    }
    
    if (budget) {
      const price = parseFloat(pkg.price);
      switch (budget) {
        case '500-1000':
          matches = matches && price >= 500 && price <= 1000;
          break;
        case '1000-2000':
          matches = matches && price >= 1000 && price <= 2000;
          break;
        case '2000-5000':
          matches = matches && price >= 2000 && price <= 5000;
          break;
        case '5000+':
          matches = matches && price >= 5000;
          break;
      }
    }
    
    return matches;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-16">
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Travel Packages
              </h2>
              <p className="text-lg text-gray-600">
                Complete travel experiences with flights, hotels, and activities
              </p>
              {(destination || budget) && (
                <p className="text-sm text-gray-500 mt-2">
                  Showing packages {destination && `for ${destination}`} {budget && `in ${budget} budget range`}
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
              ) : filteredPackages && filteredPackages.length > 0 ? (
                filteredPackages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    package={pkg}
                    onBookNow={() => handleBookNow(pkg.id)}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">No packages found for your search criteria.</p>
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

export default Packages;
