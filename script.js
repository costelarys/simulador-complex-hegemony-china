const canvas = document.getElementById('vortexCanvas');
const ctx = canvas.getContext('2d');
let dpr = window.devicePixelRatio || 1;

// Correção definitiva para o embaçamento (Blur fix)
function resizeCanvas() {
    dpr = window.devicePixelRatio || 1;
    // O tamanho real em pixels da tela
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    // O tamanho físico mostrado no navegador
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    // Escala o contexto para garantir nitidez
    ctx.scale(dpr, dpr);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let entities = [];
// Órbitas mais espaçadas e lentas para não causar vertigem
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
        // Velocidade base drasticamente reduzida (calma e didática)
        this.baseSpeed = Math.random() * 0.002 + 0.0005;
        this.type = Math.random() > 0.3 ? 'flow' : 'node'; 
    }

    update(pullSetting, speedSetting, chaosSetting) {
        let speedMultiplier = speedSetting * 0.5;
        let gravity = pullSetting * 0.3;
        let disturbance = chaosSetting * 1.5;

        this.angle += this.baseSpeed * speedMultiplier;
        
        // Puxa as entidades suavemente para o centro
        this.radius -= gravity * (this.radius * 0.002);

        if (disturbance > 0) {
            this.angle += (Math.random() - 0.5) * (0.005 * disturbance);
            this.radius += (Math.random() - 0.5) * (1.5 * disturbance);
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
            ctx.fillStyle = 'rgba(88, 166, 255, 0.5)';
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
        }
        ctx.fill();
    }
}

// Menos partículas para evitar poluição visual
for(let i = 0; i < 400; i++) {
    entities.push(new Entity());
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
    } else {
        hudStatus.innerText = "METASTABLE EQUILIBRIUM";
        hudStatus.style.color = "#56d364";
    }
}

function animate() {
    // Fundo limpo (limpa o rastro pesado que causava enjoo)
    ctx.fillStyle = 'rgba(7, 10, 14, 0.3)';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    const pull = document.getElementById('pullForce').value;
    const speed = document.getElementById('speedForce').value;
    const chaos = document.getElementById('chaosForce').value;

    updateLabels(pull, speed, chaos);

    let centerX = window.innerWidth / 2;
    let centerY = window.innerHeight / 2;

    // Núcleo
    let pulse = 1 + Math.sin(Date.now() * 0.002) * (0.01 + (chaos * 0.005));
    let grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 75 * pulse);
    
    if (chaos >= 4) {
        grad.addColorStop(0, 'rgba(255, 123, 114, 1)');
        grad.addColorStop(0.4, 'rgba(255, 123, 114, 0.3)');
    } else {
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.4, 'rgba(88, 166, 255, 0.3)');
    }
    grad.addColorStop(1, 'rgba(7, 10, 14, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 75 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Texto do núcleo mais nítido
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("HEGEMONIC CORE", centerX, centerY);

    entities.forEach(e => {
        e.update(pull, speed, chaos);
        e.draw();
    });

    // Domínios rodando lentamente para permitir a leitura
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
