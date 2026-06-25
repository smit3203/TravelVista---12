import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Wifi, Car, Utensils, Coffee, Dumbbell, MapPin } from "lucide-react";
import type { Hotel } from "@shared/schema";

interface HotelCardProps {
  hotel: Hotel;
  onBookNow: () => void;
}

const HotelCard = ({ hotel, onBookNow }: HotelCardProps) => {
  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi')) return <Wifi className="h-4 w-4 text-travel-green mr-2" />;
    if (amenityLower.includes('parking')) return <Car className="h-4 w-4 text-travel-green mr-2" />;
    if (amenityLower.includes('restaurant')) return <Utensils className="h-4 w-4 text-travel-green mr-2" />;
    if (amenityLower.includes('coffee')) return <Coffee className="h-4 w-4 text-travel-green mr-2" />;
    if (amenityLower.includes('fitness')) return <Dumbbell className="h-4 w-4 text-travel-green mr-2" />;
    return <MapPin className="h-4 w-4 text-travel-green mr-2" />;
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <img 
        src={`${hotel.imageUrl}?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250`}
        alt={hotel.name}
        className="w-full h-48 object-cover"
      />
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-gray-900">{hotel.name}</h3>
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${i < Math.floor(parseFloat(hotel.rating)) ? 'fill-current' : ''}`}
              />
            ))}
          </div>
        </div>
        
        <p className="text-gray-600 mb-4">{hotel.location}</p>
        
        <ul className="text-sm text-gray-600 mb-4 space-y-1">
          {hotel.amenities.map((amenity, index) => (
            <li key={index} className="flex items-center">
              {getAmenityIcon(amenity)}
              {amenity}
            </li>
          ))}
        </ul>
        
        <div className="flex justify-between items-center">
          <div>
            <span className="text-2xl font-bold text-travel-blue">
              ₹{hotel.price}
            </span>
            <span className="text-gray-500 text-sm">/night</span>
          </div>
          <Button 
            onClick={onBookNow}
            className="bg-travel-blue hover:bg-travel-dark-blue"
          >
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HotelCard;
