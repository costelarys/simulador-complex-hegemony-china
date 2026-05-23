/**
 * COMPLEX HEGEMONY — Dynamic Vortex Simulation Engine
 * High-DPI canvas, requestAnimationFrame loop, modular particle system
 */
 
'use strict';
 
/* ══════════════════════════════════════════
   1. CANVAS SETUP & HiDPI SCALING
══════════════════════════════════════════ */
const canvas  = document.getElementById('vortex-canvas');
const ctx     = canvas.getContext('2d');
let   W, H, cx, cy, dpr;
 
function resizeCanvas() {
  dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  W = rect.width;
  H = rect.height;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  ctx.scale(dpr, dpr);
  cx = W / 2;
  cy = H / 2;
  document.getElementById('dpr-display').textContent = dpr.toFixed(1);
}
 
window.addEventListener('resize', () => { resizeCanvas(); rebuildParticles(); });
resizeCanvas();
 
 
/* ══════════════════════════════════════════
   2. SIMULATION STATE
══════════════════════════════════════════ */
const state = {
  lockIn:   3,   // Downward Causation slider
  flow:     3,   // Relational Power slider
  dist:     1,   // Systemic Disturbances slider
  phase:    false,
  tick:     0,
  frameNum: 0,
};
 
// Orbit ring definitions
const ORBITS = [
  { label: 'TECHNOLOGICAL DOMAIN',        color: '#00e5ff', baseRadius: 0.22 },
  { label: 'ECONOMIC DOMAIN',             color: '#00ff88', baseRadius: 0.33 },
  { label: 'MILITARY DOMAIN',             color: '#ff6b35', baseRadius: 0.44 },
  { label: 'POLITICAL / IDEOLOGICAL',     color: '#c77dff', baseRadius: 0.54 },
];
 
/* ══════════════════════════════════════════
   3. PARTICLE SYSTEM
══════════════════════════════════════════ */
const PARTICLE_COUNTS = [14, 17, 20, 21]; // per orbit
let particles = [];
 
class Particle {
  constructor(orbitIndex) {
    this.orbitIndex  = orbitIndex;
    this.orbit       = ORBITS[orbitIndex];
    this.baseAngle   = Math.random() * Math.PI * 2;
    this.angle       = this.baseAngle;
    this.radiusNoise = (Math.random() - 0.5) * 28;
    this.speedMult   = 0.6 + Math.random() * 0.8;
    this.size        = 1.5 + Math.random() * 2.5;
    this.opacity     = 0.55 + Math.random() * 0.45;
    this.noisePhase  = Math.random() * Math.PI * 2;
    this.noiseFreq   = 0.4 + Math.random() * 0.6;
    this.trailLen    = Math.floor(3 + Math.random() * 8);
    this.trail       = [];
    this.hue         = 0; // used during phase shift
  }
 
  update(dt) {
    const baseR   = this.orbit.baseRadius * Math.min(W, H) * 0.5;
    const lockIn  = state.lockIn;
    const distVal = state.dist;
 
    // Lockup pulls radius inward
    const lockPull    = 1 - (lockIn / 8) * 0.55;
    // Disturbances add turbulence
    const turbulence  = distVal > 0
      ? Math.sin(state.tick * this.noiseFreq + this.noisePhase) * distVal * 6
      : 0;
 
    this.currentRadius = (baseR + this.radiusNoise + turbulence) * lockPull;
    this.currentRadius = Math.max(20, this.currentRadius);
 
    // Angular speed: flow slider drives base speed
    const baseSpeed = (0.004 + state.flow * 0.0012) * this.speedMult;
    // Disturbances add angular jitter
    const jitter    = distVal > 4
      ? Math.sin(state.tick * 0.5 + this.noisePhase) * 0.003 * distVal
      : 0;
    this.angle     += (baseSpeed + jitter) * dt * 60;
 
    const x = cx + Math.cos(this.angle) * this.currentRadius;
    const y = cy + Math.sin(this.angle) * this.currentRadius;
    this.x = x; this.y = y;
 
    this.trail.push({ x, y });
    if (this.trail.length > this.trailLen) this.trail.shift();
  }
 
  draw() {
    const col    = state.phase
      ? `hsl(${(state.tick * 1.2 + this.orbitIndex * 60) % 360}, 90%, 65%)`
      : this.orbit.color;
 
    // Trail
    if (this.trail.length > 1) {
      for (let i = 1; i < this.trail.length; i++) {
        const t   = i / this.trail.length;
        const p0  = this.trail[i - 1];
        const p1  = this.trail[i];
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.strokeStyle = hexToRgba(col, t * this.opacity * 0.5);
        ctx.lineWidth   = this.size * t * 0.6;
        ctx.stroke();
      }
    }
 
    // Particle glow
    const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3.5);
    grd.addColorStop(0, hexToRgba(col, this.opacity));
    grd.addColorStop(1, hexToRgba(col, 0));
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 3.5, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();
 
