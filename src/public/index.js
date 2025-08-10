const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let drawing = false;
let lastX = 0, lastY = 0;

canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    [lastX, lastY] = [e.clientX, e.clientY];
});

canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.clientX, e.clientY);
    ctx.stroke();
    [lastX, lastY] = [e.clientX, e.clientY];
});

canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseout', () => drawing = false);