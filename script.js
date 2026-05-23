const canvas = document.getElementById('vortexCanvas');
const ctx = canvas.getContext('2d');
let dpr = window.devicePixelRatio || 1;

function resizeCanvas() {
    dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(dpr, dpr);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let entities = [];
const domains = [
    { name: "TECHNOLOGICAL DOMAIN", angleOffset: 0, baseRadius: 200 },
    { name: "ECONOMIC DOMAIN", angleOffset: Math.PI / 2, baseRadius: 260 },
    { name: "MILITARY DOMAIN", angleOffset: Math.PI, baseRadius: 160 },
    { name: "POLITICAL/IDEOLOGICAL", angleOffset: (Math.PI * 3) / 2, baseRadius: 320 }
];

class Entity {
    constructor() {
        this.reset();
        this.radius = Math.random() * (Math.max(window.innerWidth, window.innerHeight) * 0.4) + 50;
    }

    reset() {
        this.angle = Math.random() * Math.PI * 2;
        this.radius = Math.max(window.innerWidth, window.innerHeight) * 0.4;
        this.size = Math.random() * 2 + 1; 
        this.baseSpeed = Math.random() * 0.002 + 0.0005;
        this.type = Math.random() > 0.3 ? 'flow' : 'node'; 
    }

    update(pullSetting, speedSetting, chaosSetting) {
        let speedMultiplier = speedSetting * 0.5;
        let gravity = pullSetting * 0.3;
        let disturbance = chaosSetting * 1.5;

        this.angle += this.baseSpeed * speedMultiplier;
        this.radius -= gravity * (this.radius * 0.002);

        if (disturbance > 0) {
            this.angle += (Math.random() - 0.5) * (0.004 * disturbance);
            this.radius += (Math.random() - 0.5) * (1.2 * disturbance);
        }

        if (this.radius < 50) {
            this.reset();
        }

        this.x = (window.innerWidth / 2) + Math.cos(this.angle) * this.radius;
        this.y = (window.innerHeight / 2) + Math.sin(this.angle) * this.radius;
    }

    draw() {
        ctx.beginPath();
        if (this.type === 'flow') {
            ctx.fillStyle = 'rgba(88, 166, 255, 0.4)';
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
        }
        ctx.fill();
    }
}

for(let i = 0; i < 400; i++) {
    entities.push(new Entity());
}

// Matriz de exemplos baseada nos atratores e estados de metaestabilidade da sua tese
function getHistoricalContext(pull, speed, chaos) {
    // Caso 1: Perturbações Altas (Estado C do seu diagrama) -> Transição Sistêmica e a ascensão da China via BRI
    if (parseInt(chaos) >= 4) {
        return "State C (Multipolarity / Shift): High systemic disturbances represent punctuated transformative crises. As US decline intersects with China's economic and technological rise, the Digital Silk Road and port infrastructures reconfigure global flows, pushing the system toward a new adaptive attractor.";
    }
    
    // Caso 2: Atração Máxima e Velocidade Moderada (Estado B do seu diagrama) -> Unipolaridade dos EUA
    if (parseInt(pull) >= 4 && parseInt(chaos) <= 1) {
        return "State B (US Unipolarity): Dominant centralized core with absolute structural lock-in. International institutions and financial systems create path-dependencies that automatically format the possibility spaces of subordinate entities under US leadership.";
    }

    // Caso 3: Atrator em Equilíbrio Rígido / Fluxo Controlado -> Bipolaridade da Guerra Fria
    if (parseInt(pull) <= 2 && parseInt(speed) <= 2 && parseInt(chaos) === 0) {
        return "State A (Cold War Bipolarity): Rigid meta-stable equilibrium split between two structured fields of attraction. Low relational emergence outside the established blocs; fixed regulatory and ideological parameters restrict entity behavior.";
    }

    // Caso Default: Estado Geral de Metaestabilidade dinâmica
    return "Metastable Order: Dynamic equilibrium where the hegemonic configuration is robust enough to endure across technological and economic scales, but remains highly sensitive to minor structural frictions and relational feedback loop accumulations.";
}

function updateLabels(pull, speed, chaos) {
    const textPull = ["Weak", "Minimal", "Moderate", "High", "STRUCTURAL LOCK-IN"];
    const textSpeed = ["Static", "Baseline", "Accelerated", "High Flow", "Hyper-Relational"];
    const textChaos = ["Stable", "Minor Frictions", "Growing Tensions", "Critical Instability", "PHASE SHIFT"];

    document.getElementById('v-pull').innerText = textPull[pull - 1];
    document.getElementById('v-speed').innerText = textSpeed[speed - 1];
    
    const chaosDisplay = document.getElementById('v-chaos');
    chaosDisplay.innerText = textChaos[chaos];
    chaosDisplay.style.color = chaos >= 4 ? "#ff7b72" : "#d29922";

    const hudStatus = document.getElementById('hud-status');
    const hudEntities = document.getElementById('hud-entities');
    const hudExample = document.getElementById('hud-example');

    // Injeta o texto dinâmico da matriz histórica
    hudExample.innerText = getHistoricalContext(pull, speed, chaos);

    if (parseInt(pull) >= 4) {
        hudEntities.innerText = "BEHAVIOR LOCKED-IN (DOWNWARD CAUSATION)";
        hudEntities.style.color = "#58a6ff";
    } else {
        hudEntities.innerText = "INTERACTING ACROSS SCALES";
        hudEntities.style.color = "#ffffff";
    }

    if (parseInt(chaos) >= 4) {
        hudStatus.innerText = "RAPID PHASE SHIFT TRIGGERED";
        hudStatus.style.color = "#ff7b72";
        hudExample.style.color = "#ff7b72";
    } else if (parseInt(pull) >= 4 && parseInt(chaos) <= 1) {
        hudStatus.innerText = "CENTRALIZED ATTRACTOR STATE";
        hudStatus.style.color = "#58a6ff";
        hudExample.style.color = "#58a6ff";
    } else {
        hudStatus.innerText = "METASTABLE EQUILIBRIUM";
        hudStatus.style.color = "#56d364";
        hudExample.style.color = "#d29922";
    }
}

function animate() {
    ctx.fillStyle = 'rgba(7, 10, 14, 0.3)';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    const pull = document.getElementById('pullForce').value;
    const speed = document.getElementById('speedForce').value;
    const chaos = document.getElementById('chaosForce').value;

    updateLabels(pull, speed, chaos);

    let centerX = window.innerWidth / 2;
    let centerY = window.innerHeight / 2;

    let pulse = 1 + Math.sin(Date.now() * 0.002) * (0.01 + (chaos * 0.005));
    let grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 75 * pulse);
    
    if (chaos >= 4) {
        grad.addColorStop(0, 'rgba(255, 123, 114, 1)');
        grad.addColorStop(0.4, 'rgba(255, 123, 114, 0.3)');
    } else if (pull >= 4 && chaos <= 1) {
        grad.addColorStop(0, 'rgba(88, 166, 255, 1)');
        grad.addColorStop(0.4, 'rgba(88, 166, 255, 0.3)');
    } else {
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.4, 'rgba(88, 166, 255, 0.3)');
    }
    grad.addColorStop(1, 'rgba(7, 10, 14, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 75 * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("HEGEMONIC CORE", centerX, centerY);

    entities.forEach(e => {
        e.update(pull, speed, chaos);
        e.draw();
    });

    domains.forEach(d => {
        let time = Date.now() * 0.00003 * speed;
        let currentAngle = time + d.angleOffset;
        
        let adjustedRadius = d.baseRadius - (pull * 15) + (Math.random() * chaos * 3);
        if (adjustedRadius < 90) adjustedRadius = 90;

        let dx = centerX + Math.cos(currentAngle) * adjustedRadius;
        let dy = centerY + Math.sin(currentAngle) * adjustedRadius;

        ctx.beginPath();
        ctx.strokeStyle = chaos >= 4 ? 'rgba(255, 123, 114, 0.4)' : 'rgba(88, 166, 255, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.arc(centerX, centerY, adjustedRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = "bold 11px sans-serif";
        ctx.fillText(d.name, dx, dy);
    });

    requestAnimationFrame(animate);
}

animate();
