import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Destination } from "@shared/schema";

interface DestinationCardProps {
  destination: Destination;
  onBookNow: () => void;
}

const DestinationCard = ({ destination, onBookNow }: DestinationCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <img 
        src={destination.imageUrl}
        alt={`${destination.name} ${destination.country}`}
        className="w-full h-48 object-cover"
        onError={(e) => {
          // Fallback to a default image if the URL fails
          const target = e.target as HTMLImageElement;
          target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600';
        }}
      />
      <CardContent className="p-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {destination.name}, {destination.country}
        </h3>
        <p className="text-gray-600 text-sm mb-3">
          {destination.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-travel-blue font-bold">
            From ₹{destination.price}
          </span>
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

export default DestinationCard;
