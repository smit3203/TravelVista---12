import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Instagram, Youtube, Phone, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">TravelStud</h3>
            <p className="text-gray-300 mb-4">
              Your trusted partner for unforgettable travel experiences around the world.
            </p>
            <div className="space-y-2 text-gray-300 mb-4">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>+91 8849276759</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span>smitchhabhaya33@gmail.com</span>
              </div>
            </div>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="https://instagram.com/smit_chhabhaya" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                <Youtube className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="/destinations" className="hover:text-white transition-colors">Destinations</a></li>
              <li><a href="/packages" className="hover:text-white transition-colors">Travel Packages</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/flights" className="hover:text-white transition-colors">Flight Booking</a></li>
              <li><a href="/hotels" className="hover:text-white transition-colors">Hotel Reservations</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Car Rentals</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Travel Insurance</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
            <p className="text-gray-300 mb-4">Subscribe for travel deals and updates</p>
            <div className="flex">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="flex-1 rounded-r-none border-gray-600 bg-gray-800 text-white placeholder-gray-400"
              />
              <Button 
                onClick={() => alert("Thank you for subscribing! We'll keep you updated with the latest travel deals.")}
                className="bg-travel-blue hover:bg-travel-dark-blue rounded-l-none transition-colors"
              >
                Subscribe
              </Button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 TravelStud. All rights reserved. | Created by Smit Sabhaya</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
