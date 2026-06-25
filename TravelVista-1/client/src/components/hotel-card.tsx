import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Star, Wifi, Car, Utensils, Coffee, Dumbbell, MapPin, MessageSquare, Plus } from "lucide-react";
import type { Hotel, Review } from "@shared/schema";

interface HotelCardProps {
  hotel: Hotel;
  onBookNow: () => void;
}

const HotelCard = ({ hotel, onBookNow }: HotelCardProps) => {
  const { toast } = useToast();
  const { user } = useAuth();

  // Review Dialog form states
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>("");

  // Fetch reviews for this hotel
  const { data: reviews, isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: [`/api/reviews/hotel/${hotel.id}`],
    queryFn: async () => {
      const response = await fetch(`/api/reviews/hotel/${hotel.id}`);
      if (!response.ok) throw new Error("Failed to fetch reviews");
      return response.json();
    }
  });

  // Post review mutation
  const postReviewMutation = useMutation({
    mutationFn: async (reviewData: { rating: number; comment: string; itemId: number; itemType: string }) => {
      const response = await apiRequest("POST", "/api/reviews", reviewData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/reviews/hotel/${hotel.id}`] });
      toast({
        title: "Review Submitted!",
        description: "Thank you for sharing your experience.",
      });
      setNewComment("");
      setNewRating(5);
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Could not submit your review. Please try again.",
        variant: "destructive",
      });
    }
  });

  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi')) return <Wifi className="h-4 w-4 text-travel-green mr-2" />;
    if (amenityLower.includes('parking')) return <Car className="h-4 w-4 text-travel-green mr-2" />;
    if (amenityLower.includes('restaurant')) return <Utensils className="h-4 w-4 text-travel-green mr-2" />;
    if (amenityLower.includes('coffee')) return <Coffee className="h-4 w-4 text-travel-green mr-2" />;
    if (amenityLower.includes('fitness')) return <Dumbbell className="h-4 w-4 text-travel-green mr-2" />;
    return <MapPin className="h-4 w-4 text-travel-green mr-2" />;
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    postReviewMutation.mutate({
      rating: newRating,
      comment: newComment,
      itemId: hotel.id,
      itemType: "hotel"
    });
  };

  // Compute average rating from reviews (or default to hotel rating)
  const averageRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : hotel.rating;

  const reviewCount = reviews?.length || 0;

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between h-full bg-white border border-gray-150 rounded-2xl">
      <div>
        <img 
          src={`${hotel.imageUrl}?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250`}
          alt={hotel.name}
          className="w-full h-48 object-cover"
        />
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold text-gray-900 leading-tight">{hotel.name}</h3>
            
            {/* Reviews Dialog trigger */}
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center gap-1 text-xs text-gray-500 font-semibold hover:text-travel-blue hover:underline bg-gray-50 px-2 py-1 rounded-lg border cursor-pointer select-none whitespace-nowrap">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span>{averageRating} ({reviewCount})</span>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-white border rounded-2xl shadow-xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-extrabold text-gray-900">
                    Reviews: {hotel.name}
                  </DialogTitle>
                </DialogHeader>

                {/* Rating breakdown summary */}
                <div className="flex items-center gap-4 py-4 border-b">
                  <div className="text-center">
                    <div className="text-4xl font-extrabold text-gray-900">{averageRating}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Out of 5 Stars</div>
                  </div>
                  <div className="flex-1 text-xs text-gray-500 font-medium">
                    Based on {reviewCount} customer {reviewCount === 1 ? 'review' : 'reviews'}.
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-4 py-4 max-h-[300px] overflow-y-auto pr-1">
                  {reviewsLoading ? (
                    <p className="text-xs text-gray-400">Loading reviews...</p>
                  ) : reviews && reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-gray-800">{review.username}</span>
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-3 w-3 ${i < review.rating ? 'fill-current' : ''}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                          {review.comment}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-gray-400">
                      No customer reviews yet. Be the first to share your thoughts!
                    </div>
                  )}
                </div>

                {/* Add Review Form */}
                <div className="pt-4 border-t">
                  {user ? (
                    <form onSubmit={handleReviewSubmit} className="space-y-3.5">
                      <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        <MessageSquare className="h-4 w-4 text-travel-blue" />
                        Write a Review
                      </h4>
                      
                      {/* Star Rating Selectors */}
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500 font-semibold mr-2">Your Rating:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            className="cursor-pointer text-yellow-400 hover:scale-110 transition-transform"
                          >
                            <Star className={`h-6 w-6 ${star <= newRating ? 'fill-current' : 'text-gray-250'}`} />
                          </button>
                        ))}
                      </div>

                      <Textarea 
                        placeholder="Share details of your stay at this hotel..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="text-xs rounded-xl border-gray-200 focus:border-travel-blue focus:ring-1 focus:ring-travel-blue min-h-[70px]"
                        required
                      />

                      <Button
                        type="submit"
                        disabled={postReviewMutation.isPending}
                        className="w-full bg-travel-blue hover:bg-travel-dark-blue text-white rounded-xl text-xs font-semibold h-9"
                      >
                        {postReviewMutation.isPending ? "Submitting..." : "Post Review"}
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center py-3 text-xs text-gray-400 font-semibold bg-gray-50 border rounded-xl">
                      Please log in to submit a review.
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <p className="text-gray-600 mb-4 flex items-center gap-1 text-sm font-medium">
            <MapPin className="h-4 w-4 text-travel-blue" />
            {hotel.location}
          </p>
          
          <ul className="text-sm text-gray-600 mb-4 space-y-1.5">
            {hotel.amenities.map((amenity, index) => (
              <li key={index} className="flex items-center text-xs font-medium">
                {getAmenityIcon(amenity)}
                {amenity}
              </li>
            ))}
          </ul>
        </CardContent>
      </div>
      
      <div className="p-6 pt-0 border-t border-gray-50 bg-gray-50/50 flex justify-between items-center">
        <div>
          <span className="text-2xl font-bold text-travel-blue">
            ₹{parseFloat(hotel.price).toLocaleString()}
          </span>
          <span className="text-gray-500 text-[11px] font-semibold">/night</span>
        </div>
        <Button 
          onClick={onBookNow}
          className="bg-travel-blue hover:bg-travel-dark-blue font-semibold rounded-xl text-sm px-5"
        >
          Book Now
        </Button>
      </div>
    </Card>
  );
};

export default HotelCard;
