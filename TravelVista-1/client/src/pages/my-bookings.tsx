import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Package, Phone, Mail, User as UserIcon, Ticket, ArrowRight } from "lucide-react";
import type { Booking } from "@shared/schema";
import { format } from "date-fns";

export default function MyBookingsPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();

  // Redirect to login if not logged in
  if (!authLoading && !user) {
    setTimeout(() => setLocation("/auth"), 50);
    return null;
  }

  const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/user/bookings"],
    enabled: !!user,
  });

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return format(date, "PPp");
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Bookings</h1>
              <p className="text-gray-500 text-sm mt-1">
                Manage and view all your flight, hotel, and package bookings, {user?.username}.
              </p>
            </div>
            <Button
              onClick={() => setLocation("/")}
              className="bg-travel-blue hover:bg-travel-dark-blue flex items-center space-x-2 text-sm h-11 px-6 rounded-xl"
            >
              <span>Explore Destinations</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Bookings Grid */}
          {bookingsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="rounded-2xl">
                  <CardContent className="p-6">
                    <Skeleton className="h-5 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : bookings && bookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((booking) => (
                <Card key={booking.id} className="rounded-2xl hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col justify-between overflow-hidden group">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <Badge className="bg-blue-50 text-travel-blue hover:bg-blue-100/80 font-semibold mb-2">
                          {booking.packageType}
                        </Badge>
                        <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-travel-blue transition-colors">
                          {booking.destination}
                        </CardTitle>
                      </div>
                      <div className="p-2 bg-gray-100 rounded-xl text-gray-500">
                        <Ticket className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="space-y-2.5 text-sm text-gray-600 mt-4 border-t border-gray-50 pt-4">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-2.5 text-gray-400" />
                        <span className="font-medium text-gray-800">
                          {booking.firstName} {booking.lastName}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <CalendarDays className="h-4 w-4 mr-2.5 text-gray-400" />
                        <span>Travel Date: <strong>{booking.travelDate}</strong></span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2.5 text-gray-400" />
                        <span className="truncate">{booking.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2.5 text-gray-400" />
                        <span>{booking.phone}</span>
                      </div>
                      {booking.specialRequests && (
                        <div className="mt-3 p-2 bg-yellow-50/50 border border-yellow-100/50 rounded-xl text-xs text-yellow-800">
                          <strong>Note:</strong> {booking.specialRequests}
                        </div>
                      )}
                    </div>

                    {/* Booking Status Timeline */}
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Booking Status Timeline
                      </div>
                      <div className="flex items-center justify-between relative px-2 py-1">
                        {/* Background grey line */}
                        <div className="absolute left-6 right-6 top-[13px] h-0.5 bg-gray-200" />
                        {/* Active colored line */}
                        <div 
                          className="absolute left-6 top-[13px] h-0.5 bg-travel-blue transition-all duration-500"
                          style={{ 
                            width: booking.paymentStatus === 'paid' ? 'calc(100% - 48px)' : '33%'
                          }} 
                        />
                        
                        {/* Step Nodes */}
                        {[
                          { label: "Booked", done: true },
                          { label: "Verified", done: booking.paymentStatus === 'paid' },
                          { label: "Confirmed", done: booking.paymentStatus === 'paid' },
                          { label: "Completed", done: false } // placeholder upcoming for now
                        ].map((step, idx) => (
                          <div key={idx} className="flex flex-col items-center gap-1.5 z-10">
                            <div 
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all ${
                                step.done 
                                  ? 'bg-travel-blue border-travel-blue text-white shadow-md shadow-blue-500/20' 
                                  : 'bg-white border-gray-200 text-gray-400'
                              }`}
                            >
                              {idx + 1}
                            </div>
                            <span className={`text-[10px] font-bold tracking-tight ${step.done ? 'text-travel-blue' : 'text-gray-400'}`}>
                              {step.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-xs text-gray-500 flex justify-between items-center">
                    <span>Booking ID: #{booking.id}</span>
                    <span>Booked on: {formatDate(booking.createdAt)}</span>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gray-50 rounded-full text-gray-400">
                  <Ticket className="h-10 w-10" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900">No bookings yet</h3>
              <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
                You haven't made any flight, hotel, or travel package reservations.
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <Button
                  onClick={() => setLocation("/flights")}
                  variant="outline"
                  className="rounded-xl h-10 px-5 text-sm"
                >
                  Book Flights
                </Button>
                <Button
                  onClick={() => setLocation("/hotels")}
                  variant="outline"
                  className="rounded-xl h-10 px-5 text-sm"
                >
                  Book Hotels
                </Button>
                <Button
                  onClick={() => setLocation("/packages")}
                  className="bg-travel-blue hover:bg-travel-dark-blue text-white rounded-xl h-10 px-5 text-sm"
                >
                  Book Packages
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
      
      <Footer />
    </div>
  );
}
