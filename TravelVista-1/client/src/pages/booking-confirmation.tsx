import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, MapPin, User, Phone, Mail, Package } from "lucide-react";
import type { Booking } from "@shared/schema";
import { format } from "date-fns";

const BookingConfirmation = () => {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const bookingId = searchParams.get('id');

  const { data: booking, isLoading } = useQuery<Booking>({
    queryKey: ['/api/bookings', bookingId],
    queryFn: async () => {
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (!response.ok) throw new Error('Failed to fetch booking');
      return response.json();
    },
    enabled: !!bookingId,
  });

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return format(date, 'PPP');
    } catch {
      return 'N/A';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-travel-blue"></div>
            <p className="mt-4 text-gray-600">Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h2>
            <p className="text-gray-600 mb-8">The booking you're looking for doesn't exist.</p>
            <Button 
              onClick={() => setLocation('/')}
              className="bg-travel-blue hover:bg-travel-dark-blue"
            >
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-16">
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <CheckCircle className="h-16 w-16 text-travel-green" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Booking Confirmed!
              </h2>
              <p className="text-lg text-gray-600">
                Thank you for your booking. We'll contact you soon with further details.
              </p>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl">Booking Details</CardTitle>
                  <Badge variant="secondary" className="text-sm">
                    Booking #{booking.id}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-travel-blue" />
                      <div>
                        <p className="font-medium text-gray-900">Traveler</p>
                        <p className="text-gray-600">{booking.firstName} {booking.lastName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-travel-blue" />
                      <div>
                        <p className="font-medium text-gray-900">Email</p>
                        <p className="text-gray-600">{booking.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-travel-blue" />
                      <div>
                        <p className="font-medium text-gray-900">Phone</p>
                        <p className="text-gray-600">{booking.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-travel-blue" />
                      <div>
                        <p className="font-medium text-gray-900">Age</p>
                        <p className="text-gray-600">{booking.age} years</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-travel-blue" />
                      <div>
                        <p className="font-medium text-gray-900">Destination</p>
                        <p className="text-gray-600">{booking.destination}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-travel-blue" />
                      <div>
                        <p className="font-medium text-gray-900">Travel Date</p>
                        <p className="text-gray-600">{formatDate(booking.travelDate)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Package className="h-5 w-5 text-travel-blue" />
                      <div>
                        <p className="font-medium text-gray-900">Package Type</p>
                        <p className="text-gray-600">{booking.packageType}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-travel-blue" />
                      <div>
                        <p className="font-medium text-gray-900">Booking Date</p>
                        <p className="text-gray-600">{formatDate(booking.createdAt)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="h-5 w-5 flex items-center justify-center font-bold text-travel-blue text-lg">₹</span>
                      <div>
                        <p className="font-medium text-gray-900">Amount Paid</p>
                        <p className="text-gray-600">₹{booking.amountPaid || '0.00'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="h-5 w-5 flex items-center justify-center text-travel-blue text-lg">💳</span>
                      <div>
                        <p className="font-medium text-gray-900">Payment Status</p>
                        <Badge 
                          className={booking.paymentStatus === 'paid' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-yellow-500 text-white'}
                        >
                          {booking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                        </Badge>
                      </div>
                    </div>

                    {booking.paymentId && (
                      <div className="flex items-center space-x-3">
                        <span className="h-5 w-5 flex items-center justify-center text-travel-blue font-bold text-xs">ID</span>
                        <div>
                          <p className="font-medium text-gray-900">Transaction ID</p>
                          <code className="text-gray-600 text-xs font-mono">{booking.paymentId}</code>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {booking.address && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900 mb-2">Address</p>
                    <p className="text-gray-600">{booking.address}</p>
                  </div>
                )}
                
                {booking.specialRequests && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="font-medium text-gray-900 mb-2">Special Requests</p>
                    <p className="text-gray-600">{booking.specialRequests}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="text-travel-blue">•</span>
                  <span>You will receive a confirmation email shortly</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-travel-blue">•</span>
                  <span>Our travel team will contact you within 24 hours</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-travel-blue">•</span>
                  <span>We'll provide detailed itinerary and travel documents</span>
                </li>
                {booking.paymentStatus === 'paid' ? (
                  <li className="flex items-start space-x-2">
                    <span className="text-travel-blue">•</span>
                    <span>Your payment has been successfully processed and verified!</span>
                  </li>
                ) : (
                  <li className="flex items-start space-x-2">
                    <span className="text-travel-blue">•</span>
                    <span>Payment details will be shared via email</span>
                  </li>
                )}
              </ul>
            </div>

            <div className="text-center mt-8">
              <Button 
                onClick={() => setLocation('/')}
                className="bg-travel-blue hover:bg-travel-dark-blue mr-4"
              >
                Back to Home
              </Button>
              <Button 
                onClick={() => setLocation('/contact')}
                variant="outline"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
};

export default BookingConfirmation;