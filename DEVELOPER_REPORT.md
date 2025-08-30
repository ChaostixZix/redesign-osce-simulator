# OSCE Simulator - Developer Implementation Report

## Table of Contents
1. [App Overview](#app-overview)
2. [OSCE Session Workflow](#osce-session-workflow)
3. [AI Patient Chat System](#ai-patient-chat-system)
4. [Physical Examination Flow](#physical-examination-flow)
5. [Test Ordering System](#test-ordering-system)
6. [Architecture & Technical Stack](#architecture--technical-stack)
7. [Data Models & Schema](#data-models--schema)
8. [Key Implementation Patterns](#key-implementation-patterns)
9. [Session State Management](#session-state-management)
10. [Developer Guidelines](#developer-guidelines)

---

## App Overview

### What is OSCE?
**OSCE (Objective Structured Clinical Examination)** is a standardized method for assessing clinical competence in medical education. This simulator provides an interactive, AI-powered platform for medical students to practice clinical skills in a controlled environment.

### Core Purpose
- **Target Users**: Medical students, healthcare trainees, clinical educators
- **Goal**: Simulate realistic patient encounters for skill development
- **Format**: Timed, structured clinical assessments (typically 30 minutes)

### Key Value Propositions
1. **Standardized Assessment**: Consistent evaluation criteria across sessions
2. **AI-Powered Realism**: Natural language patient interactions
3. **Comprehensive Clinical Workflow**: Complete medical examination process
4. **Progress Tracking**: Real-time performance monitoring
5. **Safe Learning Environment**: Risk-free practice with immediate feedback

---

## OSCE Session Workflow

### Six-Stage Clinical Assessment Process

The simulator follows the standard OSCE examination structure with six sequential stages:

```typescript
// Core OSCE stages defined in client/src/lib/osce-types.ts
export const OSCE_STAGES: StageInfo[] = [
  {
    id: "history",
    name: "History Taking",
    icon: "fas fa-comments",
    description: "Take patient history through conversation"
  },
  {
    id: "physical", 
    name: "Physical Examination",
    icon: "fas fa-stethoscope",
    description: "Perform physical examination"
  },
  {
    id: "tests",
    name: "Laboratory Tests", 
    icon: "fas fa-vial",
    description: "Order and review lab tests"
  },
  {
    id: "imaging",
    name: "Imaging Studies",
    icon: "fas fa-x-ray", 
    description: "Order and review imaging"
  },
  {
    id: "diagnosis",
    name: "Diagnosis",
    icon: "fas fa-clipboard-list",
    description: "Formulate differential diagnosis"
  },
  {
    id: "treatment",
    name: "Treatment Plan",
    icon: "fas fa-file-medical",
    description: "Create treatment and management plan"
  }
];
```

### Session Flow Principles

#### 1. **Linear Stage Progression**
```typescript
// Sessions progress through stages sequentially
const currentStageIndex = OSCE_STAGES.findIndex(stage => stage.id === session.currentStage);
const currentStage = OSCE_STAGES[currentStageIndex];
```

#### 2. **Time-Based Constraints**
```typescript
// 30-minute default timer with real-time countdown
timeRemaining: integer("time_remaining").notNull().default(1800), // seconds
```

#### 3. **State Persistence**
- All session data persisted in real-time
- Students can pause/resume sessions
- Progress tracking across stages

#### 4. **Dynamic Content Rendering**
```typescript
// Main content switches based on current stage
const renderMainContent = () => {
  switch (session.currentStage as OsceStage) {
    case "history":
    case "physical":
      return <PhysicalExam session={session} osceCase={osceCase} />;
    case "tests":
    case "imaging": 
      return <TestOrdering session={session} osceCase={osceCase} />;
    case "diagnosis":
      return <DiagnosisInterface />;
    case "treatment":
      return <TreatmentPlan session={session} osceCase={osceCase} />;
  }
};
```

---

## AI Patient Chat System

### OpenAI Integration Architecture

The AI patient system uses OpenAI GPT models to simulate realistic patient responses:

```typescript
// server/services/openai.ts
export async function getPatientResponse(
  patientInfo: any,
  chatHistory: any[],
  studentMessage: string
): Promise<PatientResponse> {
  try {
    const systemPrompt = `You are simulating a ${patientInfo.age}-year-old ${patientInfo.gender} patient named ${patientInfo.name}. 
    Chief complaint: ${patientInfo.chiefComplaint}
    
    Respond as this patient would in a realistic medical encounter. Be conversational but provide medically relevant information when asked appropriate questions. Show appropriate emotions and concerns. Do not provide medical advice or diagnoses - you are the patient, not a doctor.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: systemPrompt },
        ...chatHistory.map((msg: any) => ({
          role: msg.sender === "student" ? "user" : "assistant",
          content: msg.message
        })),
        { role: "user", content: studentMessage }
      ],
      response_format: { type: "json_object" },
      max_tokens: 200,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    // Fallback response for API failures
    return {
      message: "I'm having trouble speaking right now. Could you try again?",
      emotion: "neutral"
    };
  }
}
```

### Chat Flow Implementation

#### 1. **Real-time Chat Interface**
```typescript
// client/src/components/osce/patient-chat.tsx
const sendMessageMutation = useMutation({
  mutationFn: async (messageText: string) => {
    const response = await apiRequest("POST", `/api/sessions/${session.id}/chat`, {
      message: messageText
    });
    return response.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/sessions", session.id, "chat"] });
    setMessage("");
  }
});
```

#### 2. **Quick Question Templates**
```typescript
// Pre-defined common medical questions
export const QUICK_QUESTIONS = [
  "Can you rate your pain from 1-10?",
  "Any family history of heart disease?", 
  "Are you taking any medications?",
  "Have you had this type of pain before?",
  "Any associated symptoms like nausea or sweating?",
  "What makes the pain better or worse?"
];
```

#### 3. **Chat History Management**
```typescript
// Real-time polling for new messages
const { data: chatHistory = [] } = useQuery({
  queryKey: ["/api/sessions", session.id, "chat"],
  refetchInterval: 2000,
});
```

### Patient Response Structure
```typescript
export interface PatientResponse {
  message: string;
  emotion: "neutral" | "worried" | "relieved" | "anxious" | "pain";
  additionalInfo?: string;
}
```

---

## Physical Examination Flow

### Interactive Body Examination System

The physical examination component provides a visual, click-based interface for systematic patient examination:

#### 1. **Body Part Structure**
```typescript
// client/src/lib/osce-types.ts
export const BODY_PARTS = [
  { 
    id: "head", 
    name: "Head & Neck", 
    examinations: ["inspection", "palpation", "auscultation"] 
  },
  { 
    id: "chest", 
    name: "Chest", 
    examinations: ["inspection", "palpation", "percussion", "auscultation"] 
  },
  { 
    id: "abdomen", 
    name: "Abdomen", 
    examinations: ["inspection", "palpation", "percussion", "auscultation"] 
  },
  { 
    id: "extremities", 
    name: "Extremities", 
    examinations: ["inspection", "palpation", "neurological"] 
  }
];
```

#### 2. **Virtual Medical Tools**
```typescript
export const EXAMINATION_TOOLS: ExaminationTool[] = [
  {
    id: "stethoscope",
    name: "Stethoscope", 
    icon: "fas fa-stethoscope",
    bodyParts: ["chest", "heart", "lungs", "abdomen"]
  },
  {
    id: "ophthalmoscope",
    name: "Ophthalmoscope",
    icon: "fas fa-eye",
    bodyParts: ["head", "eyes"]
  },
  {
    id: "otoscope", 
    name: "Otoscope",
    icon: "fas fa-assistive-listening-systems",
    bodyParts: ["head", "ears"]
  },
  {
    id: "reflex-hammer",
    name: "Reflex Hammer",
    icon: "fas fa-hammer", 
    bodyParts: ["extremities", "neurological"]
  }
];
```

#### 3. **Examination Process**
```typescript
// client/src/components/osce/physical-exam.tsx
const examineMutation = useMutation({
  mutationFn: async ({ bodyPart, examinationType }: { bodyPart: string; examinationType: string }) => {
    const response = await apiRequest("POST", `/api/sessions/${session.id}/examine`, {
      bodyPart,
      examinationType
    });
    return response.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/sessions", session.id] });
  }
});

const performExamination = (bodyPart: string, examinationType: string) => {
  examineMutation.mutate({ bodyPart, examinationType });
};
```

#### 4. **Findings Recording & Display**
```typescript
// Examination findings stored as key-value pairs
const getFindings = () => {
  return Object.entries(session.physicalFindings || {}).map(([key, finding]: [string, any]) => {
    const [bodyPart, examType] = key.split('_');
    return {
      id: key,
      bodyPart: bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1),
      examType: examType.charAt(0).toUpperCase() + examType.slice(1), 
      finding: finding.finding,
      normal: finding.normal,
      timestamp: finding.timestamp
    };
  });
};
```

### AI-Generated Examination Findings

Physical examination results are dynamically generated based on the case:

```typescript
// server/services/openai.ts
export async function generatePhysicalFinding(
  bodyPart: string,
  examinationType: string, 
  patientCase: any
): Promise<string> {
  // Uses OpenAI to generate realistic examination findings
  // based on patient case and examination type
}
```

---

## Test Ordering System

### Comprehensive Medical Testing Workflow

The test ordering system simulates real hospital laboratory and imaging workflows:

#### 1. **Test Categories Structure**
```typescript
// client/src/components/osce/test-ordering.tsx
const TEST_CATEGORIES = [
  {
    id: "hematology",
    name: "Hematology",
    description: "CBC, Coagulation studies", 
    tests: ["CBC with Differential", "PT/INR", "PTT", "D-Dimer", "ESR", "CRP"]
  },
  {
    id: "chemistry",
    name: "Chemistry",
    description: "Basic metabolic panel, Lipids",
    tests: ["Basic Metabolic Panel", "Comprehensive Metabolic Panel", "Lipid Panel", "HbA1c", "Glucose"]
  },
  {
    id: "cardiac", 
    name: "Cardiac Markers",
    description: "Troponins, CK-MB, BNP",
    tests: ["Troponin I", "Troponin T", "CK-MB", "BNP", "Pro-BNP"]
  },
  {
    id: "imaging",
    name: "Imaging",
    description: "X-ray, CT, MRI, Echo", 
    tests: ["Chest X-ray", "CT Chest", "Echocardiogram", "CT Abdomen/Pelvis", "MRI"]
  },
  {
    id: "specialized",
    name: "Specialized",
    description: "Cultures, Serology",
    tests: ["Blood Culture", "Urine Culture", "Hepatitis Panel", "Thyroid Function", "Urinalysis"]
  }
];
```

#### 2. **Test Processing Simulation**
```typescript
// Realistic turnaround times for different test types
const getTurnaroundTime = (testName: string) => {
  const availableTest = osceCase.availableTests?.find((t: any) => t.name === testName);
  return availableTest?.turnaroundTime || 30; // minutes
};
```

#### 3. **Test Status Management**
```typescript
// shared/schema.ts - Test order lifecycle
export const testOrder = pgTable("test_order", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => osceSession.id).notNull(),
  testName: text("test_name").notNull(),
  testCategory: text("test_category").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed
  orderTime: timestamp("order_time").defaultNow(),
  resultTime: timestamp("result_time"),
  result: jsonb("result"),
});
```

#### 4. **Test Ordering Flow**
```typescript
// Multi-select test ordering with batch processing
const orderTestsMutation = useMutation({
  mutationFn: async (tests: string[]) => {
    const response = await apiRequest("POST", `/api/sessions/${session.id}/tests`, {
      tests
    });
    return response.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/sessions", session.id, "tests"] });
    setSelectedTests([]);
    if (onClose) onClose();
  }
});
```

### Test Results Generation

AI-powered generation of realistic test results:

```typescript
// server/services/openai.ts
export async function generateTestResult(
  testName: string,
  patientCase: any
): Promise<any> {
  // Generates medically accurate test results
  // based on patient case and clinical scenario
}
```

---

## Architecture & Technical Stack

### Frontend Architecture
```
client/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   └── osce/                  # OSCE-specific components
│   │       ├── case-library.tsx   # Case selection
│   │       ├── patient-chat.tsx   # AI chat interface
│   │       ├── physical-exam.tsx  # Examination interface
│   │       ├── test-ordering.tsx  # Lab/imaging orders
│   │       ├── diagnosis-modal.tsx # Diagnosis selection
│   │       ├── treatment-plan.tsx # Treatment planning
│   │       └── sidebar.tsx        # Session navigation
│   ├── pages/
│   │   ├── osce-simulator.tsx     # Main simulation page
│   │   └── not-found.tsx          # 404 handler
│   ├── lib/
│   │   ├── osce-types.ts          # Type definitions
│   │   ├── queryClient.ts         # API client setup
│   │   └── utils.ts               # Utility functions
│   └── App.tsx                    # Main app component
```

### Backend Architecture
```
server/
├── index.ts                       # Express server setup
├── routes.ts                      # API route definitions
├── storage.ts                     # Storage abstraction layer
├── vite.ts                        # Vite dev server integration
└── services/
    └── openai.ts                  # AI service integration
```

### Technology Stack

#### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TanStack Query** - Server state management
- **Wouter** - Lightweight routing
- **shadcn/ui** - Component library
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations

#### Backend  
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Database toolkit
- **PostgreSQL** - Primary database
- **OpenAI API** - AI patient responses
- **Zod** - Schema validation

#### Development Tools
- **TSX** - TypeScript execution
- **ESBuild** - Fast bundling
- **Drizzle Kit** - Database migrations

---

## Data Models & Schema

### Core Database Schema

```typescript
// shared/schema.ts

// Medical case definitions
export const osceCase = pgTable("osce_case", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  patientInfo: jsonb("patient_info").notNull(), // Demographics, chief complaint
  vitals: jsonb("vitals").notNull(),            // Vital signs
  expectedFindings: jsonb("expected_findings").notNull(), // Expected exam results
  availableTests: jsonb("available_tests").notNull(),     // Available lab/imaging
  correctDiagnosis: text("correct_diagnosis").notNull(),
  differentialDiagnoses: jsonb("differential_diagnoses").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Active simulation sessions
export const osceSession = pgTable("osce_session", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  caseId: varchar("case_id").references(() => osceCase.id).notNull(),
  currentStage: text("current_stage").notNull().default("history"),
  timeStarted: timestamp("time_started").defaultNow(),
  timeRemaining: integer("time_remaining").notNull().default(1800),
  chatHistory: jsonb("chat_history").notNull().default([]),
  physicalFindings: jsonb("physical_findings").notNull().default({}),
  orderedTests: jsonb("ordered_tests").notNull().default([]),
  testResults: jsonb("test_results").notNull().default({}),
  selectedDiagnosis: text("selected_diagnosis"),
  diagnosisReasoning: text("diagnosis_reasoning"),
  treatmentPlan: jsonb("treatment_plan").notNull().default({}),
  score: integer("score"),
  completed: boolean("completed").notNull().default(false),
});

// Patient-student conversations
export const chatMessage = pgTable("chat_message", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => osceSession.id).notNull(),
  sender: text("sender").notNull(), // "student" or "patient"
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Laboratory and imaging orders
export const testOrder = pgTable("test_order", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => osceSession.id).notNull(),
  testName: text("test_name").notNull(),
  testCategory: text("test_category").notNull(),
  status: text("status").notNull().default("pending"),
  orderTime: timestamp("order_time").defaultNow(),
  resultTime: timestamp("result_time"),
  result: jsonb("result"),
});
```

### Data Flexibility with JSONB

The schema uses PostgreSQL's JSONB fields for flexible medical data storage:

```typescript
// Example patient info structure
patientInfo: {
  name: "Sarah Johnson",
  age: 45,
  gender: "Female", 
  chiefComplaint: "Chest pain for 2 days",
  mrn: "12345678",
  dob: "1979-03-15"
}

// Example vital signs
vitals: {
  bp: "138/88",
  hr: 92,
  temp: "98.6°F", 
  rr: 18,
  o2sat: 98,
  bmi: 26.4
}

// Example physical findings
physicalFindings: {
  "chest_auscultation": {
    finding: "Clear breath sounds bilaterally",
    normal: true,
    timestamp: "2024-01-15T10:30:00Z"
  },
  "abdomen_palpation": {
    finding: "Tenderness in RUQ, Murphy's sign positive", 
    normal: false,
    timestamp: "2024-01-15T10:32:00Z"
  }
}
```

---

## Key Implementation Patterns

### 1. **Component Composition Pattern**

```typescript
// Main simulator page orchestrates multiple components
export default function OsceSimulator() {
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <OsceSidebar 
        session={session} 
        osceCase={osceCase}
        onOpenTests={() => setShowTestModal(true)}
        onOpenDiagnosis={() => setShowDiagnosisModal(true)}
      />
      
      <div className="flex-1 flex flex-col">
        {renderMainContent()}
      </div>

      <PatientChat session={session} osceCase={osceCase} />
      
      {showTestModal && (
        <TestOrdering 
          session={session} 
          osceCase={osceCase} 
          onClose={() => setShowTestModal(false)} 
        />
      )}
    </div>
  );
}
```

### 2. **API Client Pattern**

```typescript
// lib/queryClient.ts - Centralized API request handling
export async function apiRequest(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  url: string,
  body?: any
): Promise<Response> {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response;
}
```

### 3. **Mutation Pattern with Optimistic Updates**

```typescript
// Real-time updates with TanStack Query
const sendMessageMutation = useMutation({
  mutationFn: async (messageText: string) => {
    const response = await apiRequest("POST", `/api/sessions/${session.id}/chat`, {
      message: messageText
    });
    return response.json();
  },
  onSuccess: () => {
    // Invalidate and refetch related queries
    queryClient.invalidateQueries({ queryKey: ["/api/sessions", session.id, "chat"] });
    setMessage("");
  }
});
```

### 4. **Error Boundary Pattern**

```typescript
// server/index.ts - Global error handling
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
  throw err;
});
```

### 5. **Storage Abstraction Pattern**

```typescript
// server/storage.ts - Interface-based storage abstraction
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  createSession(session: InsertOsceSession): Promise<OsceSession>;
  updateSession(id: string, updates: Partial<OsceSession>): Promise<OsceSession | undefined>;
  // ... other storage methods
}

