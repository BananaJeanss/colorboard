const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.draggable = false;
canvas.addEventListener("dragstart", (e) => e.preventDefault());

let drawing = false;
let lastX = 0,
  lastY = 0;

let brushSize = 5;
let strokeColor = "black";

canvas.addEventListener("mousedown", (e) => {
  e.preventDefault();
  drawing = true;
  const rect = canvas.getBoundingClientRect();
  lastX = e.clientX - rect.left;
  lastY = e.clientY - rect.top;
});

canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = brushSize;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();
  lastX = x;
  lastY = y;
});

canvas.addEventListener("mouseup", () => (drawing = false));
canvas.addEventListener("mouseout", () => (drawing = false));

const brushButtons = document.querySelectorAll(".brushSize");
brushButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const size = btn.getAttribute("data-size");
    // check if size or 'eraser'
    if (size === "eraser") {
      strokeColor = "white";
      brushSize = 20;
    } else {
      strokeColor = "black";
      brushSize = parseInt(size, 10);
    }
  });
});
