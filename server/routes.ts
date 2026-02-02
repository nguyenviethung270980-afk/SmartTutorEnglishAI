import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";
import { setupAuth, isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";
import { POWERUPS, type PowerupId } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  await setupAuth(app);
  registerAuthRoutes(app);
  
  // Protected: Create homework (requires login)
  app.post(api.homework.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const input = api.homework.create.input.parse(req.body);
      
      const prompt = `Generate a ${input.difficulty} level English homework exercise about "${input.topic}". 
      The format should be "${input.type}".
      Return ONLY a JSON object with a "questions" array. 
      Each question object should have:
      - "id": number
      - "question": string
      - "options": array of strings (if multiple choice)
      - "correctAnswer": string
      - "explanation": string
      
      Do not include any markdown formatting or explanations outside the JSON.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          { role: "system", content: "You are a helpful English teacher." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
      });

      const contentStr = completion.choices[0].message.content;
      if (!contentStr) {
        throw new Error("Failed to generate content");
      }

      const content = JSON.parse(contentStr);

      const newHomework = await storage.createHomework({
        ...input,
        userId,
        content: content,
      });

      res.status(201).json(newHomework);
    } catch (err) {
      console.error("Error creating homework:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Public: Get homework (students can access via link)
  app.get(api.homework.get.path, async (req, res) => {
    const homework = await storage.getHomework(Number(req.params.id));
    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' });
    }
    res.json(homework);
  });

  // Protected: List homework for current user only
  app.get(api.homework.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const list = await storage.listHomeworkByUser(userId);
    res.json(list);
  });

  // Protected: Delete homework (only owner can delete)
  app.delete(api.homework.delete.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const deleted = await storage.deleteHomework(Number(req.params.id), userId);
    if (!deleted) {
      return res.status(404).json({ message: 'Homework not found or unauthorized' });
    }
    res.json({ success: true });
  });

  // Protected: Update homework settings
  app.patch('/api/homework/:id/settings', isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const hw = await storage.getHomework(Number(req.params.id));
    if (!hw || hw.userId !== userId) {
      return res.status(404).json({ message: 'Homework not found or unauthorized' });
    }
    
    // For now, we'll create new homework with updated settings
    // In production, you'd want an update method
    res.json({ success: true });
  });

  // Public: Submit exam (students don't need login)
  app.post('/api/submissions', async (req, res) => {
    try {
      const hw = await storage.getHomework(req.body.homeworkId);
      if (!hw) {
        return res.status(404).json({ message: 'Homework not found' });
      }
      
      const submission = await storage.createExamSubmission({
        ...req.body,
        userId: hw.userId, // Link to homework owner
      });
      res.status(201).json(submission);
    } catch (err) {
      console.error("Error creating submission:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Protected: List submissions for current user's homeworks
  app.get('/api/submissions', isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const list = await storage.listExamSubmissionsByUser(userId);
    res.json(list);
  });

  app.get('/api/submissions/homework/:id', isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Verify homework belongs to user
    const hw = await storage.getHomework(Number(req.params.id));
    if (!hw || hw.userId !== userId) {
      return res.status(404).json({ message: 'Homework not found or unauthorized' });
    }
    
    const list = await storage.getExamSubmissionsByHomework(Number(req.params.id));
    res.json(list);
  });

  // Protected: Vocabulary (per user)
  app.post('/api/vocabulary', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const word = await storage.createVocabularyWord({ ...req.body, userId });
      res.status(201).json(word);
    } catch (err) {
      console.error("Error creating vocabulary word:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/vocabulary', isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const list = await storage.listVocabularyWordsByUser(userId);
    res.json(list);
  });

  app.delete('/api/vocabulary/:id', isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const deleted = await storage.deleteVocabularyWord(Number(req.params.id), userId);
    if (!deleted) {
      return res.status(404).json({ message: 'Word not found or unauthorized' });
    }
    res.json({ success: true });
  });

  // Daily Question
  app.get('/api/daily-question', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const today = new Date().toISOString().split('T')[0];
      let dailyQ = await storage.getDailyQuestion(userId, today);
      
      if (!dailyQ) {
        // Generate a new daily question
        const topics = ["vocabulary", "grammar", "idioms", "phrasal verbs", "synonyms", "antonyms"];
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
        
        const completion = await openai.chat.completions.create({
          model: "gpt-5.1",
          messages: [
            { role: "system", content: "You are an English teacher creating a daily challenge question." },
            { role: "user", content: `Create one multiple choice English ${randomTopic} question. Return JSON with: question, options (array of 4 strings), correctAnswer, explanation, topic.` }
          ],
          response_format: { type: "json_object" },
        });

        const content = JSON.parse(completion.choices[0].message.content || '{}');
        
        dailyQ = await storage.createDailyQuestion({
          userId,
          date: today,
          question: content.question,
          options: content.options,
          correctAnswer: content.correctAnswer,
          explanation: content.explanation,
          topic: content.topic || randomTopic,
        });
      }
      
      res.json(dailyQ);
    } catch (err) {
      console.error("Error getting daily question:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Answer daily question
  app.post('/api/daily-question/:id/answer', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { answer } = req.body;
      const today = new Date().toISOString().split('T')[0];
      const dailyQ = await storage.getDailyQuestion(userId, today);
      
      if (!dailyQ || dailyQ.id !== Number(req.params.id)) {
        return res.status(404).json({ message: "Question not found" });
      }

      if (dailyQ.answered) {
        return res.status(400).json({ message: "Already answered" });
      }

      const isCorrect = answer === dailyQ.correctAnswer;
      await storage.updateDailyQuestionAnswered(dailyQ.id, isCorrect);
      
      // Update streak and award points
      const pointsEarned = isCorrect ? 10 : 0;
      if (pointsEarned > 0) {
        await storage.addPoints(userId, pointsEarned);
      }
      await storage.updateStreak(userId, today, isCorrect);

      const stats = await storage.getUserStats(userId);
      
      res.json({ 
        correct: isCorrect, 
        correctAnswer: dailyQ.correctAnswer,
        explanation: dailyQ.explanation,
        pointsEarned,
        stats,
      });
    } catch (err) {
      console.error("Error answering daily question:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User Stats
  app.get('/api/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      let stats = await storage.getUserStats(userId);
      if (!stats) {
        stats = await storage.createOrUpdateUserStats(userId, {});
      }
      res.json(stats);
    } catch (err) {
      console.error("Error getting stats:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User Powerups
  app.get('/api/powerups', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const powerups = await storage.getUserPowerups(userId);
      res.json(powerups);
    } catch (err) {
      console.error("Error getting powerups:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Shop - Buy Powerup
  app.post('/api/shop/buy', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { powerupId } = req.body as { powerupId: PowerupId };
      const powerup = POWERUPS[powerupId];
      
      if (!powerup) {
        return res.status(400).json({ message: "Invalid powerup" });
      }

      const stats = await storage.getUserStats(userId);
      const currentPoints = stats?.points || 0;

      if (currentPoints < powerup.price) {
        return res.status(400).json({ message: "Not enough points" });
      }

      await storage.createOrUpdateUserStats(userId, { points: currentPoints - powerup.price });
      const purchased = await storage.addPowerup(userId, powerupId);
      const updatedStats = await storage.getUserStats(userId);

      res.json({ purchased, stats: updatedStats });
    } catch (err) {
      console.error("Error buying powerup:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Use Powerup
  app.post('/api/powerups/:id/use', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const used = await storage.usePowerup(userId, req.params.id);
      if (!used) {
        return res.status(400).json({ message: "Powerup not available" });
      }

      const powerups = await storage.getUserPowerups(userId);
      res.json({ success: true, powerups });
    } catch (err) {
      console.error("Error using powerup:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get shop items
  app.get('/api/shop', isAuthenticated, async (req: any, res) => {
    res.json(Object.values(POWERUPS));
  });

  return httpServer;
}