export class MemStorage implements IStorage {
  // In-memory implementation for development
}

export class DbStorage implements IStorage {
  // Database implementation for production
}
```

---

## Session State Management

### Real-time Session Updates

The app maintains real-time session state through several mechanisms:

#### 1. **Timer Management**
```typescript
// client/src/components/osce/sidebar.tsx
const [timeRemaining, setTimeRemaining] = useState(session.timeRemaining);

// Client-side countdown with server sync
useEffect(() => {
  const timer = setInterval(() => {
    setTimeRemaining((prev: number) => Math.max(0, prev - 1));
  }, 1000);

  return () => clearInterval(timer);
}, []);

// Periodic server sync
const pauseSessionMutation = useMutation({
  mutationFn: async () => {
    const response = await apiRequest("PATCH", `/api/sessions/${session.id}`, {
      timeRemaining: timeRemaining
    });
    return response.json();
  }
});
```

#### 2. **Stage Progression Logic**
```typescript
// server/routes.ts - Stage advancement
app.patch("/api/sessions/:id", async (req, res) => {
  try {
    const session = await storage.updateSession(req.params.id, req.body);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: "Failed to update session" });
  }
});
```

#### 3. **Data Persistence Strategy**
```typescript
// Incremental updates to avoid data loss
const updatePhysicalFindings = async (bodyPart: string, finding: any) => {
  const updatedFindings = {
    ...session.physicalFindings,
    [`${bodyPart}_${finding.examType}`]: {
      finding: finding.result,
      normal: finding.normal,
      timestamp: new Date().toISOString()
    }
  };
  
  await storage.updateSession(session.id, {
    physicalFindings: updatedFindings
  });
};
```

### Session Recovery & Persistence

```typescript
// Automatic session recovery on page reload
const { data: session, isLoading } = useQuery({
  queryKey: ["/api/sessions", sessionId],
  enabled: !!sessionId,
  staleTime: 0, // Always fetch fresh data
  refetchOnWindowFocus: true
});
```

---

## Developer Guidelines

### Code Organization Principles

#### 1. **Separation of Concerns**
- **Components**: Pure UI components with minimal business logic
- **Services**: Business logic and external API integrations  
- **Storage**: Data persistence and retrieval
- **Types**: Shared type definitions and schemas

#### 2. **Type Safety Strategy**
```typescript
// End-to-end type safety with Zod schemas
export const insertOsceSessionSchema = createInsertSchema(osceSession).omit({
  id: true,
  timeStarted: true,
});

