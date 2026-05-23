const canvas = document.getElementById('vortexCanvas');
const ctx = canvas.getContext('2d');

function setupCanvas() {
    canvas.width = canvas.clientWidth * 2;
    canvas.height = canvas.clientHeight * 2;
    ctx.scale(2, 2);
}
window.addEventListener('resize', setupCanvas);
setupCanvas();

let entities = [];
class Entity {
    constructor() { this.reset(); }
    reset() {
        this.angle = Math.random() * Math.PI * 2;
        this.radius = Math.random() * 200 + 50;
        this.speed = Math.random() * 0.005 + 0.002;
    }
    update(pull) {
        this.angle += this.speed;
        this.radius -= (pull - 3) * 0.2;
        if (this.radius < 10) this.reset();
    }
    draw(cx, cy) {
        ctx.beginPath();
        let x = cx + Math.cos(this.angle) * this.radius;
        let y = cy + Math.sin(this.angle) * this.radius;
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = '#58a6ff';
        ctx.fill();
    }
}

for(let i=0; i<400; i++) entities.push(new Entity());

function animate() {
    ctx.fillStyle = '#05070a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    let pull = document.getElementById('pullForce').value;
    // O centro agora é relativo ao container do canvas
    let cx = canvas.width / 4; 
    let cy = canvas.height / 4;

    entities.forEach(e => {
        e.update(pull);
        e.draw(cx, cy);
    });

    document.getElementById('hud-spatial-fix').innerText = pull > 3 ? "HIGH LOCK-IN" : "FLUID DYNAMICS";
    requestAnimationFrame(animate);
}
animate();
