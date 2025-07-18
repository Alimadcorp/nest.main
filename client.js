const protocol = location.protocol === "https:" ? "wss" : "ws";
const socket = new WebSocket(
  `${protocol}://${location.host
    .replace(":5500", "")
    .replace(":3000", "")}:4000`
);
let userId = null;
let myUsername =
  localStorage.getItem("n.mmyusername") ||
  prompt("Choose your username:") ||
  "Anonymous";
localStorage.setItem("n.mmyusername", myUsername);
let others = {}; // id → { x, y, color, username }

socket.addEventListener("open", () => {
  socket.send(JSON.stringify({ type: "set-username", username: myUsername }));
});

socket.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.type === "cursor") {
    others[msg.id] = {
      x: msg.x,
      y: msg.y,
      color: msg.color,
      username: msg.username,
      held: msg.held,
    };
    if (!curs[msg.id]) {
      curs[msg.id] = cursp[msg.id] = others[msg.id];
    }
  }
  if (msg.type === "leave") {
    delete others[msg.id];
    delete curs[msg.id];
  }
});

setInterval(() => {
  socket.send(
    JSON.stringify({
      type: "cursor",
      x: mouseX,
      y: mouseY,
      held: mouseIsPressed,
    })
  );
}, 50);
