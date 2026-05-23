/**
 * SIMULATING COMPLEX HEGEMONY: The International System
 * ═══════════════════════════════════════════════════════
 * Modules
 *   1.  Canvas Setup & HiDPI Scaling
 *   2.  Domain Definitions Database
 *   3.  Orbit Configuration
 *   4.  Simulation State
 *   5.  Particle System
 *   6.  Drawing Utilities
 *   7.  Drawing Pipeline (background → core)
 *   8.  Canvas Click / Hit-Test
 *   9.  Modal System
 *  10.  Slider Controls & HUD Logic
 *  11.  Animation Loop & Init
 */

'use strict';

/* ═══════════════════════════════════════════════════════
   1. CANVAS SETUP & HiDPI SCALING
═══════════════════════════════════════════════════════ */
const canvas  = document.getElementById('vortex');
const ctx     = canvas.getContext('2d');
let   W, H, cx, cy, DPR, CORE_R;

function initCanvas() {
  DPR = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  W = rect.width;
  H = rect.height;

  // Physical pixel dimensions
  canvas.width  = Math.round(W * DPR);
  canvas.height = Math.round(H * DPR);

  // CSS display size
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';

  // Reset transform then apply DPR scale so all drawing uses CSS-pixel coordinates
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

  cx     = W / 2;
  cy     = H / 2;
  CORE_R = Math.min(W, H) * 0.095;

  document.getElementById('dpr-disp').textContent = DPR.toFixed(1);
}


/* ═══════════════════════════════════════════════════════
   2. DOMAIN DEFINITIONS DATABASE
═══════════════════════════════════════════════════════ */
const DOMAIN_DEFS = {
  tech: {
    title : 'Technological Power',
    color : '#22d3ee',
    body  : 'Leveraging R&D (e.g., AI, 5G) for geopolitical influence, reshaping infrastructures and creating path-dependencies where political struggles unfold. Technology becomes the medium through which hegemonic norms are both encoded and reproduced.'
  },
  econ: {
    title : 'Economic Power',
    color : '#34d399',
    body  : 'Shapes state influence, alliance formation, and hegemonic potential through transnational financial networks, market control, and economic statecraft. The hegemon\'s currency and institutions extract structural rents while appearing as neutral governance.'
  },
  mil: {
    title : 'Military Power',
    color : '#fb923c',
    body  : 'Control over the legitimate use of force, shaping perceptions and diplomacy, deeply interconnected with economic strength and soft power. Basing rights, arms networks, and alliance structures create asymmetric dependencies that enforce hegemonic order even in peacetime.'
  },
  pol: {
    title : 'Political & Ideological Power',
    color : '#c084fc',
    body  : 'Operates through strategy, discourse, and international norms to organize social groups, relying on both coercion and Gramscian consent. The most durable form of hegemony: shaping the very categories through which actors perceive their interests.'
  }
};


/* ═══════════════════════════════════════════════════════
   3. ORBIT CONFIGURATION
═══════════════════════════════════════════════════════ */
const ORBITS = [
  { label : 'TECHNOLOGICAL DOMAIN',        color : '#22d3ee', baseR : 0.23, defKey : 'tech' },
  { label : 'ECONOMIC DOMAIN',             color : '#34d399', baseR : 0.35, defKey : 'econ' },
  { label : 'MILITARY DOMAIN',             color : '#fb923c', baseR : 0.47, defKey : 'mil'  },
  { label : 'POLITICAL/IDEOLOGICAL DOMAIN',color : '#c084fc', baseR : 0.59, defKey : 'pol'  }
];

// Label angles — staggered around the top to prevent overlap
const LABEL_ANGLES = [
  -Math.PI / 2 - 0.22,   // TECH    : top-left
  -Math.PI / 2 + 0.18,   // ECON    : top-right
  -Math.PI / 2 - 0.16,   // MILITARY: slightly left
  -Math.PI / 2 + 0.12    // POL/IDEO: slightly right
];

/**
 * Returns the actual CSS-pixel orbit radius for a given orbit,
 * accounting for the current lockIn compression.
 */
