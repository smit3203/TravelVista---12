import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Destinations from "@/pages/destinations";
import Flights from "@/pages/flights";
import Hotels from "@/pages/hotels";
import Packages from "@/pages/packages";
import Booking from "@/pages/booking";
import Contact from "@/pages/contact";
import Admin from "@/pages/admin";
import BookingConfirmation from "@/pages/booking-confirmation";
import AuthPage from "@/pages/auth";
import MyBookingsPage from "@/pages/my-bookings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/my-bookings" component={MyBookingsPage} />
      <Route path="/destinations" component={Destinations} />
      <Route path="/flights" component={Flights} />
      <Route path="/hotels" component={Hotels} />
      <Route path="/packages" component={Packages} />
      <Route path="/booking" component={Booking} />
      <Route path="/booking-confirmation" component={BookingConfirmation} />
      <Route path="/contact" component={Contact} />
      <Route path="/admin-dashboard-secure" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
