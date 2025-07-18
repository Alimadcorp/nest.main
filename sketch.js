let curs = {};
let cursp = {};
let drawLayer;

function setup() {
  createCanvas(windowWidth, windowHeight);
  drawLayer = createGraphics(windowWidth, windowHeight);
  drawLayer.clear(); // transparent background

  noCursor();
  textAlign(CENTER, TOP);
  textSize(12);
  frameRate(60);
  textFont('monospace');
}

function draw() {
  background(0);
  image(drawLayer, 0, 0);

  for (const id in curs) {
    const o = curs[id];
    const t = others[id];
    o.x = lerp(o.x, t.x, 0.5);
    o.y = lerp(o.y, t.y, 0.5);

    if (t.held && cursp[id]) {
      drawLayer.stroke(o.color);
      drawLayer.strokeWeight(3);
      drawLayer.line(cursp[id].x, cursp[id].y, o.x, o.y);
    }

    drawCursor(o.x, o.y, o.color, o.username, t.held, cursp[id]?.x, cursp[id]?.y);
  }

  cursp = structuredClone(curs);
}

function drawCursor(x, y, color, name, held, px, py) {
  noStroke();
  fill(color);
  ellipse(x, y, 12, 12);
  fill(255);
  text(name, x, y + 12);
  if (held && px != null && py != null) {
    stroke(255);
    strokeWeight(10);
    line(px, py, x, y);
  }
}
