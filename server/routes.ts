import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertActionItemSchema, insertEodTaskSchema } from "@shared/schema";
import { z } from "zod";
import { authenticateUser, hashPassword, requireAuth, requireAdmin, getCurrentUser } from "./auth";
import * as microsoft from "./microsoft";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  displayName: z.string().min(1).max(100),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      const user = await authenticateUser(username, password);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      req.session.userId = user.id;
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid credentials format" });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, displayName } = registerSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        displayName,
      });
      
      req.session.userId = user.id;
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Get current user
  app.get("/api/user", async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Action Items API (protected)
  app.get("/api/action-items", requireAuth, async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const items = await storage.getActionItems(user.id);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/action-items", requireAuth, async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
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

  app.patch("/api/action-items/:id", requireAuth, async (req, res) => {
    try {
      const id = req.params.id as string;
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

  app.delete("/api/action-items/:id", requireAuth, async (req, res) => {
    try {
      const id = req.params.id as string;
      const success = await storage.deleteActionItem(id);
      if (!success) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // EOD Tasks API (protected)
  app.get("/api/eod-tasks", requireAuth, async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
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

  app.patch("/api/eod-tasks/:id", requireAuth, async (req, res) => {
    try {
      const id = req.params.id as string;
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

  // Initialize demo data endpoint (protected)
  app.post("/api/init-demo-data", requireAuth, async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
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

  // Admin API routes
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const id = req.params.id as string;
      const { role, displayName } = req.body;
      
      const updates: any = {};
      if (role) updates.role = role;
      if (displayName) updates.displayName = displayName;
      
      const user = await storage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const id = req.params.id as string;
      const currentUser = await getCurrentUser(req);
      
      if (currentUser?.id === id) {
        return res.status(400).json({ error: "Cannot delete your own account" });
      }
      
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/users/:id/reset-password", requireAdmin, async (req, res) => {
    try {
      const id = req.params.id as string;
      const { newPassword } = req.body;
      
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
      
      const hashedPassword = await hashPassword(newPassword);
      const user = await storage.updateUser(id, { password: hashedPassword });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Microsoft OAuth routes
  app.get("/api/microsoft/status", requireAuth, async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const configured = microsoft.isConfigured();
      const token = await storage.getMicrosoftToken(user.id);
      
      res.json({
        configured,
        connected: !!token,
        expiresAt: token?.expiresAt || null,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/microsoft/authorize", requireAuth, async (req, res) => {
    try {
      if (!microsoft.isConfigured()) {
        return res.status(400).json({ error: "Microsoft integration not configured" });
      }

      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const state = Buffer.from(JSON.stringify({ userId: user.id })).toString("base64");
      const authUrl = microsoft.getAuthorizationUrl(req, state);
      
      res.json({ authUrl });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/microsoft/callback", async (req, res) => {
    try {
      const { code, state, error } = req.query;
      
      if (error) {
        return res.redirect("/integrations?error=" + encodeURIComponent(error as string));
      }

      if (!code || !state) {
        return res.redirect("/integrations?error=missing_parameters");
      }

      const stateData = JSON.parse(Buffer.from(state as string, "base64").toString());
      const userId = stateData.userId;

      const tokens = await microsoft.exchangeCodeForTokens(req, code as string);
      const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000);

      await storage.saveMicrosoftToken({
        userId,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt,
        scope: tokens.scope,
      });

      res.redirect("/integrations?success=microsoft_connected");
    } catch (error: any) {
      console.error("Microsoft OAuth callback error:", error);
      res.redirect("/integrations?error=" + encodeURIComponent(error.message));
    }
  });

  app.delete("/api/microsoft/disconnect", requireAuth, async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      await storage.deleteMicrosoftToken(user.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/microsoft/emails", requireAuth, async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const accessToken = await microsoft.getValidAccessToken(user.id);
      if (!accessToken) {
        return res.status(401).json({ error: "Microsoft not connected or token expired" });
      }

      const count = parseInt(req.query.count as string) || 20;
      const emails = await microsoft.fetchOutlookEmails(accessToken, count);
      
      res.json(emails);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Teams API routes
  app.get("/api/microsoft/teams", requireAuth, async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const accessToken = await microsoft.getValidAccessToken(user.id);
      if (!accessToken) {
        return res.status(401).json({ error: "Microsoft not connected or token expired" });
      }

      const teams = await microsoft.fetchUserTeams(accessToken);
      res.json(teams);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/microsoft/teams/:teamId/channels", requireAuth, async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const accessToken = await microsoft.getValidAccessToken(user.id);
      if (!accessToken) {
        return res.status(401).json({ error: "Microsoft not connected or token expired" });
      }

      const channels = await microsoft.fetchTeamChannels(accessToken, String(req.params.teamId));
      res.json(channels);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/microsoft/teams/:teamId/channels/:channelId/messages", requireAuth, async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const accessToken = await microsoft.getValidAccessToken(user.id);
      if (!accessToken) {
        return res.status(401).json({ error: "Microsoft not connected or token expired" });
      }

      const count = parseInt(req.query.count as string) || 20;
      const messages = await microsoft.fetchChannelMessages(accessToken, String(req.params.teamId), String(req.params.channelId), count);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/microsoft/chats", requireAuth, async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const accessToken = await microsoft.getValidAccessToken(user.id);
      if (!accessToken) {
        return res.status(401).json({ error: "Microsoft not connected or token expired" });
      }

      const chats = await microsoft.fetchTeamsChats(accessToken);
      res.json(chats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/microsoft/chats/:chatId/messages", requireAuth, async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const accessToken = await microsoft.getValidAccessToken(user.id);
      if (!accessToken) {
        return res.status(401).json({ error: "Microsoft not connected or token expired" });
      }

      const count = parseInt(req.query.count as string) || 20;
      const messages = await microsoft.fetchChatMessages(accessToken, String(req.params.chatId), count);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
