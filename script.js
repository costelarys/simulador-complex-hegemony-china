const canvas = document.getElementById('vortexCanvas');
const ctx = canvas.getContext('2d');

function resize() {
    // Pega o tamanho real do container main
    const container = canvas.parentElement;
    canvas.width = container.clientWidth * window.devicePixelRatio;
    canvas.height = container.clientHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

window.addEventListener('resize', resize);
resize();

let particles = Array.from({length: 500}, () => ({
    angle: Math.random() * Math.PI * 2,
    radius: Math.random() * 300 + 50,
    speed: Math.random() * 0.01 + 0.002
}));

function animate() {
    ctx.fillStyle = 'rgba(5, 7, 10, 0.2)';
    ctx.fillRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
    
    let pull = document.getElementById('pullForce').value;
    let cx = (canvas.width / window.devicePixelRatio) / 2;
    let cy = (canvas.height / window.devicePixelRatio) / 2;

    ctx.fillStyle = '#58a6ff';
    particles.forEach(p => {
        p.angle += p.speed;
        p.radius -= (pull - 3) * 0.3;
        if(p.radius < 10) p.radius = 350;
        
        let x = cx + Math.cos(p.angle) * p.radius;
        let y = cy + Math.sin(p.angle) * p.radius;
        
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
    });
    
    requestAnimationFrame(animate);
}

animate();
