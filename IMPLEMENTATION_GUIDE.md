# OSCE Simulator - Quick Implementation Guide

## 🎯 Core Principles for Developers

This guide provides the essential patterns and principles for implementing medical simulation apps based on the OSCE Simulator architecture.

---

## 🏗️ Architecture Overview

### Tech Stack
- **Frontend**: React + TypeScript + Vite + TanStack Query
- **Backend**: Express.js + TypeScript + Drizzle ORM + PostgreSQL  
- **AI**: OpenAI GPT for patient interactions
- **UI**: shadcn/ui + Tailwind CSS

### Key Design Patterns
1. **Stage-Based Workflow**: Linear progression through assessment stages
2. **Real-time State Sync**: Client-server state synchronization with optimistic updates
3. **AI Integration**: Fallback-safe external API integration
4. **Modular Components**: Clear separation of concerns

---

## 🔄 Session Workflow Implementation

### 1. Define Assessment Stages
```typescript
export const ASSESSMENT_STAGES = [
  { id: "history", name: "History Taking", icon: "fas fa-comments" },
  { id: "physical", name: "Physical Exam", icon: "fas fa-stethoscope" },
  { id: "tests", name: "Laboratory Tests", icon: "fas fa-vial" },
  { id: "diagnosis", name: "Diagnosis", icon: "fas fa-clipboard-list" },
  { id: "treatment", name: "Treatment Plan", icon: "fas fa-file-medical" }
];
```

### 2. Session State Management
```typescript
// Database schema for sessions
export const session = pgTable("session", {
  id: varchar("id").primaryKey(),
  currentStage: text("current_stage").default("history"),
  timeRemaining: integer("time_remaining").default(1800), // 30 minutes
  sessionData: jsonb("session_data").default({}), // Flexible data storage
  completed: boolean("completed").default(false)
});
```

### 3. Stage Progression Logic
```typescript
const renderContent = () => {
  switch (session.currentStage) {
    case "history":
      return <HistoryTaking session={session} />;
    case "physical": 
      return <PhysicalExam session={session} />;
    case "tests":
      return <TestOrdering session={session} />;
    case "diagnosis":
      return <DiagnosisInterface session={session} />;
    case "treatment":
      return <TreatmentPlan session={session} />;
    default:
      return <HistoryTaking session={session} />;
  }
};
```

---

## 🤖 AI Integration Pattern

### 1. Safe AI Service Layer
```typescript
export async function getAIResponse(
  context: any,
  userInput: string
): Promise<AIResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: buildSystemPrompt(context) },
        { role: "user", content: userInput }
      ],
      response_format: { type: "json_object" },
      max_tokens: 200
    });
    
    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("AI API error:", error);
    // Always return valid fallback response
    return {
      message: "I'm having trouble responding right now. Please try again.",
      type: "neutral"
    };
  }
}
```

### 2. Context-Aware Prompts
```typescript
const buildSystemPrompt = (patientInfo: any) => `
You are simulating a ${patientInfo.age}-year-old ${patientInfo.gender} patient.
Chief complaint: ${patientInfo.chiefComplaint}

Respond as this patient would in a medical encounter.
Provide medically relevant information when asked appropriate questions.
Show realistic emotions and concerns.
Do NOT provide medical advice - you are the patient, not the doctor.

Response format: { "message": "patient response", "emotion": "emotion_type" }
`;
```

---

## 📋 Data Collection Pattern

### 1. Flexible JSONB Storage
```typescript
// Use JSONB for flexible medical data
sessionData: {
  physicalFindings: {
    "chest_auscultation": {
      finding: "Clear breath sounds bilaterally",
      normal: true,
      timestamp: "2024-01-15T10:30:00Z"
    }
  },
  orderedTests: [
    { name: "CBC", category: "Hematology", status: "pending" }
  ],
  chatHistory: [
    { sender: "student", message: "How are you feeling?", timestamp: "..." }
  ]
}
```

### 2. Incremental Data Updates
```typescript
const updateSessionData = async (sessionId: string, newData: any) => {
  const session = await getSession(sessionId);
  const updatedData = {
    ...session.sessionData,
    ...newData
  };
  
  return await updateSession(sessionId, { sessionData: updatedData });
};
```

---

## 🔧 Component Architecture

### 1. Container/Presenter Pattern
```typescript
// Container: Data fetching and state management
export default function AssessmentContainer() {
  const { data: session } = useQuery({
    queryKey: ["/api/sessions", sessionId]
  });
  
  return <AssessmentPresenter session={session} />;
}

// Presenter: UI rendering only
export default function AssessmentPresenter({ session }: Props) {
  return (
    <div className="assessment-interface">
      {/* Pure UI components */}
    </div>
  );
}
```

