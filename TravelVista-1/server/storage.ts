import { users, bookings, destinations, packages, hotels, flights, contacts, reviews } from "@shared/schema";
import type { User, InsertUser, Booking, InsertBooking, Destination, InsertDestination, Package, InsertPackage, Hotel, InsertHotel, Flight, InsertFlight, Contact, InsertContact, Review, InsertReview } from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Booking methods
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookings(): Promise<Booking[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByUserId(userId: number): Promise<Booking[]>;
  
  // Destination methods
  getDestinations(): Promise<Destination[]>;
  getDestination(id: number): Promise<Destination | undefined>;
  createDestination(destination: InsertDestination): Promise<Destination>;
  
  // Package methods
  getPackages(): Promise<Package[]>;
  getPackage(id: number): Promise<Package | undefined>;
  createPackage(packageData: InsertPackage): Promise<Package>;
  
  // Hotel methods
  getHotels(): Promise<Hotel[]>;
  getHotel(id: number): Promise<Hotel | undefined>;
  createHotel(hotel: InsertHotel): Promise<Hotel>;
  
  // Flight methods
  getFlights(): Promise<Flight[]>;
  getFlight(id: number): Promise<Flight | undefined>;
  createFlight(flight: InsertFlight): Promise<Flight>;
  searchFlights(from: string, to: string): Promise<Flight[]>;
  
  // Contact methods
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;

  // Review methods
  getReviews(itemId: number, itemType: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
}

export class DatabaseStorage implements IStorage {
  async initializeData() {
    // Ensure reviews table exists in the database
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "reviews" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL,
        "username" text NOT NULL,
        "rating" integer NOT NULL,
        "comment" text NOT NULL,
        "item_id" integer NOT NULL,
        "item_type" text NOT NULL,
        "created_at" timestamp DEFAULT now()
      );
    `);

    // Check if data already exists
    const existingDestinations = await db.select().from(destinations);
    if (existingDestinations.length > 0) {
      const bali = existingDestinations.find((d: any) => d.name === "Bali");
      if (bali && parseFloat(bali.price) < 5000) {
        // Clear old seed data to re-initialize with competitive INR pricing
        await db.delete(destinations);
        await db.delete(packages);
        await db.delete(hotels);
        await db.delete(flights);
      } else {
        const existingFlights = await db.select().from(flights);
        if (existingFlights.length < 5) {
          await db.delete(flights);
          const sampleFlights: InsertFlight[] = [
            {
              airline: "Singapore Airlines",
              flightNumber: "SQ 123",
              departureCity: "New Delhi (DEL)",
              arrivalCity: "Tokyo (NRT)",
              departureTime: "08:30",
              arrivalTime: "15:00+1",
              duration: "14h 30m",
              stops: "1 stop",
              price: "52999.00"
            },
            {
              airline: "All Nippon Airways",
              flightNumber: "NH 830",
              departureCity: "Mumbai (BOM)",
              arrivalCity: "Tokyo (HND)",
              departureTime: "09:00",
              arrivalTime: "19:00",
              duration: "9h 00m",
              stops: "Non-stop",
              price: "72499.00"
            },
            {
              airline: "Air India",
              flightNumber: "AI 306",
              departureCity: "New Delhi (DEL)",
              arrivalCity: "Tokyo (NRT)",
              departureTime: "21:15",
              arrivalTime: "08:45+1",
              duration: "8h 30m",
              stops: "Non-stop",
              price: "58999.00"
            },
            {
              airline: "VietJet Air",
              flightNumber: "VJ 891",
              departureCity: "New Delhi (DEL)",
              arrivalCity: "Bali (DPS)",
              departureTime: "07:45",
              arrivalTime: "16:30",
              duration: "8h 45m",
              stops: "1 stop",
              price: "28499.00"
            },
            {
              airline: "Batik Air",
              flightNumber: "OD 231",
              departureCity: "Mumbai (BOM)",
              arrivalCity: "Bali (DPS)",
              departureTime: "23:15",
              arrivalTime: "08:30+1",
              duration: "9h 15m",
              stops: "1 stop",
              price: "32999.00"
            },
            {
              airline: "AirAsia",
              flightNumber: "AK 53",
              departureCity: "New Delhi (DEL)",
              arrivalCity: "Bali (DPS)",
              departureTime: "11:30",
              arrivalTime: "21:00",
              duration: "9h 30m",
              stops: "1 stop",
              price: "26999.00"
            },
            {
              airline: "Air India",
              flightNumber: "AI 143",
              departureCity: "New Delhi (DEL)",
              arrivalCity: "Paris (CDG)",
              departureTime: "13:15",
              arrivalTime: "18:30",
              duration: "9h 15m",
              stops: "Non-stop",
              price: "58999.00"
            },
            {
              airline: "Air France",
              flightNumber: "AF 217",
              departureCity: "Mumbai (BOM)",
              arrivalCity: "Paris (CDG)",
              departureTime: "02:15",
              arrivalTime: "07:45",
              duration: "9h 30m",
              stops: "Non-stop",
              price: "68499.00"
            },
            {
              airline: "Gulf Air",
              flightNumber: "GF 131",
              departureCity: "New Delhi (DEL)",
              arrivalCity: "Paris (CDG)",
              departureTime: "21:45",
              arrivalTime: "07:30+1",
              duration: "11h 45m",
              stops: "1 stop",
              price: "42999.00"
            },
            {
              airline: "Swiss International",
              flightNumber: "LX 147",
              departureCity: "New Delhi (DEL)",
              arrivalCity: "Swiss Alps (ZRH)",
              departureTime: "01:15",
              arrivalTime: "06:15",
              duration: "9h 00m",
              stops: "Non-stop",
              price: "64999.00"
            },
            {
              airline: "Etihad Airways",
              flightNumber: "EY 206",
              departureCity: "Mumbai (BOM)",
              arrivalCity: "Swiss Alps (ZRH)",
              departureTime: "21:30",
              arrivalTime: "07:00+1",
              duration: "11h 30m",
              stops: "1 stop",
              price: "48499.00"
            },
            {
              airline: "Qatar Airways",
              flightNumber: "QR 571",
              departureCity: "New Delhi (DEL)",
              arrivalCity: "Santorini (JTR)",
              departureTime: "03:45",
              arrivalTime: "12:15",
              duration: "10h 30m",
              stops: "1 stop",
              price: "78999.00"
            },
            {
              airline: "IndiGo",
              flightNumber: "6E 1792",
              departureCity: "New Delhi (DEL)",
              arrivalCity: "Maldives (MLE)",
              departureTime: "09:00",
              arrivalTime: "13:00",
              duration: "4h 00m",
              stops: "Non-stop",
              price: "18499.00"
            },
            {
              airline: "Vistara",
              flightNumber: "UK 273",
              departureCity: "Mumbai (BOM)",
              arrivalCity: "Maldives (MLE)",
              departureTime: "11:15",
              arrivalTime: "14:30",
              duration: "3h 15m",
              stops: "Non-stop",
              price: "21999.00"
            },
            {
              airline: "Thai Airways",
              flightNumber: "TG 324",
              departureCity: "New Delhi (DEL)",
              arrivalCity: "Thailand (BKK)",
              departureTime: "07:45",
              arrivalTime: "13:30",
              duration: "4h 15m",
              stops: "Non-stop",
              price: "22999.00"
            },
            {
              airline: "IndiGo",
              flightNumber: "6E 105",
              departureCity: "Mumbai (BOM)",
              arrivalCity: "Thailand (BKK)",
              departureTime: "08:15",
              arrivalTime: "14:15",
              duration: "4h 30m",
              stops: "Non-stop",
              price: "16499.00"
            }
          ];
          await db.insert(flights).values(sampleFlights);
        }
        return; // Data already initialized with new pricing
      }
    }

    // Initialize sample destinations
    const sampleDestinations: InsertDestination[] = [
      {
        name: "Bali",
        country: "Indonesia",
        description: "Tropical paradise with stunning beaches and culture",
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5",
        price: "24999.00"
      },
      {
        name: "Paris",
        country: "France",
        description: "City of lights and romance",
        imageUrl: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a",
        price: "44999.00"
      },
      {
        name: "Tokyo",
        country: "Japan",
        description: "Modern metropolis with ancient traditions",
        imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf",
        price: "54999.00"
      },
      {
        name: "Swiss Alps",
        country: "Switzerland",
        description: "Breathtaking mountain landscapes",
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
        price: "74999.00"
      }
    ];

    await db.insert(destinations).values(sampleDestinations);

    // Initialize sample packages
    const samplePackages: InsertPackage[] = [
      {
        name: "Santorini Escape",
        destination: "Santorini, Greece",
        duration: "7 Days / 6 Nights",
        price: "119999.00",
        rating: "4.9",
        reviewCount: 156,
        imageUrl: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff",
        description: "Experience the magic of Santorini with breathtaking sunsets and luxury accommodation",
        includes: ["Round-trip flights", "5-star resort accommodation", "Daily breakfast", "Island tours & activities"],
        category: "Popular"
      },
      {
        name: "Maldives Paradise",
        destination: "Maldives",
        duration: "5 Days / 4 Nights",
        price: "149999.00",
        rating: "4.8",
        reviewCount: 89,
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5",
        description: "Ultimate luxury in overwater villas with pristine beaches",
        includes: ["Private transfers", "Overwater villa", "All meals included", "Spa treatments"],
        category: "Luxury"
      },
      {
        name: "Thailand Adventure",
        destination: "Thailand",
        duration: "10 Days / 9 Nights",
        price: "49999.00",
        rating: "4.7",
        reviewCount: 234,
        imageUrl: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a",
        description: "Explore the vibrant culture and stunning landscapes of Thailand",
        includes: ["Multi-city tour", "4-star hotels", "Local guide", "Cultural experiences"],
        category: "Adventure"
      }
    ];

    await db.insert(packages).values(samplePackages);

    // Initialize sample hotels
    const sampleHotels: InsertHotel[] = [
      {
        name: "Ocean View Resort",
        location: "Bali, Indonesia",
        price: "8499.00",
        rating: "5.0",
        imageUrl: "https://images.unsplash.com/photo-1611892440504-42a792e24d32",
        amenities: ["Free WiFi", "Infinity Pool", "Spa Services", "Restaurant"]
      },
      {
        name: "City Center Hotel",
        location: "Paris, France",
        price: "11999.00",
        rating: "4.0",
        imageUrl: "https://images.unsplash.com/photo-1564501049412-61c2a3083791",
        amenities: ["Free WiFi", "Fitness Center", "Concierge", "Valet Parking"]
      },
      {
        name: "Boutique Hotel",
        location: "Tokyo, Japan",
        price: "9499.00",
        rating: "5.0",
        imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa",
        amenities: ["Free WiFi", "Coffee Shop", "Premium Bedding", "Smart TV"]
      }
    ];

    await db.insert(hotels).values(sampleHotels);

    // Initialize sample flights
    const sampleFlights: InsertFlight[] = [
      {
        airline: "Singapore Airlines",
        flightNumber: "SQ 123",
        departureCity: "New York (JFK)",
        arrivalCity: "Tokyo (NRT)",
        departureTime: "08:30",
        arrivalTime: "15:00+1",
        duration: "14h 30m",
        stops: "1 stop",
        price: "94999.00"
      },
      {
        airline: "Emirates",
        flightNumber: "EK 202",
        departureCity: "New York (JFK)",
        arrivalCity: "Tokyo (NRT)",
        departureTime: "10:15",
        arrivalTime: "19:00+1",
        duration: "16h 45m",
        stops: "1 stop",
        price: "124999.00"
      }
    ];

    await db.insert(flights).values(sampleFlights);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Booking methods
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings).values(insertBooking).returning();
    return booking;
  }

  async getBookings(): Promise<Booking[]> {
    return await db.select().from(bookings);
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async getBookingsByUserId(userId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.userId, userId));
  }

  // Destination methods
  async getDestinations(): Promise<Destination[]> {
    return await db.select().from(destinations);
  }

  async getDestination(id: number): Promise<Destination | undefined> {
    const [destination] = await db.select().from(destinations).where(eq(destinations.id, id));
    return destination || undefined;
  }

  async createDestination(insertDestination: InsertDestination): Promise<Destination> {
    const [destination] = await db.insert(destinations).values(insertDestination).returning();
    return destination;
  }

  // Package methods
  async getPackages(): Promise<Package[]> {
    return await db.select().from(packages);
  }

  async getPackage(id: number): Promise<Package | undefined> {
    const [packageData] = await db.select().from(packages).where(eq(packages.id, id));
    return packageData || undefined;
  }

  async createPackage(insertPackage: InsertPackage): Promise<Package> {
    const [packageData] = await db.insert(packages).values(insertPackage).returning();
    return packageData;
  }

  // Hotel methods
  async getHotels(): Promise<Hotel[]> {
    return await db.select().from(hotels);
  }

  async getHotel(id: number): Promise<Hotel | undefined> {
    const [hotel] = await db.select().from(hotels).where(eq(hotels.id, id));
    return hotel || undefined;
  }

  async createHotel(insertHotel: InsertHotel): Promise<Hotel> {
    const [hotel] = await db.insert(hotels).values(insertHotel).returning();
    return hotel;
  }

  // Flight methods
  async getFlights(): Promise<Flight[]> {
    return await db.select().from(flights);
  }

  async getFlight(id: number): Promise<Flight | undefined> {
    const [flight] = await db.select().from(flights).where(eq(flights.id, id));
    return flight || undefined;
  }

  async createFlight(insertFlight: InsertFlight): Promise<Flight> {
    const [flight] = await db.insert(flights).values(insertFlight).returning();
    return flight;
  }

  async searchFlights(from: string, to: string): Promise<Flight[]> {
    const allFlights = await db.select().from(flights);
    return allFlights.filter((flight: Flight) => 
      flight.departureCity.toLowerCase().includes(from.toLowerCase()) &&
      flight.arrivalCity.toLowerCase().includes(to.toLowerCase())
    );
  }

  // Contact methods
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db.insert(contacts).values(insertContact).returning();
    return contact;
  }

  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts);
  }

  async getReviews(itemId: number, itemType: string): Promise<Review[]> {
    return await db.select().from(reviews).where(
      and(
        eq(reviews.itemId, itemId),
        eq(reviews.itemType, itemType)
      )
    );
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(insertReview).returning();
    return newReview;
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private bookings: Map<number, Booking> = new Map();
  private destinations: Map<number, Destination> = new Map();
  private packages: Map<number, Package> = new Map();
  private hotels: Map<number, Hotel> = new Map();
  private flights: Map<number, Flight> = new Map();
  private contacts: Map<number, Contact> = new Map();
  private reviews: Map<number, Review> = new Map();

  private userCount = 0;
  private bookingCount = 0;
  private destinationCount = 0;
  private packageCount = 0;
  private hotelCount = 0;
  private flightCount = 0;
  private contactCount = 0;
  private reviewCount = 0;

  async initializeData() {
    // Initialize sample destinations
    const sampleDestinations: InsertDestination[] = [
      {
        name: "Bali",
        country: "Indonesia",
        description: "Tropical paradise with stunning beaches and culture",
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5",
        price: "599.00"
      },
      {
        name: "Paris",
        country: "France",
        description: "City of lights and romance",
        imageUrl: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a",
        price: "799.00"
      },
      {
        name: "Tokyo",
        country: "Japan",
        description: "Modern metropolis with ancient traditions",
        imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf",
        price: "899.00"
      },
      {
        name: "Swiss Alps",
        country: "Switzerland",
        description: "Breathtaking mountain landscapes",
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
        price: "1299.00"
      }
    ];

    for (const dest of sampleDestinations) {
      await this.createDestination(dest);
    }

    // Initialize sample packages
    const samplePackages: InsertPackage[] = [
      {
        name: "Santorini Escape",
        destination: "Santorini, Greece",
        duration: "7 Days / 6 Nights",
        price: "1499.00",
        rating: "4.9",
        reviewCount: 156,
        imageUrl: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff",
        description: "Experience the magic of Santorini with breathtaking sunsets and luxury accommodation",
        includes: ["Round-trip flights", "5-star resort accommodation", "Daily breakfast", "Island tours & activities"],
        category: "Popular"
      },
      {
        name: "Maldives Paradise",
        destination: "Maldives",
        duration: "5 Days / 4 Nights",
        price: "2899.00",
        rating: "4.8",
        reviewCount: 89,
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5",
        description: "Ultimate luxury in overwater villas with pristine beaches",
        includes: ["Private transfers", "Overwater villa", "All meals included", "Spa treatments"],
        category: "Luxury"
      },
      {
        name: "Thailand Adventure",
        destination: "Thailand",
        duration: "10 Days / 9 Nights",
        price: "899.00",
        rating: "4.7",
        reviewCount: 234,
        imageUrl: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a",
        description: "Explore the vibrant culture and stunning landscapes of Thailand",
        includes: ["Multi-city tour", "4-star hotels", "Local guide", "Cultural experiences"],
        category: "Adventure"
      }
    ];

    for (const pkg of samplePackages) {
      await this.createPackage(pkg);
    }

    // Initialize sample hotels
    const sampleHotels: InsertHotel[] = [
      {
        name: "Ocean View Resort",
        location: "Bali, Indonesia",
        price: "199.00",
        rating: "5.0",
        imageUrl: "https://images.unsplash.com/photo-1611892440504-42a792e24d32",
        amenities: ["Free WiFi", "Infinity Pool", "Spa Services", "Restaurant"]
      },
      {
        name: "City Center Hotel",
        location: "Paris, France",
        price: "149.00",
        rating: "4.0",
        imageUrl: "https://images.unsplash.com/photo-1564501049412-61c2a3083791",
        amenities: ["Free WiFi", "Fitness Center", "Concierge", "Valet Parking"]
      },
      {
        name: "Boutique Hotel",
        location: "Tokyo, Japan",
        price: "129.00",
        rating: "5.0",
        imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa",
        amenities: ["Free WiFi", "Coffee Shop", "Premium Bedding", "Smart TV"]
      }
    ];

    for (const hotel of sampleHotels) {
      await this.createHotel(hotel);
    }

    // Initialize sample flights
    const sampleFlights: InsertFlight[] = [
      {
        airline: "Singapore Airlines",
        flightNumber: "SQ 123",
        departureCity: "New Delhi (DEL)",
        arrivalCity: "Tokyo (NRT)",
        departureTime: "08:30",
        arrivalTime: "15:00+1",
        duration: "14h 30m",
        stops: "1 stop",
        price: "52999.00"
      },
      {
        airline: "All Nippon Airways",
        flightNumber: "NH 830",
        departureCity: "Mumbai (BOM)",
        arrivalCity: "Tokyo (HND)",
        departureTime: "09:00",
        arrivalTime: "19:00",
        duration: "9h 00m",
        stops: "Non-stop",
        price: "72499.00"
      },
      {
        airline: "Air India",
        flightNumber: "AI 306",
        departureCity: "New Delhi (DEL)",
        arrivalCity: "Tokyo (NRT)",
        departureTime: "21:15",
        arrivalTime: "08:45+1",
        duration: "8h 30m",
        stops: "Non-stop",
        price: "58999.00"
      },
      {
        airline: "VietJet Air",
        flightNumber: "VJ 891",
        departureCity: "New Delhi (DEL)",
        arrivalCity: "Bali (DPS)",
        departureTime: "07:45",
        arrivalTime: "16:30",
        duration: "8h 45m",
        stops: "1 stop",
        price: "28499.00"
      },
      {
        airline: "Batik Air",
        flightNumber: "OD 231",
        departureCity: "Mumbai (BOM)",
        arrivalCity: "Bali (DPS)",
        departureTime: "23:15",
        arrivalTime: "08:30+1",
        duration: "9h 15m",
        stops: "1 stop",
        price: "32999.00"
      },
      {
        airline: "AirAsia",
        flightNumber: "AK 53",
        departureCity: "New Delhi (DEL)",
        arrivalCity: "Bali (DPS)",
        departureTime: "11:30",
        arrivalTime: "21:00",
        duration: "9h 30m",
        stops: "1 stop",
        price: "26999.00"
      },
      {
        airline: "Air India",
        flightNumber: "AI 143",
        departureCity: "New Delhi (DEL)",
        arrivalCity: "Paris (CDG)",
        departureTime: "13:15",
        arrivalTime: "18:30",
        duration: "9h 15m",
        stops: "Non-stop",
        price: "58999.00"
      },
      {
        airline: "Air France",
        flightNumber: "AF 217",
        departureCity: "Mumbai (BOM)",
        arrivalCity: "Paris (CDG)",
        departureTime: "02:15",
        arrivalTime: "07:45",
        duration: "9h 30m",
        stops: "Non-stop",
        price: "68499.00"
      },
      {
        airline: "Gulf Air",
        flightNumber: "GF 131",
        departureCity: "New Delhi (DEL)",
        arrivalCity: "Paris (CDG)",
        departureTime: "21:45",
        arrivalTime: "07:30+1",
        duration: "11h 45m",
        stops: "1 stop",
        price: "42999.00"
      },
      {
        airline: "Swiss International",
        flightNumber: "LX 147",
        departureCity: "New Delhi (DEL)",
        arrivalCity: "Swiss Alps (ZRH)",
        departureTime: "01:15",
        arrivalTime: "06:15",
        duration: "9h 00m",
        stops: "Non-stop",
        price: "64999.00"
      },
      {
        airline: "Etihad Airways",
        flightNumber: "EY 206",
        departureCity: "Mumbai (BOM)",
        arrivalCity: "Swiss Alps (ZRH)",
        departureTime: "21:30",
        arrivalTime: "07:00+1",
        duration: "11h 30m",
        stops: "1 stop",
        price: "48499.00"
      },
      {
        airline: "Qatar Airways",
        flightNumber: "QR 571",
        departureCity: "New Delhi (DEL)",
        arrivalCity: "Santorini (JTR)",
        departureTime: "03:45",
        arrivalTime: "12:15",
        duration: "10h 30m",
        stops: "1 stop",
        price: "78999.00"
      },
      {
        airline: "IndiGo",
        flightNumber: "6E 1792",
        departureCity: "New Delhi (DEL)",
        arrivalCity: "Maldives (MLE)",
        departureTime: "09:00",
        arrivalTime: "13:00",
        duration: "4h 00m",
        stops: "Non-stop",
        price: "18499.00"
      },
      {
        airline: "Vistara",
        flightNumber: "UK 273",
        departureCity: "Mumbai (BOM)",
        arrivalCity: "Maldives (MLE)",
        departureTime: "11:15",
        arrivalTime: "14:30",
        duration: "3h 15m",
        stops: "Non-stop",
        price: "21999.00"
      },
      {
        airline: "Thai Airways",
        flightNumber: "TG 324",
        departureCity: "New Delhi (DEL)",
        arrivalCity: "Thailand (BKK)",
        departureTime: "07:45",
        arrivalTime: "13:30",
        duration: "4h 15m",
        stops: "Non-stop",
        price: "22999.00"
      },
      {
        airline: "IndiGo",
        flightNumber: "6E 105",
        departureCity: "Mumbai (BOM)",
        arrivalCity: "Thailand (BKK)",
        departureTime: "08:15",
        arrivalTime: "14:15",
        duration: "4h 30m",
        stops: "Non-stop",
        price: "16499.00"
      }
    ];

    for (const flight of sampleFlights) {
      await this.createFlight(flight);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = ++this.userCount;
    const user: User = { id, ...insertUser };
    this.users.set(id, user);
    return user;
  }

  // Booking methods
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = ++this.bookingCount;
    const booking: Booking = { 
      id, 
      ...insertBooking, 
      userId: insertBooking.userId ?? null,
      specialRequests: insertBooking.specialRequests || null,
      agreedToTerms: insertBooking.agreedToTerms ?? false,
      paymentStatus: insertBooking.paymentStatus ?? "pending",
      paymentId: insertBooking.paymentId ?? null,
      orderId: insertBooking.orderId ?? null,
      amountPaid: insertBooking.amountPaid ?? null,
      createdAt: new Date() 
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByUserId(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => booking.userId === userId);
  }

  // Destination methods
  async getDestinations(): Promise<Destination[]> {
    return Array.from(this.destinations.values());
  }

  async getDestination(id: number): Promise<Destination | undefined> {
    return this.destinations.get(id);
  }

  async createDestination(insertDestination: InsertDestination): Promise<Destination> {
    const id = ++this.destinationCount;
    const destination: Destination = { id, ...insertDestination };
    this.destinations.set(id, destination);
    return destination;
  }

  // Package methods
  async getPackages(): Promise<Package[]> {
    return Array.from(this.packages.values());
  }

  async getPackage(id: number): Promise<Package | undefined> {
    return this.packages.get(id);
  }

  async createPackage(insertPackage: InsertPackage): Promise<Package> {
    const id = ++this.packageCount;
    const packageData: Package = { id, ...insertPackage };
    this.packages.set(id, packageData);
    return packageData;
  }

  // Hotel methods
  async getHotels(): Promise<Hotel[]> {
    return Array.from(this.hotels.values());
  }

  async getHotel(id: number): Promise<Hotel | undefined> {
    return this.hotels.get(id);
  }

  async createHotel(insertHotel: InsertHotel): Promise<Hotel> {
    const id = ++this.hotelCount;
    const hotel: Hotel = { id, ...insertHotel };
    this.hotels.set(id, hotel);
    return hotel;
  }

  // Flight methods
  async getFlights(): Promise<Flight[]> {
    return Array.from(this.flights.values());
  }

  async getFlight(id: number): Promise<Flight | undefined> {
    return this.flights.get(id);
  }

  async createFlight(insertFlight: InsertFlight): Promise<Flight> {
    const id = ++this.flightCount;
    const flight: Flight = { id, ...insertFlight };
    this.flights.set(id, flight);
    return flight;
  }

  async searchFlights(from: string, to: string): Promise<Flight[]> {
    const allFlights = Array.from(this.flights.values());
    return allFlights.filter(flight => 
      flight.departureCity.toLowerCase().includes(from.toLowerCase()) &&
      flight.arrivalCity.toLowerCase().includes(to.toLowerCase())
    );
  }

  // Contact methods
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = ++this.contactCount;
    const contact: Contact = { id, ...insertContact, createdAt: new Date() };
    this.contacts.set(id, contact);
    return contact;
  }

  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }

  async getReviews(itemId: number, itemType: string): Promise<Review[]> {
    const allReviews = Array.from(this.reviews.values());
    return allReviews.filter(review => 
      review.itemId === itemId && 
      review.itemType === itemType
    );
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = ++this.reviewCount;
    const review: Review = { id, ...insertReview, createdAt: new Date() };
    this.reviews.set(id, review);
    return review;
  }
}

export const storage = process.env.DATABASE_URL
  ? new DatabaseStorage()
  : new MemStorage();

if (!process.env.DATABASE_URL) {
  console.log("⚠️  DATABASE_URL environment variable is missing. Falling back to in-memory database storage.");
}
