// ── Setup ──────────────────────────────────────────────────────────
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
let W, H;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// ── Points ─────────────────────────────────────────────────────────
// A = character (source), B = enemy (target), C = control
const points = {
  A: { x: 0, y: 0, label: 'A', color: '#4af' },
  C: { x: 0, y: 0, label: 'C', color: '#fa4' },
  B: { x: 0, y: 0, label: 'B', color: '#f44' },
};

function resetPoints() {
  points.A.x = W * 0.2;  points.A.y = H * 0.65;
  points.B.x = W * 0.8;  points.B.y = H * 0.35;
  points.C.x = W * 0.5;  points.C.y = H * 0.15;
}
resetPoints();

// ── Drag ───────────────────────────────────────────────────────────
const RADIUS = 14;
let dragging = null;

function getHovered(mx, my) {
  for (const key of ['A', 'C', 'B']) {
    const p = points[key];
    if (Math.hypot(mx - p.x, my - p.y) < RADIUS + 6) return key;
  }
  return null;
}

canvas.addEventListener('pointerdown', e => {
  const hit = getHovered(e.clientX, e.clientY);
  if (hit) { dragging = hit; canvas.setPointerCapture(e.pointerId); }
});
canvas.addEventListener('pointermove', e => {
  if (dragging) {
    points[dragging].x = e.clientX;
    points[dragging].y = e.clientY;
  }
  canvas.style.cursor = getHovered(e.clientX, e.clientY) ? 'grab' : 'default';
});
canvas.addEventListener('pointerup', () => { dragging = null; });

// ── Quadratic Bezier helpers ───────────────────────────────────────
// Evaluates position on a quadratic Bezier curve at parameter t (0..1).
//   t  = progress along the curve (0 = start, 1 = end)
//   a  = start point (character / source)
//   c  = control point (pulls the curve toward it)
//   b  = end point (enemy / target)
//   mt = "one minus t", the complement of t
// Formula: B(t) = (1−t)² · a  +  2(1−t)t · c  +  t² · b
function bezierPoint(t, a, c, b) {
  const mt = 1 - t; // complement of t
  return {
    x: mt * mt * a.x + 2 * mt * t * c.x + t * t * b.x,
    y: mt * mt * a.y + 2 * mt * t * c.y + t * t * b.y,
  };
}

// ── Animation state ────────────────────────────────────────────────
let anim = {
  active: false,
  t: 0,
  phase: 'travel', // 'travel' | 'impact' | 'idle'
  looping: true,
  impactTimer: 0,
  particles: [],
  trail: [],
};

function fireAnim() {
  anim.active = true;
  anim.t = 0;
  anim.phase = 'travel';
  anim.impactTimer = 0;
  anim.particles = [];
  anim.trail = [];
}

document.getElementById('btnFire').addEventListener('click', () => {
  anim.looping = false;
  document.getElementById('btnLoop').style.borderColor = '#334';
  fireAnim();
});
const btnLoop2d = document.getElementById('btnLoop');
btnLoop2d.style.borderColor = '#6af';
btnLoop2d.addEventListener('click', () => {
  anim.looping = !anim.looping;
  btnLoop2d.style.borderColor = anim.looping ? '#6af' : '#334';
  if (anim.looping && !anim.active) fireAnim();
});

// Start looping immediately
fireAnim();

// ── Particles (impact burst) ──────────────────────────────────────
function spawnImpact(x, y) {
  for (let i = 0; i < 18; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 4;
    anim.particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.015 + Math.random() * 0.02,
      size: 2 + Math.random() * 3,
    });
  }
}

// ── Easing ─────────────────────────────────────────────────────────
// Quadratic curve targeting easing
function easeFF12(t) {
  // no dead zone at start, accelerates smoothly into target
  return t * t * (3 - 2 * t) * 0.4 + t * t * 0.6;
}

// ── Draw helpers ───────────────────────────────────────────────────
function expandHex(c) {
  if (c.length === 4) return '#' + c[1]+c[1] + c[2]+c[2] + c[3]+c[3];
  return c;
}

function drawDot(p) {
  const col = expandHex(p.color);
  const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, RADIUS + 8);
  grad.addColorStop(0, col + '44');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(p.x, p.y, RADIUS + 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, RADIUS, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px Courier New';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(p.label, p.x, p.y);
}

