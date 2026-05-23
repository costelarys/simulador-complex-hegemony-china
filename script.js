const canvas = document.getElementById('vortexCanvas');
const ctx = canvas.getContext('2d');

function init() {
    // Força o tamanho do canvas para o tamanho do container pai
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    animate();
}

let particles = Array.from({length: 400}, () => ({
    angle: Math.random() * Math.PI * 2,
    radius: Math.random() * 200 + 50,
    speed: Math.random() * 0.02 + 0.005
}));

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    let pull = document.getElementById('pullForce').value;
    let cx = canvas.width / 2;
    let cy = canvas.height / 2;

    ctx.fillStyle = '#58a6ff';
    particles.forEach(p => {
        p.angle += p.speed;
        p.radius -= (pull - 3) * 0.5;
        if(p.radius < 10) p.radius = 250;
        
        let x = cx + Math.cos(p.angle) * p.radius;
        let y = cy + Math.sin(p.angle) * p.radius;
        
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
    });
    
    requestAnimationFrame(animate);
}

// Inicializa
init();
window.addEventListener('resize', init);
