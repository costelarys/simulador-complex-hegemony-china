const canvas = document.getElementById('vortexCanvas');
const ctx = canvas.getContext('2d');

// Ajuste para nitidez (DPR)
function setupCanvas() {
    const dpr = window.devicePixelRatio || 2;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
}
window.addEventListener('resize', setupCanvas);
setupCanvas();

let entities = [];
class Entity {
    constructor() { this.reset(); }
    reset() {
        this.angle = Math.random() * Math.PI * 2;
        this.radius = Math.random() * 200 + 50;
        this.speed = Math.random() * 0.01 + 0.005;
    }
    update(pull) {
        this.angle += this.speed;
        this.radius -= (pull - 3) * 0.5;
        if (this.radius < 10) this.reset();
    }
    draw(centerX, centerY) {
        ctx.beginPath();
        let x = centerX + Math.cos(this.angle) * this.radius;
        let y = centerY + Math.sin(this.angle) * this.radius;
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#58a6ff';
        ctx.fill();
    }
}

for(let i=0; i<300; i++) entities.push(new Entity());

function animate() {
    // ClearRect garante que não haja rastros (evita vertigem)
    ctx.fillStyle = '#05070a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    let pull = document.getElementById('pullForce').value;
    let centerX = canvas.width / 4; // Ajustado para o centro do canvas restante
    let centerY = canvas.height / 2;

    entities.forEach(e => {
        e.update(pull);
        e.draw(centerX, centerY);
    });

    document.getElementById('hud-spatial-fix').innerText = pull > 3 ? "HIGH LOCK-IN" : "FLUID DYNAMICS";
    requestAnimationFrame(animate);
}
animate();
