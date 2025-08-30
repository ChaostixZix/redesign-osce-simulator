# OSCE Simulator - App Flow Diagram

## 📊 Application Flow Overview

This document provides a visual representation of how the OSCE Simulator works from both user and technical perspectives.

---

## 🔄 User Journey Flow

```
┌─────────────────────┐
│   Case Selection    │
│  (Case Library)     │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   Start Session    │
│  POST /api/sessions │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   OSCE Stages       │
│   (30 min timer)    │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┬─────────────────────┬─────────────────────┐
│   Stage 1: History  │   Stage 2: Physical │   Stage 3: Tests    │
│   - AI Chat         │   - Body Examination│   - Order Labs      │
│   - Quick Questions │   - Virtual Tools   │   - Order Imaging   │
│   - Patient Info    │   - Record Findings │   - View Results    │
└─────────┬───────────┴─────────┬───────────┴─────────┬───────────┘
          │                     │                     │
          ▼                     ▼                     ▼
┌─────────────────────┬─────────────────────┬─────────────────────┐
│   Stage 4: Imaging  │   Stage 5: Diagnosis│   Stage 6: Treatment│
│   - CT/MRI Orders   │   - Differential Dx │   - Management Plan │
│   - X-ray Results   │   - ICD-10 Codes    │   - Medications     │
│   - Radiology       │   - Reasoning       │   - Follow-up       │
└─────────┬───────────┴─────────┬───────────┴─────────┬───────────┘
          │                     │                     │
          └─────────────────────┼─────────────────────┘
                                ▼
                  ┌─────────────────────┐
                  │   Session Complete  │
                  │   - Score           │
                  │   - Feedback        │
                  │   - Performance     │
                  └─────────────────────┘
```

---

## 🏗️ Technical Architecture Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                           Frontend (React)                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Case Library  │  │ OSCE Simulator  │  │  Patient Chat   │  │
│  │  - Case Grid    │  │ - Stage Router  │  │ - Chat History  │  │
│  │  - Start Button │  │ - Timer         │  │ - Quick Actions │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                 │                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ Physical Exam   │  │  Test Ordering  │  │   Diagnosis     │  │
│  │ - Body Diagram  │  │ - Test Categories│  │ - Differential  │  │
│  │ - Virtual Tools │  │ - Order Queue   │  │ - Reasoning     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼ TanStack Query (REST API)
┌─────────────────────────────────────────────────────────────────┐
│                        Backend (Express.js)                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   API Routes    │  │   Middleware    │  │   Services      │  │
│  │ - /api/cases    │  │ - JSON Parser   │  │ - OpenAI        │  │
│  │ - /api/sessions │  │ - Error Handler │  │ - Storage       │  │
│  │ - /api/chat     │  │ - CORS          │  │ - Validation    │  │
│  │ - /api/tests    │  │ - Logging       │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼ Drizzle ORM
┌─────────────────────────────────────────────────────────────────┐
│                      Database (PostgreSQL)                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   osce_case     │  │  osce_session   │  │  chat_message   │  │
│  │ - Patient Info  │  │ - Current Stage │  │ - Sender        │  │
│  │ - Vitals        │  │ - Timer         │  │ - Message       │  │
│  │ - Expected Dx   │  │ - Findings      │  │ - Timestamp     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐                      │
│  │   test_order    │  │     users       │                      │
│  │ - Test Name     │  │ - Username      │                      │
│  │ - Status        │  │ - Password      │                      │
│  │ - Results       │  │                 │                      │
│  └─────────────────┘  └─────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼ HTTP Requests
┌─────────────────────────────────────────────────────────────────┐
│                       External APIs                             │
│  ┌─────────────────┐                                            │
│  │    OpenAI GPT   │                                            │
│  │ - Patient Chat  │                                            │
│  │ - Findings Gen  │                                            │
│  │ - Test Results  │                                            │
│  └─────────────────┘                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Patterns

### 1. Session Initialization
```
User Clicks "Start Session"
         │
         ▼
Frontend: POST /api/sessions { caseId, timeRemaining: 1800 }
         │
         ▼
Backend: Create session record with initial state
         │
         ▼
Database: INSERT INTO osce_session (case_id, current_stage, time_remaining, ...)
         │
         ▼
Frontend: Navigate to /simulator/:sessionId
         │
         ▼
UI: Load session components (sidebar, main content, patient chat)
```

### 2. AI Chat Interaction
```
Student Types Message
         │
         ▼
Frontend: POST /api/sessions/:id/chat { message: "How are you feeling?" }
         │
         ▼
Backend: Store student message in chat_message table
         │
         ▼
Backend: Call OpenAI API with patient context + chat history
         │
         ▼
OpenAI: Generate patient response based on medical scenario
         │
         ▼
Backend: Store AI response in chat_message table
         │
         ▼
Frontend: Poll /api/sessions/:id/chat and update UI
```

### 3. Physical Examination
```
Student Selects Tool + Body Part + Exam Type
         │
         ▼
Frontend: POST /api/sessions/:id/examine { bodyPart: "chest", examType: "auscultation" }
         │
         ▼
Backend: Generate examination finding based on case expected findings
         │
         ▼
Backend: Update session.physicalFindings["chest_auscultation"] = { finding, normal, timestamp }
         │
         ▼
Frontend: Invalidate session query and re-render findings list
```

### 4. Test Ordering & Results
```
Student Selects Tests to Order
         │
         ▼
Frontend: POST /api/sessions/:id/tests { tests: ["CBC", "Troponin I"] }
         │
         ▼
Backend: Create test_order records with status="pending"
         │
         ▼
Backend: Start async processing (simulate turnaround time)
         │
         ▼ (After turnaround time)
Backend: Generate AI-based test results and update status="completed"
         │
         ▼
Frontend: Poll /api/sessions/:id/tests and show results when ready
```

