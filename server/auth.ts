import bcrypt from "bcryptjs";
import { storage } from "./storage";
import type { Request, Response, NextFunction } from "express";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function authenticateUser(username: string, password: string) {
  const user = await storage.getUserByUsername(username);
  if (!user) {
    return null;
  }
  
  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return null;
  }
  
  return user;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

export async function getCurrentUser(req: Request) {
  if (!req.session.userId) {
    return null;
  }
  return storage.getUser(req.session.userId);
}
