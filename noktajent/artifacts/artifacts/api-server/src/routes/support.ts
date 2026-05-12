import { Router } from "express";

const router = Router();

interface SupportMessage {
  id: string;
  sessionId: string;
  role: "user" | "agent";
  text: string;
  createdAt: number;
}

interface SupportSession {
  id: string;
  deviceId: string;
  userName: string;
  status: "open" | "active" | "closed";
  createdAt: number;
  updatedAt: number;
}

const sessions = new Map<string, SupportSession>();
const messages = new Map<string, SupportMessage[]>();
const deviceToSession = new Map<string, string>();

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

router.post("/support/sessions", (req, res) => {
  const { deviceId, userName } = req.body as { deviceId: string; userName?: string };
  if (!deviceId) {
    res.status(400).json({ error: "deviceId required" });
    return;
  }
  let sessionId = deviceToSession.get(deviceId);
  let session = sessionId ? sessions.get(sessionId) : undefined;
  if (!session) {
    sessionId = generateId();
    session = {
      id: sessionId,
      deviceId,
      userName: userName || "Kullanıcı",
      status: "open",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    sessions.set(sessionId, session);
    messages.set(sessionId, []);
    deviceToSession.set(deviceId, sessionId);
    const welcome: SupportMessage = {
      id: generateId(),
      sessionId,
      role: "agent",
      text: "Merhaba! Nokta destek hattına hoş geldiniz. Size nasıl yardımcı olabiliriz?",
      createdAt: Date.now(),
    };
    messages.get(sessionId)!.push(welcome);
  } else if (userName && userName !== session.userName) {
    session.userName = userName;
    session.updatedAt = Date.now();
  }
  res.json(session);
});

router.get("/support/sessions/:sessionId/messages", (req, res) => {
  const { sessionId } = req.params;
  const after = req.query["after"] ? Number(req.query["after"]) : 0;
  const session = sessions.get(sessionId);
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  const allMessages = messages.get(sessionId) || [];
  const filtered = after > 0 ? allMessages.filter((m) => m.createdAt > after) : allMessages;
  res.json({ messages: filtered, session });
});

router.post("/support/sessions/:sessionId/messages", (req, res) => {
  const { sessionId } = req.params;
  const { text } = req.body as { text: string };
  const session = sessions.get(sessionId);
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  if (!text?.trim()) {
    res.status(400).json({ error: "text required" });
    return;
  }
  const msg: SupportMessage = {
    id: generateId(),
    sessionId,
    role: "user",
    text: text.trim(),
    createdAt: Date.now(),
  };
  messages.get(sessionId)!.push(msg);
  session.updatedAt = Date.now();
  if (session.status === "open") {
    session.status = "active";
  }
  res.status(201).json(msg);
});

router.get("/support/admin/sessions", (_req, res) => {
  const result = Array.from(sessions.values())
    .filter((s) => s.status !== "closed")
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((session) => {
      const msgs = messages.get(session.id) || [];
      const lastMessage = msgs[msgs.length - 1];
      const unreadCount = msgs.filter((m) => m.role === "user").length;
      return { session, lastMessage, unreadCount };
    });
  res.json({ sessions: result });
});

router.post("/support/admin/sessions/:sessionId/reply", (req, res) => {
  const { sessionId } = req.params;
  const { text } = req.body as { text: string };
  const session = sessions.get(sessionId);
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  if (!text?.trim()) {
    res.status(400).json({ error: "text required" });
    return;
  }
  const msg: SupportMessage = {
    id: generateId(),
    sessionId,
    role: "agent",
    text: text.trim(),
    createdAt: Date.now(),
  };
  messages.get(sessionId)!.push(msg);
  session.updatedAt = Date.now();
  if (session.status !== "active") {
    session.status = "active";
  }
  res.status(201).json(msg);
});

router.patch("/support/admin/sessions/:sessionId/status", (req, res) => {
  const { sessionId } = req.params;
  const { status } = req.body as { status: "open" | "active" | "closed" };
  const session = sessions.get(sessionId);
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  session.status = status;
  session.updatedAt = Date.now();
  res.json(session);
});

router.get("/support/admin", (_req, res) => {
  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Nokta — Destek Paneli</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f0f0f; color: #e5e5e5; height: 100vh; display: flex; flex-direction: column; }
  header { background: #1a1a1a; border-bottom: 1px solid #2a2a2a; padding: 16px 24px; display: flex; align-items: center; gap: 12px; }
  .logo { font-size: 24px; font-weight: 800; color: #fff; letter-spacing: -1px; }
  .badge { background: #22c55e; color: #fff; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 20px; }
  .layout { display: flex; flex: 1; overflow: hidden; }
  .sidebar { width: 300px; border-right: 1px solid #2a2a2a; overflow-y: auto; background: #141414; }
  .sidebar-title { padding: 12px 16px; font-size: 11px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #222; }
  .session-item { padding: 14px 16px; border-bottom: 1px solid #1f1f1f; cursor: pointer; transition: background 0.15s; }
  .session-item:hover { background: #1e1e1e; }
  .session-item.active { background: #1e1e1e; border-left: 2px solid #a8ff78; }
  .session-name { font-size: 14px; font-weight: 600; color: #e5e5e5; }
  .session-preview { font-size: 12px; color: #666; margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .session-meta { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; }
  .session-time { font-size: 11px; color: #444; }
  .unread-badge { background: #a8ff78; color: #0f0f0f; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 10px; }
  .status-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-right: 6px; }
  .status-open { background: #f59e0b; }
  .status-active { background: #22c55e; }
  .status-closed { background: #555; }
  .chat-panel { flex: 1; display: flex; flex-direction: column; }
  .chat-header { padding: 16px 20px; border-bottom: 1px solid #2a2a2a; display: flex; align-items: center; justify-content: space-between; background: #141414; }
  .chat-user { font-size: 16px; font-weight: 600; }
  .chat-status { display: flex; gap: 8px; }
  .status-btn { padding: 6px 14px; border-radius: 8px; border: 1px solid #333; background: transparent; color: #aaa; font-size: 12px; cursor: pointer; transition: all 0.15s; }
  .status-btn:hover { background: #222; color: #fff; }
  .status-btn.close-btn:hover { border-color: #ef4444; color: #ef4444; }
  .messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
  .msg { max-width: 70%; }
  .msg.user { align-self: flex-start; }
  .msg.agent { align-self: flex-end; }
  .msg-bubble { padding: 10px 14px; border-radius: 14px; font-size: 14px; line-height: 1.5; }
  .msg.user .msg-bubble { background: #1e1e1e; color: #e5e5e5; border-bottom-left-radius: 4px; }
  .msg.agent .msg-bubble { background: #a8ff78; color: #0f0f0f; border-bottom-right-radius: 4px; }
  .msg-meta { font-size: 11px; color: #444; margin-top: 4px; }
  .msg.agent .msg-meta { text-align: right; }
  .reply-bar { padding: 16px 20px; border-top: 1px solid #2a2a2a; display: flex; gap: 10px; background: #141414; }
  .reply-input { flex: 1; background: #1e1e1e; border: 1px solid #2a2a2a; border-radius: 10px; padding: 10px 14px; color: #e5e5e5; font-size: 14px; outline: none; resize: none; font-family: inherit; }
  .reply-input:focus { border-color: #a8ff78; }
  .send-btn { background: #a8ff78; color: #0f0f0f; border: none; border-radius: 10px; padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
  .send-btn:hover { opacity: 0.85; }
  .empty-state { flex: 1; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 12px; color: #444; }
  .empty-icon { font-size: 40px; }
  .empty-text { font-size: 16px; }
  .refresh-btn { position: fixed; bottom: 80px; right: 20px; background: #1e1e1e; color: #aaa; border: 1px solid #333; border-radius: 50%; width: 40px; height: 40px; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
</style>
</head>
<body>
<header>
  <div class="logo">nokta</div>
  <div class="badge">Destek Paneli</div>
</header>
<div class="layout">
  <div class="sidebar">
    <div class="sidebar-title">Konuşmalar</div>
    <div id="sessions-list"></div>
  </div>
  <div class="chat-panel" id="chat-panel">
    <div class="empty-state">
      <div class="empty-icon">💬</div>
      <div class="empty-text">Bir konuşma seçin</div>
    </div>
  </div>
</div>
<script>
let currentSession = null;
let pollInterval = null;
let lastMsgTime = 0;

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return s + 's önce';
  if (s < 3600) return Math.floor(s/60) + 'dk önce';
  if (s < 86400) return Math.floor(s/3600) + 'sa önce';
  return Math.floor(s/86400) + 'g önce';
}

async function loadSessions() {
  const r = await fetch('/api/support/admin/sessions');
  const { sessions } = await r.json();
  const list = document.getElementById('sessions-list');
  if (!sessions.length) {
    list.innerHTML = '<div style="padding:20px;color:#444;font-size:13px;text-align:center">Henüz konuşma yok</div>';
    return;
  }
  list.innerHTML = sessions.map(({ session, lastMessage, unreadCount }) => {
    const statusClass = 'status-' + session.status;
    const preview = lastMessage ? lastMessage.text.substring(0, 50) : 'Henüz mesaj yok';
    const isActive = currentSession?.id === session.id;
    return '<div class="session-item' + (isActive ? ' active' : '') + '" onclick="selectSession(\'' + session.id + '\')">' +
      '<div class="session-name"><span class="status-dot ' + statusClass + '"></span>' + session.userName + '</div>' +
      '<div class="session-preview">' + preview + '</div>' +
      '<div class="session-meta">' +
        '<span class="session-time">' + timeAgo(session.updatedAt) + '</span>' +
        (unreadCount > 0 ? '<span class="unread-badge">' + unreadCount + '</span>' : '') +
      '</div></div>';
  }).join('');
}

async function selectSession(sessionId) {
  if (pollInterval) clearInterval(pollInterval);
  const r = await fetch('/api/support/sessions/' + sessionId + '/messages');
  const { messages, session } = await r.json();
  currentSession = session;
  lastMsgTime = messages.length ? messages[messages.length-1].createdAt : 0;
  renderChat(session, messages);
  await loadSessions();
  pollInterval = setInterval(pollMessages, 2500);
}

async function pollMessages() {
  if (!currentSession) return;
  const r = await fetch('/api/support/sessions/' + currentSession.id + '/messages?after=' + lastMsgTime);
  const { messages, session } = await r.json();
  currentSession = session;
  if (messages.length) {
    lastMsgTime = messages[messages.length-1].createdAt;
    appendMessages(messages);
  }
}

function renderChat(session, msgs) {
  const panel = document.getElementById('chat-panel');
  panel.innerHTML =
    '<div class="chat-header">' +
      '<div class="chat-user">' + session.userName + ' <span style="color:#555;font-size:12px">' + session.id.substring(0,8) + '</span></div>' +
      '<div class="chat-status">' +
        '<button class="status-btn" onclick="markActive()">Aktif</button>' +
        '<button class="status-btn close-btn" onclick="closeSession()">Kapat</button>' +
      '</div>' +
    '</div>' +
    '<div class="messages" id="messages-list"></div>' +
    '<div class="reply-bar">' +
      '<textarea class="reply-input" id="reply-input" rows="2" placeholder="Yanıt yazın..." onkeydown="handleKey(event)"></textarea>' +
      '<button class="send-btn" onclick="sendReply()">Gönder</button>' +
    '</div>';
  const list = document.getElementById('messages-list');
  list.innerHTML = msgs.map(renderMsg).join('');
  list.scrollTop = list.scrollHeight;
}

function appendMessages(msgs) {
  const list = document.getElementById('messages-list');
  if (!list) return;
  msgs.forEach(m => {
    list.innerHTML += renderMsg(m);
  });
  list.scrollTop = list.scrollHeight;
}

function renderMsg(m) {
  return '<div class="msg ' + m.role + '">' +
    '<div class="msg-bubble">' + m.text + '</div>' +
    '<div class="msg-meta">' + (m.role === 'agent' ? 'Siz · ' : '') + timeAgo(m.createdAt) + '</div>' +
  '</div>';
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); }
}

async function sendReply() {
  const input = document.getElementById('reply-input');
  const text = input.value.trim();
  if (!text || !currentSession) return;
  input.value = '';
  const r = await fetch('/api/support/admin/sessions/' + currentSession.id + '/reply', {
    method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ text })
  });
  const msg = await r.json();
  lastMsgTime = msg.createdAt;
  appendMessages([msg]);
}

async function markActive() {
  if (!currentSession) return;
  await fetch('/api/support/admin/sessions/' + currentSession.id + '/status', {
    method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ status: 'active' })
  });
  loadSessions();
}

async function closeSession() {
  if (!currentSession) return;
  await fetch('/api/support/admin/sessions/' + currentSession.id + '/status', {
    method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ status: 'closed' })
  });
  currentSession = null;
  if (pollInterval) clearInterval(pollInterval);
  document.getElementById('chat-panel').innerHTML = '<div class="empty-state"><div class="empty-icon">✓</div><div class="empty-text">Konuşma kapatıldı</div></div>';
  loadSessions();
}

loadSessions();
setInterval(loadSessions, 5000);
</script>
</body>
</html>`;
  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

export default router;
