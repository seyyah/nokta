import { Router } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../../lib/db";
import { moodBoardsTable, insertMoodBoardSchema } from "@workspace/db";

const router = Router();

// GET /api/mood - List all mood boards
router.get("/", async (req, res) => {
  try {
    const boards = await db.select().from(moodBoardsTable);
    res.json(boards);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch mood boards" });
  }
});

// POST /api/mood - Create a new mood board
router.post("/", async (req, res) => {
  try {
    const validatedData = insertMoodBoardSchema.parse(req.body);
    const [board] = await db.insert(moodBoardsTable).values(validatedData).returning();
    res.json(board);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Failed to create mood board" });
    }
  }
});

// PUT /api/mood/:id - Update a mood board
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertMoodBoardSchema.partial().parse(req.body);
    const [board] = await db.update(moodBoardsTable).set(validatedData).where(eq(moodBoardsTable.id, id)).returning();
    if (!board) {
      return res.status(404).json({ error: "Mood board not found" });
    }
    res.json(board);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Failed to update mood board" });
    }
  }
});

// DELETE /api/mood/:id - Delete a mood board
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(moodBoardsTable).where(eq(moodBoardsTable.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete mood board" });
  }
});

export default router;