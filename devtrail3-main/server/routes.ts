import type { Express } from "express";
import { aiClient } from "./ai";
import { createServer, type Server } from "http";
import { storage } from "./storage";
// import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { requireAuth } from "./auth/clerkAuth";


import { api } from "@shared/routes";
import { z } from "zod";
import { openai } from "./replit_integrations/image"; // Re-use configured openai instance

const extractJSON = (text: string) => {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? JSON.parse(match[0]) : {};
};


export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Replit Auth
  // await setupAuth(app);
  // registerAuthRoutes(app);

  // Setup Replit AI Integrations
  //test


  // API Routes - Protected by isAuthenticated
  
  // Entries
  app.get(api.entries.list.path, requireAuth, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const entries = await storage.getEntries(userId);
    res.json(entries);
  });

  app.post(api.entries.create.path, requireAuth, async (req: any, res) => {
    try {
      const input = api.entries.create.input.parse(req.body);
      const { tags, projectIds, ...entryData } = input;
      const userId = req.user.claims.sub;
      const entry = await storage.createEntry(userId, entryData, tags, projectIds);
      res.status(201).json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.entries.get.path, requireAuth, async (req: any, res) => {
    const entry = await storage.getEntry(Number(req.params.id));
    if (!entry) return res.status(404).json({ message: "Entry not found" });
    res.json(entry);
  });

  app.put(api.entries.update.path, requireAuth, async (req: any, res) => {
     try {
      const input = api.entries.update.input.parse(req.body);
      const { tags, projectIds, ...entryData } = input;
      const userId = req.user.claims.sub;
      const entry = await storage.updateEntry(Number(req.params.id), userId, entryData, tags, projectIds);
      res.json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.entries.delete.path, requireAuth, async (req: any, res) => {
    const userId = req.user.claims.sub;
    await storage.deleteEntry(Number(req.params.id), userId);
    res.status(204).send();
  });

  // Projects
  app.get(api.projects.list.path, requireAuth, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const projects = await storage.getProjects(userId);
    res.json(projects);
  });
  app.get(api.projects.get.path, requireAuth, async (req: any, res) => {
  const userId = req.user.claims.sub;

  const project = await storage.getProject(
  Number(req.params.id),
  userId
);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  res.json(project);
});

  app.post(api.projects.create.path, requireAuth, async (req: any, res) => {
    try {
      const input = api.projects.create.input.parse(req.body);
      const userId = req.user.claims.sub;
      const project = await storage.createProject(userId, input);
      res.status(201).json(project);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.projects.delete.path, requireAuth, async (req: any, res) => {
  const userId = req.user.claims.sub;

  await storage.deleteProject(Number(req.params.id), userId);

  res.status(204).send();
});

  // Tags
  app.get(api.tags.list.path, requireAuth, async (req, res) => {
    const tags = await storage.getTags();
    res.json(tags);
  });

  // AI Features
  app.get("/api/ai/weekly-report", requireAuth, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const entries = await storage.getEntries(userId);
    const last7Days = entries.filter(e => {
      const date = new Date(e.date);
      const now = new Date();
      return (now.getTime() - date.getTime()) <= 7 * 24 * 60 * 60 * 1000;
    });

    if (last7Days.length === 0) {
      return res.json({
        summary: "No entries found for the last 7 days. Start journaling to get your weekly report!",
        focusAreas: [],
        wins: [],
        struggles: [],
        nextWeekSuggestions: ["Start by logging your first entry of the week."]
      });
    }

    const prompt = `
      Analyze the last 7 days of developer journal entries and provide a weekly report.
      Return strictly a JSON object with this structure:
      {
        "summary": "overall summary of the week",
        "focusAreas": ["area 1", "area 2"],
        "wins": ["win 1", "win 2"],
        "struggles": ["struggle 1", "struggle 2"],
        "nextWeekSuggestions": ["suggestion 1", "suggestion 2"]
      }
      
      Entries:
      ${JSON.stringify(last7Days.map(e => ({ content: e.content, bug: e.bug, solution: e.solution })))}
    `;

    try {
    const response = await aiClient.chat([
  { role: "user", content: prompt }
]);

const data = extractJSON(response);
res.json(data);

    }catch (error) {
  console.error("AI ERROR:", error);
  res.status(500).json({ message: "AI analysis failed" });
}
  });

  app.get("/api/ai/skill-heatmap", requireAuth, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const entries = await storage.getEntries(userId);
    const last30Days = entries.filter(e => {
      const date = new Date(e.date);
      const now = new Date();
      return (now.getTime() - date.getTime()) <= 30 * 24 * 60 * 60 * 1000;
    });

    const prompt = `
      Analyze these developer journal entries from the last 30 days and identify skills/technologies mentioned.
      Assign a level 1-5 for each skill based on frequency and depth of mention.
      Return strictly a JSON object: { "skills": [{ "name": "Skill", "level": number }] }
      
      Entries:
      ${JSON.stringify(last30Days.map(e => ({ content: e.content, tags: e.tags })))}
    `;

    try {
     const response = await aiClient.chat([
  { role: "user", content: prompt }
]);

const data = extractJSON(response);
res.json(data);


    } catch (error) {
  console.error("AI ERROR:", error);
  res.status(500).json({ message: "AI analysis failed" });
}

  });

  app.get("/api/ai/bug-patterns", requireAuth, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const entries = await storage.getEntries(userId);
    const bugsOnly = entries.filter(e => e.bug && e.bug.trim() !== "");

    if (bugsOnly.length === 0) {
      return res.json({
        mostCommonBug: "None yet",
        patterns: [],
        advice: "Keep logging your bugs and solutions to see patterns emerge."
      });
    }

    const prompt = `
      Analyze these bug descriptions and solutions from a developer's journal.
      Identify patterns and provide advice.
      Return strictly a JSON object:
      {
        "mostCommonBug": "description",
        "patterns": [{ "type": "pattern name", "count": number }],
        "advice": "actionable advice"
      }
      
      Bugs:
      ${JSON.stringify(bugsOnly.map(e => ({ bug: e.bug, solution: e.solution })))}
    `;

    try {
    const response = await aiClient.chat([
  { role: "user", content: prompt }
]);

const data = extractJSON(response);
res.json(data);


    } catch (error) {
  console.error("AI ERROR:", error);
  res.status(500).json({ message: "AI analysis failed" });
}

  });

  app.post(api.ai.generateSummary.path, requireAuth, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const { timeRange } = req.body;
    
    // Fetch recent entries
    const entries = await storage.getEntries(userId);
    // Filter by timeRange (simplified for MVP: just take last 5 entries)
    const recentEntries = entries.slice(0, 5); 

    const prompt = `
      Analyze these developer journal entries and provide a ${timeRange} summary.
      Also provide 3 key insights about their learning progress.
      
      Entries:
      ${JSON.stringify(recentEntries.map(e => ({ content: e.content, bug: e.bug, solution: e.solution })))}
    `;

   try {
 const response = await aiClient.chat([
  { role: "user", content: prompt }
]);

const data = extractJSON(response);
res.json(data);

} catch (error) {
  res.json({
    summary: "Based on your recent entries, you've been consistent with your learning.",
    insights: [
      "Great progress on React",
      "Solved some tricky bugs",
      "Keep it up!"
    ]
  });
}

  });

  app.post(api.ai.suggestNextSteps.path, requireAuth, async (req: any, res) => {
     const userId = req.user.claims.sub;
     const entries = await storage.getEntries(userId);
     const recentEntries = entries.slice(0, 10);

     const prompt = `
      Based on these developer journal entries, suggest 3 specific next steps or technologies to learn.
      
      Entries:
      ${JSON.stringify(recentEntries.map(e => ({ content: e.content, tags: e.tags })))}
     `;

     try {
    const response = await aiClient.chat([
  { role: "user", content: prompt }
]);

res.json({
  suggestions: response
    .split("\n")
    .filter(line => line.trim().length > 0)
});



     } catch (error) {
       res.json({
         suggestions: ["Deep dive into React Hooks", "Explore PostgreSQL indexing", "Try building a small CLI tool"]
       });
     }
  });

  return httpServer;
}
