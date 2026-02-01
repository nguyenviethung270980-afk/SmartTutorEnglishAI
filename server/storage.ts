import { db } from "./db";
import { homework, examSubmission, vocabularyWord, type InsertHomework, type Homework, type InsertExamSubmission, type ExamSubmission, type InsertVocabularyWord, type VocabularyWord } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createHomework(homework: InsertHomework): Promise<Homework>;
  getHomework(id: number): Promise<Homework | undefined>;
  listHomework(): Promise<Homework[]>;
  deleteHomework(id: number): Promise<boolean>;
  
  createExamSubmission(submission: InsertExamSubmission): Promise<ExamSubmission>;
  listExamSubmissions(): Promise<ExamSubmission[]>;
  getExamSubmissionsByHomework(homeworkId: number): Promise<ExamSubmission[]>;
  
  createVocabularyWord(word: InsertVocabularyWord): Promise<VocabularyWord>;
  listVocabularyWords(): Promise<VocabularyWord[]>;
  deleteVocabularyWord(id: number): Promise<boolean>;
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

  async deleteHomework(id: number): Promise<boolean> {
    const result = await db
      .delete(homework)
      .where(eq(homework.id, id))
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

  async listExamSubmissions(): Promise<ExamSubmission[]> {
    return await db
      .select()
      .from(examSubmission)
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

  async listVocabularyWords(): Promise<VocabularyWord[]> {
    return await db
      .select()
      .from(vocabularyWord)
      .orderBy(desc(vocabularyWord.createdAt));
  }

  async deleteVocabularyWord(id: number): Promise<boolean> {
    const result = await db
      .delete(vocabularyWord)
      .where(eq(vocabularyWord.id, id))
      .returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
