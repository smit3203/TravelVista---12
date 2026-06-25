// This file contains mock data for development purposes
// In a real application, this would be replaced with actual API calls

export const mockDestinations = [
  {
    id: 1,
    name: "Bali",
    country: "Indonesia",
    description: "Tropical paradise with stunning beaches and culture",
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5",
    price: 599
  },
  {
    id: 2,
    name: "Paris",
    country: "France",
    description: "City of lights and romance",
    imageUrl: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a",
    price: 799
  },
  {
    id: 3,
    name: "Tokyo",
    country: "Japan",
    description: "Modern metropolis with ancient traditions",
    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf",
    price: 899
  },
  {
    id: 4,
    name: "Swiss Alps",
    country: "Switzerland",
    description: "Breathtaking mountain landscapes",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    price: 1299
  }
];

export const mockPackages = [
  {
    id: 1,
    name: "Santorini Escape",
    destination: "Santorini, Greece",
    duration: "7 Days / 6 Nights",
    price: 1499,
    rating: 4.9,
    reviewCount: 156,
    imageUrl: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff",
    description: "Experience the magic of Santorini with breathtaking sunsets and luxury accommodation",
    includes: ["Round-trip flights", "5-star resort accommodation", "Daily breakfast", "Island tours & activities"],
    category: "Popular"
  },
  {
    id: 2,
    name: "Maldives Paradise",
    destination: "Maldives",
    duration: "5 Days / 4 Nights",
    price: 2899,
    rating: 4.8,
    reviewCount: 89,
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5",
    description: "Ultimate luxury in overwater villas with pristine beaches",
    includes: ["Private transfers", "Overwater villa", "All meals included", "Spa treatments"],
    category: "Luxury"
  },
  {
    id: 3,
    name: "Thailand Adventure",
    destination: "Thailand",
    duration: "10 Days / 9 Nights",
    price: 899,
    rating: 4.7,
    reviewCount: 234,
    imageUrl: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a",
    description: "Explore the vibrant culture and stunning landscapes of Thailand",
    includes: ["Multi-city tour", "4-star hotels", "Local guide", "Cultural experiences"],
    category: "Adventure"
  }
];

export const mockHotels = [
  {
    id: 1,
    name: "Ocean View Resort",
    location: "Bali, Indonesia",
    price: 199,
    rating: 5.0,
    imageUrl: "https://images.unsplash.com/photo-1611892440504-42a792e24d32",
    amenities: ["Free WiFi", "Infinity Pool", "Spa Services", "Restaurant"]
  },
  {
    id: 2,
    name: "City Center Hotel",
    location: "Paris, France",
    price: 149,
    rating: 4.0,
    imageUrl: "https://images.unsplash.com/photo-1564501049412-61c2a3083791",
    amenities: ["Free WiFi", "Fitness Center", "Concierge", "Valet Parking"]
  },
  {
    id: 3,
    name: "Boutique Hotel",
    location: "Tokyo, Japan",
    price: 129,
    rating: 5.0,
    imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa",
    amenities: ["Free WiFi", "Coffee Shop", "Premium Bedding", "Smart TV"]
  }
];

export const mockFlights = [
  {
    id: 1,
    airline: "Singapore Airlines",
    flightNumber: "SQ 123",
    departureCity: "New York (JFK)",
    arrivalCity: "Tokyo (NRT)",
    departureTime: "08:30",
    arrivalTime: "15:00+1",
    duration: "14h 30m",
    stops: "1 stop",
    price: 899
  },
  {
    id: 2,
    airline: "Emirates",
    flightNumber: "EK 202",
    departureCity: "New York (JFK)",
    arrivalCity: "Tokyo (NRT)",
    departureTime: "10:15",
    arrivalTime: "19:00+1",
    duration: "16h 45m",
    stops: "1 stop",
    price: 1199
  }
];