function getOrbitRadius(orbit) {
  const lockIn     = SIM.lockIn;
  const lockFactor = 1 - ((lockIn - 1) / 4) * 0.42; // 1.00 at 1 → 0.58 at 5
  const base       = orbit.baseR * Math.min(W, H) * 0.5;
  return Math.max(CORE_R * 1.45, base * lockFactor);
}


/* ═══════════════════════════════════════════════════════
   4. SIMULATION STATE
═══════════════════════════════════════════════════════ */
const SIM = {
  lockIn : 2,   // slider: 1–5
  flow   : 3,   // slider: 1–5
  dist   : 1,   // slider: 1–5
  tick   : 0,   // animation clock
  frame  : 0    // frame counter
};

/** True when disturbances trigger a phase shift */
function isPhaseShift() { return SIM.dist >= 4; }


/* ═══════════════════════════════════════════════════════
   5. PARTICLE SYSTEM
═══════════════════════════════════════════════════════ */
const COUNTS_PER_ORBIT = [14, 17, 19, 21]; // ~71 total
let   particles = [];

class Particle {
  constructor(orbitIndex) {
    const o         = ORBITS[orbitIndex];
    this.oi         = orbitIndex;
    this.orbit      = o;
    this.angle      = Math.random() * Math.PI * 2;
    this.rOffset    = (Math.random() - 0.5) * 22;   // radial jitter
    this.speedMult  = 0.55 + Math.random() * 0.9;
    this.size       = 1.4 + Math.random() * 2.8;
    this.alpha      = 0.45 + Math.random() * 0.55;
    this.noisePhase = Math.random() * Math.PI * 2;
    this.noiseFreq  = 0.28 + Math.random() * 0.65;
    this.trailLen   = 3 + Math.floor(Math.random() * 9);
    this.trail      = [];
    this.x          = cx;
    this.y          = cy;
  }

  update(dt) {
    // Radial position
    const baseR     = getOrbitRadius(this.orbit) + this.rOffset;
    const chaosAmp  = ((SIM.dist - 1) / 4) * 11;
    const turbulence = chaosAmp > 0
      ? Math.sin(SIM.tick * this.noiseFreq + this.noisePhase) * chaosAmp
      : 0;
    const currentR  = Math.max(CORE_R + 8, baseR + turbulence);

    // Angular speed
    const baseSpeed = 0.0028 + ((SIM.flow - 1) / 4) * 0.0095;
    const jitter    = isPhaseShift()
      ? Math.sin(SIM.tick * 0.38 + this.noisePhase) * 0.0042 * SIM.dist
      : 0;
    this.angle += (baseSpeed + jitter) * this.speedMult * dt * 60;

    this.x = cx + Math.cos(this.angle) * currentR;
    this.y = cy + Math.sin(this.angle) * currentR;

    // Trail history
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.trailLen) this.trail.shift();
  }

  draw() {
    const col = isPhaseShift()
      ? `hsl(${(SIM.tick * 2 + this.oi * 50) % 360}, 95%, 65%)`
      : this.orbit.color;

    // Trail
    for (let i = 1; i < this.trail.length; i++) {
      const t  = i / this.trail.length;
      const p0 = this.trail[i - 1];
      const p1 = this.trail[i];
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.strokeStyle = hexAlpha(col, t * this.alpha * 0.45);
      ctx.lineWidth   = this.size * t * 0.45;
      ctx.stroke();
    }

    // Halo glow
    const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3.8);
    g.addColorStop(0, hexAlpha(col, this.alpha * 0.85));
    g.addColorStop(1, hexAlpha(col, 0));
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 3.8, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    // Solid core dot
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = hexAlpha(col, this.alpha);
    ctx.fill();
  }
}

function rebuildParticles() {
  particles = [];
  COUNTS_PER_ORBIT.forEach((n, oi) => {
    for (let i = 0; i < n; i++) particles.push(new Particle(oi));
  });
}


/* ═══════════════════════════════════════════════════════
   6. DRAWING UTILITIES
═══════════════════════════════════════════════════════ */

