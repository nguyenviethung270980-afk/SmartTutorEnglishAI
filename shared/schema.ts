import { pgTable, text, serial, jsonb, timestamp, integer, boolean } from "drizzle-orm/pg-core";
export * from "./models/auth";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const homework = pgTable("homework", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
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
  userId: text("user_id").notNull(),
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
  userId: text("user_id").notNull(),
  word: text("word").notNull(),
  definition: text("definition").notNull(),
  example: text("example"),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyQuestion = pgTable("daily_question", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: text("date").notNull(),
  question: text("question").notNull(),
  options: jsonb("options"),
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  topic: text("topic"),
  answered: boolean("answered").default(false),
  answeredCorrectly: boolean("answered_correctly").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  points: integer("points").default(0),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  totalCorrect: integer("total_correct").default(0),
  totalAnswered: integer("total_answered").default(0),
  lastActivityDate: text("last_activity_date"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userPowerup = pgTable("user_powerup", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  powerupId: text("powerup_id").notNull(),
  quantity: integer("quantity").default(1),
  purchasedAt: timestamp("purchased_at").defaultNow(),
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

export const insertDailyQuestionSchema = createInsertSchema(dailyQuestion).omit({
  id: true,
  createdAt: true,
});

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
  updatedAt: true,
});

export const insertUserPowerupSchema = createInsertSchema(userPowerup).omit({
  id: true,
  purchasedAt: true,
});

export type Homework = typeof homework.$inferSelect;
export type InsertHomework = z.infer<typeof insertHomeworkSchema>;
export type ExamSubmission = typeof examSubmission.$inferSelect;
export type InsertExamSubmission = z.infer<typeof insertExamSubmissionSchema>;
export type VocabularyWord = typeof vocabularyWord.$inferSelect;
export type InsertVocabularyWord = z.infer<typeof insertVocabularyWordSchema>;
export type DailyQuestion = typeof dailyQuestion.$inferSelect;
export type InsertDailyQuestion = z.infer<typeof insertDailyQuestionSchema>;
export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type UserPowerup = typeof userPowerup.$inferSelect;
export type InsertUserPowerup = z.infer<typeof insertUserPowerupSchema>;

// Power-up definitions
export const POWERUPS = {
  time_freeze: {
    id: 'time_freeze',
    name: 'Time Freeze',
    description: 'Pause the exam timer for 30 seconds',
    price: 50,
    icon: 'snowflake',
  },
  double_points: {
    id: 'double_points',
    name: 'Double Points',
    description: 'Earn 2x points on your next daily question',
    price: 75,
    icon: 'zap',
  },
  hint: {
    id: 'hint',
    name: 'Hint',
    description: 'Remove 2 wrong answers from multiple choice',
    price: 30,
    icon: 'lightbulb',
  },
  streak_shield: {
    id: 'streak_shield',
    name: 'Streak Shield',
    description: 'Protect your streak if you miss a day',
    price: 100,
    icon: 'shield',
  },
  bonus_question: {
    id: 'bonus_question',
    name: 'Bonus Question',
    description: 'Get an extra daily question for more points',
    price: 40,
    icon: 'plus-circle',
  },
} as const;

export type PowerupId = keyof typeof POWERUPS;
