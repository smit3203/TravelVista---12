# TravelStud - Complete Project Download Guide

## 🚀 What You're Getting

This is a complete travel booking website similar to MakeMyTrip with the following features:
- Flight search and booking
- Hotel search and booking  
- Travel package browsing
- Contact form for customer support
- Admin dashboard for managing bookings
- Modern React frontend with TypeScript
- Express.js backend with PostgreSQL database

## 📁 Project Structure

```
TravelStud/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── pages/           # Page components
│   │   ├── lib/             # Utilities and API client
│   │   └── hooks/           # Custom React hooks
│   └── index.html           # Main HTML file
├── server/                   # Express.js backend
│   ├── index.ts             # Server entry point
│   ├── routes.ts            # API routes
│   ├── storage.ts           # Database operations
│   └── db.ts                # Database connection
├── shared/                   # Shared types and schemas
│   └── schema.ts            # Database schema and types
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── tailwind.config.ts       # Tailwind CSS config
├── vite.config.ts           # Vite build config
└── drizzle.config.ts        # Database migration config
```

## 🔧 How to Set Up on Your PC

### 1. Install Requirements
- Node.js (version 18 or higher)
- npm or yarn package manager

### 2. Download All Files
Save all the files shown in this project to your computer, maintaining the folder structure shown above.

### 3. Install Dependencies
Open terminal in the project folder and run:
```bash
npm install
```

### 4. Set Up Database
You'll need a PostgreSQL database. You can either:
- Use a local PostgreSQL installation
- Use a cloud service like Neon, Supabase, or Railway

Create a `.env` file in the root directory with:
```
DATABASE_URL=your_postgresql_connection_string
```

### 5. Initialize Database
Run these commands to set up the database tables:
```bash
npm run db:push
```

### 6. Start the Application
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## 🎯 Key Features

### Frontend Pages
- **Home** - Landing page with hero section
- **Flights** - Search and book flights
- **Hotels** - Browse and book hotels
- **Packages** - Travel packages
- **Booking** - Booking form
- **Contact** - Customer support form
- **Admin** - Admin dashboard (password protected)

### Backend API
- `/api/destinations` - Get travel destinations
- `/api/packages` - Get travel packages
- `/api/hotels` - Get hotel listings
- `/api/flights` - Search flights
- `/api/bookings` - Create bookings
- `/api/contacts` - Submit contact forms

## 🛠 Technology Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **UI Components**: Radix UI + shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **State Management**: TanStack Query

## 📝 Important Files to Download

Make sure you download these essential files:

### Configuration Files
- `package.json` - Project dependencies
- `tsconfig.json` - TypeScript settings
- `tailwind.config.ts` - Styling configuration
- `vite.config.ts` - Build configuration
- `drizzle.config.ts` - Database configuration

### Source Code
- All files in `client/src/` folder
- All files in `server/` folder
- All files in `shared/` folder

### HTML & Config
- `client/index.html` - Main HTML file
- `postcss.config.js` - CSS processing

This is a complete, production-ready travel booking website that you can run on your own computer!