export type InsertOsceSession = z.infer<typeof insertOsceSessionSchema>;
```

#### 3. **Component Design Patterns**

**Container/Presenter Pattern:**
```typescript
// Container component handles data fetching and state
export default function OsceSimulator() {
  const { data: session } = useQuery({
    queryKey: ["/api/sessions", sessionId],
  });

  return <PhysicalExam session={session} osceCase={osceCase} />;
}

// Presenter component handles UI rendering
export default function PhysicalExam({ session, osceCase }: PhysicalExamProps) {
  return (
    <div className="examination-interface">
      {/* UI implementation */}
    </div>
  );
}
```

#### 4. **Error Handling Strategy**

**Progressive Error Handling:**
```typescript
// Component-level error boundaries
const sendMessageMutation = useMutation({
  mutationFn: async (messageText: string) => {
    try {
      const response = await apiRequest("POST", `/api/sessions/${session.id}/chat`, {
        message: messageText
      });
      return response.json();
    } catch (error) {
      console.error("Chat error:", error);
      throw error;
    }
  },
  onError: (error) => {
    // User-friendly error handling
    toast.error("Failed to send message. Please try again.");
  }
});
```

#### 5. **Performance Optimization**

**Query Optimization:**
```typescript
// Strategic cache invalidation
onSuccess: () => {
  // Only invalidate specific related queries
  queryClient.invalidateQueries({ queryKey: ["/api/sessions", session.id, "chat"] });
  queryClient.invalidateQueries({ queryKey: ["/api/sessions", session.id] });
}

