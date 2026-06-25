import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { z } from "zod";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { insertBookingSchema, type Flight, type Hotel } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";

const bookingFormSchema = insertBookingSchema.extend({
  agreedToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

const getBookingPrice = (destination: string, packageType: string) => {
  let basePrice = 1000;
  const dest = destination.toLowerCase();
  
  if (dest.includes("bali")) basePrice = 599;
  else if (dest.includes("paris")) basePrice = 799;
  else if (dest.includes("tokyo")) basePrice = 899;
  else if (dest.includes("swiss")) basePrice = 1299;
  else if (dest.includes("maldives")) basePrice = 2899;
  else if (dest.includes("santorini")) basePrice = 1499;
  else if (dest.includes("thailand")) basePrice = 899;

  switch (packageType) {
    case 'complete-package': return basePrice;
    case 'flight-hotel': return Math.round(basePrice * 0.8);
    case 'hotel-only': return Math.round(basePrice * 0.5);
    case 'flight-only': return Math.round(basePrice * 0.4);
    default: return basePrice;
  }
};

const Booking = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const packageParam = searchParams.get('package');
  const destParam = searchParams.get('destination');
  const packageTypeParam = searchParams.get('packageType');
  const flightIdParam = searchParams.get('flightId');
  const hotelIdParam = searchParams.get('hotelId');
  const nightsParam = searchParams.get('nights') ? parseInt(searchParams.get('nights') || "5") : 5;

  const { data: flight } = useQuery<Flight>({
    queryKey: [`/api/flights/${flightIdParam}`],
    enabled: !!flightIdParam && packageTypeParam === "custom-package",
    queryFn: async () => {
      const response = await fetch(`/api/flights/${flightIdParam}`);
      if (!response.ok) throw new Error("Failed to fetch flight");
      return response.json();
    }
  });

  const { data: hotel } = useQuery<Hotel>({
    queryKey: [`/api/hotels/${hotelIdParam}`],
    enabled: !!hotelIdParam && packageTypeParam === "custom-package",
    queryFn: async () => {
      const response = await fetch(`/api/hotels/${hotelIdParam}`);
      if (!response.ok) throw new Error("Failed to fetch hotel");
      return response.json();
    }
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      age: 0,
      travelDate: "",
      destination: destParam || "",
      packageType: packageTypeParam || (packageParam ? "complete-package" : ""),
      address: "",
      specialRequests: "",
      agreedToTerms: false,
    },
  });

  // Pre-fill username and contact if logged in
  useEffect(() => {
    if (user) {
      const names = user.username.split(" ");
      form.setValue("firstName", names[0] || "");
      if (names.length > 1) {
        form.setValue("lastName", names.slice(1).join(" "));
      }
      if (user.username.includes("@")) {
        form.setValue("email", user.username);
      }
    }
  }, [user, form]);

  const selectedDestination = form.watch("destination");
  const selectedPackageType = form.watch("packageType");
  const price = selectedPackageType === "custom-package"
    ? ((flight && hotel) ? Math.round((parseFloat(flight.price) + parseFloat(hotel.price) * nightsParam) * 0.85) : 0)
    : (selectedDestination && selectedPackageType 
      ? getBookingPrice(selectedDestination, selectedPackageType)
      : 0);

  // Dynamically load Razorpay SDK script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const onSubmit = async (data: BookingFormData) => {
    const { agreedToTerms, ...bookingData } = data;
    
    const completeBookingData = {
      ...bookingData,
      userId: user?.id || null, // Link user account if authenticated
      age: Number(bookingData.age) || 18,
      travelDate: bookingData.travelDate || new Date().toISOString().split('T')[0],
      destination: bookingData.destination || 'To be determined',
      packageType: bookingData.packageType || 'custom',
      specialRequests: bookingData.specialRequests || '',
      address: bookingData.address || ''
    };

    try {
      // 1. Create order on the server
      const orderRes = await fetch("/api/payments/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: completeBookingData.destination,
          packageType: completeBookingData.packageType,
          customFlightId: flightIdParam ? parseInt(flightIdParam) : undefined,
          customHotelId: hotelIdParam ? parseInt(hotelIdParam) : undefined,
          nights: nightsParam
        })
      });

      if (!orderRes.ok) {
        throw new Error("Failed to create payment order");
      }

      const orderData = await orderRes.json();

      // 2. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast({
          title: "Payment Error",
          description: "Failed to load payment gateway. Check your internet connection.",
          variant: "destructive"
        });
        return;
      }

      // 3. Open Razorpay Checkout Modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "TravelVista Checkout",
        description: `Booking for ${completeBookingData.destination} (${completeBookingData.packageType.replace('-', ' ')})`,
        image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100&h=100&fit=crop",
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            // 4. Verify payment on server (this also inserts the booking)
            const finalBookingData = {
              ...completeBookingData,
              specialRequests: packageTypeParam === "custom-package"
                ? `Custom Package | Flight: ${flight?.airline} (${flight?.flightNumber}) | Hotel: ${hotel?.name} (${nightsParam} Nights Stay) | ${completeBookingData.specialRequests || "No extra requests"}`
                : completeBookingData.specialRequests
            };

            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingData: finalBookingData
              })
            });

            if (!verifyRes.ok) {
              throw new Error("Signature verification failed");
            }

            const verifyData = await verifyRes.json();
            
            toast({
              title: "Payment & Booking Confirmed!",
              description: `Booking ID: ${verifyData.booking.id}. Thank you for booking with TravelVista!`
            });

            setLocation(`/booking-confirmation?id=${verifyData.booking.id}`);
          } catch (err) {
            console.error("Payment verification failed:", err);
            toast({
              title: "Payment Verification Failed",
              description: "We could not verify your payment. Please contact support if your money was debited.",
              variant: "destructive"
            });
          }
        },
        prefill: {
          name: `${completeBookingData.firstName} ${completeBookingData.lastName}`,
          email: completeBookingData.email,
          contact: completeBookingData.phone
        },
        theme: {
          color: "#2563eb"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast({
          title: "Payment Failed",
          description: response.error.description || "The transaction was declined by the bank.",
          variant: "destructive"
        });
      });
      rzp.open();

    } catch (error) {
      console.error("Checkout process error:", error);
      toast({
        title: "Checkout Error",
        description: "There was an error initiating checkout. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-16">
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Complete Your Booking
              </h2>
              <p className="text-lg text-gray-600">
                Fill out the form below to secure your travel experience
              </p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your first name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter your email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="Enter your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Enter your age" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="travelDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Travel Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="destination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Destination</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your destination" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="bali">Bali, Indonesia</SelectItem>
                              <SelectItem value="paris">Paris, France</SelectItem>
                              <SelectItem value="tokyo">Tokyo, Japan</SelectItem>
                              <SelectItem value="maldives">Maldives</SelectItem>
                              <SelectItem value="santorini">Santorini, Greece</SelectItem>
                              <SelectItem value="thailand">Thailand</SelectItem>
                              <SelectItem value="swiss">Swiss Alps, Switzerland</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="packageType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Package Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select package type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="flight-only">Flight Only</SelectItem>
                              <SelectItem value="hotel-only">Hotel Only</SelectItem>
                              <SelectItem value="flight-hotel">Flight + Hotel</SelectItem>
                              <SelectItem value="complete-package">Complete Package</SelectItem>
                              {field.value === "custom-package" && (
                                <SelectItem value="custom-package">Custom Flight + Hotel Bundle</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter your complete address" 
                              className="resize-none"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="specialRequests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Requests</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any special requests or requirements" 
                              className="resize-none"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="agreedToTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I agree to the{" "}
                              <a href="#" className="text-travel-blue hover:underline">
                                Terms and Conditions
                              </a>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Pricing Breakdown Summary */}
                    {price > 0 ? (
                      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-2 animate-fadeIn">
                        <div className="flex justify-between items-center text-sm text-gray-600">
                          <span>Subtotal</span>
                          <span>₹{price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-600">
                          <span>Tax & Services</span>
                          <span>₹0.00</span>
                        </div>
                        <div className="border-t border-blue-150 pt-2 flex justify-between items-center text-base font-bold text-gray-900">
                          <span>Total Amount</span>
                          <span className="text-travel-blue">₹{price.toLocaleString()}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4 text-center text-sm text-gray-400">
                        Select destination and package type to calculate price
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full bg-travel-blue hover:bg-travel-dark-blue h-11 text-white font-semibold rounded-xl"
                      disabled={price === 0}
                    >
                      Pay & Confirm Booking
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
};

export default Booking;
