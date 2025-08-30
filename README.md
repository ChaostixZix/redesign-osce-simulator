# Medical OSCE Simulator

<div align="center">

![OSCE Simulator Homepage](https://github.com/user-attachments/assets/ccaaf370-2bdc-4607-8ec5-dacaa25231d8)

*OSCE Simulator - Medical Training Platform*

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)

</div>

## 📚 Table of Contents

- [What is this app?](#-what-is-this-app)
- [Key Features](#-key-features)
- [User Interface](#️-user-interface)
- [Architecture Overview](#️-architecture-overview)
- [Technology Stack](#️-technology-stack)
- [API Documentation](#-api-documentation)
- [Getting Started](#-getting-started)
- [Development Workflow](#-development-workflow)
- [Troubleshooting](#-troubleshooting)
- [Use Cases](#-use-cases)
- [Future Enhancements](#-future-enhancements)
- [Security Considerations](#-security-considerations)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [License](#-license)
- [Contributing](#-contributing)

## 🏥 What is this app?

The **Medical OSCE Simulator** is a comprehensive web-based training platform designed for medical students and healthcare professionals to practice their clinical skills through interactive, AI-powered patient simulations. OSCE stands for "Objective Structured Clinical Examination" - a standardized method of assessing clinical competence.

## 🌟 Key Features

### 📚 **Structured Clinical Cases**
- Pre-built medical cases with realistic patient scenarios
- Each case includes patient demographics, chief complaints, and clinical context
- Timed sessions (typically 30 minutes) to simulate real OSCE conditions
- Multiple differential diagnoses and available diagnostic tests

### 🤖 **AI-Powered Patient Interactions**
- Interactive chat with AI patients powered by OpenAI
- Natural language conversations for history taking
- Realistic patient responses based on medical context
- Quick question templates for common inquiries

### 🔍 **Interactive Physical Examination**
- Visual body examination interface
- Virtual medical tools (stethoscope, ophthalmoscope, otoscope, reflex hammer)
- Click-to-examine different body regions (head & neck, chest, abdomen, extremities)
- Real-time recording of examination findings

### 🧪 **Diagnostic Testing Workflow**
- Order laboratory tests and imaging studies
- Comprehensive test categories: Hematology, Chemistry, Cardiac Markers, Imaging, Specialized
- Realistic test results based on the clinical scenario
- Timed test processing (results available after realistic delays)
- Common tests include CBC, PT/INR, D-Dimer, Troponins, X-rays, CT scans, and more

![Test Ordering Interface](https://github.com/user-attachments/assets/3c17b020-c479-4896-98eb-9ab108b0d8b0)

*Comprehensive test ordering interface with categorized medical tests*

### 📊 **Comprehensive Assessment Stages**
The platform guides students through the complete OSCE workflow:

1. **History Taking** - Interview the AI patient
2. **Physical Examination** - Conduct systematic examination
3. **Laboratory Tests** - Order and interpret lab results
4. **Imaging Studies** - Request and review imaging
5. **Diagnosis** - Formulate differential diagnoses
6. **Treatment Plan** - Develop management strategies

### 📈 **Progress Tracking**
- Real-time session timer
- Stage-by-stage progress indicators
- Session save and pause functionality
- Performance scoring and feedback

## 🖥️ User Interface

![OSCE Simulator Main Interface](https://github.com/user-attachments/assets/ba719067-0830-4f58-93b4-fac169f17c31)

*Main simulation interface showing the complete OSCE workflow*

The interface features:
- **Left Panel**: Session timer, progress tracking, and case information
- **Center Panel**: Interactive examination tools and current stage workflow
- **Right Panel**: Patient information, vital signs, and AI chat interface

## 🏗️ Architecture Overview

The Medical OSCE Simulator follows a modern full-stack architecture designed for scalability, maintainability, and educational effectiveness.

### Frontend Architecture
The client-side application is built with React 18 and TypeScript, featuring:

- **Component-Based Design**: Modular React components organized by feature
- **Client-Side Routing**: Lightweight routing with wouter for seamless navigation
- **State Management**: TanStack Query for efficient server state management and caching
- **UI Framework**: shadcn/ui components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom design tokens and responsive design
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Animations**: Framer Motion for smooth, engaging user interactions

### Backend Architecture
The server-side infrastructure uses Express.js with TypeScript:

- **RESTful API Design**: Clean, consistent endpoints for all OSCE operations
- **Middleware Stack**: JSON parsing, logging, error handling, and CORS support
- **Storage Abstraction**: Flexible storage interface supporting both in-memory and database persistence
- **AI Integration**: OpenAI GPT integration for realistic patient responses and clinical reasoning
- **Session Management**: Secure session handling for multi-user support
- **Type Safety**: End-to-end TypeScript for robust development experience

### Database Design
PostgreSQL with Drizzle ORM provides a comprehensive medical simulation schema:

- **Users Table**: Authentication and user management
- **OSCE Cases**: Medical scenarios with patient demographics, vital signs, and expected findings
- **Sessions**: Individual simulation instances tracking progress through OSCE stages
- **Chat Messages**: Complete conversation history between students and AI patients
- **Test Orders**: Laboratory and imaging requests with realistic results and timing

The database uses JSONB fields for flexible medical data while maintaining type safety through Zod schemas.

### AI-Powered Patient Simulation
The OpenAI integration provides realistic medical interactions:

- **Contextual Responses**: AI maintains consistency with patient history and medical context
- **Clinical Accuracy**: Responses follow medical protocols and realistic patient behavior
- **Emotional Simulation**: Appropriate patient emotions and reactions to clinical situations
- **Examination Findings**: Dynamic physical examination results based on the clinical scenario

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with shadcn/ui components
- **React Hook Form** with Zod validation
- **TanStack Query** for server state management
- **Framer Motion** for animations

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** database with Neon serverless hosting
- **Drizzle ORM** for type-safe database operations
- **OpenAI API** integration for AI patient responses

### Development Tools
- **ESBuild** for server bundling
- **Drizzle Kit** for database migrations
- **TypeScript** throughout the stack

## 📡 API Documentation

The OSCE Simulator provides a comprehensive RESTful API for all medical simulation operations:

### Core Endpoints

#### OSCE Cases Management
- `GET /api/cases` - Retrieve all available medical cases
- `GET /api/cases/:id` - Get specific case details including patient info and expected findings
- `POST /api/cases` - Create new medical cases (admin functionality)

#### Session Management
- `POST /api/sessions` - Start a new OSCE session for a specific case
- `GET /api/sessions/:id` - Retrieve current session state and progress
- `PUT /api/sessions/:id` - Update session progress, findings, and stage transitions
- `DELETE /api/sessions/:id` - End or cancel an active session

#### Patient Interaction
- `GET /api/sessions/:id/chat` - Retrieve complete chat history with AI patient
- `POST /api/sessions/:id/chat` - Send message to AI patient and receive response
- `GET /api/sessions/:id/findings` - Get all recorded physical examination findings

#### Diagnostic Testing
- `GET /api/sessions/:id/tests` - Retrieve all ordered tests and their results
- `POST /api/sessions/:id/tests` - Order new laboratory or imaging tests
- `PUT /api/tests/:id` - Update test status and results (simulated processing)

#### User Management
- `POST /api/auth/login` - Authenticate user and create session
- `POST /api/auth/register` - Register new user account
- `GET /api/users/profile` - Get current user profile and progress

### Data Models

#### OSCE Case Structure
```json
{
  "id": "uuid",
  "title": "Chest Pain",
  "description": "45-year-old female presenting with acute chest pain",
  "patientInfo": {
    "name": "Sarah Johnson",
    "age": 45,
    "gender": "Female",
    "chiefComplaint": "Chest pain for 2 days"
  },
  "vitals": {
    "bloodPressure": "138/88",
    "heartRate": "92 bpm",
    "temperature": "98.6°F",
    "oxygenSaturation": "98%"
  },
  "expectedFindings": {
    "cardiovascular": ["Normal S1, S2", "No murmurs"],
    "respiratory": ["Clear bilateral breath sounds"]
  },
  "availableTests": ["CBC", "Troponin I", "ECG", "Chest X-ray"],
  "correctDiagnosis": "Unstable Angina",
  "differentialDiagnoses": ["STEMI", "NSTEMI", "Pericarditis"]
}
```

#### Session Progress Tracking
```json
{
  "id": "session-uuid",
  "caseId": "case-uuid",
  "currentStage": "history", // history, examination, tests, diagnosis, treatment
  "timeStarted": "2024-01-01T10:00:00Z",
  "timeRemaining": 1800, // seconds
  "chatHistory": [...],
  "physicalFindings": {...},
  "orderedTests": [...],
  "selectedDiagnosis": "string",
  "score": 85,
  "completed": false
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- OpenAI API key (for AI patient functionality)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ChaostixZix/redesign-osce-simulator.git
cd redesign-osce-simulator
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file with:
```env
DATABASE_URL=your_postgresql_connection_string
OPENAI_API_KEY=your_openai_api_key
PORT=5000
```

4. **Run database migrations**
```bash
npm run db:push
```

5. **Start the development server**
```bash
npm run dev
```

6. **Access the application**
Open your browser and navigate to `http://localhost:5000`

### Production Build

```bash
npm run build
npm start
```

## 👨‍💻 Development Workflow

### Project Structure
```
redesign-osce-simulator/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page-level components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions and configurations
├── server/                 # Backend Express application
│   ├── index.ts           # Server entry point
│   ├── storage.ts         # Database abstraction layer
│   └── routes/            # API route handlers
├── shared/                 # Shared code between client and server
│   └── schema.ts          # Database schema and types
├── migrations/            # Database migration files
└── dist/                  # Built production files
```

### Available NPM Scripts

- `npm run dev` - Start development server with hot reloading
- `npm run build` - Build production-ready application
- `npm start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes

### Environment Configuration

The application requires several environment variables for full functionality:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/osce_simulator

# AI Integration
OPENAI_API_KEY=sk-your-openai-api-key

# Server Configuration
PORT=5000
NODE_ENV=development

# Session Management (optional)
SESSION_SECRET=your-session-secret-key
```

### Development Tips

1. **Database Setup**: Use Neon serverless PostgreSQL for easy cloud database setup
2. **API Testing**: The server runs on `http://localhost:5000` with API endpoints at `/api/*`
3. **Hot Reloading**: Vite provides instant frontend updates; server restarts automatically on backend changes
4. **Type Safety**: TypeScript is configured for strict checking across the entire stack
5. **Database Changes**: Use `npm run db:push` to sync schema changes with your database

### Code Style and Standards

- **TypeScript**: Strict mode enabled for enhanced type safety
- **ESLint**: Configured for React and TypeScript best practices
- **Prettier**: Automatic code formatting on save
- **Components**: Use functional components with TypeScript interfaces
- **State Management**: Prefer TanStack Query for server state, useState for local state
- **Styling**: Tailwind CSS utility classes with shadcn/ui component patterns

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check if DATABASE_URL is correctly set
echo $DATABASE_URL

# Test database connection
npm run db:push
```

#### OpenAI API Issues
- Ensure your OpenAI API key has sufficient credits
- Check that the API key is correctly set in your `.env` file
- Verify your OpenAI account has access to the required models (GPT-3.5 or GPT-4)

#### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process (replace PID with actual process ID)
kill -9 <PID>
```

#### TypeScript Compilation Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Run type checking
npm run check
```

#### Build Issues
```bash
# Clear build cache
rm -rf dist/
rm -rf client/dist/

# Rebuild from scratch
npm run build
```

### Performance Optimization

- **Database**: Use connection pooling for production deployments
- **Caching**: TanStack Query provides intelligent caching for API responses
- **Bundle Size**: Vite automatically optimizes and splits bundles for faster loading
- **AI Responses**: Consider implementing response caching for frequently asked questions

## 🎯 Use Cases

### For Medical Students
- Practice clinical skills in a safe, simulated environment
- Prepare for actual OSCE examinations
- Learn systematic approaches to patient assessment
- Build confidence in patient interactions

### For Medical Educators
- Create standardized clinical cases
- Assess student performance objectively
- Provide consistent training experiences
- Track student progress over time

### For Healthcare Professionals
- Continuing medical education
- Skill refresher training
- Practice with rare or complex cases
- Maintain clinical competencies

## 🔮 Future Enhancements

- **Performance Analytics**: Detailed scoring algorithms and performance metrics
- **Case Library Management**: Administrative interface for creating and managing cases
- **Session Recording**: Playback functionality for review and assessment
- **Multi-user Support**: Collaborative scenarios and peer assessments
- **Mobile Optimization**: Responsive design for tablet and mobile devices
- **Integration Capabilities**: LMS integration and gradebook synchronization

## 🔐 Security Considerations

### Authentication & Authorization
- **Session Management**: Secure session handling with configurable timeouts
- **Password Security**: Passwords are hashed using industry-standard algorithms
- **API Protection**: All endpoints require proper authentication except public routes
- **CORS Configuration**: Properly configured cross-origin resource sharing

### Data Protection
- **Patient Data**: All simulated patient data is fictional and HIPAA-compliant
- **Database Security**: PostgreSQL with encrypted connections and access controls
- **Environment Variables**: Sensitive configuration stored in environment variables
- **API Keys**: OpenAI API keys are securely managed and not exposed to client-side

### Best Practices
- **Input Validation**: All user inputs validated using Zod schemas
- **SQL Injection Prevention**: Drizzle ORM provides built-in protection
- **XSS Protection**: React's built-in XSS protection and content sanitization
- **Rate Limiting**: Consider implementing rate limiting for production deployments

## 🚀 Deployment

### Production Deployment Options

#### Option 1: Traditional VPS/Cloud Server
```bash
# 1. Clone repository on server
git clone https://github.com/ChaostixZix/redesign-osce-simulator.git
cd redesign-osce-simulator

# 2. Install dependencies
npm install

# 3. Set production environment variables
export NODE_ENV=production
export DATABASE_URL=your_production_database_url
export OPENAI_API_KEY=your_api_key

# 4. Run database migrations
npm run db:push

# 5. Build and start
npm run build
npm start
```

#### Option 2: Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 5000
CMD ["npm", "start"]
```

#### Option 3: Serverless Deployment (Vercel/Netlify)
- Frontend can be deployed to Vercel/Netlify
- Backend requires Node.js runtime (Vercel Functions or similar)
- Database: Use Neon, Supabase, or other serverless PostgreSQL

### Environment Configuration for Production

```env
NODE_ENV=production
DATABASE_URL=postgresql://prod_user:password@prod_host:5432/osce_db
OPENAI_API_KEY=sk-production-key
PORT=5000
SESSION_SECRET=production-session-secret-256-chars
```

### Performance Recommendations

- **Database**: Use connection pooling (pg-pool) for high concurrency
- **Caching**: Implement Redis for session storage and API response caching
- **CDN**: Use CDN for static assets and images
- **Monitoring**: Implement logging and monitoring (Winston, DataDog, etc.)
- **Load Balancing**: Use nginx or cloud load balancers for multiple instances

### Scaling Considerations

- **Database Scaling**: PostgreSQL read replicas for read-heavy workloads
- **API Scaling**: Horizontal scaling with multiple server instances
- **AI Rate Limits**: Implement queuing for OpenAI API calls during high usage
- **Session Storage**: Move from in-memory to Redis/database for multi-instance deployments

## 🧪 Testing

### Current Testing Approach
The project currently focuses on TypeScript compilation checking and runtime validation:

- **Type Safety**: Comprehensive TypeScript coverage across frontend and backend
- **Schema Validation**: Zod schemas ensure data integrity at runtime
- **Manual Testing**: UI testing through browser interaction and API testing via development server

### Recommended Testing Additions
```bash
# Unit Testing Setup (Jest + React Testing Library)
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# API Testing (Supertest)
npm install --save-dev supertest @types/supertest

# E2E Testing (Playwright or Cypress)
npm install --save-dev @playwright/test
```

### Testing Medical Scenarios
- **Case Validation**: Verify medical cases follow clinical protocols
- **AI Response Testing**: Ensure AI patient responses are medically appropriate
- **User Journey Testing**: Complete OSCE workflow testing
- **Performance Testing**: Load testing for multiple concurrent users

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

We welcome contributions to the Medical OSCE Simulator! Whether you're a developer, medical educator, or healthcare professional, there are many ways to help improve this platform.

### Ways to Contribute

#### For Developers
- **Bug Fixes**: Report and fix issues in the codebase
- **Feature Development**: Implement new features from the roadmap
- **Performance Optimization**: Improve application performance and scalability
- **Code Quality**: Refactoring, documentation, and test coverage improvements
- **Mobile Support**: Enhance responsive design and mobile compatibility

#### For Medical Professionals
- **Case Development**: Create new realistic medical scenarios
- **Content Review**: Validate medical accuracy of existing cases
- **Clinical Feedback**: Suggest improvements to clinical workflows
- **Educational Insights**: Share pedagogical best practices for medical simulation

#### For Educators
- **User Experience**: Suggest improvements to the educational interface
- **Assessment Methods**: Contribute to scoring and evaluation algorithms
- **Accessibility**: Help make the platform more accessible to diverse learners

### Development Contribution Process

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/redesign-osce-simulator.git
   cd redesign-osce-simulator
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Set Up Development Environment**
   ```bash
   npm install
   cp .env.example .env  # Configure your environment variables
   npm run dev
   ```

4. **Make Your Changes**
   - Follow the existing code style and conventions
   - Add TypeScript types for new functionality
   - Include appropriate error handling
   - Update documentation if needed

5. **Test Your Changes**
   ```bash
   npm run check  # TypeScript compilation
   npm run dev    # Manual testing
   ```

6. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

7. **Submit a Pull Request**
   - Provide a clear description of your changes
   - Include screenshots for UI changes
   - Reference any related issues
   - Ensure all checks pass

### Code Style Guidelines

- **TypeScript**: Use strict typing and avoid `any` types
- **Components**: Follow React functional component patterns
- **API Routes**: Implement proper error handling and validation
- **Database**: Use Drizzle ORM patterns and type-safe queries
- **Styling**: Use Tailwind CSS utility classes consistently
- **Comments**: Add JSDoc comments for complex functions

### Medical Content Guidelines

When contributing medical cases or content:

- **Accuracy**: Ensure all medical information is clinically accurate
- **Diversity**: Include cases representing diverse patient populations
- **Complexity**: Balance educational value with appropriate difficulty levels
- **Ethics**: Use only fictional patient data and scenarios
- **References**: Cite medical literature where appropriate

### Reporting Issues

When reporting bugs or suggesting features:

1. **Search Existing Issues**: Check if the issue already exists
2. **Provide Details**: Include steps to reproduce, expected vs actual behavior
3. **Include Context**: Browser version, operating system, error messages
4. **Add Screenshots**: Visual issues benefit from screenshots
5. **Medical Context**: For clinical issues, provide relevant medical context

### Feature Requests

For new feature suggestions:

- **Educational Value**: Explain how it benefits medical education
- **User Stories**: Describe who would use it and how
- **Implementation Ideas**: Suggest technical approaches if applicable
- **Priority**: Indicate if it's critical, nice-to-have, or future consideration

### Community Guidelines

- **Respectful Communication**: Maintain professional and inclusive language
- **Medical Ethics**: Respect patient privacy and medical ethics in all contributions
- **Collaboration**: Work together to solve problems and share knowledge
- **Learning Focus**: Remember the educational mission of the platform

### Getting Help

- **Documentation**: Check this README and inline code comments
- **Issues**: Search existing issues or create a new one
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Medical Questions**: Consult medical literature and clinical guidelines

Thank you for helping make medical education more accessible and effective!

---

<div align="center">

**Empowering the next generation of healthcare professionals through innovative simulation technology**

</div>