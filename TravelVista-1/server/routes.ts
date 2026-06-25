import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema, insertContactSchema, insertReviewSchema, type User } from "@shared/schema";
import Razorpay from "razorpay";
import crypto from "crypto";

function getBookingPrice(destination: string, packageType: string) {
  let basePrice = 1000;
  const dest = destination.toLowerCase();
  
  if (dest.includes("bali")) basePrice = 599;
  else if (dest.includes("paris")) basePrice = 799;
  else if (dest.includes("tokyo")) basePrice = 899;
  else if (dest.includes("swiss")) basePrice = 1299;
  else if (dest.includes("maldives")) basePrice = 2899;
  else if (dest.includes("santorini")) basePrice = 1499;
  else if (dest.includes("thailand")) basePrice = 899;

  switch (packageType) {
    case 'complete-package': return basePrice;
    case 'flight-hotel': return Math.round(basePrice * 0.8);
    case 'hotel-only': return Math.round(basePrice * 0.5);
    case 'flight-only': return Math.round(basePrice * 0.4);
    default: return basePrice;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database with sample data
  await storage.initializeData();

  // Initialize Razorpay SDK
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_T5XIQCko2zoj9q",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "5E0F2pEjkB0Gdsf3AxOoF8AX",
  });

  // Destinations
  app.get("/api/destinations", async (req, res) => {
    try {
      const destinations = await storage.getDestinations();
      res.json(destinations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch destinations" });
    }
  });

  app.get("/api/destinations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const destination = await storage.getDestination(id);
      if (!destination) {
        return res.status(404).json({ error: "Destination not found" });
      }
      res.json(destination);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch destination" });
    }
  });

  // Packages
  app.get("/api/packages", async (req, res) => {
    try {
      const packages = await storage.getPackages();
      res.json(packages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch packages" });
    }
  });

  app.get("/api/packages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const packageData = await storage.getPackage(id);
      if (!packageData) {
        return res.status(404).json({ error: "Package not found" });
      }
      res.json(packageData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch package" });
    }
  });

  // Hotels
  app.get("/api/hotels", async (req, res) => {
    try {
      const hotels = await storage.getHotels();
      res.json(hotels);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch hotels" });
    }
  });

  app.get("/api/hotels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const hotel = await storage.getHotel(id);
      if (!hotel) {
        return res.status(404).json({ error: "Hotel not found" });
      }
      res.json(hotel);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch hotel" });
    }
  });

  // Flights
  app.get("/api/flights", async (req, res) => {
    try {
      const { from, to } = req.query;
      let flights;
      
      if (from && to) {
        flights = await storage.searchFlights(from as string, to as string);
      } else {
        flights = await storage.getFlights();
      }
      
      res.json(flights);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch flights" });
    }
  });

  app.get("/api/flights/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const flight = await storage.getFlight(id);
      if (!flight) {
        return res.status(404).json({ error: "Flight not found" });
      }
      res.json(flight);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch flight" });
    }
  });

  // Bookings
  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      console.error("Booking error:", error);
      res.status(400).json({ error: "Invalid booking data" });
    }
  });

  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getBooking(id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch booking" });
    }
  });

  // Payments
  app.post("/api/payments/order", async (req, res) => {
    try {
      const { destination, packageType } = req.body;
      if (!destination || !packageType) {
        return res.status(400).json({ error: "Destination and packageType are required" });
      }

      const price = getBookingPrice(destination, packageType);
      const options = {
        amount: Math.round(price * 100), // amount in paise (₹price)
        currency: "INR",
        receipt: `receipt_booking_${Date.now()}`
      };

      const order = await razorpay.orders.create(options);
      res.status(201).json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_T5XIQCko2zoj9q"
      });
    } catch (error) {
      console.error("Razorpay order creation error:", error);
      res.status(500).json({ error: "Failed to create payment order" });
    }
  });

  app.post("/api/payments/verify", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingData } = req.body;
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingData) {
        return res.status(400).json({ error: "Missing required payment verification details" });
      }

      const keySecret = process.env.RAZORPAY_KEY_SECRET || "5E0F2pEjkB0Gdsf3AxOoF8AX";
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(body.toString())
        .digest("hex");

      const isSignatureValid = expectedSignature === razorpay_signature;

      if (!isSignatureValid) {
        return res.status(400).json({ error: "Invalid payment signature" });
      }

      // Save the booking on successful verification
      const price = getBookingPrice(bookingData.destination, bookingData.packageType);
      const validatedData = insertBookingSchema.parse({
        ...bookingData,
        paymentStatus: "paid",
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        amountPaid: price.toString()
      });

      const booking = await storage.createBooking(validatedData);
      res.status(201).json({ success: true, booking });
    } catch (error) {
      console.error("Razorpay payment verification error:", error);
      res.status(500).json({ error: "Failed to verify payment signature" });
    }
  });

  // Contacts
  app.post("/api/contacts", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      res.status(201).json(contact);
    } catch (error) {
      console.error("Contact error:", error);
      res.status(400).json({ error: "Invalid contact data" });
    }
  });

  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  // Admin authentication
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { password } = req.body;
      
      // Get admin password from environment variable
      const adminPassword = process.env.ADMIN_PASSWORD || "smitsabhaya2024admin";
      
      if (password === adminPassword) {
        res.json({ success: true });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  // Reviews API
  app.get("/api/reviews/:itemType/:itemId", async (req, res) => {
    try {
      const itemId = parseInt(req.params.itemId);
      const itemType = req.params.itemType;
      const reviewsList = await storage.getReviews(itemId, itemType);
      res.json(reviewsList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const validatedData = insertReviewSchema.parse({
        ...req.body,
        userId: (req.user as User).id,
        username: (req.user as User).username
      });
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Review error:", error);
      res.status(400).json({ error: "Invalid review data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
