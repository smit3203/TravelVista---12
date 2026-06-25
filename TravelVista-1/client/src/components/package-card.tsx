import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Check } from "lucide-react";
import type { Package } from "@shared/schema";

interface PackageCardProps {
  package: Package;
  onBookNow: () => void;
}

const PackageCard = ({ package: pkg, onBookNow }: PackageCardProps) => {
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'popular':
        return 'bg-travel-orange';
      case 'luxury':
        return 'bg-travel-green';
      case 'adventure':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <img 
        src={`${pkg.imageUrl}?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250`}
        alt={pkg.name}
        className="w-full h-48 object-cover"
      />
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-gray-900">{pkg.name}</h3>
          <Badge className={`${getCategoryColor(pkg.category)} text-white`}>
            {pkg.category}
          </Badge>
        </div>
        
        <p className="text-gray-600 mb-4">{pkg.duration} • {pkg.destination}</p>
        
        <div className="flex items-center mb-4">
          <div className="flex text-yellow-400 mr-2">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${i < Math.floor(parseFloat(pkg.rating)) ? 'fill-current' : ''}`}
              />
            ))}
          </div>
          <span className="text-gray-600 text-sm">
            ({pkg.rating}) {pkg.reviewCount} reviews
          </span>
        </div>
        
        <ul className="text-sm text-gray-600 mb-4 space-y-1">
          {pkg.includes.map((item, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-4 w-4 text-travel-green mr-2" />
              {item}
            </li>
          ))}
        </ul>
        
        <div className="flex justify-between items-center">
          <div>
            <span className="text-2xl font-bold text-travel-blue">
              ₹{pkg.price}
            </span>
            <span className="text-gray-500 text-sm">/person</span>
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

export default PackageCard;
