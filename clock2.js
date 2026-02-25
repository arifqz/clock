let blob1, blob2, blob3, blob4;
let hand;
let star1, star2, star3, star4;
let squareList = [];
let tick = 0;
let turnX = 0;
let turnY = 0;

let sunUp = null;
let sunDown = null;
let lat = 40.7128;
let lng = -74.0060;

const orbitR = 320;
const bigR = 414;
const arcR = 203;
const handR = 395;
const handMid = (245 + 395) / 2;
const smallR = 65;
const sqX = 220;
const sqY = 200;
const sqSize = 6;

const k1 = 1.8;
const k2 = 140;
const k3 = 130;
const k4 = 120;
const k5 = 0.15;

function setup() {
  const h = windowHeight - 56;
  const w = min(windowWidth, h * (4 / 5));
  const c = createCanvas(w, h, WEBGL);
  c.parent('canvas-container');

  blob1 = new Blob(0, 0, 0, 260);
  blob2 = new Blob(0, 0, 0, 22);
  blob3 = new Blob(0, 0, 0, 414);
  blob4 = new Blob(0, 0, 0, 150);
  
  hand = new Hand(0, 0, 50, 80, 280, 60);

  const y = -orbitR * (2 / 3);
  const ch = sqrt(orbitR * orbitR - y * y);
  const xh = ch * 1.8 * (2 / 3);
  const sl = (xh / 2) * 0.15;
  
  star1 = new Star(xh / 3, y, sl, 0, [1.0, 1.4, 0.8, 1.2]);
  star2 = new Star(-300, 220, sl * 0.78, PI / 2, [1.3, 0.7, 1.6, 0.9]);
  star3 = new Star(280, -240, sl * 0.45, PI / 4, [0.85, 1.55, 1.1, 0.6]);
  star4 = new Star(0, -430, sl * 0.45, PI * 0.75, [1.2, 0.75, 1.45, 0.95]);

  for (let i = 0; i < 22; i++) {
    let baseAngle = random() < 0.5 ? -HALF_PI : HALF_PI;
    let variation = random(-QUARTER_PI, QUARTER_PI); 
    squareList.push({
      a: baseAngle + variation,
      r: random(bigR + 20, bigR + 250), 
      s: random(0.2, 0.6) 
    });
  }
  
  for (let i = 0; i < 10; i++) {
    let variation = random(-QUARTER_PI, QUARTER_PI);
    squareList.push({
      a: -HALF_PI + variation, 
      r: random(bigR + 20, bigR + 250),
      s: random(0.2, 0.6)
    });
  }
  
  for (let i = 0; i < 15; i++) {
    let sideAngle = random() < 0.5 ? 0 : PI; 
    let variation = random(-QUARTER_PI, QUARTER_PI);
    squareList.push({
      a: sideAngle + variation,
      r: random(bigR + 20, bigR + 250),
      s: random(0.2, 0.6)
    });
  }

  loadJSON('https://ipwho.is/', function (res) {
    if (res && res.success && typeof res.latitude === 'number' && typeof res.longitude === 'number') {
      lat = res.latitude;
      lng = res.longitude;
    }
    getSun();
  }, function () {
    getSun();
  });
}

function getSun() {
  const d = new Date();
  const ds = d.getFullYear() + '-' + nf(d.getMonth() + 1, 2) + '-' + nf(d.getDate(), 2);
  const url = 'https://api.sunrise-sunset.org/json?lat=' + lat + '&lng=' + lng + '&date=' + ds + '&formatted=0';
  loadJSON(url, function (res) {
    if (res && res.results) {
      const sr = new Date(res.results.sunrise);
      const ss = new Date(res.results.sunset);
      const opt = { hour12: false, hour: '2-digit', minute: '2-digit' };
      const srHands = sr.toLocaleTimeString('en-US', opt).split(':');
      const ssHands = ss.toLocaleTimeString('en-US', opt).split(':');
      sunUp = int(srHands[0]) * 60 + int(srHands[1]);
      sunDown = int(ssHands[0]) * 60 + int(ssHands[1]);
    }
  }, function (err) {
    console.error('API:', err);
  });
}

