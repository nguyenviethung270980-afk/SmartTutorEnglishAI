import { db } from "./db";
import { homework, examSubmission, vocabularyWord, dailyQuestion, type InsertHomework, type Homework, type InsertExamSubmission, type ExamSubmission, type InsertVocabularyWord, type VocabularyWord, type InsertDailyQuestion, type DailyQuestion } from "@shared/schema";
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
}

export const storage = new DatabaseStorage();
