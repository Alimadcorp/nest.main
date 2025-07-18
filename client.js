const socket = new WebSocket(`ws://${location.host}:4567`);
const notes = {};
const cursors = {};

socket.addEventListener('message', ev => {
  const msg = JSON.parse(ev.data);
  if (msg.type === 'init') {
    msg.notes.forEach(n => spawnNote(n));
  }
  if (msg.type === 'note-created') spawnNote(msg.note);
  if (msg.type === 'note-moved') moveNote(msg.id, msg.x, msg.y);
  if (msg.type === 'note-edited') updateNoteText(msg.id, msg.text, msg.lastEdited);
  if (msg.type === 'cursor') updateCursor(msg.userId, msg.color, msg.x, msg.y);
});

function spawnNote(n) {
  const el = document.createElement('div');
  el.className = 'note';
  el.contentEditable = true;
  el.style.left = n.x + 'px';
  el.style.top = n.y + 'px';
  el.innerText = n.text;
  el.onblur = () => socket.send(JSON.stringify({ type: 'edit', id: n.id, text: el.innerText }));
  el.onmousedown = e => {
    const dx = e.offsetX, dy = e.offsetY;
    const move = me => {
      el.style.left = me.pageX - dx + 'px';
      el.style.top = me.pageY - dy + 'px';
    };
    const up = () => {
      socket.send(JSON.stringify({ type: 'move', id: n.id, x: parseInt(el.style.left), y: parseInt(el.style.top) }));
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };
  document.body.append(el);
  notes[n.id] = el;
}

function moveNote(id, x, y) {
  if (notes[id]) notes[id].style.left = x + 'px', notes[id].style.top = y + 'px';
}

function updateNoteText(id, text) {
  const el = notes[id];
  if (el) el.innerText = text;
}

function updateCursor(uid, color, x, y) {
  let c = cursors[uid];
  if (!c) {
    c = document.createElement('div');
    c.style.position = 'absolute';
    c.style.width = '8px';
    c.style.height = '8px';
    c.style.background = color;
    c.style.borderRadius = '50%';
    document.body.append(c);
    cursors[uid] = c;
  }
  c.style.left = x + 'px';
  c.style.top = y + 'px';
}

window.addEventListener('mousemove', e => {
  socket.send(JSON.stringify({ type: 'cursor', x: e.pageX, y: e.pageY }));
});