/** Convert hex colour + alpha → rgba() string */
function hexAlpha(hex, a) {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a))})`;
}

/**
 * Draw a text label with a solid dark background pill for maximum legibility.
 * @param {string} text        - Label text
 * @param {number} x           - Center x in CSS px
 * @param {number} y           - Center y in CSS px
 * @param {string} font        - CSS font string
 * @param {string} color       - Text / border colour (hex)
 * @param {number} bgAlpha     - Background opacity (0–1)
 */
function drawLabelWithBG(text, x, y, font, color, bgAlpha) {
  ctx.save();
  ctx.font         = font;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';

  const tw  = ctx.measureText(text).width;
  const th  = 14;
  const pad = { x: 8, y: 4 };
  const bw  = tw + pad.x * 2;
  const bh  = th + pad.y * 2;
  const bx  = x - bw / 2;
  const by  = y - bh / 2;
  const br  = 3;

  // Background pill (manual roundRect for compatibility)
  ctx.fillStyle = `rgba(9, 12, 18, ${bgAlpha})`;
  ctx.beginPath();
  ctx.moveTo(bx + br, by);
  ctx.lineTo(bx + bw - br, by);
  ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + br);
  ctx.lineTo(bx + bw, by + bh - br);
  ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - br, by + bh);
  ctx.lineTo(bx + br, by + bh);
  ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - br);
  ctx.lineTo(bx, by + br);
  ctx.quadraticCurveTo(bx, by, bx + br, by);
  ctx.closePath();
  ctx.fill();

  // Subtle border
  ctx.strokeStyle = hexAlpha(color, 0.28);
  ctx.lineWidth   = 0.8;
  ctx.stroke();

  // Text
  ctx.fillStyle   = color;
  ctx.fillText(text, x, y);

  ctx.restore();
}


/* ═══════════════════════════════════════════════════════
   7. DRAWING PIPELINE
═══════════════════════════════════════════════════════ */

/** 7a — Motion-blur fade (called at top of each frame) */
function clearFrame() {
  ctx.fillStyle = 'rgba(9, 12, 18, 0.23)';
  ctx.fillRect(0, 0, W, H);
}

/** 7b — Atmospheric radial background */
function drawAtmosphere() {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.72);
  if (isPhaseShift()) {
    g.addColorStop(0,   'rgba(90, 10, 10, 0.14)');
    g.addColorStop(0.5, 'rgba(40, 5, 5, 0.06)');
  } else {
    g.addColorStop(0,   'rgba(10, 25, 70, 0.18)');
    g.addColorStop(0.5, 'rgba(5, 12, 35, 0.06)');
  }
  g.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

/** 7c — Radial field lines emanating from core */
function drawFieldLines() {
  const n     = 26;
  const maxR  = Math.min(W, H) * 0.66;
  const alpha = 0.018 + ((SIM.lockIn - 1) / 4) * 0.028;
  const colFn = isPhaseShift()
    ? (a) => `rgba(239,68,68,${a})`
    : (a) => `rgba(59,130,246,${a})`;

  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + SIM.tick * 0.0014;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR);
    ctx.strokeStyle = colFn(alpha);
    ctx.lineWidth   = 0.55;
    ctx.stroke();
  }
}

/** 7d — Spatial Fix glowing ring (anchoring metaphor) */
function drawSpatialFixRing() {
  const pulse = 1 + Math.sin(SIM.tick * 0.048) * 0.038;
  const r     = CORE_R * 1.5 * pulse;

  // Glow halo
  const g = ctx.createRadialGradient(cx, cy, r * 0.7, cx, cy, r * 1.5);
  g.addColorStop(0,   'rgba(245,158,11, 0.10)');
  g.addColorStop(0.5, 'rgba(245,158,11, 0.04)');
  g.addColorStop(1,   'rgba(245,158,11, 0)');
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();

  // Dashed ring
  const ringAlpha = 0.3 + Math.sin(SIM.tick * 0.048) * 0.1;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(245,158,11,${ringAlpha})`;
  ctx.lineWidth   = 1.3;
  ctx.setLineDash([4, 9]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Label
  const lx = cx;
  const ly = cy - r - 7;
  drawLabelWithBG(
    'SPATIAL FIX',
    lx, ly,
    `500 9px '${document.body.style.fontFamily || 'IBM Plex Mono'}, monospace'`,
    '#f59e0b',
    0.80
  );
}

