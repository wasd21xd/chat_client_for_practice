const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

const clients = new Map(); // ws -> { id, username, color }

const COLORS = [
  '#e05c5c', '#e07a5c', '#e0a05c', '#c8e05c',
  '#5ce07a', '#5cb8e0', '#5c7ae0', '#a05ce0',
  '#e05cb8', '#e05c8a',
];

function broadcast(data, excludeWs = null) {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== excludeWs) {
      client.send(message);
    }
  });
}

function broadcastAll(data) {
  broadcast(data, null);
}

function getUsersList() {
  return Array.from(clients.values()).map(({ id, username, color }) => ({ id, username, color }));
}

wss.on('connection', (ws) => {
  const id = uuidv4();
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];

  ws.on('message', (raw) => {
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return;
    }

    if (data.type === 'JOIN') {
      const username = (data.username || 'Anonymous').slice(0, 20);
      clients.set(ws, { id, username, color });

      // Tell this client their own info
      ws.send(JSON.stringify({ type: 'WELCOME', id, username, color }));

      // Tell everyone the new user list
      broadcastAll({ type: 'USERS_UPDATE', users: getUsersList() });

      // Announce join to others
      broadcast(
        { type: 'SYSTEM', text: `${username} joined the chat`, timestamp: Date.now() },
        ws
      );
    }

    if (data.type === 'MESSAGE') {
      const client = clients.get(ws);
      if (!client) return;

      const msg = {
        type: 'MESSAGE',
        id: uuidv4(),
        authorId: client.id,
        author: client.username,
        color: client.color,
        text: (data.text || '').slice(0, 500),
        timestamp: Date.now(),
      };

      broadcastAll(msg);
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

console.log(`WebSocket server running on ws://localhost:${PORT}`);
