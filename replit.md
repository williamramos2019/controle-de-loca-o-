# Overview

This is a Brazilian warehouse management application ("Almoxarifado") built for construction sites. The system enables tracking of tools, equipment loans, inventory movements, and provides dashboard analytics. It features a mobile-first design with a clean, intuitive interface for managing construction tool inventory and loan operations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Session Management**: connect-pg-simple for PostgreSQL-backed sessions
- **API Design**: RESTful endpoints with proper error handling
- **Development**: Hot reload with Vite middleware integration

## Database Schema Design
- **Tools Table**: Stores tool information including name, code, category, quantities, pricing, and supplier details
- **Loans Table**: Tracks borrowing records with borrower information, dates, status, and quantities
- **Users Table**: Basic user authentication structure
- **Inventory Movements Table**: Audit trail for all inventory changes (entries, exits, loans, returns)
- **Relationships**: Foreign key constraints ensure data integrity between tools, loans, and movements

## Component Architecture
- **Layout Components**: Header with notifications, bottom navigation for mobile
- **Card Components**: Reusable tool cards, loan cards, and stats cards
- **Form Components**: Unified form handling with validation
- **UI Components**: Complete design system from shadcn/ui
- **Mobile-First Design**: Touch-friendly interfaces with responsive breakpoints

## Data Flow Patterns
- **Query-Based**: Uses React Query for caching, background updates, and optimistic updates
- **Form Validation**: Client-side validation with Zod schemas shared between frontend and backend
- **Error Handling**: Centralized error handling with toast notifications
- **Real-time Updates**: Query invalidation triggers automatic data refreshes

## Storage Strategy
- **Memory Storage**: In-memory storage implementation for development/testing
- **Database Storage**: Production-ready PostgreSQL with Drizzle migrations
- **Session Storage**: PostgreSQL-backed sessions for user authentication
- **File Storage**: Static file serving through Express

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, TypeScript for the frontend foundation
- **Express.js**: Backend server framework with TypeScript support
- **Vite**: Build tool and development server

## Database & ORM
- **Neon Database**: Serverless PostgreSQL database hosting
- **Drizzle ORM**: Type-safe database operations and schema management
- **Drizzle Kit**: Database migration and introspection tools

## UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Unstyled, accessible UI primitives for complex components
- **Lucide React**: Icon library for consistent iconography
- **date-fns**: Date manipulation and formatting

## State Management & Forms
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Performant form handling
- **Zod**: Runtime type validation and schema validation

## Development Tools
- **Replit Integration**: Development environment plugins and runtime error overlay
- **PostCSS**: CSS processing with Autoprefixer
- **ESBuild**: Fast JavaScript bundling for production

## Session & Authentication
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **Express Session**: Session middleware for user authentication

## Utility Libraries
- **class-variance-authority**: Utility for creating variant-based component APIs
- **clsx**: Conditional className utility
- **cmdk**: Command palette component for search interfaces