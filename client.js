const protocol = location.protocol === "https:" ? "wss" : "ws";
let socket;
let userId = null;
let myColor = null;
let mouseOut = [];
let myUsername =
  Math.random() ||
  localStorage.getItem("n.mmyusername") ||
  prompt("Choose your username:") ||
  "Anonymous";
localStorage.setItem("n.mmyusername", myUsername);
let others = {}; // id → { x, y, color, username }

window.addEventListener("load", () => {
  socket = new WebSocket(
    //`wss://3ad298c09ed2.ngrok-free.app`
    `ws://localhost:4567`
  );
  socket.addEventListener("open", () => {
    socket.send(JSON.stringify({ type: "set-username", username: myUsername }));
    mouseOut = [];
  });

  socket.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.username == myUsername) {
      if (!userId) {
        userId = msg.id;
        myColor = msg.color;
      }
    }
    if (msg.type === "cursor") {
      coroutine(msg);
    }
    if (msg.type === "history") {
      makeHistory(msg.data);
    }
    if (msg.type === "leave") {
      delete others[msg.id];
      delete curs[msg.id];
    }
  });

  async function coroutine(m) {
    await theCoroutine(m);
  }

  async function theCoroutine(msg) {
    const j = msg.msg.split(";");
    for (let i = 0; i < j.length - 1; i++) {
      others[msg.id] = {
        x: parseInt(j[i].split(",")[0]),
        y: parseInt(j[i].split(",")[1]),
        color: msg.color,
        username: msg.username,
        held: msg.held,
      };
      if (!curs[msg.id]) {
        curs[msg.id] = cursp[msg.id] = others[msg.id];
      }
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 2);
      });
    }
  }

  setInterval(() => {
    let mouseMessage = "";
    for (let i = 0; i < mouseOut.length; i++) {
      mouseMessage += `${mouseOut[i].x},${mouseOut[i].y};`;
    }
    socket.send(
      JSON.stringify({
        type: "cursor",
        msg: mouseMessage,
        held: mouseIsPressed,
      })
    );
    mouseOut = [];
  }, 100);

  setInterval(() => {
    mouseOut.push({
      x: mouseX,
      y: mouseY,
      held: mouseIsPressed,
    });
  }, 10);
});
