import { Router } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../../lib/db";
import { agendaEventsTable, insertAgendaEventSchema } from "@workspace/db";

const router = Router();

// GET /api/agenda - List all agenda events
router.get("/", async (req, res) => {
  try {
    const events = await db.select().from(agendaEventsTable);
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch agenda events" });
  }
});

// POST /api/agenda - Create a new agenda event
router.post("/", async (req, res) => {
  try {
    const validatedData = insertAgendaEventSchema.parse(req.body);
    const [event] = await db.insert(agendaEventsTable).values(validatedData).returning();
    res.json(event);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Failed to create agenda event" });
    }
  }
});

// PUT /api/agenda/:id - Update an agenda event
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertAgendaEventSchema.partial().parse(req.body);
    const [event] = await db.update(agendaEventsTable).set(validatedData).where(eq(agendaEventsTable.id, id)).returning();
    if (!event) {
      return res.status(404).json({ error: "Agenda event not found" });
    }
    res.json(event);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Failed to update agenda event" });
    }
  }
});

// DELETE /api/agenda/:id - Delete an agenda event
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(agendaEventsTable).where(eq(agendaEventsTable.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete agenda event" });
  }
});

export default router;