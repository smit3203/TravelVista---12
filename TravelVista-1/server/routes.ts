import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema, insertContactSchema, insertReviewSchema, type User } from "@shared/schema";
import Razorpay from "razorpay";
import crypto from "crypto";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
      const { destination, packageType, customFlightId, customHotelId, nights } = req.body;
      if (!destination || !packageType) {
        return res.status(400).json({ error: "Destination and packageType are required" });
      }

      let price = 0;
      if (packageType === "custom-package") {
        if (!customFlightId || !customHotelId || !nights) {
          return res.status(400).json({ error: "customFlightId, customHotelId, and nights are required for custom packages" });
        }
        const flight = await storage.getFlight(Number(customFlightId));
        const hotel = await storage.getHotel(Number(customHotelId));
        if (!flight || !hotel) {
          return res.status(404).json({ error: "Selected flight or hotel not found" });
        }
        const flightPrice = parseFloat(flight.price);
        const hotelPrice = parseFloat(hotel.price);
        price = Math.round((flightPrice + (hotelPrice * Number(nights))) * 0.85); // 15% discount
      } else {
        price = getBookingPrice(destination, packageType);
      }

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

      // Fetch the Razorpay order to get the exact amount paid safely
      const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);
      const amountPaid = (Number(razorpayOrder.amount) / 100).toString();

      // Save the booking on successful verification
      const validatedData = insertBookingSchema.parse({
        ...bookingData,
        paymentStatus: "paid",
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        amountPaid: amountPaid
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

  // Chat API
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          systemInstruction: `You are VistaAI, a premium, friendly AI travel chatbot assistant for the TravelVista website.
Your goals:
1. Help users plan their travel itinerary.
2. Recommend hotels, flights, destinations, and packages available on our platform.
3. Guide users on how to use the website (e.g. they can build custom packages, view bookings, write hotel reviews, and check maps).
4. Provide contact details if asked: Phone is +91 8797656432, Email is smitsabhaya@gmail.com, founded by travel expert Smit Sabhaya.
5. Keep your responses friendly, helpful, relatively concise, and formatted in markdown.

Here is the current catalog data available on TravelVista to help with recommendations:
- Destinations: Bali (Indonesia), Paris (France), Tokyo (Japan), Swiss Alps (Switzerland), Maldives, Santorini (Greece), Thailand.
- Custom Package Builder offers a 15% discount if a flight and hotel are booked together!
`
        });

        let chatSession;
        if (history && Array.isArray(history) && history.length > 0) {
          const formattedHistory = history.map((item: any) => ({
            role: item.role === 'model' ? 'model' : 'user',
            parts: [{ text: item.parts[0]?.text || "" }]
          }));
          chatSession = model.startChat({ history: formattedHistory });
        } else {
          chatSession = model.startChat();
        }

        const result = await chatSession.sendMessage(message);
        const response = await result.response;
        return res.json({ reply: response.text() });
      } else {
        const query = message.toLowerCase();
        let reply = "";

        if (query.includes("hi") || query.includes("hello") || query.includes("hey") || query.includes("greet")) {
          reply = "Hello! 👋 Welcome to TravelVista! I'm VistaAI, your smart travel assistant. How can I help you plan your dream vacation today?";
        } else if (query.includes("custom") || query.includes("builder") || query.includes("build") || query.includes("bundle")) {
          reply = "You can build your own custom travel package on our new **[Custom Package Builder](/custom-package)** page! 🗺️✈️\n\nSimply:\n1. Choose your dream destination\n2. Select your flight\n3. Choose your hotel and stay duration\n\nYou'll automatically receive a **15% bundle discount**! 🤑";
        } else if (query.includes("hotel") || query.includes("stay") || query.includes("resort") || query.includes("accommodation")) {
          const hotelsList = await storage.getHotels();
          const recs = hotelsList.slice(0, 3).map(h => `- **${h.name}** in ${h.location} (₹${parseFloat(h.price).toLocaleString()}/night, ★${h.rating})`).join("\n");
          reply = `Here are some highly recommended hotels available on TravelVista: 🏨\n\n${recs}\n\nYou can explore all hotel listings, filter by ratings/amenities, and view them on the interactive map on our **[Hotels page](/hotels)**!`;
        } else if (query.includes("flight") || query.includes("plane") || query.includes("airline")) {
          const flightsList = await storage.getFlights();
          const recs = flightsList.slice(0, 3).map(f => `- **${f.airline}** (${f.flightNumber}): ${f.departureCity} ✈️ ${f.arrivalCity} (₹${parseFloat(f.price).toLocaleString()}, ${f.stops})`).join("\n");
          reply = `We offer multiple flight connections to our popular destinations! Here are a few options: ✈️\n\n${recs}\n\nSearch and filter flights by departure times, stops, and airlines on our **[Flights page](/flights)**!`;
        } else if (query.includes("package") || query.includes("deal") || query.includes("offer")) {
          const packagesList = await storage.getPackages();
          const recs = packagesList.slice(0, 3).map(p => `- **${p.name}** (${p.duration}, ₹${parseFloat(p.price).toLocaleString()}, ★${p.rating})`).join("\n");
          reply = `Check out our featured ready-made travel packages: 🎒\n\n${recs}\n\nExplore complete packages on our **[Packages page](/packages)** or create your own custom one on our **[Custom Package Builder](/custom-package)**!`;
        } else if (query.includes("destination") || query.includes("place") || query.includes("country") || query.includes("visit")) {
          const destList = await storage.getDestinations();
          const recs = destList.slice(0, 4).map(d => `- **${d.name}**, ${d.country}: ${d.description}`).join("\n");
          reply = `Discover our popular travel destinations around the world: 🌍\n\n${recs}\n\nSee the full list on our **[Destinations page](/destinations)**!`;
        } else if (query.includes("contact") || query.includes("email") || query.includes("phone") || query.includes("mobile") || query.includes("number") || query.includes("support")) {
          reply = "Need support or personal travel advice? 📞✉️ We're here for you!\n\n- **Phone**: +91 8797656432\n- **Email**: smitsabhaya@gmail.com\n- **Founder**: Smit Chhabhaya (Travel Expert)\n\nYou can also send us a message directly via our **[Contact Page](/contact)**.";
        } else if (query.includes("admin") || query.includes("dashboard")) {
          reply = "Authorized administrators can access the secure dashboard at **[/admin-dashboard-secure](/admin-dashboard-secure)** by logging in and entering the password `smitsabhaya2024admin`.";
        } else {
          reply = "I'm VistaAI, your travel helper! ✈️\n\nI can assist you with:\n- Booking hotels, flights, and packages\n- Creating a custom flight + hotel bundle on the **[Custom Package Builder](/custom-package)** (with a 15% discount!)\n- Finding contact details and support.\n\nWhat would you like to know more about?";
        }

        return res.json({ reply });
      }
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process chat query" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
