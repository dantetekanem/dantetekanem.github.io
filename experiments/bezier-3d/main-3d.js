import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Line2 } from 'three/lines/Line2';
import { LineGeometry } from 'three/lines/LineGeometry';
import { LineMaterial } from 'three/lines/LineMaterial';

// ── Scene setup ────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0a12, 0.015);

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 200);
camera.position.set(0, 8, 18);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x0a0a12);
document.body.appendChild(renderer.domElement);

// ── Orbit controls (left-click rotates, right-click pans) ─────────
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
orbit.enableDamping = true;
orbit.dampingFactor = 0.08;
orbit.target.set(0, 2, 0);

// ── Lights ─────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0x334466, 0.6));
const dirLight = new THREE.DirectionalLight(0xaaccff, 0.8);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// ── Ground grid ────────────────────────────────────────────────────
const grid = new THREE.GridHelper(30, 30, 0x1a1a2e, 0x111122);
scene.add(grid);

// ── Control points ─────────────────────────────────────────────────
const pointDefs = {
  A: { pos: new THREE.Vector3(-6, 1, 3), color: 0x44aaff, label: 'A' },
  C: { pos: new THREE.Vector3(0, 6, -2), color: 0xffaa44, label: 'C' },
  B: { pos: new THREE.Vector3(6, 1, -3), color: 0xff4444, label: 'B' },
};

const spheres = {};
const sphereGroup = new THREE.Group();
scene.add(sphereGroup);

