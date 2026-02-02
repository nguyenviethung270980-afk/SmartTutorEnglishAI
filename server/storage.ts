import { db } from "./db";
import { homework, examSubmission, vocabularyWord, dailyQuestion, userStats, userPowerup, type InsertHomework, type Homework, type InsertExamSubmission, type ExamSubmission, type InsertVocabularyWord, type VocabularyWord, type InsertDailyQuestion, type DailyQuestion, type InsertUserStats, type UserStats, type InsertUserPowerup, type UserPowerup } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  createHomework(homework: InsertHomework): Promise<Homework>;
  getHomework(id: number): Promise<Homework | undefined>;
  listHomeworkByUser(userId: string): Promise<Homework[]>;
  deleteHomework(id: number, userId: string): Promise<boolean>;
  
  createExamSubmission(submission: InsertExamSubmission): Promise<ExamSubmission>;
  listExamSubmissionsByUser(userId: string): Promise<ExamSubmission[]>;
  getExamSubmissionsByHomework(homeworkId: number): Promise<ExamSubmission[]>;
  
  createVocabularyWord(word: InsertVocabularyWord): Promise<VocabularyWord>;
  listVocabularyWordsByUser(userId: string): Promise<VocabularyWord[]>;
  deleteVocabularyWord(id: number, userId: string): Promise<boolean>;
  
  getDailyQuestion(userId: string, date: string): Promise<DailyQuestion | undefined>;
  createDailyQuestion(question: InsertDailyQuestion): Promise<DailyQuestion>;
  updateDailyQuestionAnswered(id: number, correct: boolean): Promise<void>;
  
  getUserStats(userId: string): Promise<UserStats | undefined>;
  createOrUpdateUserStats(userId: string, data: Partial<InsertUserStats>): Promise<UserStats>;
  addPoints(userId: string, points: number): Promise<UserStats>;
  updateStreak(userId: string, date: string, correct: boolean): Promise<UserStats>;
  
  getUserPowerups(userId: string): Promise<UserPowerup[]>;
  addPowerup(userId: string, powerupId: string): Promise<UserPowerup>;
  usePowerup(userId: string, powerupId: string): Promise<boolean>;
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

  async listHomeworkByUser(userId: string): Promise<Homework[]> {
    return await db
      .select()
      .from(homework)
      .where(eq(homework.userId, userId))
      .orderBy(desc(homework.createdAt));
  }

  async deleteHomework(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(homework)
      .where(and(eq(homework.id, id), eq(homework.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async createExamSubmission(insertSubmission: InsertExamSubmission): Promise<ExamSubmission> {
    const [newSubmission] = await db
      .insert(examSubmission)
      .values(insertSubmission)
      .returning();
    return newSubmission;
  }

  async listExamSubmissionsByUser(userId: string): Promise<ExamSubmission[]> {
    return await db
      .select()
      .from(examSubmission)
      .where(eq(examSubmission.userId, userId))
      .orderBy(desc(examSubmission.submittedAt));
  }

  async getExamSubmissionsByHomework(homeworkId: number): Promise<ExamSubmission[]> {
    return await db
      .select()
      .from(examSubmission)
      .where(eq(examSubmission.homeworkId, homeworkId))
      .orderBy(desc(examSubmission.submittedAt));
  }

  async createVocabularyWord(insertWord: InsertVocabularyWord): Promise<VocabularyWord> {
    const [newWord] = await db
      .insert(vocabularyWord)
      .values(insertWord)
      .returning();
    return newWord;
  }

  async listVocabularyWordsByUser(userId: string): Promise<VocabularyWord[]> {
    return await db
      .select()
      .from(vocabularyWord)
      .where(eq(vocabularyWord.userId, userId))
      .orderBy(desc(vocabularyWord.createdAt));
  }

  async deleteVocabularyWord(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(vocabularyWord)
      .where(and(eq(vocabularyWord.id, id), eq(vocabularyWord.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async getDailyQuestion(userId: string, date: string): Promise<DailyQuestion | undefined> {
    const [found] = await db
      .select()
      .from(dailyQuestion)
      .where(and(eq(dailyQuestion.userId, userId), eq(dailyQuestion.date, date)));
    return found;
  }

  async createDailyQuestion(insertQuestion: InsertDailyQuestion): Promise<DailyQuestion> {
    const [newQuestion] = await db
      .insert(dailyQuestion)
      .values(insertQuestion)
      .returning();
    return newQuestion;
  }

  async updateDailyQuestionAnswered(id: number, correct: boolean): Promise<void> {
    await db
      .update(dailyQuestion)
      .set({ answered: true, answeredCorrectly: correct })
      .where(eq(dailyQuestion.id, id));
  }

  async getUserStats(userId: string): Promise<UserStats | undefined> {
    const [found] = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId));
    return found;
  }

  async createOrUpdateUserStats(userId: string, data: Partial<InsertUserStats>): Promise<UserStats> {
    const existing = await this.getUserStats(userId);
    if (existing) {
      const [updated] = await db
        .update(userStats)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(userStats.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userStats)
        .values({ userId, ...data })
        .returning();
      return created;
    }
  }

  async addPoints(userId: string, points: number): Promise<UserStats> {
    const stats = await this.getUserStats(userId);
    const currentPoints = stats?.points || 0;
    return this.createOrUpdateUserStats(userId, { points: currentPoints + points });
  }

  async updateStreak(userId: string, date: string, correct: boolean): Promise<UserStats> {
    const stats = await this.getUserStats(userId);
    const lastDate = stats?.lastActivityDate;
    let currentStreak = stats?.currentStreak || 0;
    let longestStreak = stats?.longestStreak || 0;
    const totalCorrect = (stats?.totalCorrect || 0) + (correct ? 1 : 0);
    const totalAnswered = (stats?.totalAnswered || 0) + 1;

    // Check if this is a consecutive day
    if (lastDate) {
      const last = new Date(lastDate);
      const today = new Date(date);
      const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1 && correct) {
        currentStreak += 1;
      } else if (diffDays > 1) {
        currentStreak = correct ? 1 : 0;
      } else if (diffDays === 0) {
        // Same day, don't change streak
      }
    } else if (correct) {
      currentStreak = 1;
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    return this.createOrUpdateUserStats(userId, {
      currentStreak,
      longestStreak,
      totalCorrect,
      totalAnswered,
      lastActivityDate: date,
    });
  }

  async getUserPowerups(userId: string): Promise<UserPowerup[]> {
    return await db
      .select()
      .from(userPowerup)
      .where(eq(userPowerup.userId, userId));
  }

  async addPowerup(userId: string, powerupId: string): Promise<UserPowerup> {
    const [existing] = await db
      .select()
      .from(userPowerup)
      .where(and(eq(userPowerup.userId, userId), eq(userPowerup.powerupId, powerupId)));

    if (existing) {
      const [updated] = await db
        .update(userPowerup)
        .set({ quantity: (existing.quantity || 0) + 1 })
        .where(eq(userPowerup.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userPowerup)
        .values({ userId, powerupId, quantity: 1 })
        .returning();
      return created;
    }
  }

  async usePowerup(userId: string, powerupId: string): Promise<boolean> {
    const [existing] = await db
      .select()
      .from(userPowerup)
      .where(and(eq(userPowerup.userId, userId), eq(userPowerup.powerupId, powerupId)));

    if (!existing || (existing.quantity || 0) < 1) {
      return false;
    }

    if (existing.quantity === 1) {
      await db.delete(userPowerup).where(eq(userPowerup.id, existing.id));
    } else {
      await db
        .update(userPowerup)
        .set({ quantity: (existing.quantity || 0) - 1 })
        .where(eq(userPowerup.id, existing.id));
    }
    return true;
  }
}

export const storage = new DatabaseStorage();
