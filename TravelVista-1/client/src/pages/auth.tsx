import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, User, Compass, Calendar, Plane, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  // If user is already logged in, redirect to home
  if (user) {
    setTimeout(() => setLocation("/"), 50);
    return null;
  }

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) return;
    loginMutation.mutate({ username: loginUsername, password: loginPassword });
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerUsername || !registerPassword) return;
    if (registerPassword !== confirmPassword) {
      setPasswordsMatch(false);
      return;
    }
    setPasswordsMatch(true);
    registerMutation.mutate({ username: registerUsername, password: registerPassword });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex flex-col">
      <Navbar />
      
      <div className="flex-grow pt-24 pb-16 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white/60 backdrop-blur-md border border-white/20 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden">
          
          {/* Brand Presentation Section (Left) */}
          <div className="md:col-span-5 flex flex-col justify-between h-full text-gray-800 space-y-8 pr-0 md:pr-6 border-r-0 md:border-r border-gray-100">
            <div>
              <div className="flex items-center space-x-2 text-travel-blue mb-4">
                <Compass className="h-8 w-8 animate-spin-slow" />
                <span className="text-2xl font-bold tracking-tight">TravelVista</span>
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Your journey starts with a single click.
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed text-sm">
                Create an account to book flights, track hotel stays, save custom travel packages, and manage all your travel itineraries in one beautiful dashboard.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-blue-50/50 border border-blue-100/50">
                <div className="p-2 bg-blue-500 rounded-xl text-white">
                  <Plane className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-gray-900">Seamless Bookings</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Quickly reserve flights, hotels, and packages with single-click checkouts.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100/50">
                <div className="p-2 bg-indigo-500 rounded-xl text-white">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-gray-900">Booking History</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Access and modify your past and upcoming reservations in one neat place.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-teal-50/50 border border-teal-100/50">
                <div className="p-2 bg-teal-500 rounded-xl text-white">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-gray-900">Safe & Secure</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Your personal information and bookings are protected with modern encryption.</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} TravelVista Inc. All rights reserved.
            </p>
          </div>

          {/* Form Auth Section (Right) */}
          <div className="md:col-span-7 w-full max-w-lg mx-auto">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100/80 p-1 rounded-2xl">
                <TabsTrigger value="login" className="rounded-xl py-2.5 text-sm font-semibold tracking-wide transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="register" className="rounded-xl py-2.5 text-sm font-semibold tracking-wide transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Register
                </TabsTrigger>
              </TabsList>

              {/* Login Tab Content */}
              <TabsContent value="login">
                <Card className="border-0 shadow-none bg-transparent">
                  <CardHeader className="p-0 mb-6">
                    <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
                    <CardDescription className="text-gray-500 text-sm mt-1">
                      Enter your account details to access your dashboard.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="login-username" className="text-xs font-semibold text-gray-700">Username</Label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-3 h-4.5 w-4.5 text-gray-400" />
                          <Input
                            id="login-username"
                            type="text"
                            required
                            placeholder="Enter your username"
                            value={loginUsername}
                            onChange={(e) => setLoginUsername(e.target.value)}
                            className="pl-10 h-11 border-gray-200 focus:border-travel-blue focus:ring-1 focus:ring-travel-blue rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="login-password" className="text-xs font-semibold text-gray-700">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-3 h-4.5 w-4.5 text-gray-400" />
                          <Input
                            id="login-password"
                            type="password"
                            required
                            placeholder="••••••••"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="pl-10 h-11 border-gray-200 focus:border-travel-blue focus:ring-1 focus:ring-travel-blue rounded-xl"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={loginMutation.isPending}
                        className="w-full h-11 bg-travel-blue hover:bg-travel-dark-blue text-white font-semibold rounded-xl mt-6 shadow-md shadow-blue-500/10 transition-colors"
                      >
                        {loginMutation.isPending ? "Logging in..." : "Access Dashboard"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Register Tab Content */}
              <TabsContent value="register">
                <Card className="border-0 shadow-none bg-transparent">
                  <CardHeader className="p-0 mb-6">
                    <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
                    <CardDescription className="text-gray-500 text-sm mt-1">
                      Register to unlock flight and hotel reservation history.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="register-username" className="text-xs font-semibold text-gray-700">Username</Label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-3 h-4.5 w-4.5 text-gray-400" />
                          <Input
                            id="register-username"
                            type="text"
                            required
                            placeholder="Choose a username"
                            value={registerUsername}
                            onChange={(e) => setRegisterUsername(e.target.value)}
                            className="pl-10 h-11 border-gray-200 focus:border-travel-blue focus:ring-1 focus:ring-travel-blue rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="register-password" className="text-xs font-semibold text-gray-700">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-3 h-4.5 w-4.5 text-gray-400" />
                          <Input
                            id="register-password"
                            type="password"
                            required
                            placeholder="Create password"
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                            className="pl-10 h-11 border-gray-200 focus:border-travel-blue focus:ring-1 focus:ring-travel-blue rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="confirm-password" className="text-xs font-semibold text-gray-700">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-3 h-4.5 w-4.5 text-gray-400" />
                          <Input
                            id="confirm-password"
                            type="password"
                            required
                            placeholder="Re-enter password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10 h-11 border-gray-200 focus:border-travel-blue focus:ring-1 focus:ring-travel-blue rounded-xl"
                          />
                        </div>
                        {!passwordsMatch && (
                          <p className="text-red-500 text-xs mt-1">Passwords do not match.</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={registerMutation.isPending}
                        className="w-full h-11 bg-travel-blue hover:bg-travel-dark-blue text-white font-semibold rounded-xl mt-6 shadow-md shadow-blue-500/10 transition-colors"
                      >
                        {registerMutation.isPending ? "Creating account..." : "Register Now"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
