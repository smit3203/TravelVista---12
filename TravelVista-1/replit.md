# TravelStud - Travel Booking Application

## Overview

TravelStud is a full-stack travel booking application built with React frontend and Express backend. It allows users to search and book flights, hotels, and travel packages with a modern, responsive user interface. The application now uses PostgreSQL database for persistent data storage and includes an admin dashboard for managing bookings and customer inquiries.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **Critical Security Fix (2025-01-11)**: Fixed hard-coded admin password vulnerability by implementing server-side authentication
- **Environment Variable Security (2025-01-11)**: Moved admin password to environment variable with proper .gitignore protection
- **Booking System Fix (2025-01-11)**: Fixed booking form validation and database connectivity issues
- **Admin Security Enhancement (2025-01-11)**: Changed admin URL to `/admin-dashboard-secure` for better security
- **Form Improvements (2025-01-11)**: Enhanced error handling and user feedback across all forms
- **Interactive Features (2025-01-11)**: Added comprehensive destinations page with search functionality
- **Enhanced UI/UX (2025-01-11)**: Added smooth animations, transitions, and improved navigation
- **Social Media Integration (2025-01-11)**: Instagram link properly opens to @smit_chhabhaya profile
- **Newsletter Signup (2025-01-11)**: Added interactive newsletter subscription in footer
- **Admin Dashboard Improvements (2025-01-11)**: Enhanced admin interface with logout functionality
- **Enhanced Security (2025-01-11)**: Added secure admin authentication with password protection
- **Personalized Content (2025-01-11)**: Updated footer and contact information with Smit Sabhaya's details
- **Improved About Section (2025-01-11)**: Added professional about section with experience highlights
- **Database Integration (2025-01-11)**: Migrated from in-memory storage to PostgreSQL database
- **Admin Dashboard (2025-01-11)**: Added admin interface to view all bookings and customer inquiries
- **Database Schema**: Created tables for users, bookings, destinations, packages, hotels, flights, and contacts
- **Real-time Data**: All forms now save data directly to PostgreSQL database

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side router)
- **UI Components**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and build processes

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Pattern**: RESTful API with Express routes
- **Error Handling**: Centralized error handling middleware
- **Logging**: Custom request/response logging middleware

## Key Components

### Database Schema
- **Users**: Authentication and user management
- **Destinations**: Travel destinations with images and pricing
- **Packages**: Travel packages with duration, pricing, and ratings
- **Hotels**: Hotel listings with amenities and location data
- **Flights**: Flight information with airline, timing, and pricing
- **Bookings**: User booking records with personal details
- **Contacts**: Customer inquiries and support messages

### API Endpoints
- **Destinations**: GET /api/destinations, GET /api/destinations/:id
- **Packages**: GET /api/packages, GET /api/packages/:id
- **Hotels**: GET /api/hotels, GET /api/hotels/:id
- **Flights**: GET /api/flights (with search filtering)
- **Bookings**: POST /api/bookings
- **Contacts**: POST /api/contacts

### Frontend Pages
- **Home**: Landing page with hero section and featured content
- **Flights**: Flight search and booking interface
- **Hotels**: Hotel search and booking interface
- **Packages**: Travel package browsing and booking
- **Booking**: Universal booking form for all services
- **Contact**: Customer support contact form
- **404**: Not found page

## Data Flow

1. **User Interaction**: Users interact with React components
2. **Form Submission**: React Hook Form handles form validation using Zod schemas
3. **API Calls**: TanStack Query manages API requests to Express backend
4. **Data Processing**: Express routes process requests and interact with PostgreSQL via Drizzle ORM
5. **Response Handling**: Frontend receives responses and updates UI state
6. **Error Handling**: Centralized error handling on both frontend and backend

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React, React DOM
- **Routing**: Wouter
- **State Management**: TanStack Query
- **UI Components**: Radix UI primitives, shadcn/ui
- **Forms**: React Hook Form, Hookform Resolvers
- **Validation**: Zod
- **Styling**: Tailwind CSS, Class Variance Authority
- **Icons**: Lucide React
- **Utilities**: clsx, date-fns

### Backend Dependencies
- **Web Framework**: Express.js
- **Database**: Drizzle ORM, Neon Database serverless driver
- **Validation**: Zod (shared with frontend)
- **Session Management**: connect-pg-simple
- **Development**: tsx for TypeScript execution

### Development Tools
- **Build Tool**: Vite
- **Database Migrations**: Drizzle Kit
- **TypeScript**: Full TypeScript support across the stack
- **ESLint/PostCSS**: Code quality and CSS processing

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution with auto-reload
- **Database**: Neon Database with environment-based configuration
- **Replit Integration**: Specialized plugins for Replit development environment

### Production Build
- **Frontend**: Vite build process generating static assets
- **Backend**: esbuild bundling Express application
- **Database**: Drizzle migrations for schema management
- **Environment**: Node.js production server

### Configuration Management
- **Environment Variables**: DATABASE_URL for database connection
- **Build Scripts**: Separate dev, build, and start scripts
- **Static Assets**: Vite handles frontend asset optimization
- **API Routes**: Express serves both API and static files in production

The application follows a modern full-stack architecture with clear separation of concerns, type safety throughout, and a focus on developer experience with hot reloading and comprehensive tooling.