const protocol = location.protocol === "https:" ? "wss" : "ws";
let socket;
let userId = null;
let myColor = null;
let mouseOut = [];
let last = {};
let myUsername =
  localStorage.getItem("n.mmyusername") ||
  prompt("Choose your username:") ||
  "Anonymous";
localStorage.setItem("n.mmyusername", myUsername);
let others = {};

window.addEventListener("load", () => {
  document.addEventListener("keydown", (event) => {
    if (event.key === "r" || event.key === "R") {
      socket.send(JSON.stringify({ type: "clear" }));
    }
  });
  const url =
    window.location != "http://127.0.0.1:5500/"
      ? `wss://3ad298c09ed2.ngrok-free.app`
      : `ws://localhost:4567`;
  socket = new WebSocket(url);
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
    if (msg.type === "clear") {
      drawLayer.clear();
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
        }, 4);
      });
    }
  }

  setInterval(() => {
    let mouseMessage = "";
    for (let i = 0; i < mouseOut.length; i++) {
      mouseMessage += `${mouseOut[i].x},${mouseOut[i].y};`;
    }
    if(mouseMessage == "") return;
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
    const current = {
      x: mouseX,
      y: mouseY,
      held: mouseIsPressed,
    };

    if (
      current.x !== last.x ||
      current.y !== last.y ||
      current.held !== last.held ||
      current.held
    ) {
      mouseOut.push(current);
      last = current;
    }
  }, 4);
});
