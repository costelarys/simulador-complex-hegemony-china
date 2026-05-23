const canvas = document.getElementById('vortexCanvas');
const ctx = canvas.getContext('2d');

function setupCanvas() {
    const dpr = window.devicePixelRatio || 2; // Força alta densidade
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
}
setupCanvas();

// Função de animação simplificada para evitar vertigem
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // ... (restante da lógica do vórtice, mantendo a mesma base, mas sem o rastro longo)
    requestAnimationFrame(animate);
}
animate();
