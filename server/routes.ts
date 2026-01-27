import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertActionItemSchema, insertEodTaskSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Demo user - in production this would come from authentication
  const DEMO_USER_ID = "demo-user";

  // Initialize demo user if not exists
  (async () => {
    const existingUser = await storage.getUserByUsername("j.doe");
    if (!existingUser) {
      await storage.createUser({
        username: "j.doe",
        password: "demo", // In production, use proper hashing
        displayName: "J. Doe",
      });
    }
  })();

  // Get current user
  app.get("/api/user", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("j.doe");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Action Items API
  app.get("/api/action-items", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("j.doe");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const items = await storage.getActionItems(user.id);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/action-items", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("j.doe");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const validated = insertActionItemSchema.parse({
        ...req.body,
        userId: user.id,
      });
      const item = await storage.createActionItem(validated);
      res.json(item);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/action-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const item = await storage.updateActionItem(id, updates);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/action-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteActionItem(id);
      if (!success) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // EOD Tasks API
  app.get("/api/eod-tasks", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("j.doe");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const date = req.query.date as string || new Date().toISOString().split('T')[0];
      let tasks = await storage.getEodTasks(user.id, date);

      // Initialize default tasks if none exist for today
      if (tasks.length === 0) {
        tasks = await storage.initializeDefaultEodTasks(user.id, date);
      }

      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/eod-tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const task = await storage.updateEodTask(id, updates);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Initialize demo data endpoint
  app.post("/api/init-demo-data", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("j.doe");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if demo data already exists
      const existingItems = await storage.getActionItems(user.id);
      if (existingItems.length > 0) {
        return res.json({ message: "Demo data already exists", items: existingItems });
      }

      // Create demo action items
      const demoItems = [
        {
          userId: user.id,
          title: "VPN Gateway Latency - Health Science Campus",
          summary: "Multiple users reporting slow connection speeds. Network logs showing high packet loss on Gateway-02.",
          source: "ticket",
          priority: "critical",
          state: "action_required",
          reason: "Service Degradation (Major)",
          impact: "Clinical Staff Blocking",
          slaStatus: "breaching",
          nextAction: "Acknowledge & escalate to Network",
        },
        {
          userId: user.id,
          title: "Mentioned by Mike Ross (Security Lead)",
          summary: "@J.Doe Can you verify the firewall logs for the new radiometry server? Need this for the audit report by 2pm.",
          source: "teams",
          priority: "high",
          state: "action_required",
          sender: "Mike Ross",
          reason: "Direct Mention • Compliance Deadline",
          impact: "Audit Compliance Risk",
          nextAction: "Verify logs → reply before 2 PM",
        },
        {
          userId: user.id,
          title: "Re: Access Request for Cardiology Dataset",
          summary: "I've attached the IRB approval. Please expedite access for Dr. Chen.",
          source: "email",
          priority: "high",
          state: "action_required",
          sender: "Dr. Sarah Chen",
          reason: "VIP Sender • Access Blocking",
          impact: "Research Blocker",
          nextAction: "Grant access in AD",
        },
        {
          userId: user.id,
          title: "New Hire Provisioning - Radiology",
          summary: "Waiting for HR to confirm start date before creating AD account.",
          source: "ticket",
          priority: "medium",
          state: "waiting",
          reason: "Routine Task",
          waitingOn: "HR Dept",
        },
        {
          userId: user.id,
          title: "Scheduled Maintenance: This Weekend",
          summary: "FYI: The storage array firmware update is scheduled for Saturday 2am.",
          source: "email",
          priority: "low",
          state: "info",
          sender: "Infra Team",
          reason: "FYI Only",
        },
      ];

      const createdItems = await Promise.all(
        demoItems.map(item => storage.createActionItem(item))
      );

      res.json({ message: "Demo data initialized", items: createdItems });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