/**
 * 7e — Orbit rings.
 * Also populates `orbitHitList` for click detection.
 */
const orbitHitList = []; // updated every frame

function drawOrbitRings() {
  orbitHitList.length = 0;

  ORBITS.forEach((o, i) => {
    const r     = getOrbitRadius(o);
    const phase = isPhaseShift();
    const col   = phase
      ? `hsl(${(SIM.tick * 0.9 + i * 55) % 360}, 88%, 62%)`
      : o.color;

    // Dashed ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = hexAlpha(col, phase ? 0.32 : 0.18);
    ctx.lineWidth   = phase ? 1.8 : 1.0;
    ctx.setLineDash([5, 11]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Register for hit-testing
    orbitHitList.push({ r, defKey: o.defKey, color: col });

    // Domain label — staggered angle
    const la = LABEL_ANGLES[i];
    const lx = cx + Math.cos(la) * r;
    const ly = cy + Math.sin(la) * r - 9;
    drawLabelWithBG(
      o.label,
      lx, ly,
      `700 11px 'Barlow Condensed', 'Impact', sans-serif`,
      col,
      0.82
    );
  });
}

/** 7f — Connexion lines from core to nearby particles */
function drawConnections() {
  const thresh = Math.min(W, H) * 0.24;
  particles.forEach(p => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const d  = Math.sqrt(dx * dx + dy * dy);
    if (d < thresh) {
      const t = 1 - d / thresh;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = hexAlpha(p.orbit.color, t * 0.19);
      ctx.lineWidth   = t * 0.9;
      ctx.stroke();
    }
  });
}

/** 7g — Vortex core */
function drawCore() {
  const phase = isPhaseShift();
  const pulse = 1 + Math.sin(SIM.tick * 0.042) * 0.034;
  const r     = CORE_R * pulse;

  const cCol  = phase
    ? `hsl(${SIM.tick % 360}, 90%, 58%)`
    : '#3b82f6';
  const inner = phase
    ? `hsl(${(SIM.tick + 55) % 360}, 100%, 84%)`
    : '#bfdbfe';

  // Multi-layer outer glow rings
  for (let i = 5; i >= 1; i--) {
    const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * (1 + i * 0.58));
    gr.addColorStop(0,   hexAlpha(cCol, 0.038 * i));
    gr.addColorStop(0.6, hexAlpha(cCol, 0.015 * i));
    gr.addColorStop(1,   hexAlpha(cCol, 0));
    ctx.beginPath();
    ctx.arc(cx, cy, r * (1 + i * 0.58), 0, Math.PI * 2);
    ctx.fillStyle = gr;
    ctx.fill();
  }

  // Lock-in ring: shows structural compression
  if (SIM.lockIn > 1) {
    const lkAlpha = ((SIM.lockIn - 1) / 4) * 0.35;
    const lkR     = r * (1.28 + ((SIM.lockIn - 1) / 4) * 0.18);
    ctx.beginPath();
    ctx.arc(cx, cy, lkR, 0, Math.PI * 2);
    ctx.strokeStyle = hexAlpha(cCol, lkAlpha);
    ctx.lineWidth   = 1.5;
    ctx.stroke();
  }

  // Core fill gradient
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  grad.addColorStop(0,    inner);
  grad.addColorStop(0.38, cCol);
  grad.addColorStop(0.75, hexAlpha(cCol, 0.52));
  grad.addColorStop(1,    hexAlpha(cCol, 0.06));
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Border
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = hexAlpha(cCol, 0.80);
  ctx.lineWidth   = 1.6;
  ctx.stroke();

  // ── Core text labels ──
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';

  const titleSize = Math.max(11, r * 0.265);
  const subSize   = Math.max(8,  r * 0.165);

  // "COMPLEX HEGEMONY" — heavy text shadow for legibility
  ctx.font        = `800 ${titleSize}px 'Barlow Condensed', 'Impact', sans-serif`;
  ctx.shadowColor = 'rgba(0,0,0,0.98)';
  ctx.shadowBlur  = 14;
  ctx.fillStyle   = phase
    ? `hsl(${(SIM.tick + 175) % 360}, 100%, 92%)`
    : '#f8fafc';
  // Draw twice to saturate the shadow
  ctx.fillText('COMPLEX HEGEMONY', cx, cy - r * 0.19);
  ctx.fillText('COMPLEX HEGEMONY', cx, cy - r * 0.19);

  // "[GRAMSCIAN CONSENT]"
  ctx.font        = `500 ${subSize}px 'IBM Plex Mono', 'Courier New', monospace`;
  ctx.fillStyle   = hexAlpha(phase ? '#fca5a5' : '#93c5fd', 0.92);
  ctx.shadowBlur  = 8;
  ctx.fillText('[GRAMSCIAN CONSENT]', cx, cy + r * 0.24);

  ctx.shadowBlur = 0;
}


