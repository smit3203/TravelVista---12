import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plane } from "lucide-react";
import type { Flight } from "@shared/schema";

interface FlightResultProps {
  flight: Flight;
  onSelect: () => void;
}

const FlightResult = ({ flight, onSelect }: FlightResultProps) => {
  const getAirlineColor = (airline: string) => {
    switch (airline.toLowerCase()) {
      case 'singapore airlines':
        return 'bg-travel-blue';
      case 'emirates':
        return 'bg-red-500';
      case 'lufthansa':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="border border-gray-200 hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <div className={`w-12 h-12 ${getAirlineColor(flight.airline)} rounded-lg flex items-center justify-center`}>
                <Plane className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{flight.airline}</h3>
                <p className="text-sm text-gray-600">{flight.flightNumber}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{flight.departureTime}</div>
                <div className="text-sm text-gray-600">{flight.departureCity}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-px bg-gray-300"></div>
                  <Plane className="h-4 w-4 text-travel-blue" />
                  <div className="w-4 h-px bg-gray-300"></div>
                </div>
                <div className="text-sm text-gray-600 mt-1">{flight.duration}</div>
                <div className="text-xs text-gray-500">{flight.stops}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{flight.arrivalTime}</div>
                <div className="text-sm text-gray-600">{flight.arrivalCity}</div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="text-2xl font-bold text-travel-blue">₹{flight.price}</div>
            <div className="text-sm text-gray-600">per person</div>
            <Button 
              onClick={onSelect}
              className="bg-travel-blue hover:bg-travel-dark-blue"
            >
              Select
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlightResult;
