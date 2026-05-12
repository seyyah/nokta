import { Router } from "express";
import { db } from "@workspace/db";
import { conversations as conversationsTable, messages as messagesTable } from "@workspace/db";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { eq, asc } from "drizzle-orm";

const router = Router();

const AGENT_PROMPTS: Record<string, string> = {
  architect: `Sen deneyimli bir yazılım mimarısın. Proje mimarisi, sistem tasarımı, veri modelleri ve teknik kararlar hakkında uzman tavsiyeler veriyorsun. Yanıtlarını Türkçe ver, teknik detaylara gir, PRD ve roadmap oluştur.`,
  frontend: `Sen kıdemli bir Frontend mühendisisin. UI/UX, React Native, performans, animasyonlar ve kullanıcı deneyimi konusunda uzman tavsiyeler veriyorsun. Yanıtlarını Türkçe ver.`,
  backend: `Sen kıdemli bir Backend mühendisisin. API tasarımı, veritabanı optimizasyonu, güvenlik ve ölçeklenebilirlik konusunda uzman tavsiyeler veriyorsun. Yanıtlarını Türkçe ver.`,
  security: `Sen bir güvenlik mühendisisin. Güvenlik açıkları, tehdit modellemesi, kimlik doğrulama ve veri koruma konusunda uzman tavsiyeler veriyorsun. Yanıtlarını Türkçe ver.`,
  productivity: `Sen bir üretkenlik koçusun. Zaman yönetimi, görev önceliklendirme, odak stratejileri ve iş akışı optimizasyonu konusunda uzman tavsiyeler veriyorsun. Yanıtlarını Türkçe ver.`,
  planner: `Sen bir ürün yöneticisi ve proje planlayıcısısın. Fikri gerçeğe dönüştürmek için PRD, özellik listesi, sprint planlaması, görev ağacı ve yol haritası oluşturuyorsun. Kullanıcının fikrini alıp kapsamlı bir plan sunuyorsun. Yanıtlarını Türkçe ver, markdown formatla.`,
  critic: `Sen eleştirel bir mühendissin. Planları, mimarileri ve kararları eleştiriyor, zayıf noktaları buluyorsun. Yapıcı ama dürüst eleştiri yapıyorsun. Yanıtlarını Türkçe ver.`,
};

router.get("/anthropic/conversations", async (req, res) => {
  try {
    const convs = await db.select().from(conversationsTable).orderBy(asc(conversationsTable.id));
    res.json(convs);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/anthropic/conversations", async (req, res) => {
  try {
    const { title, agentType } = req.body as { title: string; agentType?: string };
    const [conv] = await db.insert(conversationsTable).values({ title }).returning();
    if (!conv) { res.status(500).json({ error: "Failed to create" }); return; }
    res.status(201).json({ ...conv, agentType: agentType || "planner" });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/anthropic/conversations/:id", async (req, res) => {
  try {
    const id = parseInt(req.params["id"]!);
    const [conv] = await db.select().from(conversationsTable).where(eq(conversationsTable.id, id));
    if (!conv) { res.status(404).json({ error: "Not found" }); return; }
    const msgs = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, id)).orderBy(asc(messagesTable.id));
    res.json({ ...conv, messages: msgs });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal error" });
  }
});

router.delete("/anthropic/conversations/:id", async (req, res) => {
  try {
    const id = parseInt(req.params["id"]!);
    const [conv] = await db.select().from(conversationsTable).where(eq(conversationsTable.id, id));
    if (!conv) { res.status(404).json({ error: "Not found" }); return; }
    await db.delete(messagesTable).where(eq(messagesTable.conversationId, id));
    await db.delete(conversationsTable).where(eq(conversationsTable.id, id));
    res.status(204).end();
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/anthropic/conversations/:id/messages", async (req, res) => {
  try {
    const id = parseInt(req.params["id"]!);
    const msgs = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, id)).orderBy(asc(messagesTable.id));
    res.json(msgs);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/anthropic/conversations/:id/messages", async (req, res) => {
  const id = parseInt(req.params["id"]!);
  const { content, agentType } = req.body as { content: string; agentType?: string };

  if (!content?.trim()) {
    res.status(400).json({ error: "content required" });
    return;
  }

  try {
    const [conv] = await db.select().from(conversationsTable).where(eq(conversationsTable.id, id));
    if (!conv) { res.status(404).json({ error: "Not found" }); return; }

    await db.insert(messagesTable).values({ conversationId: id, role: "user", content: content.trim() });

    const history = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, id)).orderBy(asc(messagesTable.id));

    const chatMessages = history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const systemPrompt = AGENT_PROMPTS[agentType || "planner"] ?? AGENT_PROMPTS["planner"]!;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: systemPrompt,
      messages: chatMessages,
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        fullResponse += event.delta.text;
        res.write(`data: ${JSON.stringify({ content: event.delta.text })}\n\n`);
      }
    }

    await db.insert(messagesTable).values({ conversationId: id, role: "assistant", content: fullResponse });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (e) {
    req.log.error(e);
    if (!res.headersSent) {
      res.status(500).json({ error: "AI error" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "AI error" })}\n\n`);
      res.end();
    }
  }
});

export default router;
