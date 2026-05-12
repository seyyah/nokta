import { Router } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../../lib/db";
import { projectsTable, insertProjectSchema } from "@workspace/db";

const router = Router();

// GET /api/projects - List all projects
router.get("/", async (req, res) => {
  try {
    const projects = await db.select().from(projectsTable);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// POST /api/projects - Create a new project
router.post("/", async (req, res) => {
  try {
    const validatedData = insertProjectSchema.parse(req.body);
    const [project] = await db.insert(projectsTable).values(validatedData).returning();
    res.json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Failed to create project" });
    }
  }
});

// PUT /api/projects/:id - Update a project
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertProjectSchema.partial().parse(req.body);
    const [project] = await db.update(projectsTable).set(validatedData).where(eq(projectsTable.id, id)).returning();
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Failed to update project" });
    }
  }
});

// DELETE /api/projects/:id - Delete a project
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(projectsTable).where(eq(projectsTable.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete project" });
  }
});

export default router;