require('dotenv').config();
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const PORT = process.env.PORT || 8080;
const SALT_ROUNDS = 10;

// ── Database ──────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(20) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      color VARCHAR(7) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      username VARCHAR(20) NOT NULL,
      color VARCHAR(7) NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('Database ready');
}

async function getHistory() {
  const res = await pool.query(
    `SELECT id, user_id as "authorId", username as author, color, text,
            EXTRACT(EPOCH FROM created_at)::bigint * 1000 as timestamp
     FROM messages ORDER BY created_at DESC LIMIT 50`
  );
  return res.rows.reverse();
}

async function saveMessage({ userId, username, color, text }) {
  const res = await pool.query(
    `INSERT INTO messages (user_id, username, color, text)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [userId, username, color, text]
  );
  return res.rows[0].id;
}

async function registerUser({ username, password, color }) {
  const existing = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
  if (existing.rows.length > 0) return { error: 'USERNAME_TAKEN' };
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const res = await pool.query(
    `INSERT INTO users (username, password_hash, color) VALUES ($1, $2, $3) RETURNING id, username, color`,
    [username, password_hash, color]
  );
  return { user: res.rows[0] };
}

async function loginUser({ username, password }) {
  const res = await pool.query('SELECT id, username, color, password_hash FROM users WHERE username = $1', [username]);
  if (res.rows.length === 0) return { error: 'INVALID_CREDENTIALS' };
  const user = res.rows[0];
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return { error: 'INVALID_CREDENTIALS' };
  return { user: { id: user.id, username: user.username, color: user.color } };
}

// ── WebSocket ─────────────────────────────────────────────────
const COLORS = [
  '#e05c5c','#e07a5c','#e0a05c','#c8e05c',
  '#5ce07a','#5cb8e0','#5c7ae0','#a05ce0',
  '#e05cb8','#e05c8a',
];

const clients = new Map(); // ws -> { id, username, color }

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function broadcast(data, excludeWs = null) {
  const msg = JSON.stringify(data);
  for (const [ws] of clients) {
    if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    }
  }
}

function broadcastAll(data) {
  broadcast(data, null);
}

function getUsersList() {
  return Array.from(clients.values()).map(({ id, username, color }) => ({ id, username, color }));
}

const wss = new WebSocket.Server({ port: PORT });

wss.on('connection', (ws) => {
  ws.on('message', async (raw) => {
    let data;
    try { data = JSON.parse(raw); } catch { return; }

    // ── REGISTER ──
    if (data.type === 'REGISTER') {
      const username = (data.username || '').trim().slice(0, 20);
      const password = (data.password || '').trim();
      if (!username || password.length < 4) {
        return ws.send(JSON.stringify({ type: 'AUTH_ERROR', message: 'Имя обязательно, пароль минимум 4 символа' }));
      }
      const color = randomColor();
      const result = await registerUser({ username, password, color });
      if (result.error === 'USERNAME_TAKEN') {
        return ws.send(JSON.stringify({ type: 'AUTH_ERROR', message: 'Это имя уже занято' }));
      }
      const user = result.user;
      clients.set(ws, { id: user.id, username: user.username, color: user.color });
      const history = await getHistory();
      ws.send(JSON.stringify({ type: 'WELCOME', id: user.id, username: user.username, color: user.color, history }));
      broadcastAll({ type: 'USERS_UPDATE', users: getUsersList() });
      broadcast({ type: 'SYSTEM', text: `${user.username} joined the chat`, timestamp: Date.now() }, ws);
    }

    // ── LOGIN ──
    if (data.type === 'LOGIN') {
      const username = (data.username || '').trim();
      const password = (data.password || '').trim();
      const result = await loginUser({ username, password });
      if (result.error) {
        return ws.send(JSON.stringify({ type: 'AUTH_ERROR', message: 'Неверное имя или пароль' }));
      }
      const user = result.user;
      clients.set(ws, { id: user.id, username: user.username, color: user.color });
      const history = await getHistory();
      ws.send(JSON.stringify({ type: 'WELCOME', id: user.id, username: user.username, color: user.color, history }));
      broadcastAll({ type: 'USERS_UPDATE', users: getUsersList() });
      broadcast({ type: 'SYSTEM', text: `${user.username} joined the chat`, timestamp: Date.now() }, ws);
    }

    // ── MESSAGE ──
    if (data.type === 'MESSAGE') {
      const client = clients.get(ws);
      if (!client) return;
      const text = (data.text || '').slice(0, 500);
      if (!text.trim()) return;
      const msgId = await saveMessage({ userId: client.id, username: client.username, color: client.color, text });
      broadcastAll({
        type: 'MESSAGE',
        id: msgId,
        authorId: client.id,
        author: client.username,
        color: client.color,
        text,
        timestamp: Date.now(),
      });
    }
  });

  ws.on('close', () => {
    const client = clients.get(ws);
    if (client) {
      clients.delete(ws);
      broadcastAll({ type: 'USERS_UPDATE', users: getUsersList() });
      broadcastAll({ type: 'SYSTEM', text: `${client.username} left the chat`, timestamp: Date.now() });
    }
  });
});

initDb().then(() => {
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