function draw() {
  push();
  background(0);
  perspective(PI / 3, width / height, 0.1, 2000);
  camera(0, 0, 1000, 0, 0, 0, 0, 1, 0);
  
  emissiveMaterial(255, 255, 255);
  ambientLight(60);
  pointLight(255, 255, 255, 200, -200, 200);
  directionalLight(255, 0, 0, 0, 1, 0);

  tick += 0.05;

  blob1.draw1();
  blob2.draw2();
  blob3.draw3();
  blob4.draw4();
  
  drawRing();
  drawDay();
  drawNight();
  
  star1.draw();
  star2.draw();
  star3.draw();
  star4.draw();
  
  drawMainSq();
  drawSquares();
  
  drawMinLine();
  drawMinCircle();
  drawSecDot();
  
  hand.draw();
  
  pop();
}

function mouseWheel(event) {
  turnY += event.delta * 0.005;
}

function mouseDragged() {
  turnX += (mouseX - pmouseX) * 0.01;
  turnY += (mouseY - pmouseY) * 0.01;
}

function touchMoved() {
  turnX += (mouseX - pmouseX) * 0.01;
  turnY += (mouseY - pmouseY) * 0.01;
  return false;
}

function windowResized() {
  const h = windowHeight - 56;
  const w = min(windowWidth, h * (4 / 5));
  resizeCanvas(w, h);
}

function getMins() {
  try {
    const s = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const p = s.split(':');
    const sc = p[2] !== undefined ? int(p[2]) : 0;
    const v = int(p[0]) * 60 + int(p[1]) + sc / 60;
    if (isNaN(v)) return 720;
    return v;
  } catch (e) {
    return 720;
  }
}

function nearMouse(x, y) {
  const sc = min(width, height) / 600;
  const sx = width / 2 + x * sc;
  const sy = height / 2 - y * sc;
  const d = dist(mouseX, mouseY, sx, sy);
  return max(0, 1 - d / 160);
}

function drawRing() {
  stroke(255, 255, 255);
  strokeWeight(1);
  noFill();
  push();
  beginShape();
  for (let a = 0; a <= TWO_PI; a += 0.05) {
    vertex(orbitR * cos(a), orbitR * sin(a), 0);
  }
  endShape(CLOSE);
  pop();
}

function drawDay() {
  if (sunUp == null || sunDown == null) return;
  const n = getMins();
  if (n >= sunDown || n < sunUp) return;
  
  const an = map(n % 720, 0, 720, -HALF_PI, -HALF_PI + TWO_PI);
  let as = map(sunDown % 720, 0, 720, -HALF_PI, -HALF_PI + TWO_PI);
  if (as < an) as += TWO_PI;
  
  stroke(255, 255, 255);
  strokeWeight(1);
  noFill();
  push();
  beginShape();
  for (let a = an; a <= as; a += 0.03) {
    vertex(arcR * cos(a), arcR * sin(a), 0);
  }
  endShape();
  pop();
}

function drawNight() {
  if (sunUp == null || sunDown == null) return;
  const n = getMins();
  const night = (n >= sunDown || n < sunUp);
  if (!night) return;

  const an = map(n % 720, 0, 720, -HALF_PI, -HALF_PI + TWO_PI);
  let as = map(sunUp % 720, 0, 720, -HALF_PI, -HALF_PI + TWO_PI);
  if (as < an) as += TWO_PI;

  stroke(255, 255, 255);
  strokeWeight(1);
  noFill();
  push();
  beginShape();
  for (let a = an; a <= as; a += 0.03) {
    vertex(arcR * cos(a), arcR * sin(a), 0);
  }
  endShape();
  pop();
}

function drawMainSq() {
  const t = millis() * 0.001;
  const x = 8 * sin(t * 1.2);
  const y = 8 * sin(t * 0.9);
  noStroke();
  fill(255);
  emissiveMaterial(255, 255, 255);
  push();
  translate(sqX + x, sqY + y, 0);
  beginShape();
  vertex(-sqSize, -sqSize, 0);
  vertex(sqSize, -sqSize, 0);
  vertex(sqSize, sqSize, 0);
  vertex(-sqSize, sqSize, 0);
  endShape(CLOSE);
  pop();
}