/* ═══════════════════════════════════════════════════════
   8. CANVAS CLICK / HIT-TEST
═══════════════════════════════════════════════════════ */
const HIT_THRESHOLD = 24; // px tolerance around ring edge

canvas.addEventListener('click', (e) => {
  const rect  = canvas.getBoundingClientRect();
  const mx    = e.clientX - rect.left;
  const my    = e.clientY - rect.top;
  const dx    = mx - cx;
  const dy    = my - cy;
  const dist  = Math.sqrt(dx * dx + dy * dy);

  let bestMatch = null;
  let bestDelta = Infinity;

  orbitHitList.forEach(hit => {
    const delta = Math.abs(dist - hit.r);
    if (delta < HIT_THRESHOLD && delta < bestDelta) {
      bestDelta = delta;
      bestMatch = hit;
    }
  });

  if (bestMatch) {
    openModal(bestMatch.defKey, bestMatch.color);
  } else {
    closeModal();
  }
});


/* ═══════════════════════════════════════════════════════
   9. MODAL SYSTEM
═══════════════════════════════════════════════════════ */
const modalBackdrop = document.getElementById('domain-modal');
const modalTitle    = document.getElementById('modal-title');
const modalBody     = document.getElementById('modal-body');
const modalOrb      = document.getElementById('modal-orb');

function openModal(defKey, orbColor) {
  const def = DOMAIN_DEFS[defKey];
  if (!def) return;

  modalTitle.textContent   = def.title;
  modalBody.textContent    = def.body;
  modalOrb.style.background = def.color;
  modalOrb.style.boxShadow  = `0 0 14px ${def.color}`;

  // Accent the title colour
  modalTitle.style.color = '#f1f5f9';

  // Left border on card
  document.getElementById('modal-card').style.borderLeftColor = def.color;
  document.getElementById('modal-card').style.borderLeftWidth = '3px';

  modalBackdrop.classList.remove('hidden');
}

function closeModal() {
  modalBackdrop.classList.add('hidden');
}

document.getElementById('modal-close').addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', (e) => {
  if (e.target === modalBackdrop) closeModal();
});

// Keyboard close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});


/* ═══════════════════════════════════════════════════════
   10. SLIDER CONTROLS & HUD LOGIC
═══════════════════════════════════════════════════════ */

/* ── Slider element references ── */
const slLockIn = document.getElementById('sl-lockin');
const slFlow   = document.getElementById('sl-flow');
const slDist   = document.getElementById('sl-dist');

const dispLockIn = document.getElementById('disp-lockin');
const dispFlow   = document.getElementById('disp-flow');
const dispDist   = document.getElementById('disp-dist');

/* ── HUD element references ── */
const hudState   = document.getElementById('hud-state');
const hudSpatial = document.getElementById('hud-spatial');
const phaseWarn  = document.getElementById('phase-warn');

