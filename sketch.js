let panX=0, panY=0, scaleF=1;
let dragging=false, prevX, prevY;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  noLoop();
}
function draw() {
  fill(255, 255, 255, 10);
  rect(0, 0, width, height);
}

function mousePressed() {
  if (keyIsDown(CONTROL)) {
    dragging = true;
    prevX = mouseX;
    prevY = mouseY;
  }
}

function mouseDragged() {
  if (dragging) {
    panX += mouseX - prevX;
    panY += mouseY - prevY;
    prevX = mouseX;
    prevY = mouseY;
    applyTransform();
  }
}

function mouseReleased() {
  dragging = false;
}

function mouseWheel(ev) {
  const s = ev.delta > 0 ? 0.9 : 1.1;
  scaleF *= s;
  scaleF = constrain(scaleF, 0.5, 2);
  applyTransform();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function applyTransform() {
  select('body').style('transform', `translate(${panX}px,${panY}px) scale(${scaleF})`);
}
