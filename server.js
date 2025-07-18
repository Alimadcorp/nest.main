import express from 'express';
import { WebSocketServer } from 'ws';
import { v4 as uuid } from 'uuid';

const app = express();
app.use(express.static('public'));

const PORT = process.env.PORT || 4567;
const server = app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
const wss = new WebSocketServer({ server });

const clients = new Map(); // ws → { id, username, color }

wss.on('connection', (ws) => {
  const id = uuid();
  const color = `hsl(${Math.random() * 360}, 70%, 60%)`;
  clients.set(ws, { id, color, username: `Guest-${id.slice(0, 4)}`, held:false });

  ws.on('message', (raw) => {
    const msg = JSON.parse(raw);
    const data = clients.get(ws);

    if (msg.type === 'set-username') {
      data.username = msg.username;
    }

    if (msg.type === 'cursor') {
      const out = {
        type: 'cursor',
        id: data.id,
        x: msg.x,
        y: msg.y,
        color: data.color,
        username: data.username,
        held: msg.held
      };
      for (const client of clients.keys()) {
        if (client.readyState === 1) client.send(JSON.stringify(out));
      }
    }
  });

  ws.on('close', () => {
    const { id } = clients.get(ws);
    for (const client of clients.keys()) {
      client.send(JSON.stringify({ type: 'leave', id }));
    }
    clients.delete(ws);
  });
});
