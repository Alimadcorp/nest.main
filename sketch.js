let curs = {};
let cursp = {};
let curspp = [{}, {}, {}];
let drawLayer;

function setup() {
  createCanvas(windowWidth, windowHeight);
  drawLayer = createGraphics(windowWidth, windowHeight);
  drawLayer.clear();

  noCursor();
  textAlign(CENTER, TOP);
  textSize(12);
  frameRate(60);
  textFont("monospace");
}

function pushCursor(c) {
  for (let i = 1; i < cursp.length; i++) {
    cursp[i - 1] = cursp[i];
  }
}

function draw() {
  background(0);
  image(drawLayer, 0, 0);

  for (const id in curs) {
    if (id == userId) {
      continue;
    }
    const o = curs[id];
    const t = others[id];
    o.x = lerp(o.x, t.x, 0.5);
    o.y = lerp(o.y, t.y, 0.5);

    if (t.held && cursp[id]) {
      drawLayer.stroke(o.color);
      drawLayer.strokeWeight(3);
      drawLayer.line(cursp[id].x, cursp[id].y, o.x, o.y);
    }

    drawCursor(
      o.x,
      o.y,
      o.color,
      o.username,
      t.held,
      cursp[id]?.x,
      cursp[id]?.y
    );
  }

  if (mouseIsPressed) {
    drawLayer.stroke(myColor);
    drawLayer.strokeWeight(3);
    drawLayer.line(pmouseX, pmouseY, mouseX, mouseY);
  }

  drawCursor(
    mouseX,
    mouseY,
    myColor,
    myUsername,
    mouseIsPressed,
    pmouseX,
    pmouseY
  );

  cursp = structuredClone(curs);
}

function makeHistory(history) {
  let k = Object.keys(history);
  for (let i = 0; i < k.length; i++) {
    if (history[k[i]].length == 0) {
      delete history[k[i]];
    }
  }
  k = Object.keys(history);
  console.log(history);
  for (let i = 0; i < k.length; i++) {
    const col = k[i];
    const strokey = history[k[i]].join("").split(";").filter(Boolean); // omg
    drawLayer.strokeWeight(3);
    drawLayer.stroke(col);

    let prev = null;
    for (let j = 0; j < strokey.length; j++) {
      const [x, y] = strokey[j].split(",").map(Number);
      if (prev) {
        drawLayer.line(prev[0], prev[1], x, y);
      }
      prev = [x, y];
    }
  }
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

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  const newDrawLayer = createGraphics(windowWidth, windowHeight);
  newDrawLayer.clear();
  newDrawLayer.image(drawLayer, 0, 0);
  drawLayer = newDrawLayer;
}