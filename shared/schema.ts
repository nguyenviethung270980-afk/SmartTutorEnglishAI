import { pgTable, text, serial, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const homework = pgTable("homework", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  difficulty: text("difficulty").notNull(), // 'Beginner', 'Intermediate', 'Advanced'
  type: text("type").notNull(), // 'Multiple Choice', 'Fill in the blanks', 'Short Answer'
  content: jsonb("content").notNull(), // Array of questions
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertHomeworkSchema = createInsertSchema(homework).omit({
  id: true,
  createdAt: true,
});

export type Homework = typeof homework.$inferSelect;
export type InsertHomework = z.infer<typeof insertHomeworkSchema>;
