import { pgTable, text, serial, jsonb, timestamp, integer, boolean } from "drizzle-orm/pg-core";
export * from "./models/auth";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const homework = pgTable("homework", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  difficulty: text("difficulty").notNull(),
  type: text("type").notNull(),
  content: jsonb("content").notNull(),
  timerMinutes: integer("timer_minutes").default(0),
  questionCount: integer("question_count").default(0),
  antiCheat: boolean("anti_cheat").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const examSubmission = pgTable("exam_submission", {
  id: serial("id").primaryKey(),
  homeworkId: integer("homework_id").notNull(),
  studentName: text("student_name").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  percentage: integer("percentage").notNull(),
  answers: jsonb("answers").notNull(),
  timeSpent: integer("time_spent"),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

export const vocabularyWord = pgTable("vocabulary_word", {
  id: serial("id").primaryKey(),
  word: text("word").notNull(),
  definition: text("definition").notNull(),
  example: text("example"),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertHomeworkSchema = createInsertSchema(homework).omit({
  id: true,
  createdAt: true,
});

export const insertExamSubmissionSchema = createInsertSchema(examSubmission).omit({
  id: true,
  submittedAt: true,
});

export const insertVocabularyWordSchema = createInsertSchema(vocabularyWord).omit({
  id: true,
  createdAt: true,
});

export type Homework = typeof homework.$inferSelect;
export type InsertHomework = z.infer<typeof insertHomeworkSchema>;
export type ExamSubmission = typeof examSubmission.$inferSelect;
export type InsertExamSubmission = z.infer<typeof insertExamSubmissionSchema>;
export type VocabularyWord = typeof vocabularyWord.$inferSelect;
export type InsertVocabularyWord = z.infer<typeof insertVocabularyWordSchema>;