function drawSquares() {
  const t = millis() * 0.001;
  noStroke();
  fill(255);
  emissiveMaterial(255, 255, 255);
  for (let i = 0; i < squareList.length; i++) {
    const box = squareList[i];
    const x = 4 * sin(t * 1.1 + i * 0.6);
    const y = 4 * sin(t * 0.85 + i * 0.4);
    const px = box.r * cos(box.a) + x;
    const py = box.r * sin(box.a) + y;
    const h = sqSize * box.s;
    push();
    translate(px, py, 0);
    beginShape();
    vertex(-h, -h, 0);
    vertex(h, -h, 0);
    vertex(h, h, 0);
    vertex(-h, h, 0);
    endShape(CLOSE);
    pop();
  }
}

function drawMinLine() {
  let a = -HALF_PI + (minute() + second() / 60) / 60 * TWO_PI;
  let x = handR * cos(a);
  let y = handR * sin(a);
  stroke(255);
  strokeWeight(1);
  line(0, 0, 0, x, y, 0);
}

function drawMinCircle() {
  let a = -HALF_PI + (minute() + second() / 60) / 60 * TWO_PI;
  let cx = handMid * cos(a);
  let cy = handMid * sin(a);
  stroke(255);
  strokeWeight(1);
  noFill();
  push();
  beginShape();
  for (let i = 0; i <= TWO_PI; i += 0.05) {
    vertex(cx + smallR * cos(i), cy + smallR * sin(i), 0);
  }
  endShape(CLOSE);
  pop();
}

function drawSecDot() {
  let a = -HALF_PI + (millis() / 60000) * TWO_PI;
  let x = orbitR * cos(a);
  let y = orbitR * sin(a);
  push();
  noStroke();
  fill(255, 255, 255);
  emissiveMaterial(255, 255, 255);
  translate(x, y, 0);
  ellipse(0, 0, 20, 20);
  
  stroke(255); 
  strokeWeight(2);
  const r = 30;
  const s = millis() * 0.005;
  const lx = r * cos(s);
  const ly = r * sin(s);
  line(lx, ly, 0, -lx, -ly, 0);
  
  pop();
}

class Hand {
  constructor(x, y, z, br, hr, np) {
    this.pos = createVector(x, y, z);
    this.base = br;
    this.handR = hr;
    this.pts = np;
  }
  draw() {
    let h = hour();
    let m = minute();
    let hp = (h % 12) + m / 60;
    let idx = floor(hp * 5) % this.pts;
    stroke(255);
    strokeWeight(1);
    noFill();
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    beginShape();
    let xo = 0;
    for (let i = 0; i < this.pts; i++) {
      let a = -HALF_PI + (i * TWO_PI / this.pts);
      let off = map(noise(xo, tick), 0, 1, -10, 10);
      let r = ((i === idx) ? this.handR : this.base) + off;
      vertex(r * cos(a), r * sin(a), 0);
      xo += 0.1;
    }
    endShape(CLOSE);
    pop();
  }
}

