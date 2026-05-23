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
        if (this.radius < 50) this.reset();
        this.x = (window.innerWidth / 2) + Math.cos(this.angle) * this.radius;
        this.y = (window.innerHeight / 2) + Math.sin(this.angle) * this.radius;
    }
    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.type === 'flow' ? 'rgba(88, 166, 255, 0.4)' : 'rgba(255, 255, 255, 0.7)';
        ctx.arc(this.x, this.y, this.size * (this.type === 'node' ? 1.5 : 1), 0, Math.PI * 2);
        ctx.fill();
    }
}

for(let i = 0; i < 400; i++) entities.push(new Entity());

function getTheoreticalContext(pull, speed, chaos) {
    if (parseInt(chaos) >= 4) return {
        spatialFix: "Belt and Road Initiative (BRI), 5G Networks.",
        context: "Multipolarity/Shift: High systemic disturbances reconfigure flows toward new adaptive attractors."
    };
    if (parseInt(pull) >= 4 && parseInt(chaos) <= 1) return {
        spatialFix: "Transnational Financial Networks, Bretton Woods.",
        context: "Unipolarity: Dominant core creates path-dependencies formatting subaltern possibility spaces."
    };
    return {
        spatialFix: "Material Anchoring of Excess Capital.",
        context: "Metastable Order: Hegemonic configuration enduring across scales, sensitive to relational frictions."
    };
}

function updateLabels(pull, speed, chaos) {
    document.getElementById('v-pull').innerText = ["Weak", "Minimal", "Moderate", "High", "LOCK-IN"][pull - 1];
    document.getElementById('v-speed').innerText = ["Static", "Baseline", "Accelerated", "Flow", "HYPER"][speed - 1];
    
    const cDisplay = document.getElementById('v-chaos');
    cDisplay.innerText = ["Stable", "Friction", "Tension", "Instability", "SHIFT"][chaos];
    cDisplay.style.color = chaos >= 4 ? "#ff7b72" : "#d29922";

    const theory = getTheoreticalContext(pull, speed, chaos);
    document.getElementById('hud-spatial-fix').innerText = theory.spatialFix;
    document.getElementById('hud-example').innerText = theory.context;
}

function animate() {
    ctx.fillStyle = 'rgba(7, 10, 14, 0.3)';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    const pull = document.getElementById('pullForce').value;
    const speed = document.getElementById('speedForce').value;
    const chaos = document.getElementById('chaosForce').value;
    updateLabels(pull, speed, chaos);

    let centerX = window.innerWidth / 2, centerY = window.innerHeight / 2;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = "center";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("COMPLEX HEGEMONY", centerX, centerY - 8);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = "bold 10px monospace";
    ctx.fillText("[ GRAMSCIAN CONSENT ]", centerX, centerY + 8);

    entities.forEach(e => { e.update(pull, speed, chaos); e.draw(); });
    domains.forEach(d => {
        let angle = (Date.now() * 0.00003 * speed) + d.angleOffset;
        let rad = d.baseRadius - (pull * 15);
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(88, 166, 255, 0.15)';
        ctx.arc(centerX, centerY, rad, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'white';
        ctx.fillText(d.name, centerX + Math.cos(angle) * rad, centerY + Math.sin(angle) * rad);
    });
    requestAnimationFrame(animate);
}
animate();
