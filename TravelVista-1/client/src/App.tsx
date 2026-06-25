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

import { ComponentType } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

function ProtectedRoute({ component: Component }: { component: ComponentType<any> }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-travel-blue"></div>
      </div>
    );
  }

  if (!user) {
    // If not authenticated, redirect to /auth
    return <Redirect to="/auth" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/"><ProtectedRoute component={Home} /></Route>
      <Route path="/my-bookings"><ProtectedRoute component={MyBookingsPage} /></Route>
      <Route path="/destinations"><ProtectedRoute component={Destinations} /></Route>
      <Route path="/flights"><ProtectedRoute component={Flights} /></Route>
      <Route path="/hotels"><ProtectedRoute component={Hotels} /></Route>
      <Route path="/packages"><ProtectedRoute component={Packages} /></Route>
      <Route path="/booking"><ProtectedRoute component={Booking} /></Route>
      <Route path="/booking-confirmation"><ProtectedRoute component={BookingConfirmation} /></Route>
      <Route path="/contact"><ProtectedRoute component={Contact} /></Route>
      <Route path="/admin-dashboard-secure"><ProtectedRoute component={Admin} /></Route>
      <Route><ProtectedRoute component={NotFound} /></Route>
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