/* ── Historical context strings ── */
const SPATIAL_TEXT = {
  phaseShift : 'State C (Multipolarity): BRI and Digital Silk Road reconfiguring systemic flows.',
  stateB     : 'State B (US Unipolarity): Institutional path-dependencies and globalized financial networks.',
  stateA     : 'State A (Cold War Bipolarity): Geopolitical containment rings and divided industrial blocs.',
  default    : 'Dynamic equilibrium; geographical anchoring of capital.'
};

/**
 * Read slider values into SIM state, update display values,
 * then refresh the HUD. Called on every 'input' event.
 */
function syncAndUpdate() {
  // Read values
  SIM.lockIn = parseFloat(slLockIn.value);
  SIM.flow   = parseFloat(slFlow.value);
  SIM.dist   = parseFloat(slDist.value);

  // Update numeric displays
  dispLockIn.textContent = SIM.lockIn.toFixed(1);
  dispFlow.textContent   = SIM.flow.toFixed(1);
  dispDist.textContent   = SIM.dist.toFixed(1);

  // ── HUD: System State ──
  if (isPhaseShift()) {
    hudState.textContent = 'PHASE SHIFT';
    hudState.className   = 'hud-val state-phase';
  } else {
    hudState.textContent = 'METASTABLE EQUILIBRIUM';
    hudState.className   = 'hud-val state-stable';
  }

  // ── HUD: Spatial Fix ──
  const allLow = SIM.lockIn <= 2 && SIM.flow <= 2 && SIM.dist <= 2;

  let sfText, sfClass;
  if (isPhaseShift()) {
    sfText  = SPATIAL_TEXT.phaseShift;
    sfClass = 'hud-val hud-spatial sf-c';
  } else if (SIM.lockIn >= 4 && SIM.dist <= 2) {
    sfText  = SPATIAL_TEXT.stateB;
    sfClass = 'hud-val hud-spatial sf-b';
  } else if (allLow) {
    sfText  = SPATIAL_TEXT.stateA;
    sfClass = 'hud-val hud-spatial sf-a';
  } else {
    sfText  = SPATIAL_TEXT.default;
    sfClass = 'hud-val hud-spatial sf-default';
  }
  hudSpatial.textContent = sfText;
  hudSpatial.className   = sfClass;

  // ── Phase warning banner ──
  if (isPhaseShift()) {
    phaseWarn.classList.remove('hidden');
  } else {
    phaseWarn.classList.add('hidden');
  }
}

// Attach event listeners directly to 'input' — fires on every drag
slLockIn.addEventListener('input', syncAndUpdate);
slFlow.addEventListener('input',   syncAndUpdate);
slDist.addEventListener('input',   syncAndUpdate);


/* ═══════════════════════════════════════════════════════
   11. ANIMATION LOOP & INITIALISATION
═══════════════════════════════════════════════════════ */
let lastTs = 0;

function frame(ts) {
  // Delta time, normalised to 60 fps units (value of 1 = one 60 fps tick)
  const dt   = Math.min((ts - lastTs) / 16.667, 3.5);
  lastTs     = ts;
  SIM.tick  += dt;
  SIM.frame += 1;

  // ── Render pipeline ──
  clearFrame();
  drawAtmosphere();
  drawFieldLines();
  drawOrbitRings();     // also populates orbitHitList
  drawSpatialFixRing();
  drawConnections();
  particles.forEach(p => { p.update(dt); p.draw(); });
  drawCore();

  // ── DOM readout ──
  document.getElementById('fc').textContent = SIM.frame;

  requestAnimationFrame(frame);
}

/* Resize handler — re-initialises canvas and re-seeds particles */
window.addEventListener('resize', () => {
  initCanvas();
  rebuildParticles();
});

/* Boot sequence */
initCanvas();
rebuildParticles();
syncAndUpdate();   // populate HUD from slider defaults before first frame

requestAnimationFrame(ts => {
  lastTs = ts;
  frame(ts);
});
