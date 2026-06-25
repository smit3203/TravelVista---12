# ✈️ TravelVista - Full-Stack Travel Booking Application

TravelVista is a modern, responsive, and full-stack travel booking platform (similar to MakeMyTrip) that allows users to search and book flights, hotels, and travel packages. The app features secure server-side admin controls, live cloud database persistence, and beautiful interactive interfaces.

---

## 🚀 Key Features

*   **✈️ Flight Booking**: Interactive search and flight booking system with mock data support.
*   **🏨 Hotel Bookings**: Search, filter, and reserve hotel stays with detail cards and amenities list.
*   **📦 Travel Packages**: Complete vacation packages containing flight and lodging information.
*   **✉️ Customer Support**: Contact form with validations that routes messages straight to the database.
*   **🔒 Secure Admin Dashboard**: Secure authentication via environment variables to view all bookings and contact messages.
*   **⚡ Modern UI/UX**: Fluid page transitions, responsive layouts, Tailwind styling, and micro-interactions.

---

## 🛠️ Tech Stack

*   **Frontend**: React 18 + TypeScript + Tailwind CSS + Radix UI + Wouter (router)
*   **Backend**: Node.js + Express + TypeScript + tsx
*   **Database**: PostgreSQL + Drizzle ORM (connected to Neon Serverless PostgreSQL)
*   **Validation**: Zod + React Hook Form

---

## 📁 Project Structure

```text
TravelVista/
├── package.json               # Root proxy package manager config
├── TravelVista-1/             # Core project directory
│   ├── client/                # React single-page frontend application
│   ├── server/                # Express.js REST API server
│   ├── shared/                # Shared database schemas and Zod validators
│   ├── drizzle.config.ts      # Drizzle migration and schema configuration
│   ├── tailwind.config.ts     # Tailwind design system configuration
│   └── tsconfig.json          # TypeScript workspace settings
```

---

## 🔧 Getting Started

### 1. Prerequisites
Ensure you have **Node.js (v18 or higher)** installed on your machine.

### 2. Configure Environment Variables
Create a file named `.env` inside the `TravelVista-1/` directory:
```env
PORT=5000
NODE_ENV=development
SESSION_SECRET=your-random-session-secret-key
DATABASE_URL=your-postgresql-connection-string
```

> [!TIP]
> You can sign up for a free PostgreSQL database at [Neon.tech](https://neon.tech). Make sure to append `&uselibpqcompat=true` to your `DATABASE_URL` string to prevent SSL warning messages.

### 3. Install Dependencies
Run from the root directory:
```bash
npm install --prefix TravelVista-1
```

### 4. Push Database Schema
Push the local Drizzle schema definitions directly to your PostgreSQL database:
```bash
npm run db:push
```

### 5. Start Development Server
Run the dev server:
```bash
npm run dev
```
The application will start on **[http://localhost:5000](http://localhost:5000)**.

---

## 🛡️ Security Fixes Applied
*   **Removed Hardcoded Credentials**: Replaced client-side admin password checks with secure server-side verification using standard environment variables (`ADMIN_PASSWORD`).
*   **Git Protection**: Excluded confidential configurations from version control by explicitly ignoring the `.env` file.