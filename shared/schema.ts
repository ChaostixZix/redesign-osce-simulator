import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const osceCase = pgTable("osce_case", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  patientInfo: jsonb("patient_info").notNull(), // age, gender, chief complaint, etc.
  vitals: jsonb("vitals").notNull(),
  expectedFindings: jsonb("expected_findings").notNull(),
  availableTests: jsonb("available_tests").notNull(),
  correctDiagnosis: text("correct_diagnosis").notNull(),
  differentialDiagnoses: jsonb("differential_diagnoses").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const osceSession = pgTable("osce_session", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  caseId: varchar("case_id").references(() => osceCase.id).notNull(),
  currentStage: text("current_stage").notNull().default("history"),
  timeStarted: timestamp("time_started").defaultNow(),
  timeRemaining: integer("time_remaining").notNull().default(1800), // 30 minutes in seconds
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

export const chatMessage = pgTable("chat_message", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => osceSession.id).notNull(),
  sender: text("sender").notNull(), // "student" or "patient"
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertOsceCaseSchema = createInsertSchema(osceCase).omit({
  id: true,
  createdAt: true,
});

export const insertOsceSessionSchema = createInsertSchema(osceSession).omit({
  id: true,
  timeStarted: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessage).omit({
  id: true,
  timestamp: true,
});

export const insertTestOrderSchema = createInsertSchema(testOrder).omit({
  id: true,
  orderTime: true,
  resultTime: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type OsceCase = typeof osceCase.$inferSelect;
export type InsertOsceCase = z.infer<typeof insertOsceCaseSchema>;

export type OsceSession = typeof osceSession.$inferSelect;
export type InsertOsceSession = z.infer<typeof insertOsceSessionSchema>;

export type ChatMessage = typeof chatMessage.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type TestOrder = typeof testOrder.$inferSelect;
export type InsertTestOrder = z.infer<typeof insertTestOrderSchema>;
