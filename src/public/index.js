const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.draggable = false;

let drawing = false;
let lastX = 0,
  lastY = 0;

let brushSize = 5;
let strokeColor = "black";

canvas.addEventListener("mousedown", (e) => {
  drawing = true;
  [lastX, lastY] = [e.clientX, e.clientY];
});

canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = brushSize;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(e.clientX, e.clientY);
  ctx.stroke();
  [lastX, lastY] = [e.clientX, e.clientY];
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
