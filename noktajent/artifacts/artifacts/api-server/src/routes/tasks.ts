import { Router } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../../lib/db";
import { tasksTable, insertTaskSchema } from "@workspace/db";

const router = Router();

// GET /api/tasks - List all tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await db.select().from(tasksTable);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// POST /api/tasks - Create a new task
router.post("/", async (req, res) => {
  try {
    const validatedData = insertTaskSchema.parse(req.body);
    const [task] = await db.insert(tasksTable).values(validatedData).returning();
    res.json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Failed to create task" });
    }
  }
});

// PUT /api/tasks/:id - Update a task
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertTaskSchema.partial().parse(req.body);
    const [task] = await db.update(tasksTable).set(validatedData).where(eq(tasksTable.id, id)).returning();
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Failed to update task" });
    }
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(tasksTable).where(eq(tasksTable.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete task" });
  }
});

export default router;