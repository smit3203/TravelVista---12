CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"age" integer NOT NULL,
	"travel_date" text NOT NULL,
	"destination" text NOT NULL,
	"package_type" text NOT NULL,
	"address" text NOT NULL,
	"special_requests" text,
	"agreed_to_terms" boolean DEFAULT false NOT NULL,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"payment_id" text,
	"order_id" text,
	"amount_paid" numeric(10, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "destinations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"country" text NOT NULL,
	"description" text NOT NULL,
	"image_url" text NOT NULL,
	"price" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flights" (
	"id" serial PRIMARY KEY NOT NULL,
	"airline" text NOT NULL,
	"flight_number" text NOT NULL,
	"departure_city" text NOT NULL,
	"arrival_city" text NOT NULL,
	"departure_time" text NOT NULL,
	"arrival_time" text NOT NULL,
	"duration" text NOT NULL,
	"stops" text NOT NULL,
	"price" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hotels" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"location" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"rating" numeric(2, 1) NOT NULL,
	"image_url" text NOT NULL,
	"amenities" text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"destination" text NOT NULL,
	"duration" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"rating" numeric(2, 1) NOT NULL,
	"review_count" integer NOT NULL,
	"image_url" text NOT NULL,
	"description" text NOT NULL,
	"includes" text[] NOT NULL,
	"category" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"username" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" text NOT NULL,
	"item_id" integer NOT NULL,
	"item_type" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
