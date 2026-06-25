import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Compass } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const Navbar = () => {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logoutMutation } = useAuth();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/destinations", label: "Destinations" },
    { href: "/flights", label: "Flights" },
    { href: "/hotels", label: "Hotels" },
    { href: "/packages", label: "Packages" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location.startsWith(href);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center space-x-2">
              <Compass className="h-6 w-6 text-travel-blue" />
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">TravelVista</h1>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-baseline space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive(item.href)
                      ? "text-travel-blue bg-blue-50/50"
                      : "text-gray-600 hover:text-travel-blue hover:bg-gray-50/50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            
            {/* User Actions */}
            <div className="pl-4 border-l border-gray-100 flex items-center space-x-3">
              {user ? (
                <>
                  <Link href="/my-bookings">
                    <Button variant="ghost" className="text-sm font-semibold text-gray-700 hover:text-travel-blue rounded-xl">
                      My Bookings
                    </Button>
                  </Link>
                  <Button 
                    onClick={() => logoutMutation.mutate()} 
                    variant="outline" 
                    className="border-red-150 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl font-semibold"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Link href="/auth">
                  <Button className="bg-travel-blue hover:bg-travel-dark-blue text-white rounded-xl text-sm font-semibold px-5 shadow-sm shadow-blue-500/10">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        isActive(item.href)
                          ? "text-travel-blue bg-blue-50"
                          : "text-gray-600 hover:text-travel-blue hover:bg-gray-50"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                  
                  {/* Mobile User Buttons */}
                  <div className="pt-4 border-t border-gray-100 flex flex-col space-y-2">
                    {user ? (
                      <>
                        <Link href="/my-bookings" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full justify-start rounded-xl font-semibold">
                            My Bookings
                          </Button>
                        </Link>
                        <Button 
                          onClick={() => {
                            logoutMutation.mutate();
                            setIsOpen(false);
                          }} 
                          variant="destructive" 
                          className="w-full justify-start rounded-xl font-semibold"
                        >
                          Logout
                        </Button>
                      </>
                    ) : (
                      <Link href="/auth" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-travel-blue hover:bg-travel-dark-blue text-white rounded-xl font-semibold">
                          Sign In
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
