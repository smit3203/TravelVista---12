import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  CalendarDays, User, MapPin, Package, Phone, Mail, Lock, 
  BarChart3, TrendingUp, DollarSign, Users, MessageSquare, 
  ShieldCheck, Inbox, Search, Filter, RefreshCw
} from "lucide-react";
import type { Booking, Contact } from "@shared/schema";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';

const Admin = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"analytics" | "bookings" | "inquiries">("analytics");
  
  // Bookings list search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [packageFilter, setPackageFilter] = useState("all");
  const [destinationFilter, setDestinationFilter] = useState("all");

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        toast({
          title: "Access Granted",
          description: "Welcome to the secure admin dashboard, Smit!",
        });
      } else {
        toast({
          title: "Access Denied",
          description: "Incorrect password. This area is restricted to authorized users only.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to verify credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const { data: bookings, isLoading: bookingsLoading, refetch: refetchBookings } = useQuery<Booking[]>({
    queryKey: ['/api/bookings'],
    enabled: isAuthenticated,
  });

  const { data: contacts, isLoading: contactsLoading, refetch: refetchContacts } = useQuery<Contact[]>({
    queryKey: ['/api/contacts'],
    enabled: isAuthenticated,
  });

  const handleRefresh = () => {
    refetchBookings();
    refetchContacts();
    toast({
      title: "Data Refreshed",
      description: "Successfully fetched latest bookings and inquiries.",
    });
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return format(date, 'PPp');
    } catch {
      return 'N/A';
    }
  };

  // Helper to map package type to price for estimated revenue
  const getBookingPrice = (packageType: string) => {
    switch (packageType) {
      case 'complete-package': return 1800;
      case 'flight-hotel': return 1100;
      case 'hotel-only': return 600;
      case 'flight-only': return 500;
      default: return 1000;
    }
  };

  // Analytics calculations
  const totalBookings = bookings?.length || 0;
  const totalRevenue = bookings?.reduce((sum, b) => {
    if (b.paymentStatus === 'paid') {
      return sum + (b.amountPaid ? parseFloat(b.amountPaid) : getBookingPrice(b.packageType));
    }
    if (!b.paymentStatus) {
      return sum + (b.amountPaid ? parseFloat(b.amountPaid) : getBookingPrice(b.packageType));
    }
    return sum;
  }, 0) || 0;
  const averageBookingValue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;
  const totalInquiries = contacts?.length || 0;

  // Chart data 1: Destination Popularity
  const destinationData = (() => {
    if (!bookings) return [];
    const counts: Record<string, number> = {};
    bookings.forEach(b => {
      counts[b.destination] = (counts[b.destination] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  })();

  // Chart data 2: Package Preferences
  const packageData = (() => {
    if (!bookings) return [];
    const counts: Record<string, number> = {};
    bookings.forEach(b => {
      const label = b.packageType
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  // Chart data 3: Traveler Age Demographics
  const ageData = (() => {
    if (!bookings) return [];
    const ranges = {
      '18-25': 0,
      '26-35': 0,
      '36-50': 0,
      '50+': 0
    };
    bookings.forEach(b => {
      const age = b.age;
      if (age >= 18 && age <= 25) ranges['18-25']++;
      else if (age >= 26 && age <= 35) ranges['26-35']++;
      else if (age >= 36 && age <= 50) ranges['36-50']++;
      else if (age > 50) ranges['50+']++;
    });
    return Object.entries(ranges).map(([name, count]) => ({ name, count }));
  })();

  // Chart data 4: Revenue & Bookings Trend
  const trendData = (() => {
    if (!bookings) return [];
    const sortedBookings = [...bookings].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    });

    const dailyCounts: Record<string, { count: number, revenue: number }> = {};
    sortedBookings.forEach(b => {
      if (!b.createdAt) return;
      const dateStr = format(new Date(b.createdAt), 'MMM dd');
      const price = b.amountPaid ? parseFloat(b.amountPaid) : getBookingPrice(b.packageType);
      if (!dailyCounts[dateStr]) {
        dailyCounts[dateStr] = { count: 0, revenue: 0 };
      }
      dailyCounts[dateStr].count += 1;
      dailyCounts[dateStr].revenue += price;
    });

    let runningTotalBookings = 0;
    let runningTotalRevenue = 0;
    
    return Object.entries(dailyCounts).map(([date, data]) => {
      runningTotalBookings += data.count;
      runningTotalRevenue += data.revenue;
      return {
        date,
        Bookings: runningTotalBookings,
        Revenue: runningTotalRevenue
      };
    });
  })();

  // Filter Bookings List
  const filteredBookings = bookings?.filter(b => {
    const matchesSearch = 
      `${b.firstName} ${b.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.destination.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesPackage = packageFilter === "all" || b.packageType === packageFilter;
    const matchesDestination = destinationFilter === "all" || b.destination === destinationFilter;
    
    return matchesSearch && matchesPackage && matchesDestination;
  });

  const uniqueDestinations = (() => {
    if (!bookings) return [];
    return Array.from(new Set(bookings.map(b => b.destination)));
  })();

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md shadow-2xl border-gray-100">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-50 p-4 rounded-full text-travel-blue">
                  <Lock className="h-10 w-10 animate-pulse" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
                TravelVista Admin Panel
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">Owner & Administrator Access Only</p>
              <p className="text-xs text-gray-400 mt-2 bg-gray-100 py-1.5 px-3 rounded-lg inline-block">
                For Smit Sabhaya • Authorized Personnel Only
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="Enter secure admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="rounded-xl h-11 border-gray-200 focus:border-travel-blue focus:ring-travel-blue"
                />
              </div>
              <Button 
                onClick={handleLogin} 
                disabled={loading || !password}
                className="w-full h-11 bg-travel-blue hover:bg-travel-dark-blue text-white rounded-xl font-semibold shadow-md shadow-blue-500/10 transition-all hover:translate-y-[-1px]"
              >
                {loading ? "Verifying..." : "Access Dashboard"}
              </Button>
              <p className="text-xs text-gray-400 text-center">
                Access attempts are logged. Unauthorized access is strictly prohibited.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />
      
      <div className="pt-16">
        {/* Admin Header */}
        <div className="bg-white border-b sticky top-16 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-6 gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="h-6 w-6 text-travel-blue" />
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
                  <Badge className="bg-travel-blue/15 text-travel-blue border-none font-semibold hover:bg-travel-blue/15">
                    Secure Mode
                  </Badge>
                </div>
                <p className="text-gray-500 text-sm mt-0.5">Welcome back, Smit Sabhaya</p>
              </div>
              <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="icon"
                  className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
                  title="Refresh Data"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={() => {
                    setIsAuthenticated(false);
                    setPassword("");
                    toast({
                      title: "Logged Out",
                      description: "Secure session ended.",
                    });
                  }}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl font-semibold px-4 h-10 transition-colors"
                >
                  Logout
                </Button>
              </div>
            </div>

            {/* Custom Tabbed Navigation */}
            <div className="flex space-x-2 border-t border-gray-100 pt-2">
              <button
                onClick={() => setActiveTab("analytics")}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === "analytics"
                    ? "border-travel-blue text-travel-blue"
                    : "border-transparent text-gray-500 hover:text-travel-blue hover:border-gray-200"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Overview & Analytics</span>
              </button>
              
              <button
                onClick={() => setActiveTab("bookings")}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === "bookings"
                    ? "border-travel-blue text-travel-blue"
                    : "border-transparent text-gray-500 hover:text-travel-blue hover:border-gray-200"
                }`}
              >
                <Package className="h-4 w-4" />
                <span>Bookings ({totalBookings})</span>
              </button>
              
              <button
                onClick={() => setActiveTab("inquiries")}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === "inquiries"
                    ? "border-travel-blue text-travel-blue"
                    : "border-transparent text-gray-500 hover:text-travel-blue hover:border-gray-200"
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Customer Inquiries ({totalInquiries})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Contents */}
        <main className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* TAB 1: ANALYTICS OVERVIEW */}
          {activeTab === "analytics" && (
            <div className="space-y-8 animate-fadeIn">
              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="hover:shadow-md transition-shadow border-gray-100 overflow-hidden relative group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-travel-blue" />
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Total Bookings
                        </p>
                        <h4 className="text-3xl font-extrabold text-gray-900 mt-2">
                          {bookingsLoading ? <Skeleton className="h-8 w-16" /> : totalBookings}
                        </h4>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-xl text-travel-blue">
                        <CalendarDays className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="flex items-center mt-4 text-xs font-medium text-green-600">
                      <TrendingUp className="h-3.5 w-3.5 mr-1" />
                      <span>+12.4% vs last month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow border-gray-100 overflow-hidden relative group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Total Revenue
                        </p>
                        <h4 className="text-3xl font-extrabold text-gray-900 mt-2">
                          {bookingsLoading ? (
                            <Skeleton className="h-8 w-24" />
                          ) : (
                            `₹${totalRevenue.toLocaleString()}`
                          )}
                        </h4>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-xl text-emerald-500">
                        <DollarSign className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="flex items-center mt-4 text-xs font-medium text-green-600">
                      <TrendingUp className="h-3.5 w-3.5 mr-1" />
                      <span>+8.7% vs last month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow border-gray-100 overflow-hidden relative group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Avg. Booking Value
                        </p>
                        <h4 className="text-3xl font-extrabold text-gray-900 mt-2">
                          {bookingsLoading ? (
                            <Skeleton className="h-8 w-20" />
                          ) : (
                            `₹${averageBookingValue.toLocaleString()}`
                          )}
                        </h4>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-xl text-amber-500">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                    </div>
                     <div className="flex items-center mt-4 text-xs font-medium text-gray-500">
                      <span>Based on actual transactions</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow border-gray-100 overflow-hidden relative group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500" />
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Inquiries Received
                        </p>
                        <h4 className="text-3xl font-extrabold text-gray-900 mt-2">
                          {contactsLoading ? <Skeleton className="h-8 w-16" /> : totalInquiries}
                        </h4>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-xl text-purple-500">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="flex items-center mt-4 text-xs font-medium text-purple-600">
                      <span>Active customer touchpoints</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Chart 1: Revenue Trend */}
                <Card className="border-gray-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-gray-800 flex items-center">
                      <TrendingUp className="h-4.5 w-4.5 text-travel-blue mr-2" />
                      Cumulative Bookings & Estimated Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    {bookingsLoading ? (
                      <Skeleton className="w-full h-full rounded-xl" />
                    ) : trendData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                          <YAxis yAxisId="left" stroke="#3b82f6" fontSize={12} />
                          <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} />
                          <Tooltip />
                          <Legend />
                          <Area yAxisId="left" type="monotone" dataKey="Revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (₹)" strokeWidth={2} />
                          <Area yAxisId="right" type="monotone" dataKey="Bookings" stroke="#10b981" fill="none" name="Bookings Count" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <Inbox className="h-10 w-10 mb-2" />
                        <span>No historical trend data available</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Chart 2: Destination Popularity */}
                <Card className="border-gray-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-gray-800 flex items-center">
                      <MapPin className="h-4.5 w-4.5 text-travel-blue mr-2" />
                      Popular Destinations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    {bookingsLoading ? (
                      <Skeleton className="w-full h-full rounded-xl" />
                    ) : destinationData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={destinationData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                          <XAxis type="number" stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                          <YAxis dataKey="name" type="category" stroke="#4b5563" fontSize={12} width={80} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Bookings" barSize={16}>
                            {destinationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <Inbox className="h-10 w-10 mb-2" />
                        <span>No destination data available</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Chart 3: Traveler Age Demographics */}
                <Card className="border-gray-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-gray-800 flex items-center">
                      <Users className="h-4.5 w-4.5 text-travel-blue mr-2" />
                      Traveler Age Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    {bookingsLoading ? (
                      <Skeleton className="w-full h-full rounded-xl" />
                    ) : ageData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ageData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                          <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Travelers" barSize={30}>
                            {ageData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <Inbox className="h-10 w-10 mb-2" />
                        <span>No age demographics data available</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Chart 4: Package Type Preferences */}
                <Card className="border-gray-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-gray-800 flex items-center">
                      <Package className="h-4.5 w-4.5 text-travel-blue mr-2" />
                      Package Type Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-80 flex items-center justify-center">
                    {bookingsLoading ? (
                      <Skeleton className="w-full h-full rounded-xl" />
                    ) : packageData.length > 0 ? (
                      <div className="w-full h-full flex flex-col sm:flex-row items-center justify-between">
                        <div className="w-full sm:w-1/2 h-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={packageData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {packageData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="w-full sm:w-1/2 flex flex-col space-y-2 px-4">
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Legend</h4>
                          {packageData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <span className="text-gray-600 font-medium">{entry.name}</span>
                              </div>
                              <span className="font-semibold text-gray-900">{entry.value} bookings</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <Inbox className="h-10 w-10 mb-2" />
                        <span>No package distribution data available</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 2: BOOKINGS LIST */}
          {activeTab === "bookings" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Search and Filters panel */}
              <Card className="border-gray-100 shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search Field */}
                    <div className="relative md:col-span-2">
                      <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search traveler name, email, or destination..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-11 border-gray-200 focus:border-travel-blue focus:ring-travel-blue rounded-xl"
                      />
                    </div>
                    {/* Package Type Filter */}
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-gray-400 hidden sm:block" />
                      <select
                        value={packageFilter}
                        onChange={(e) => setPackageFilter(e.target.value)}
                        className="w-full h-11 px-3 border border-gray-200 focus:border-travel-blue focus:outline-none rounded-xl text-sm text-gray-700 bg-white"
                      >
                        <option value="all">All Packages</option>
                        <option value="complete-package">Complete Package</option>
                        <option value="flight-hotel">Flight + Hotel</option>
                        <option value="hotel-only">Hotel Only</option>
                        <option value="flight-only">Flight Only</option>
                      </select>
                    </div>
                    {/* Destination Filter */}
                    <select
                      value={destinationFilter}
                      onChange={(e) => setDestinationFilter(e.target.value)}
                      className="w-full h-11 px-3 border border-gray-200 focus:border-travel-blue focus:outline-none rounded-xl text-sm text-gray-700 bg-white"
                    >
                      <option value="all">All Destinations</option>
                      {uniqueDestinations.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Bookings Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookingsLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="border-gray-150">
                      <CardContent className="p-6 space-y-3">
                        <Skeleton className="h-6 w-3/4 mb-4 rounded" />
                        <Skeleton className="h-4 w-full rounded" />
                        <Skeleton className="h-4 w-2/3 rounded" />
                        <Skeleton className="h-4 w-1/2 rounded" />
                      </CardContent>
                    </Card>
                  ))
                ) : filteredBookings && filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <Card key={booking.id} className="hover:shadow-md transition-all border-gray-100 overflow-hidden group">
                      <CardHeader className="pb-3 bg-gray-50/50 border-b border-gray-100/50">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base font-bold text-gray-900 group-hover:text-travel-blue transition-colors">
                              {booking.firstName} {booking.lastName}
                            </CardTitle>
                            <span className="text-xs text-gray-400 mt-1 block">Traveler Account</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-travel-blue/10 text-travel-blue hover:bg-travel-blue/15 border-none font-semibold">
                              #{booking.id}
                            </Badge>
                            {booking.paymentStatus === 'paid' ? (
                              <Badge className="bg-green-50 text-green-700 hover:bg-green-100 border-none font-semibold">
                                Paid
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-none font-semibold">
                                Pending
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center text-gray-600">
                            <Mail className="h-4 w-4 mr-2.5 text-gray-400 shrink-0" />
                            <span className="truncate" title={booking.email}>{booking.email}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Phone className="h-4 w-4 mr-2.5 text-gray-400 shrink-0" />
                            <span>{booking.phone}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <MapPin className="h-4 w-4 mr-2.5 text-gray-400 shrink-0" />
                            <span className="font-semibold text-gray-800">{booking.destination}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Package className="h-4 w-4 mr-2.5 text-gray-400 shrink-0" />
                            <Badge variant="outline" className="capitalize text-xs font-medium border-gray-200">
                              {booking.packageType.replace('-', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <CalendarDays className="h-4 w-4 mr-2.5 text-gray-400 shrink-0" />
                            <span>Departure: {booking.travelDate}</span>
                          </div>
                           <div className="flex items-center text-gray-600">
                            <User className="h-4 w-4 mr-2.5 text-gray-400 shrink-0" />
                            <span>Age: {booking.age}</span>
                          </div>
                          
                          <div className="flex items-center text-gray-600">
                            <DollarSign className="h-4 w-4 mr-2.5 text-gray-400 shrink-0" />
                            <span>
                              Amount Paid: <strong className="text-gray-900">₹{booking.amountPaid ? parseFloat(booking.amountPaid).toLocaleString() : getBookingPrice(booking.packageType).toLocaleString()}</strong>
                            </span>
                          </div>

                          {booking.paymentId && (
                            <div className="flex items-center text-gray-600">
                              <ShieldCheck className="h-4 w-4 mr-2.5 text-gray-400 shrink-0" />
                              <span className="text-xs font-mono text-gray-500">
                                RZP ID: {booking.paymentId}
                              </span>
                            </div>
                          )}
                          
                          {booking.specialRequests && (
                            <div className="mt-4 p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-xs text-amber-800">
                              <strong className="block mb-1 text-amber-900">Special Request:</strong>
                              {booking.specialRequests}
                            </div>
                          )}
                        </div>

                        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                          <span>Confirmed Booking</span>
                          <span>{formatDate(booking.createdAt)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-16 bg-white border rounded-2xl">
                    <Inbox className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-700">No bookings found</h3>
                    <p className="text-gray-400 text-sm mt-1">Try tweaking your search term or filters.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMER INQUIRIES */}
          {activeTab === "inquiries" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {contactsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="border-gray-150">
                      <CardContent className="p-6 space-y-3">
                        <Skeleton className="h-6 w-1/2 mb-4 rounded" />
                        <Skeleton className="h-4 w-full rounded" />
                        <Skeleton className="h-16 w-full rounded" />
                      </CardContent>
                    </Card>
                  ))
                ) : contacts && contacts.length > 0 ? (
                  contacts.map((contact) => (
                    <Card key={contact.id} className="hover:shadow-md transition-all border-gray-100 overflow-hidden group">
                      <CardHeader className="pb-3 bg-gray-50/30 border-b border-gray-100/50">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base font-bold text-gray-900 group-hover:text-travel-blue transition-colors">
                              {contact.name}
                            </CardTitle>
                            <span className="text-xs text-gray-400 mt-1 block">Inquirer Contact</span>
                          </div>
                          <Badge variant="outline" className="text-xs font-semibold border-gray-200">
                            Ticket #{contact.id}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-4 w-4 mr-2.5 text-gray-400 shrink-0" />
                            <a 
                              href={`mailto:${contact.email}?subject=Re: ${encodeURIComponent(contact.subject)}`}
                              className="text-travel-blue hover:underline font-semibold"
                              title="Click to email reply"
                            >
                              {contact.email}
                            </a>
                          </div>
                          
                          <div className="pt-2">
                            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                              Subject
                            </div>
                            <div className="text-sm font-semibold text-gray-900">
                              {contact.subject}
                            </div>
                          </div>

                          <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                              Message Content
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                              {contact.message}
                            </p>
                          </div>

                          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                            <a 
                              href={`mailto:${contact.email}?subject=Re: ${encodeURIComponent(contact.subject)}`}
                              className="inline-flex items-center text-travel-blue font-semibold hover:underline"
                            >
                              Reply via Email &rarr;
                            </a>
                            <span>Received: {formatDate(contact.createdAt)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-16 bg-white border rounded-2xl">
                    <Inbox className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-700">No customer inquiries</h3>
                    <p className="text-gray-400 text-sm mt-1">Everything is quiet. No feedback reports or contact mails.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default Admin;