import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

// Initialize OpenAI client using the integration env vars
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post(api.homework.create.path, async (req, res) => {
    try {
      const input = api.homework.create.input.parse(req.body);
      
      // Generate content using OpenAI
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

  app.get(api.homework.get.path, async (req, res) => {
    const homework = await storage.getHomework(Number(req.params.id));
    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' });
    }
    res.json(homework);
  });

  app.get(api.homework.list.path, async (req, res) => {
    const list = await storage.listHomework();
    res.json(list);
  });

  return httpServer;
}
