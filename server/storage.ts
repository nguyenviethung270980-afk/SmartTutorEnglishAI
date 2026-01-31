import { db } from "./db";
import { homework, type InsertHomework, type Homework } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createHomework(homework: InsertHomework): Promise<Homework>;
  getHomework(id: number): Promise<Homework | undefined>;
  listHomework(): Promise<Homework[]>;
}

export class DatabaseStorage implements IStorage {
  async createHomework(insertHomework: InsertHomework): Promise<Homework> {
    const [newHomework] = await db
      .insert(homework)
      .values(insertHomework)
      .returning();
    return newHomework;
  }

  async getHomework(id: number): Promise<Homework | undefined> {
    const [found] = await db
      .select()
      .from(homework)
      .where(eq(homework.id, id));
    return found;
  }

  async listHomework(): Promise<Homework[]> {
    return await db
      .select()
      .from(homework)
      .orderBy(desc(homework.createdAt));
  }
}

export const storage = new DatabaseStorage();