// Optimistic updates for better UX
const optimisticUpdate = useMutation({
  onMutate: async (newMessage) => {
    await queryClient.cancelQueries(["/api/sessions", session.id, "chat"]);
    
    const previousMessages = queryClient.getQueryData(["/api/sessions", session.id, "chat"]);
    
    queryClient.setQueryData(["/api/sessions", session.id, "chat"], (old: any[]) => [
      ...old,
      { id: 'temp', message: newMessage, sender: 'student', timestamp: new Date() }
    ]);
    
    return { previousMessages };
  },
  onError: (err, variables, context) => {
    queryClient.setQueryData(["/api/sessions", session.id, "chat"], context?.previousMessages);
  }
});
```

### Implementation Best Practices

#### 1. **Medical Data Handling**
```typescript
// Always validate medical data structures
const validateVitalSigns = (vitals: any) => {
  const vitalSchema = z.object({
    bp: z.string().regex(/^\d{2,3}\/\d{2,3}$/),
    hr: z.number().min(30).max(200),
    temp: z.string(),
    rr: z.number().min(8).max(40),
    o2sat: z.number().min(70).max(100),
    bmi: z.number().min(10).max(50)
  });
  
  return vitalSchema.parse(vitals);
};
```

#### 2. **AI Integration Safety**
```typescript
// Always provide fallback responses for AI failures
export async function getPatientResponse(
  patientInfo: any,
  chatHistory: any[],
  studentMessage: string
): Promise<PatientResponse> {
  try {
    // OpenAI API call
    const response = await openai.chat.completions.create({...});
    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("OpenAI API error:", error);
    // Always return a valid response structure
    return {
      message: "I'm having trouble speaking right now. Could you try again?",
      emotion: "neutral"
    };
  }
}
```

#### 3. **Test-Driven Development**
```typescript
// Component testing with realistic medical scenarios
describe('PhysicalExam Component', () => {
  it('should record examination findings correctly', async () => {
    const mockSession = {
      id: 'test-session',
      physicalFindings: {}
    };
    
    render(<PhysicalExam session={mockSession} osceCase={mockCase} />);
    
    fireEvent.click(screen.getByTestId('button-tool-stethoscope'));
    fireEvent.click(screen.getByTestId('button-body-chest'));
    fireEvent.click(screen.getByTestId('button-exam-auscultation'));
    
    await waitFor(() => {
      expect(screen.getByTestId('text-finding-chest_auscultation')).toBeInTheDocument();
    });
  });
});
```

### Scaling Considerations

#### 1. **Multi-tenancy Support**
```typescript
// User isolation at the database level
export const osceSession = pgTable("osce_session", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(), // Add user association
  caseId: varchar("case_id").references(() => osceCase.id).notNull(),
  // ... other fields
});
```

#### 2. **Performance Monitoring**
```typescript
// API request logging and monitoring
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });
  
  next();
});
```

#### 3. **Database Optimization**
```sql
-- Index optimization for common queries
CREATE INDEX idx_osce_session_user_id ON osce_session(user_id);
CREATE INDEX idx_chat_message_session_id ON chat_message(session_id);
CREATE INDEX idx_test_order_session_id ON test_order(session_id);
```

---

## Summary

The OSCE Simulator represents a comprehensive medical education platform that successfully combines:

- **Structured Clinical Assessment**: Following real OSCE examination protocols
- **AI-Powered Interactions**: Realistic patient conversations using OpenAI
- **Interactive Physical Examination**: Visual, tool-based examination system
- **Comprehensive Test Ordering**: Hospital-like laboratory and imaging workflow
- **Real-time State Management**: Persistent, synchronized session state
- **Type-Safe Architecture**: End-to-end TypeScript implementation

### Key Architectural Strengths

1. **Modular Design**: Clear separation between UI, business logic, and data layers
2. **Scalable State Management**: TanStack Query for efficient server state synchronization
3. **Flexible Data Model**: JSONB fields accommodate diverse medical data structures
4. **AI Integration**: Robust fallback handling for external API dependencies
5. **Developer Experience**: Comprehensive type safety and error handling

This architecture provides a solid foundation for building similar medical simulation applications or extending the current system with additional clinical scenarios and assessment types.