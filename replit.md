# Overview

FinanQuest is a gamified financial education static web application built with Vite. The application provides interactive financial learning through quizzes, challenges, expense tracking, and an AI assistant. Users can join classes, compete on leaderboards, earn XP, and receive personalized financial advice. The platform supports multiple languages (English, Spanish, Catalan) and includes comprehensive user management and progress tracking. The app now runs entirely as a static site with no backend required.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: Vite-powered vanilla JavaScript application with hot module reloading
- **Build Tool**: Vite configured to serve frontend on port 3000 with proxy to backend on port 5000
- **Module System**: ES6 modules with separate files for different concerns (supabase.js, translations.js, script.js)
- **UI Components**: Modal-based interface with responsive design, Font Awesome icons, and Chart.js for data visualization
- **Language System**: Multi-language support with dynamic translation system supporting English, Spanish, and Catalan

## Static Architecture
- **Framework**: Pure static website served by Vite preview
- **No Backend**: All functionality runs client-side
- **Build Process**: Vite builds optimized static files with environment variable injection
- **AI Integration**: Groq API key injected at build time from environment secrets

## Data Storage Solutions
- **Primary Database**: Supabase (PostgreSQL) for user data, classes, challenges, quizzes, and expense tracking
- **Local Storage**: Browser localStorage for user session data, group information, and application state
- **Real-time Updates**: Supabase real-time subscriptions for live class updates and leaderboard changes
- **Data Models**: Users, classes, challenges, quizzes, expenses, and user progress tracking

## Authentication and Authorization
- **Custom Authentication**: Username/password system implemented through Supabase
- **Session Management**: Local storage-based session handling
- **Role-based Access**: Teacher and student roles with different permissions for class management
- **Data Privacy**: User-specific data isolation with secure API endpoints

## AI Integration Architecture
- **AI Provider**: Groq SDK for language model interactions using `llama-3.1-8b-instant`
- **Client-side Processing**: All AI requests handled directly in the browser
- **API Key Management**: Groq API key injected from environment secrets at build time
- **Personal Data Integration**: AI can access user expense data from local storage for personalized recommendations
- **Error Handling**: Comprehensive retry logic for rate limiting and service unavailability

# External Dependencies

## AI Services
- **Groq API**: Primary AI service for generating financial advice and answering user questions
- **API Key Management**: Server-side environment variable storage for secure key handling

## Database Services
- **Supabase**: PostgreSQL database with real-time capabilities
- **Supabase Auth**: User authentication and session management
- **Real-time Subscriptions**: Live updates for collaborative features

## Frontend Libraries
- **Chart.js**: Data visualization for expense and income charts
- **Font Awesome**: Icon library for UI elements
- **Vite**: Build tool and development server with hot module reloading

## Dependencies
- **Groq SDK**: AI service integration (client-side)
- **@supabase/supabase-js**: Database client library
- **Vite**: Build tool and development server

## Development and Deployment
- **Replit**: Primary development and hosting environment
- **Static Deployment**: Single-page application with optimized build output
- **Environment Variables**: Groq API key injected from secrets at build time
- **Build Process**: `npm run build && npm run preview` for production-ready static files