    // Core dot
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(col, this.opacity);
    ctx.fill();
  }
}
 
function rebuildParticles() {
  particles = [];
  PARTICLE_COUNTS.forEach((count, oi) => {
    for (let i = 0; i < count; i++) particles.push(new Particle(oi));
  });
}
 
rebuildParticles();
 
 
/* ══════════════════════════════════════════
   4. DRAWING HELPERS
══════════════════════════════════════════ */
function hexToRgba(hex, alpha) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
 
/* Draw orbit rings */
function drawOrbitRings() {
  ORBITS.forEach((orbit, i) => {
    const r = orbit.baseRadius * Math.min(W, H) * 0.5 * (1 - (state.lockIn / 8) * 0.55);
    const safeR = Math.max(22, r);
 
    // Ring glow
    ctx.beginPath();
    ctx.arc(cx, cy, safeR, 0, Math.PI * 2);
    ctx.strokeStyle = hexToRgba(orbit.color, state.phase ? 0.3 : 0.12);
    ctx.lineWidth   = state.phase ? 1.5 : 0.8;
    ctx.setLineDash([6, 10]);
    ctx.stroke();
    ctx.setLineDash([]);
 
    // Label — positioned at top of ring
    const labelAngle = -Math.PI / 2 + state.tick * 0.0003 * (i + 1);
    const lx = cx + Math.cos(labelAngle) * safeR;
    const ly = cy + Math.sin(labelAngle) * safeR - 8;
 
    ctx.save();
    ctx.translate(lx, ly);
    ctx.font      = `${Math.round(8 * (dpr > 1 ? 1 : 1))}px 'Share Tech Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.fillStyle = hexToRgba(orbit.color, 0.7);
    ctx.fillText(orbit.label, 0, 0);
    ctx.restore();
  });
}
 
/* Draw vortex core */
function drawCore() {
  const isPhase   = state.phase;
  const lockIn    = state.lockIn;
  const baseSize  = Math.min(W, H) * 0.1;
 
  // Pulsing size
  const pulse = 1 + Math.sin(state.tick * 0.04) * 0.04;
  const coreR = baseSize * pulse;
 
  // Phase-shift color logic
  const coreColor = isPhase
    ? `hsl(${(state.tick * 0.8) % 360}, 90%, 60%)`
    : '#00e5ff';
  const innerColor = isPhase
    ? `hsl(${(state.tick * 0.8 + 60) % 360}, 100%, 80%)`
    : '#ffffff';
 
  // Outer glow rings
  for (let g = 4; g >= 1; g--) {
    const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * (1 + g * 0.55));
    gr.addColorStop(0,   hexToRgba(coreColor, 0.04 * g));
    gr.addColorStop(0.5, hexToRgba(coreColor, 0.02 * g));
    gr.addColorStop(1,   hexToRgba(coreColor, 0));
    ctx.beginPath();
    ctx.arc(cx, cy, coreR * (1 + g * 0.55), 0, Math.PI * 2);
    ctx.fillStyle = gr;
    ctx.fill();
  }
 
  // Lock-in ring: grows as lockIn increases
  if (lockIn > 0) {
    const lkR = coreR * (1.3 + lockIn * 0.12);
    ctx.beginPath();
    ctx.arc(cx, cy, lkR, 0, Math.PI * 2);
    ctx.strokeStyle = hexToRgba(coreColor, 0.25 * (lockIn / 8));
    ctx.lineWidth   = 1.5;
    ctx.stroke();
  }
 
  // Core fill
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
  grad.addColorStop(0,   innerColor);
  grad.addColorStop(0.3, coreColor);
  grad.addColorStop(0.7, hexToRgba(coreColor, 0.6));
  grad.addColorStop(1,   hexToRgba(coreColor, 0.1));
  ctx.beginPath();
  ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
 
  // Border
  ctx.beginPath();
  ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
  ctx.strokeStyle = hexToRgba(coreColor, 0.9);
  ctx.lineWidth   = 1.5;
  ctx.stroke();
 
  // Labels
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
 
  ctx.font      = `900 ${Math.max(11, coreR * 0.25)}px 'Orbitron', monospace`;
  ctx.fillStyle = isPhase ? `hsl(${(state.tick * 0.8 + 180) % 360}, 100%, 85%)` : '#ffffff';
  ctx.shadowColor = coreColor;
  ctx.shadowBlur  = 12;
  ctx.fillText('COMPLEX HEGEMONY', cx, cy - coreR * 0.18);
 
  ctx.font      = `400 ${Math.max(8, coreR * 0.18)}px 'Share Tech Mono', monospace`;
  ctx.fillStyle = hexToRgba(coreColor, 0.85);
  ctx.shadowBlur = 6;
  ctx.fillText('[GRAMSCIAN CONSENT]', cx, cy + coreR * 0.2);
 
  ctx.shadowBlur = 0;
}
 
/* Draw connection lines from core to nearby particles */
function drawConnections() {
  const threshold = Math.min(W, H) * 0.18;
  particles.forEach(p => {
    const dx   = p.x - cx;
    const dy   = p.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < threshold) {
      const t = 1 - dist / threshold;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = hexToRgba(p.orbit.color, t * 0.25);
      ctx.lineWidth   = t * 1.2;
      ctx.stroke();
    }
  });
}
 
/* Background field lines / vortex streaks */
function drawFieldLines() {
  const numLines = 24;
  const maxR     = Math.min(W, H) * 0.6;
  for (let i = 0; i < numLines; i++) {
    const angle  = (i / numLines) * Math.PI * 2 + state.tick * 0.002;
    const alpha  = 0.03 + (state.lockIn / 8) * 0.04;
    const endX   = cx + Math.cos(angle) * maxR;
    const endY   = cy + Math.sin(angle) * maxR;
 
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
    ctx.lineWidth   = 0.5;
    ctx.stroke();
  }
}
 
 
/* ══════════════════════════════════════════
   5. MAIN ANIMATION LOOP
══════════════════════════════════════════ */
let lastTime = 0;
 
function animate(ts) {
  const dt   = Math.min((ts - lastTime) / 16.67, 3);
  lastTime   = ts;
  state.tick += dt;
  state.frameNum++;
 
  // Update phase state
  state.phase = state.dist > 4;
 
  // Background fade (motion blur effect)
  ctx.fillStyle = 'rgba(5, 10, 14, 0.25)';
  ctx.fillRect(0, 0, W, H);
 
  // Draw layers
  drawFieldLines();
  drawOrbitRings();
  drawConnections();
 
  particles.forEach(p => { p.update(dt); p.draw(); });
 
  drawCore();
 
  // HUD frame counter
  document.getElementById('frame-counter').textContent = state.frameNum;
 
  requestAnimationFrame(animate);
}
 
requestAnimationFrame(ts => { lastTime = ts; animate(ts); });
 
 
/* ══════════════════════════════════════════
   6. SLIDER CONTROLS
══════════════════════════════════════════ */
function bindSlider(id, fillId, valId, stateKey) {
  const slider = document.getElementById(id);
  const fill   = document.getElementById(fillId);
  const valEl  = document.getElementById(valId);
 
  function update() {
    const v = parseFloat(slider.value);
    state[stateKey] = v;
    const pct = (v / parseFloat(slider.max)) * 100;
    valEl.textContent = v.toFixed(1);
    updateHUD();
  }
 
  slider.addEventListener('input', update);
  update(); // init
}
 
bindSlider('slider-lockin', 'fill-lockin', 'val-lockin', 'lockIn');
bindSlider('slider-flow',   'fill-flow',   'val-flow',   'flow');
bindSlider('slider-dist',   'fill-dist',   'val-dist',   'dist');
 
 
/* ══════════════════════════════════════════
   7. HUD LOGIC
══════════════════════════════════════════ */
const SPATIAL_STATES = {
  A: 'State A (Cold War Bipolarity): Geopolitical containment rings',
  B: 'State B (US Unipolarity): Institutional path-dependencies and financial networks',
  C: 'State C (Multipolarity): BRI and Digital Silk Road reconfiguring flows',
};
 
function updateHUD() {
  const { lockIn, dist } = state;
 
  // Spatial Fix text
  let spatialText, spatialClass;
  if (dist > 4) {
    spatialText  = SPATIAL_STATES.C;
    spatialClass = 'accent-red';
  } else if (lockIn > 4 && dist <= 4) {
    spatialText  = SPATIAL_STATES.B;
    spatialClass = 'accent-cyan';
  } else {
    spatialText  = SPATIAL_STATES.A;
    spatialClass = '';
  }
 
  const spatialEl = document.getElementById('hud-spatial');
  spatialEl.textContent  = spatialText;
  spatialEl.className    = 'hud-value hud-spatial';
  if (spatialClass) spatialEl.classList.add(spatialClass);
 
  // Phase status
  const phaseEl = document.getElementById('hud-phase');
  const alertEl = document.getElementById('phase-alert');
  if (dist > 4) {
    phaseEl.textContent = 'PHASE SHIFT';
    phaseEl.className   = 'hud-value accent-red';
    alertEl.classList.remove('hidden');
  } else if (lockIn > 5) {
    phaseEl.textContent = 'ENTRENCHMENT';
    phaseEl.className   = 'hud-value accent-cyan';
    alertEl.classList.add('hidden');
  } else {
    phaseEl.textContent = 'STABLE';
    phaseEl.className   = 'hud-value accent-green';
    alertEl.classList.add('hidden');
  }
 
  // Entity count (cosmetic responsiveness)
  const baseCount = 72;
  const extra     = Math.round(state.flow * 3);
  document.getElementById('hud-entities').textContent = `${baseCount + extra} NODES ACTIVE`;
}
 
// Initial HUD render
updateHUD();
 
