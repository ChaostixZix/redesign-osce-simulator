# Medical OSCE Simulator

## Overview

This is a comprehensive medical OSCE (Objective Structured Clinical Examination) simulator built as a full-stack web application. The platform allows medical students to practice clinical scenarios through interactive simulations that include patient interactions, physical examinations, diagnostic test ordering, and treatment planning. The system uses AI-powered patient responses to create realistic clinical encounters and provides a structured workflow through different stages of medical assessment.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built with React and TypeScript, using Vite as the build tool. The application follows a modern component-based architecture with:

- **React Router**: Uses wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Form Handling**: React Hook Form with Zod validation schemas
- **Component Structure**: Modular components organized by feature (OSCE-specific components in separate directory)

The frontend implements a multi-stage OSCE workflow including history taking, physical examination, test ordering, diagnosis formulation, and treatment planning.

### Backend Architecture
The server uses Express.js with TypeScript and follows a clean API design:

- **Framework**: Express.js with middleware for JSON parsing, logging, and error handling
- **Storage Layer**: Abstracted storage interface with in-memory implementation (designed to be easily swapped for database storage)
- **API Design**: RESTful endpoints for cases, sessions, chat messages, and test orders
- **AI Integration**: OpenAI GPT integration for generating realistic patient responses and clinical findings
- **Development Setup**: Vite development server integration for hot reloading

### Database Design
The application uses Drizzle ORM with PostgreSQL, featuring a comprehensive schema for medical simulation:

- **Users**: Basic user authentication structure
- **OSCE Cases**: Medical scenarios with patient information, expected findings, and correct diagnoses
- **Sessions**: Individual simulation instances tracking progress through different stages
- **Chat Messages**: Patient-student conversation history
- **Test Orders**: Laboratory and imaging test requests with results

The schema supports complex medical data through JSONB fields for flexibility while maintaining type safety through Zod schemas.

### Authentication & Session Management
Currently implements a basic user system with plans for session-based authentication. The storage layer includes user management capabilities with username/password authentication.

### AI-Powered Patient Simulation
Integrates OpenAI's GPT models to provide:
- Dynamic patient responses based on medical history and conversation context
- Realistic physical examination findings
- Appropriate test results based on the clinical scenario
- Emotional responses and patient behavior simulation

The AI system maintains consistency with the underlying medical case while providing natural, conversational interactions.

## External Dependencies

- **Database**: PostgreSQL with Neon serverless database hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **AI Service**: OpenAI API for patient response generation and clinical reasoning
- **UI Components**: Radix UI primitives for accessible component foundations
- **Styling**: Tailwind CSS for utility-first styling with custom design tokens
- **Build Tools**: Vite for fast development and optimized production builds
- **Validation**: Zod for runtime type validation and schema definition
- **HTTP Client**: Native fetch API with TanStack Query for caching and state management
- **Development Tools**: ESBuild for server-side bundling, TypeScript for type safety
- **Fonts**: Google Fonts integration (Inter, Architects Daughter, DM Sans, Fira Code, Geist Mono)