class Blob {
  constructor(x, y, z, r) {
    this.pos = createVector(x, y, z);
    this.rad = r;
  }
  draw1() {
    stroke(255, 255, 255);
    strokeWeight(1);
    noFill();
    const rx = frameCount * 0.01 + turnY;
    const ry = frameCount * 0.005 + turnX;
    push();
    rotateX(rx);
    rotateY(ry);
    translate(this.pos.x, this.pos.y, this.pos.z);
    beginShape();
    let xo = 0;
    for (let i = 0; i < 6; i++) {
      let a = (i / 6) * TWO_PI;
      let wx = this.rad * cos(a);
      let wy = this.rad * sin(a);
      let wrx = wx * cos(ry);
      let wry = wy * cos(rx);
      let h = nearMouse(wrx, wry);
      let wob = h * 6 * sin(a * 4 + frameCount * 0.08);
      let r = this.rad + map(noise(xo, tick), 0, 1, -10, 10) + wob;
      vertex(r * cos(a), r * sin(a), 0);
      xo += 1.0;
    }
    endShape(CLOSE);
    pop();
  }
  draw2() {
    stroke(255);
    strokeWeight(1);
    noFill();
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    beginShape();
    let xo = 0;
    for (let a = 0; a < TWO_PI; a += 0.3) {
      let wx = this.rad * cos(a);
      let wy = this.rad * sin(a);
      let h = nearMouse(wx, wy);
      let wob = h * 3 * sin(a * 3 + frameCount * 0.06);
      let r = this.rad + map(noise(xo, tick), 0, 1, -2, 2) + wob;
      vertex(r * cos(a), r * sin(a), 0);
      xo += 0.3;
    }
    endShape(CLOSE);
    pop();
  }
  draw3() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    stroke(255, 255, 255);
    strokeWeight(1);
    let xo = 0;
    const n = 60;
    const bl = 20;
    for (let i = 0; i < n; i++) {
      let a = map(i, 0, n, 0, TWO_PI);
      let wx = this.rad * cos(a);
      let wy = this.rad * sin(a);
      let h = nearMouse(wx, wy);
      let r = this.rad + map(noise(xo, tick), 0, 1, -10, 10) + h * 5 * sin(frameCount * 0.1 + i * 0.2);
      let l = bl + h * (bl * 3);
      line(r * cos(a), r * sin(a), 0, (r - l) * cos(a), (r - l) * sin(a), 0);
      xo += 0.1;
    }
    pop();
  }
  draw4() {
    const rx = frameCount * 0.001;
    const ry = frameCount * 0.0005;
    push();
    rotateX(rx);
    rotateY(ry);
    translate(this.pos.x, this.pos.y, this.pos.z);
    stroke(255, 255, 255);
    strokeWeight(1);
    let xo = 0;
    const n = 60;
    const dl = 20;
    for (let i = 0; i < n; i++) {
      let a = map(i, 0, n, 0, TWO_PI);
      let wx = this.rad * cos(a);
      let wy = this.rad * sin(a);
      let wrx = wx * cos(ry);
      let wry = wy * cos(rx);
      let h = nearMouse(wrx, wry);
      let wob = h * 6 * sin(a * 2 + frameCount * 0.07);
      let r = this.rad + map(noise(xo, tick), 0, 1, -15, 15) + wob;
      line(r * cos(a), r * sin(a), 0, (r + dl) * cos(a), (r + dl) * sin(a), 0);
      xo += 0.1;
    }
    pop();
  }
}

class Star {
  constructor(x, y, l, ph, f) {
    this.rad = dist(0, 0, x, y);
    this.ang = atan2(y, x);
    this.spd = random(0.000005, 0.00002) * (random() < 0.5 ? 1 : -1);
    this.len = l;
    this.phase = ph;
    this.freqs = f || [1.0, 1.4, 0.8, 1.2];
  }
  draw() {
    const ca = this.ang + millis() * this.spd;
    const px = this.rad * cos(ca);
    const py = this.rad * sin(ca);
    const t = millis() * 0.001;
    const u1 = 1 + 0.15 * sin(t * this.freqs[0] + this.phase);
    const u2 = 1 + 0.15 * sin(t * this.freqs[1] + this.phase);
    const u3 = 1 + 0.15 * sin(t * this.freqs[2] + this.phase);
    const u4 = 1 + 0.15 * sin(t * this.freqs[3] + this.phase);
    
    stroke(255);
    strokeWeight(1);
    
    const dx = this.len * u1;
    line(px - dx, py, 0, px + dx, py, 0);

    const perp = k2 * k5 * u2;
    line(px, py - perp, 0, px, py + perp, 0);

    const a3 = QUARTER_PI;
    const d3 = k3 * k5 * u3;
    line(px - d3 * cos(a3), py - d3 * sin(a3), 0, px + d3 * cos(a3), py + d3 * sin(a3), 0);

    const a4 = a3 + HALF_PI;
    const d4 = k4 * k5 * u4;
    line(px - d4 * cos(a4), py - d4 * sin(a4), 0, px + d4 * cos(a4), py + d4 * sin(a4), 0);
  }
}