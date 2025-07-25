import express from "express";
import { WebSocketServer } from "ws";
import { v4 as uuid } from "uuid";

const app = express();
app.use(express.static("public"));

const PORT = process.env.PORT || 4567;
const server = app.listen(PORT, () =>
  console.log(`Listening on http://localhost:${PORT}`)
);
const wss = new WebSocketServer({ server });

const clients = new Map(); // ws => { id, username, color }
let drawn = {}; // color => [ "12,22;", "22,55;", ...]
let holding = {};

wss.on("connection", (ws) => {
  const id = uuid();
  const color = `hsl(${Math.random() * 360}, 70%, 60%)`;
  clients.set(ws, {
    id,
    color,
    username: `Guest-${id.slice(0, 4)}`,
    held: false,
  });

  ws.on("message", (raw) => {
    const msg = JSON.parse(raw);
    const data = clients.get(ws);

    if (msg.type === "set-username") {
      data.username = msg.username;
      if (!drawn[data.color]) {
        drawn[data.color] = [];
        holding[data.color] = false;
      }
      const history = {
        type: "history",
        data: drawn,
      };
      if (ws.readyState === 1) ws.send(JSON.stringify(history));
    }

    if (msg.type === "cursor") {
      if (!msg.held && holding[data.color]) {
        holding[data.color] = false;
      }
      if (msg.held) {
        if(!drawn[data.color]) drawn[data.color] = [];
        if (holding[data.color]) {
          drawn[data.color][drawn[data.color].length - 1] += msg.msg;
        } else {
          drawn[data.color].push(msg.msg);
        }
        holding[data.color] = true;
      }
      const out = {
        type: "cursor",
        id: data.id,
        msg: msg.msg,
        color: data.color,
        username: data.username,
        held: msg.held,
      };
      for (const client of clients.keys()) {
        if (client.readyState === 1) client.send(JSON.stringify(out));
      }
    }
    if (msg.type === "clear") {
      for (const client of clients.keys()) {
        clearMemory();
        if (client.readyState === 1) client.send(JSON.stringify({type: "clear"}));
      }
    }
  });

  ws.on("close", () => {
    const { id } = clients.get(ws);
    for (const client of clients.keys()) {
      client.send(JSON.stringify({ type: "leave", id }));
    }
    clients.delete(ws);
    if (clients.size == 0) {
      //clearMemory();
    }
  });
});

setInterval(clearMemory, 1000 * 60 * 60 * 24);

function clearMemory() {
  drawn = {};
  holding = {};
}
