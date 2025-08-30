import { type User, type InsertUser, type OsceCase, type InsertOsceCase, type OsceSession, type InsertOsceSession, type ChatMessage, type InsertChatMessage, type TestOrder, type InsertTestOrder } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // OSCE Cases
  getAllCases(): Promise<OsceCase[]>;
  getCase(id: string): Promise<OsceCase | undefined>;
  createCase(osceCase: InsertOsceCase): Promise<OsceCase>;
  
  // OSCE Sessions
  createSession(session: InsertOsceSession): Promise<OsceSession>;
  getSession(id: string): Promise<OsceSession | undefined>;
  updateSession(id: string, updates: Partial<OsceSession>): Promise<OsceSession | undefined>;
  
  // Chat Messages
  addChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatHistory(sessionId: string): Promise<ChatMessage[]>;
  
  // Test Orders
  createTestOrder(testOrder: InsertTestOrder): Promise<TestOrder>;
  getTestOrders(sessionId: string): Promise<TestOrder[]>;
  updateTestOrder(id: string, updates: Partial<TestOrder>): Promise<TestOrder | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private cases: Map<string, OsceCase>;
  private sessions: Map<string, OsceSession>;
  private chatMessages: Map<string, ChatMessage>;
  private testOrders: Map<string, TestOrder>;

  constructor() {
    this.users = new Map();
    this.cases = new Map();
    this.sessions = new Map();
    this.chatMessages = new Map();
    this.testOrders = new Map();
    
    // Initialize with sample cases
    this.initializeSampleCases();
  }

  private initializeSampleCases() {
    const chestPainCase: OsceCase = {
      id: randomUUID(),
      title: "Chest Pain",
      description: "45-year-old female presenting with acute chest pain",
      patientInfo: {
        name: "Sarah Johnson",
        age: 45,
        gender: "Female",
        chiefComplaint: "Chest pain for 2 days",
        mrn: "12345678",
        dob: "1979-03-15"
      },
      vitals: {
        bp: "138/88",
        hr: 92,
        temp: "98.6°F",
        rr: 18,
        o2sat: 98,
        bmi: 26.4
      },
      expectedFindings: {
        cardiovascular: { normal: true, findings: "Regular rate and rhythm, no murmurs" },
        respiratory: { normal: true, findings: "Clear breath sounds bilaterally" },
        abdomen: { normal: false, findings: "Tenderness in RUQ, Murphy's sign positive" }
      },
      availableTests: [
        { name: "Troponin I", category: "Cardiac Markers", turnaroundTime: 30 },
        { name: "Chest X-ray", category: "Imaging", turnaroundTime: 15 },
        { name: "ECG (12-lead)", category: "Cardiac", turnaroundTime: 5 },
        { name: "D-Dimer", category: "Hematology", turnaroundTime: 20 },
        { name: "CBC", category: "Hematology", turnaroundTime: 25 },
        { name: "BMP", category: "Chemistry", turnaroundTime: 25 }
      ],
      correctDiagnosis: "Acute Cholecystitis",
      differentialDiagnoses: [
        { diagnosis: "Acute Cholecystitis", icd10: "K80.20", probability: "high" },
        { diagnosis: "Peptic Ulcer Disease", icd10: "K27.9", probability: "medium" },
        { diagnosis: "Myocardial Infarction", icd10: "I21.9", probability: "low" }
      ],
      createdAt: new Date()
    };
    
    this.cases.set(chestPainCase.id, chestPainCase);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllCases(): Promise<OsceCase[]> {
    return Array.from(this.cases.values());
  }

  async getCase(id: string): Promise<OsceCase | undefined> {
    return this.cases.get(id);
  }

  async createCase(insertCase: InsertOsceCase): Promise<OsceCase> {
    const id = randomUUID();
    const osceCase: OsceCase = { ...insertCase, id, createdAt: new Date() };
    this.cases.set(id, osceCase);
    return osceCase;
  }

  async createSession(insertSession: InsertOsceSession): Promise<OsceSession> {
    const id = randomUUID();
    const session: OsceSession = { 
      ...insertSession, 
      id, 
      timeStarted: new Date(),
      chatHistory: [],
      physicalFindings: {},
      orderedTests: [],
      testResults: {},
      treatmentPlan: {}
    };
    this.sessions.set(id, session);
    return session;
  }

  async getSession(id: string): Promise<OsceSession | undefined> {
    return this.sessions.get(id);
  }

  async updateSession(id: string, updates: Partial<OsceSession>): Promise<OsceSession | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  async addChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = { ...insertMessage, id, timestamp: new Date() };
    this.chatMessages.set(id, message);
    return message;
  }

  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.sessionId === sessionId)
      .sort((a, b) => a.timestamp!.getTime() - b.timestamp!.getTime());
  }

  async createTestOrder(insertTestOrder: InsertTestOrder): Promise<TestOrder> {
    const id = randomUUID();
    const testOrder: TestOrder = { 
      ...insertTestOrder, 
      id, 
      orderTime: new Date(),
      resultTime: null,
      result: null
    };
    this.testOrders.set(id, testOrder);
    return testOrder;
  }

  async getTestOrders(sessionId: string): Promise<TestOrder[]> {
    return Array.from(this.testOrders.values())
      .filter(order => order.sessionId === sessionId)
      .sort((a, b) => a.orderTime!.getTime() - b.orderTime!.getTime());
  }

  async updateTestOrder(id: string, updates: Partial<TestOrder>): Promise<TestOrder | undefined> {
    const testOrder = this.testOrders.get(id);
    if (!testOrder) return undefined;
    
    const updatedOrder = { ...testOrder, ...updates };
    this.testOrders.set(id, updatedOrder);
    return updatedOrder;
  }
}

export const storage = new MemStorage();