for (const [key, def] of Object.entries(pointDefs)) {
  // Glow sphere
  const glowGeo = new THREE.SphereGeometry(0.6, 24, 24);
  const glowMat = new THREE.MeshBasicMaterial({
    color: def.color, transparent: true, opacity: 0.15,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);

  // Solid sphere
  const geo = new THREE.SphereGeometry(0.35, 24, 24);
  const mat = new THREE.MeshStandardMaterial({
    color: def.color, emissive: def.color, emissiveIntensity: 0.4,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.add(glow);
  mesh.position.copy(def.pos);
  mesh.userData = { key, draggable: true };

  sphereGroup.add(mesh);
  spheres[key] = mesh;
}

// ── Bezier curve line ──────────────────────────────────────────────
const CURVE_POINTS = 80;
const curveGeo = new THREE.BufferGeometry();
const curvePositions = new Float32Array(CURVE_POINTS * 3);
curveGeo.setAttribute('position', new THREE.BufferAttribute(curvePositions, 3));
const curveMat = new THREE.LineBasicMaterial({ color: 0x334455, transparent: true, opacity: 0.5 });
const curveLine = new THREE.Line(curveGeo, curveMat);
scene.add(curveLine);

// Control arms (dashed)
const armGeo = new THREE.BufferGeometry();
const armPositions = new Float32Array(4 * 3); // 4 vertices: A, C, C, B
armGeo.setAttribute('position', new THREE.BufferAttribute(armPositions, 3));
const armMat = new THREE.LineDashedMaterial({ color: 0x2a2a3e, dashSize: 0.3, gapSize: 0.2 });
const armLine = new THREE.LineSegments(armGeo, armMat);
scene.add(armLine);

function updateCurve() {
  const a = spheres.A.position;
  const c = spheres.C.position;
  const b = spheres.B.position;

  for (let i = 0; i < CURVE_POINTS; i++) {
    const t = i / (CURVE_POINTS - 1);
    const mt = 1 - t;
    const idx = i * 3;
    curvePositions[idx]     = mt*mt*a.x + 2*mt*t*c.x + t*t*b.x;
    curvePositions[idx + 1] = mt*mt*a.y + 2*mt*t*c.y + t*t*b.y;
    curvePositions[idx + 2] = mt*mt*a.z + 2*mt*t*c.z + t*t*b.z;
  }
  curveGeo.attributes.position.needsUpdate = true;

  // arms
  armPositions[0] = a.x; armPositions[1] = a.y; armPositions[2] = a.z;
  armPositions[3] = c.x; armPositions[4] = c.y; armPositions[5] = c.z;
  armPositions[6] = c.x; armPositions[7] = c.y; armPositions[8] = c.z;
  armPositions[9] = b.x; armPositions[10] = b.y; armPositions[11] = b.z;
  armGeo.attributes.position.needsUpdate = true;
  armLine.computeLineDistances();
}

// ── Projectile ─────────────────────────────────────────────────────
const projGeo = new THREE.SphereGeometry(0.2, 16, 16);
const projMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const projectile = new THREE.Mesh(projGeo, projMat);
projectile.visible = false;
scene.add(projectile);

// projectile glow
const projGlowGeo = new THREE.SphereGeometry(0.5, 16, 16);
const projGlowMat = new THREE.MeshBasicMaterial({ color: 0x66aaff, transparent: true, opacity: 0.3 });
const projGlow = new THREE.Mesh(projGlowGeo, projGlowMat);
projectile.add(projGlow);

// ── Trail (fat lines) ──────────────────────────────────────────────
const MAX_TRAIL = 120;
const trailMatFat = new LineMaterial({
  color: 0x66aaff,
  linewidth: 4,
  vertexColors: true,
  transparent: true,
  opacity: 0.9,
  worldUnits: false,
  alphaToCoverage: false,
});
let trailLineFat = null;
let trailPoints = [];

function updateTrail() {
  const count = trailPoints.length;

  // remove old line
  if (trailLineFat) {
    scene.remove(trailLineFat);
    trailLineFat.geometry.dispose();
    trailLineFat = null;
  }

  if (count < 2) return;

  const positions = [];
  const colors = [];
  for (let i = 0; i < count; i++) {
    positions.push(trailPoints[i].x, trailPoints[i].y, trailPoints[i].z);
    const alpha = i / (count - 1);
    colors.push(0.4 * alpha, 0.65 * alpha, 1.0 * alpha);
  }

  const geo = new LineGeometry();
  geo.setPositions(positions);
  geo.setColors(colors);

  trailLineFat = new Line2(geo, trailMatFat);
  trailLineFat.computeLineDistances();
  scene.add(trailLineFat);
}

// ── Impact particles ───────────────────────────────────────────────
const PARTICLE_COUNT = 40;
const particleGeo = new THREE.BufferGeometry();
const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
const particleSizes = new Float32Array(PARTICLE_COUNT);
particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
particleGeo.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

const particleMat = new THREE.PointsMaterial({
  color: 0x66aaff, size: 0.3, transparent: true, opacity: 1,
  blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
});
const particleSystem = new THREE.Points(particleGeo, particleMat);
particleSystem.visible = false;
scene.add(particleSystem);

let particles = [];

function spawnImpact(pos) {
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const dir = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
    ).normalize().multiplyScalar(1.5 + Math.random() * 3);
    particles.push({
      pos: pos.clone(),
      vel: dir,
      life: 1,
      decay: 0.015 + Math.random() * 0.025,
      size: 0.15 + Math.random() * 0.25,
    });
  }
  particleSystem.visible = true;
}

function updateParticles(dt) {
  for (const p of particles) {
    p.pos.add(p.vel.clone().multiplyScalar(dt));
    p.vel.multiplyScalar(0.96);
    p.life -= p.decay;
  }
  particles = particles.filter(p => p.life > 0);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const idx = i * 3;
    if (i < particles.length) {
      particlePositions[idx]     = particles[i].pos.x;
      particlePositions[idx + 1] = particles[i].pos.y;
      particlePositions[idx + 2] = particles[i].pos.z;
      particleSizes[i] = particles[i].size * particles[i].life;
    } else {
      particlePositions[idx] = particlePositions[idx+1] = particlePositions[idx+2] = 0;
      particleSizes[i] = 0;
    }
  }
  particleGeo.attributes.position.needsUpdate = true;
  particleGeo.attributes.size.needsUpdate = true;
  particleMat.opacity = particles.length > 0 ? 1 : 0;

  if (particles.length === 0) particleSystem.visible = false;
}

// ── Impact flash (point light) ─────────────────────────────────────
const flashLight = new THREE.PointLight(0x66aaff, 0, 12);
scene.add(flashLight);

// ── Easing ─────────────────────────────────────────────────────────
function easeFF12(t) {
  return t * t * (3 - 2 * t) * 0.4 + t * t * 0.6;
}

// ── Bezier eval ────────────────────────────────────────────────────
function bezierPoint(t) {
  const a = spheres.A.position;
  const c = spheres.C.position;
  const b = spheres.B.position;
  const mt = 1 - t;
  return new THREE.Vector3(
    mt*mt*a.x + 2*mt*t*c.x + t*t*b.x,
    mt*mt*a.y + 2*mt*t*c.y + t*t*b.y,
    mt*mt*a.z + 2*mt*t*c.z + t*t*b.z,
  );
}