### 2. Mutation Pattern with Optimistic Updates
```typescript
const updateMutation = useMutation({
  mutationFn: async (data: any) => {
    return await apiRequest("POST", `/api/sessions/${sessionId}/update`, data);
  },
  onSuccess: () => {
    // Invalidate and refetch related queries
    queryClient.invalidateQueries(["/api/sessions", sessionId]);
  },
  onError: (error) => {
    // User-friendly error handling
    toast.error("Update failed. Please try again.");
  }
});
```

---

## ⏱️ Real-time Updates

### 1. Timer Management
```typescript
const useSessionTimer = (initialTime: number) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Sync with server periodically
  useEffect(() => {
    const syncTimer = setInterval(() => {
      syncTimeWithServer(timeRemaining);
    }, 30000); // Sync every 30 seconds
    
    return () => clearInterval(syncTimer);
  }, [timeRemaining]);
  
  return timeRemaining;
};
```

### 2. Polling for Updates
```typescript
const { data: sessionData } = useQuery({
  queryKey: ["/api/sessions", sessionId],
  refetchInterval: 5000, // Poll every 5 seconds
  staleTime: 0 // Always fetch fresh data
});
```

---

## 🎨 UI/UX Patterns

### 1. Progressive Disclosure
```typescript
// Show interface elements based on session stage
const getAvailableActions = (stage: string) => {
  switch (stage) {
    case "history":
      return ["chat", "quickQuestions"];
    case "physical":
      return ["examination", "tools"];
    case "tests":
      return ["orderTests", "viewResults"];
    default:
      return [];
  }
};
```

### 2. Status Indication
```typescript
// Visual feedback for different states
const getStatusBadge = (status: string) => {
  const variants = {
    pending: { color: "yellow", text: "Processing" },
    completed: { color: "green", text: "Complete" },
    failed: { color: "red", text: "Failed" }
  };
  
  return <Badge variant={variants[status].color}>{variants[status].text}</Badge>;
};
```

---

## 🔐 Error Handling Strategy

### 1. Graceful Degradation
```typescript
// Handle API failures gracefully
const safeFetch = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(response.statusText);
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    // Return default/cached data instead of breaking the UI
    return getDefaultData();
  }
};
```

### 2. User-Friendly Error Messages
```typescript
const handleError = (error: Error, context: string) => {
  const userMessage = getErrorMessage(error.message, context);
  toast.error(userMessage);
  
  // Log technical details for debugging
  console.error(`${context} error:`, error);
};

const getErrorMessage = (technical: string, context: string) => {
  const messages = {
    "Network Error": "Connection lost. Please check your internet.",
    "Timeout": "Request timed out. Please try again.",
    "500": "Server error. Please try again later."
  };
  
  return messages[technical] || `Failed to ${context}. Please try again.`;
};
```

---

## 📊 Performance Optimization

### 1. Query Optimization
```typescript
// Strategic cache invalidation
const updateSpecificData = useMutation({
  onSuccess: (data, variables) => {
    // Only invalidate related queries
    queryClient.setQueryData(["/api/sessions", sessionId], oldData => ({
      ...oldData,
      [variables.field]: data
    }));
  }
});
```

### 2. Component Memoization
```typescript
// Memoize expensive components
const MemoizedExamInterface = React.memo(({ findings, tools }) => {
  return (
    <div className="exam-interface">
      {/* Complex UI rendering */}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for when to re-render
  return JSON.stringify(prevProps.findings) === JSON.stringify(nextProps.findings);
});
```

---

## 🚀 Deployment Considerations

### 1. Environment Configuration
```typescript
// server/config.ts
export const config = {
  port: parseInt(process.env.PORT || '5000'),
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/osce_sim',
    ssl: process.env.NODE_ENV === 'production'
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-5'
  }
};
```

### 2. Database Migration Strategy
```sql
-- Migration: Add new assessment stage
ALTER TABLE sessions ADD COLUMN custom_stages JSONB DEFAULT '[]';

-- Index for performance
CREATE INDEX idx_sessions_stage ON sessions(current_stage);
CREATE INDEX idx_sessions_user ON sessions(user_id) WHERE completed = false;
```

---

## 🎯 Key Implementation Tips

### 1. **Start Simple, Scale Gradually**
- Begin with basic stage progression
- Add AI integration incrementally
- Implement real-time features last

### 2. **Prioritize Data Integrity**
- Always validate medical data structures
- Use transactions for critical updates
- Implement data backup strategies

### 3. **Design for Extensibility**
- Use interfaces for core services
- Make assessment stages configurable
- Support multiple case types

### 4. **Focus on User Experience**
- Provide immediate feedback for all actions
- Implement optimistic updates
- Design for offline scenarios

### 5. **Monitor and Measure**
- Track session completion rates
- Monitor AI API performance
- Log user interaction patterns

---

This implementation guide provides the core patterns needed to build medical simulation applications following the OSCE Simulator's proven architecture. The key is to start with the foundational patterns and incrementally add complexity as your application grows.