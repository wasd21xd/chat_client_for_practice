# waveroom 💬

Real-time group chat application built with React, Redux, Redux-Saga, and WebSockets.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Redux 4, Redux-Saga |
| Transport | WebSocket (native browser API + `ws` library) |
| Backend | Node.js |
| Deploy (client) | Vercel |
| Deploy (server) | Render |

## Features

- Real-time messaging via WebSocket — no page reloads
- Multiple users can connect simultaneously, each gets a unique color
- System messages when users join / leave
- Messages sent by you appear on the right; others on the left
- User list in the sidebar updates live

## How to run locally

**1. Start the server**
```bash
cd server
npm install
npm start
# WebSocket server starts on ws://localhost:8080
```

**2. Start the client**
```bash
cd client
npm install
npm start
# React app opens at http://localhost:3000
```

Open two browser tabs at `http://localhost:3000`, enter different names — and chat between them.

## Project structure

```
chat-app/
├── client/          # React frontend
│   └── src/
│       ├── components/   # Login, Chat, Sidebar, MessagesList, AddMessage
│       ├── store/        # Redux (actions, reducer, store)
│       └── sagas/        # Redux-Saga (WebSocket middleware)
└── server/          # Node.js WebSocket server
    └── index.js
```

## Deploy

- **Client**: [https://your-app.vercel.app](https://your-app.vercel.app) ← замени на свою ссылку
- **Server**: [https://your-server.onrender.com](https://your-server.onrender.com) ← замени на свою ссылку

## Code Climate

[![Maintainability](https://api.codeclimate.com/v1/badges/REPLACE_WITH_YOUR_ID/maintainability)](https://codeclimate.com/github/YOUR_USERNAME/YOUR_REPO/maintainability)
