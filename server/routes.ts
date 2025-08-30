import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOsceSessionSchema, insertChatMessageSchema, insertTestOrderSchema } from "@shared/schema";
import { getPatientResponse, generatePhysicalFinding, generateTestResult } from "./services/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all OSCE cases
  app.get("/api/cases", async (req, res) => {
    try {
      const cases = await storage.getAllCases();
      res.json(cases);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cases" });
    }
  });

  // Get specific OSCE case
  app.get("/api/cases/:id", async (req, res) => {
    try {
      const osceCase = await storage.getCase(req.params.id);
      if (!osceCase) {
        return res.status(404).json({ message: "Case not found" });
      }
      res.json(osceCase);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch case" });
    }
  });

  // Create new OSCE session
  app.post("/api/sessions", async (req, res) => {
    try {
      const sessionData = insertOsceSessionSchema.parse(req.body);
      const session = await storage.createSession(sessionData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid session data" });
    }
  });

  // Get OSCE session
  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });

  // Update OSCE session
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

  // Send message to AI patient
  app.post("/api/sessions/:id/chat", async (req, res) => {
    try {
      const { message } = req.body;
      const sessionId = req.params.id;
      
      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      const osceCase = await storage.getCase(session.caseId);
      if (!osceCase) {
        return res.status(404).json({ message: "Case not found" });
      }

      // Add student message
      await storage.addChatMessage({
        sessionId,
        sender: "student",
        message
      });

      // Get chat history for context
      const chatHistory = await storage.getChatHistory(sessionId);

      // Generate AI patient response
      const patientResponse = await getPatientResponse(
        osceCase.patientInfo,
        chatHistory,
        message
      );

      // Add patient response
      const aiMessage = await storage.addChatMessage({
        sessionId,
        sender: "patient",
        message: patientResponse.message
      });

      res.json({ 
        studentMessage: message,
        patientResponse: aiMessage,
        emotion: patientResponse.emotion
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // Get chat history
  app.get("/api/sessions/:id/chat", async (req, res) => {
    try {
      const chatHistory = await storage.getChatHistory(req.params.id);
      res.json(chatHistory);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  // Perform physical examination
  app.post("/api/sessions/:id/examine", async (req, res) => {
    try {
      const { bodyPart, examinationType } = req.body;
      const sessionId = req.params.id;
      
      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      const osceCase = await storage.getCase(session.caseId);
      if (!osceCase) {
        return res.status(404).json({ message: "Case not found" });
      }

      // Generate finding using AI
      const finding = await generatePhysicalFinding(bodyPart, examinationType, osceCase);

      // Update session with finding
      const updatedFindings = {
        ...session.physicalFindings,
        [`${bodyPart}_${examinationType}`]: {
          finding,
          timestamp: new Date().toISOString(),
          normal: !finding.toLowerCase().includes("abnormal") && !finding.toLowerCase().includes("tender")
        }
      };

      await storage.updateSession(sessionId, {
        physicalFindings: updatedFindings
      });

      res.json({ finding, bodyPart, examinationType });
    } catch (error) {
      res.status(500).json({ message: "Failed to perform examination" });
    }
  });

  // Order tests
  app.post("/api/sessions/:id/tests", async (req, res) => {
    try {
      const { tests } = req.body; // Array of test names
      const sessionId = req.params.id;
      
      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      const testOrders = await Promise.all(
        tests.map(async (testName: string) => {
          const testOrder = await storage.createTestOrder({
            sessionId,
            testName,
            testCategory: "General", // Could be enhanced to categorize properly
            status: "processing"
          });
          return testOrder;
        })
      );

      res.json(testOrders);
    } catch (error) {
      res.status(500).json({ message: "Failed to order tests" });
    }
  });

  // Get test orders
  app.get("/api/sessions/:id/tests", async (req, res) => {
    try {
      const testOrders = await storage.getTestOrders(req.params.id);
      res.json(testOrders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch test orders" });
    }
  });

  // Get test results (simulate completion)
  app.get("/api/sessions/:id/tests/:testId/result", async (req, res) => {
    try {
      const { sessionId, testId } = req.params;
      
      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      const osceCase = await storage.getCase(session.caseId);
      if (!osceCase) {
        return res.status(404).json({ message: "Case not found" });
      }

      const testOrder = await storage.getTestOrders(sessionId);
      const test = testOrder.find(t => t.id === testId);
      
      if (!test) {
        return res.status(404).json({ message: "Test order not found" });
      }

      // Generate test result using AI
      const result = await generateTestResult(test.testName, osceCase);
      
      // Update test order with result
      await storage.updateTestOrder(testId, {
        status: "completed",
        resultTime: new Date(),
        result
      });

      res.json({ testName: test.testName, result });
    } catch (error) {
      res.status(500).json({ message: "Failed to get test result" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
