import { 
  users, 
  actionItems, 
  eodTasks,
  type User, 
  type InsertUser,
  type ActionItem,
  type InsertActionItem,
  type EodTask,
  type InsertEodTask
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  // Action Items operations
  getActionItems(userId: string): Promise<ActionItem[]>;
  getActionItem(id: string): Promise<ActionItem | undefined>;
  createActionItem(item: InsertActionItem): Promise<ActionItem>;
  updateActionItem(id: string, updates: Partial<InsertActionItem>): Promise<ActionItem | undefined>;
  deleteActionItem(id: string): Promise<boolean>;

  // EOD Tasks operations
  getEodTasks(userId: string, date: string): Promise<EodTask[]>;
  createEodTask(task: InsertEodTask): Promise<EodTask>;
  updateEodTask(id: string, updates: Partial<InsertEodTask>): Promise<EodTask | undefined>;
  deleteEodTask(id: string): Promise<boolean>;
  initializeDefaultEodTasks(userId: string, date: string): Promise<EodTask[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    return result.length > 0;
  }

  // Action Items operations
  async getActionItems(userId: string): Promise<ActionItem[]> {
    return db
      .select()
      .from(actionItems)
      .where(eq(actionItems.userId, userId))
      .orderBy(desc(actionItems.createdAt));
  }

  async getActionItem(id: string): Promise<ActionItem | undefined> {
    const [item] = await db.select().from(actionItems).where(eq(actionItems.id, id));
    return item || undefined;
  }

  async createActionItem(item: InsertActionItem): Promise<ActionItem> {
    const [newItem] = await db
      .insert(actionItems)
      .values(item)
      .returning();
    return newItem;
  }

  async updateActionItem(id: string, updates: Partial<InsertActionItem>): Promise<ActionItem | undefined> {
    const [updated] = await db
      .update(actionItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(actionItems.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteActionItem(id: string): Promise<boolean> {
    const result = await db
      .delete(actionItems)
      .where(eq(actionItems.id, id))
      .returning();
    return result.length > 0;
  }

  // EOD Tasks operations
  async getEodTasks(userId: string, date: string): Promise<EodTask[]> {
    return db
      .select()
      .from(eodTasks)
      .where(and(eq(eodTasks.userId, userId), eq(eodTasks.date, date)))
      .orderBy(eodTasks.order);
  }

  async createEodTask(task: InsertEodTask): Promise<EodTask> {
    const [newTask] = await db
      .insert(eodTasks)
      .values(task)
      .returning();
    return newTask;
  }

  async updateEodTask(id: string, updates: Partial<InsertEodTask>): Promise<EodTask | undefined> {
    const [updated] = await db
      .update(eodTasks)
      .set(updates)
      .where(eq(eodTasks.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteEodTask(id: string): Promise<boolean> {
    const result = await db
      .delete(eodTasks)
      .where(eq(eodTasks.id, id))
      .returning();
    return result.length > 0;
  }

  async initializeDefaultEodTasks(userId: string, date: string): Promise<EodTask[]> {
    const defaultTasks = [
      { label: "Review Critical Tickets", order: 0 },
      { label: "Clear Unread Emails", order: 1 },
      { label: "Check System Health", order: 2 },
      { label: "Update Handoff Notes", order: 3 },
    ];

    const createdTasks = await Promise.all(
      defaultTasks.map(task =>
        this.createEodTask({
          userId,
          date,
          label: task.label,
          order: task.order,
          done: false,
        })
      )
    );

    return createdTasks;
  }
}

export const storage = new DatabaseStorage();
