// server.js
import { WebSocketServer } from 'ws';
import express from 'express';
import { v4 as uuid } from 'uuid';

const app = express();
app.use(express.static('public'));

const server = app.listen(3000, () => console.log('Listening on http://localhost:3000'));
const wss = new WebSocketServer({ server });

const clients = new Map();
const notes = new Map();

wss.on('connection', ws => {
  const userId = uuid();
  const color = `hsl(${Math.random()*360}, 70%, 50%)`;
  clients.set(ws, { userId, color });
  ws.send(JSON.stringify({ type: 'init', notes: [...notes.values()] }));

  ws.on('message', data => {
    const msg = JSON.parse(data);
    handleMessage(ws, msg);
  });
  ws.on('close', () => clients.delete(ws));
});

function broadcast(obj) {
  const str = JSON.stringify(obj);
  for (const ws of clients.keys()) ws.send(str);
}

function handleMessage(ws, msg) {
  const { userId, color } = clients.get(ws);
  if (msg.type === 'create') {
    const note = { id: uuid(), x: msg.x, y: msg.y, text: msg.text, lastEdited: Date.now(), owner: userId };
    notes.set(note.id, note);
    broadcast({ type: 'note-created', note });
  }
  if (msg.type === 'move') {
    const note = notes.get(msg.id);
    if (note && note.owner === userId) {
      note.x = msg.x; note.y = msg.y;
      broadcast({ type: 'note-moved', id: note.id, x: note.x, y: note.y });
    }
  }
  if (msg.type === 'edit') {
    const note = notes.get(msg.id);
    if (note && note.owner === userId) {
      note.text = msg.text;
      note.lastEdited = Date.now();
      broadcast({ type: 'note-edited', id: note.id, text: note.text, lastEdited: note.lastEdited });
    }
  }
  if (msg.type === 'cursor') {
    broadcast({ type: 'cursor', userId, color, x: msg.x, y: msg.y });
  }
}
