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

// Matriz Teórica: Retorna o Contexto Histórico e o Spatial Fix correspondente
function getTheoreticalContext(pull, speed, chaos) {
    if (parseInt(chaos) >= 4) {
        return {
            spatialFix: "Belt and Road Initiative (BRI), 5G Networks, Dual-Use Ports.",
            context: "State C (Multipolarity / Shift): High systemic disturbances represent punctuated transformative crises. The Digital Silk Road reconfigures global flows, pushing the system toward a new adaptive attractor (China's Rise)."
        };
    }
    if (parseInt(pull) >= 4 && parseInt(chaos) <= 1) {
        return {
            spatialFix: "Globalized Financial Networks, Bretton Woods Institutions, Sea Lanes.",
            context: "State B (US Unipolarity): Dominant centralized core with absolute structural lock-in. Institutions and financial systems create path-dependencies that format the possibility spaces of subordinate entities."
        };
    }
    if (parseInt(pull) <= 2 && parseInt(speed) <= 2 && parseInt(chaos) === 0) {
        return {
            spatialFix: "Geopolitical Containment Rings, Divided Industrial Blocs.",
            context: "State A (Cold War Bipolarity): Rigid meta-stable equilibrium split between two structured fields of attraction. Low relational emergence outside established blocs."
        };
    }
    return {
        spatialFix: "Material and Geographical Anchoring of Excess Capital.",
        context: "Metastable Order: Dynamic equilibrium where the hegemonic configuration endures across scales, but remains sensitive to structural frictions and relational feedback loops."
    };
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
    const hudSpatialFix = document.getElementById('hud-spatial-fix');

    const theoryData = getTheoreticalContext(pull, speed, chaos);
    hudSpatialFix.innerText = theoryData.spatialFix;
    hudExample.innerText = theoryData.context;

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
        hudSpatialFix.style.color = "#ff7b72";
    } else if (parseInt(pull) >= 4 && parseInt(chaos) <= 1) {
        hudStatus.innerText = "CENTRALIZED ATTRACTOR STATE";
        hudStatus.style.color = "#58a6ff";
        hudSpatialFix.style.color = "#58a6ff";
    } else {
        hudStatus.innerText = "METASTABLE EQUILIBRIUM";
        hudStatus.style.color = "#56d364";
        hudSpatialFix.style.color = "#d29922";
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
    let grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 90 * pulse);
    
    if (chaos >= 4) {
        grad.addColorStop(0, 'rgba(255, 123, 114, 1)');
        grad.addColorStop(0.4, 'rgba(255, 123, 114, 0.25)');
    } else if (pull >= 4 && chaos <= 1) {
        grad.addColorStop(0, 'rgba(88, 166, 255, 1)');
        grad.addColorStop(0.4, 'rgba(88, 166, 255, 0.25)');
    } else {
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.4, 'rgba(88, 166, 255, 0.25)');
    }
    grad.addColorStop(1, 'rgba(7, 10, 14, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 90 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Rótulos do Núcleo: A Matrioska Teórica
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("COMPLEX HEGEMONY", centerX, centerY - 8);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = "bold 10px monospace";
    ctx.fillText("[ GRAMSCIAN CONSENT ]", centerX, centerY + 8);

    // Rótulo sutil do ambiente
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.font = "bold 40px sans-serif";
    ctx.fillText("GAME SPACE", centerX, centerY - 150);

    entities.forEach(e => {
        e.update(pull, speed, chaos);
        e.draw();
    });

    domains.forEach(d => {
        let time = Date.now() * 0.00003 * speed;
        let currentAngle = time + d.angleOffset;
        
        let adjustedRadius = d.baseRadius - (pull * 15) + (Math.random() * chaos * 3);
        if (adjustedRadius < 110) adjustedRadius = 110;

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