// ── Animation state ────────────────────────────────────────────────
const anim = {
  active: false,
  t: 0,
  phase: 'idle',
  looping: true,
  impactTimer: 0,
};

function fireAnim() {
  anim.active = true;
  anim.t = 0;
  anim.phase = 'travel';
  anim.impactTimer = 0;
  trailPoints = [];
  projectile.visible = true;
  particles = [];
}

// Start looping immediately
fireAnim();

document.getElementById('btnFire').addEventListener('click', () => {
  anim.looping = false;
  document.getElementById('btnLoop').classList.remove('active');
  fireAnim();
});

const btnLoop = document.getElementById('btnLoop');
btnLoop.addEventListener('click', () => {
  anim.looping = !anim.looping;
  btnLoop.classList.toggle('active', anim.looping);
  if (anim.looping && !anim.active) fireAnim();
});

// ── Drag (raycaster on left-click) ─────────────────────────────────
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const dragPlane = new THREE.Plane();
const intersection = new THREE.Vector3();
let dragTarget = null;
let dragOffset = new THREE.Vector3();

// Shift+click to drag spheres, plain click for orbit
renderer.domElement.addEventListener('pointerdown', e => {
  if (e.button !== 0 || !e.shiftKey) return;
  mouse.x = (e.clientX / innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const hits = raycaster.intersectObjects(sphereGroup.children, true);
  if (hits.length > 0) {
    let obj = hits[0].object;
    while (obj.parent && !obj.userData.draggable) obj = obj.parent;
    if (obj.userData.draggable) {
      dragTarget = obj;
      orbit.enabled = false;
      const camDir = camera.getWorldDirection(new THREE.Vector3());
      dragPlane.setFromNormalAndCoplanarPoint(camDir.negate(), dragTarget.position);
      raycaster.ray.intersectPlane(dragPlane, intersection);
      dragOffset.copy(dragTarget.position).sub(intersection);
      renderer.domElement.setPointerCapture(e.pointerId);
    }
  }
});

renderer.domElement.addEventListener('pointermove', e => {
  if (!dragTarget) return;
  mouse.x = (e.clientX / innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  raycaster.ray.intersectPlane(dragPlane, intersection);
  dragTarget.position.copy(intersection.add(dragOffset));
});

renderer.domElement.addEventListener('pointerup', () => {
  dragTarget = null;
  orbit.enabled = true;
});

// ── Resize ─────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  trailMatFat.resolution.set(innerWidth, innerHeight);
});
trailMatFat.resolution.set(innerWidth, innerHeight);

// ── Main loop ──────────────────────────────────────────────────────
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const speed = parseFloat(document.getElementById('speed').value);

  orbit.update();
  updateCurve();

  // Animation
  if (anim.active) {
    if (anim.phase === 'travel') {
      anim.t += dt * speed * 0.8;
      if (anim.t >= 1) {
        anim.t = 1;
        anim.phase = 'impact';
        anim.impactTimer = 0;
        projectile.visible = false;
        const impactPos = spheres.B.position.clone();
        spawnImpact(impactPos);
        flashLight.position.copy(impactPos);
        flashLight.intensity = 8;
      }

      const easedT = easeFF12(Math.min(anim.t, 1));
      const pos = bezierPoint(easedT);
      projectile.position.copy(pos);

      trailPoints.push(pos.clone());
      if (trailPoints.length > MAX_TRAIL) trailPoints.shift();
    }

    if (anim.phase === 'impact') {
      anim.impactTimer += dt;
      updateParticles(dt);

      // fade flash
      flashLight.intensity = Math.max(0, 8 * (1 - anim.impactTimer * 3));

      // fade trail
      if (trailPoints.length > 0 && anim.impactTimer > 0.15) {
        const removeCount = Math.ceil(trailPoints.length * dt * 3);
        trailPoints.splice(0, removeCount);
      }

      if (anim.impactTimer > 1.5) {
        if (anim.looping) {
          fireAnim();
        } else {
          anim.active = false;
          anim.phase = 'idle';
          trailPoints = [];
          flashLight.intensity = 0;
        }
      }
    }
  }

  updateTrail();

  // pulse projectile glow
  if (projectile.visible) {
    projGlow.scale.setScalar(1 + Math.sin(clock.elapsedTime * 8) * 0.2);
  }

  renderer.render(scene, camera);
}

animate();