---

## 🎯 State Management Flow

### Session State Structure
```javascript
session = {
  id: "uuid",
  caseId: "case-uuid",
  currentStage: "history", // history → physical → tests → imaging → diagnosis → treatment
  timeStarted: "2024-01-15T10:00:00Z",
  timeRemaining: 1654, // seconds countdown
  
  // Dynamic data stored as JSONB
  chatHistory: [
    { id: "msg1", sender: "student", message: "Hello", timestamp: "..." },
    { id: "msg2", sender: "patient", message: "Hi doctor", timestamp: "..." }
  ],
  
  physicalFindings: {
    "chest_auscultation": { finding: "Clear breath sounds", normal: true, timestamp: "..." },
    "abdomen_palpation": { finding: "Tender RUQ", normal: false, timestamp: "..." }
  },
  
  orderedTests: [
    { name: "CBC", category: "Hematology", status: "completed", results: {...} },
    { name: "Troponin I", category: "Cardiac", status: "pending", results: null }
  ],
  
  selectedDiagnosis: "Acute Cholecystitis",
  diagnosisReasoning: "Patient presents with RUQ pain, positive Murphy's sign...",
  
  treatmentPlan: {
    medications: ["IV fluids", "Pain management"],
    procedures: ["Laparoscopic cholecystectomy"],
    followUp: ["Surgery consult", "NPO status"]
  },
  
  score: 85,
  completed: false
}
```

### State Updates Pattern
```
Component Action
      │
      ▼
Mutation (optimistic update)
      │
      ├─ Update local cache immediately (optimistic)
      │
      ▼
API Request
      │
      ├─ Success: Confirm local update
      │
      ├─ Error: Revert local update + show error
      │
      ▼
Invalidate Related Queries
      │
      ▼
Re-render Components with New Data
```

---

## 🚦 Stage Progression Logic

```
Stage Progression Rules:
┌─────────────┐
│   History   │ → Time spent or manual progression
└─────┬───────┘
      │
      ▼
┌─────────────┐
│  Physical   │ → At least 3 body parts examined
└─────┬───────┘
      │
      ▼
┌─────────────┐
│    Tests    │ → At least 2 tests ordered
└─────┬───────┘
      │
      ▼
┌─────────────┐
│   Imaging   │ → Optional: imaging studies
└─────┬───────┘
      │
      ▼
┌─────────────┐
│  Diagnosis  │ → Differential diagnosis selected
└─────┬───────┘
      │
      ▼
┌─────────────┐
│  Treatment  │ → Treatment plan completed
└─────┬───────┘
      │
      ▼
┌─────────────┐
│  Complete   │ → Session scoring and feedback
└─────────────┘
```

### Stage Navigation Logic
```typescript
const canProgressToNextStage = (currentStage: string, sessionData: any) => {
  switch (currentStage) {
    case "history":
      return sessionData.chatHistory?.length >= 5; // Minimum conversation
      
    case "physical":
      return Object.keys(sessionData.physicalFindings || {}).length >= 3; // Min examinations
      
    case "tests":
      return sessionData.orderedTests?.length >= 2; // Min tests ordered
      
    case "imaging":
      return true; // Optional stage
      
    case "diagnosis":
      return sessionData.selectedDiagnosis !== null; // Diagnosis selected
      
    case "treatment":
      return sessionData.treatmentPlan?.medications?.length > 0; // Treatment planned
      
    default:
      return false;
  }
};
```

---

## 🔧 Real-time Update Mechanisms

### 1. Timer Synchronization
```
Client Timer (1 second intervals)
         │
         ▼
Local State Update: timeRemaining--
         │
         ▼ (Every 30 seconds)
Sync with Server: PATCH /api/sessions/:id { timeRemaining }
         │
         ▼
Server Updates Database
         │
         ▼ (On page reload/focus)
Fetch Fresh Timer Value from Server
```

### 2. Chat Polling
```
TanStack Query with refetchInterval: 2000ms
         │
         ▼
GET /api/sessions/:id/chat
         │
         ▼
Check for new messages since last fetch
         │
         ▼
Update chat UI with new messages
         │
         ▼
Auto-scroll to bottom
```

### 3. Test Results Processing
```
Test Ordered → Status: "pending"
         │
         ▼ (Background processing)
setTimeout(() => {
  generateResults();
  updateStatus("completed");
}, turnaroundTimeMs);
         │
         ▼ (Frontend polling)
useQuery with refetchInterval detects status change
         │
         ▼
UI updates to show results available
```

---

## 📱 Responsive Design Patterns

### Layout Structure
```
Desktop (≥1024px):
┌─────────────────────────────────────────────────────────────┐
│ [Sidebar] [Main Content Area] [Patient Chat Panel]         │
│  Timer     Physical Exam       Chat History               │
│  Progress  Test Ordering       Patient Info               │
│  Actions   Diagnosis          Quick Questions             │
└─────────────────────────────────────────────────────────────┘

Tablet (768px-1023px):
┌─────────────────────────────────────────────────────────────┐
│ [Collapsed Sidebar] [Main Content Area]                    │
│                     [Floating Chat Button]                 │
└─────────────────────────────────────────────────────────────┘

Mobile (≤767px):
┌─────────────────────────────────────────────────────────────┐
│ [Bottom Navigation] [Full Screen Content]                  │
│ [Modal Chat]        [Swipe Gestures]                       │
└─────────────────────────────────────────────────────────────┘
```

---

This flow diagram helps developers understand the complete journey from user interaction to data persistence, making it easier to implement similar medical simulation applications.