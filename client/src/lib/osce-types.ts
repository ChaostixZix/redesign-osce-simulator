export type OsceStage = "history" | "physical" | "tests" | "imaging" | "diagnosis" | "treatment";

export interface StageInfo {
  id: OsceStage;
  name: string;
  icon: string;
  description: string;
}

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

export interface ExaminationTool {
  id: string;
  name: string;
  icon: string;
  bodyParts: string[];
}

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

export const BODY_PARTS = [
  { id: "head", name: "Head & Neck", examinations: ["inspection", "palpation", "auscultation"] },
  { id: "chest", name: "Chest", examinations: ["inspection", "palpation", "percussion", "auscultation"] },
  { id: "abdomen", name: "Abdomen", examinations: ["inspection", "palpation", "percussion", "auscultation"] },
  { id: "extremities", name: "Extremities", examinations: ["inspection", "palpation", "neurological"] }
];

export const QUICK_QUESTIONS = [
  "Can you rate your pain from 1-10?",
  "Any family history of heart disease?",
  "Are you taking any medications?",
  "Have you had this type of pain before?",
  "Any associated symptoms like nausea or sweating?",
  "What makes the pain better or worse?"
];
