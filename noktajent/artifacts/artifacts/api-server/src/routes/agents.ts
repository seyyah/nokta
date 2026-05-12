import { Router } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../../lib/db";
import { agentsTable, agentConversationsTable, insertAgentSchema, insertAgentConversationSchema } from "@workspace/db";

const router = Router();

// GET /api/agents - List all agents
router.get("/", async (req, res) => {
  try {
    const agents = await db.select().from(agentsTable);
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch agents" });
  }
});

// POST /api/agents - Create a new agent
router.post("/", async (req, res) => {
  try {
    const validatedData = insertAgentSchema.parse(req.body);
    const [agent] = await db.insert(agentsTable).values(validatedData).returning();
    res.json(agent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Failed to create agent" });
    }
  }
});

// GET /api/agents/conversations - List all agent conversations
router.get("/conversations", async (req, res) => {
  try {
    const conversations = await db.select().from(agentConversationsTable);
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch agent conversations" });
  }
});

// POST /api/agents/conversations - Create a new agent conversation
router.post("/conversations", async (req, res) => {
  try {
    const validatedData = insertAgentConversationSchema.parse(req.body);
    const [conversation] = await db.insert(agentConversationsTable).values(validatedData).returning();
    res.json(conversation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Failed to create agent conversation" });
    }
  }
});

export default router;