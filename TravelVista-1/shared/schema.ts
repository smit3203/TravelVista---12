import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  age: integer("age").notNull(),
  travelDate: text("travel_date").notNull(),
  destination: text("destination").notNull(),
  packageType: text("package_type").notNull(),
  address: text("address").notNull(),
  specialRequests: text("special_requests"),
  agreedToTerms: boolean("agreed_to_terms").notNull().default(false),
  paymentStatus: text("payment_status").notNull().default("pending"),
  paymentId: text("payment_id"),
  orderId: text("order_id"),
  amountPaid: decimal("amount_paid", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const destinations = pgTable("destinations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

export const packages = pgTable("packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  destination: text("destination").notNull(),
  duration: text("duration").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull(),
  reviewCount: integer("review_count").notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description").notNull(),
  includes: text("includes").array().notNull(),
  category: text("category").notNull(),
});

export const hotels = pgTable("hotels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull(),
  imageUrl: text("image_url").notNull(),
  amenities: text("amenities").array().notNull(),
});

export const flights = pgTable("flights", {
  id: serial("id").primaryKey(),
  airline: text("airline").notNull(),
  flightNumber: text("flight_number").notNull(),
  departureCity: text("departure_city").notNull(),
  arrivalCity: text("arrival_city").notNull(),
  departureTime: text("departure_time").notNull(),
  arrivalTime: text("arrival_time").notNull(),
  duration: text("duration").notNull(),
  stops: text("stops").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  username: text("username").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  itemId: integer("item_id").notNull(),
  itemType: text("item_type").notNull(), // 'hotel' | 'package' | 'destination'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

export const insertDestinationSchema = createInsertSchema(destinations).omit({
  id: true,
});

export const insertPackageSchema = createInsertSchema(packages).omit({
  id: true,
});

export const insertHotelSchema = createInsertSchema(hotels).omit({
  id: true,
});

export const insertFlightSchema = createInsertSchema(flights).omit({
  id: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertDestination = z.infer<typeof insertDestinationSchema>;
export type Destination = typeof destinations.$inferSelect;
export type InsertPackage = z.infer<typeof insertPackageSchema>;
export type Package = typeof packages.$inferSelect;
export type InsertHotel = z.infer<typeof insertHotelSchema>;
export type Hotel = typeof hotels.$inferSelect;
export type InsertFlight = z.infer<typeof insertFlightSchema>;
export type Flight = typeof flights.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
