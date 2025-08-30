# Medical OSCE Simulator

<div align="center">

![OSCE Simulator Homepage](https://github.com/user-attachments/assets/ccaaf370-2bdc-4607-8ec5-dacaa25231d8)

*OSCE Simulator - Medical Training Platform*

</div>

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

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

<div align="center">

**Empowering the next generation of healthcare professionals through innovative simulation technology**

</div>