function drawCurve() {
  ctx.strokeStyle = '#334';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.moveTo(points.A.x, points.A.y);
  ctx.quadraticCurveTo(points.C.x, points.C.y, points.B.x, points.B.y);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawTrail() {
  const trail = anim.trail;
  if (trail.length < 2) return;

  for (let i = 1; i < trail.length; i++) {
    const alpha = (i / trail.length);
    const width = 1 + alpha * 3;

    ctx.strokeStyle = `rgba(100, 170, 255, ${alpha * 0.8})`;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
    ctx.lineTo(trail[i].x, trail[i].y);
    ctx.stroke();

    ctx.strokeStyle = `rgba(100, 170, 255, ${alpha * 0.2})`;
    ctx.lineWidth = width + 4;
    ctx.beginPath();
    ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
    ctx.lineTo(trail[i].x, trail[i].y);
    ctx.stroke();
  }
}

function drawProjectile(pos) {
  const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 10);
  grad.addColorStop(0, '#fff');
  grad.addColorStop(0.3, '#6af');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawParticles() {
  for (const p of anim.particles) {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = '#6af';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawImpactFlash() {
  if (anim.phase !== 'impact') return;
  const alpha = Math.max(0, 1 - anim.impactTimer * 3);
  if (alpha <= 0) return;
  const grad = ctx.createRadialGradient(
    points.B.x, points.B.y, 0,
    points.B.x, points.B.y, 60
  );
  grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
  grad.addColorStop(0.4, `rgba(100, 170, 255, ${alpha * 0.5})`);
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(points.B.x, points.B.y, 60, 0, Math.PI * 2);
  ctx.fill();
}

// ── Grid background ────────────────────────────────────────────────
function drawGrid() {
  ctx.strokeStyle = '#151520';
  ctx.lineWidth = 1;
  const step = 40;
  for (let x = 0; x < W; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += step) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
}

// ── Main loop ──────────────────────────────────────────────────────
let lastTime = -1;

function frame(time) {
  if (lastTime < 0) { lastTime = time; }
  const dt = Math.min((time - lastTime) / 1000, 0.05);
  lastTime = time;

  const speed = parseFloat(document.getElementById('speed').value);
  const trailMax = parseInt(document.getElementById('trail').value);

  // Clear
  ctx.fillStyle = '#0a0a12';
  ctx.fillRect(0, 0, W, H);
  drawGrid();

  // Update animation
  if (anim.active) {
    if (anim.phase === 'travel') {
      anim.t += dt * speed * 0.8;
      if (anim.t >= 1) {
        anim.t = 1;
        anim.phase = 'impact';
        anim.impactTimer = 0;
        spawnImpact(points.B.x, points.B.y);
      }

      const easedT = easeFF12(Math.min(anim.t, 1));
      const pos = bezierPoint(easedT, points.A, points.C, points.B);

      anim.trail.push({ x: pos.x, y: pos.y });
      if (anim.trail.length > trailMax) anim.trail.shift();
    }

    if (anim.phase === 'impact') {
      anim.impactTimer += dt;
      for (const p of anim.particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.life -= p.decay;
      }
      anim.particles = anim.particles.filter(p => p.life > 0);

      if (anim.trail.length > 0 && anim.impactTimer > 0.2) {
        const removeCount = Math.ceil(anim.trail.length * dt * 3);
        anim.trail.splice(0, removeCount);
      }

      if (anim.impactTimer > 1.2) {
        if (anim.looping) {
          fireAnim();
        } else {
          anim.active = false;
          anim.phase = 'idle';
          anim.trail = [];
        }
      }
    }
  }

  // Draw
  drawCurve();
  drawTrail();

  if (anim.active && anim.phase === 'travel') {
    const easedT = easeFF12(anim.t);
    const pos = bezierPoint(easedT, points.A, points.C, points.B);
    drawProjectile(pos);
  }

  drawImpactFlash();
  drawParticles();

  for (const key of ['A', 'C', 'B']) drawDot(points[key]);

  ctx.strokeStyle = '#2a2a3e';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 4]);
  ctx.beginPath();
  ctx.moveTo(points.A.x, points.A.y);
  ctx.lineTo(points.C.x, points.C.y);
  ctx.lineTo(points.B.x, points.B.y);
  ctx.stroke();
  ctx.setLineDash([]);

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
