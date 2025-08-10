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
let opacity = 1;

let selectedColor = "#000000";
let eraserMode = false;
let strokeColor = selectedColor;

function setBrushColor(color) {
  selectedColor = color;
  if (!eraserMode) {
    strokeColor = selectedColor;
    // update preview to reflect new color if not erasing
    brushPreview &&
      (brushPreview.style.borderColor =
        strokeColor.toLowerCase() === "#ffffff" || strokeColor === "white"
          ? "#aaa"
          : strokeColor);
  }
}

window.setBrushColor = setBrushColor;

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
  ctx.globalAlpha = opacity;
  ctx.lineJoin = "round";
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
const brushPreview = document.getElementById("brushPreview");

function updateBrushPreview(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  brushPreview.style.left = `${rect.left + x - brushSize / 2}px`;
  brushPreview.style.top = `${rect.top + y - brushSize / 2}px`;
  brushPreview.style.width = `${brushSize}px`;
  brushPreview.style.height = `${brushSize}px`;
  brushPreview.style.borderColor =
    strokeColor === "white" || strokeColor.toLowerCase() === "#ffffff"
      ? "#aaa"
      : strokeColor;
  brushPreview.style.display = "block";
}

canvas.addEventListener("mousemove", (e) => {
  updateBrushPreview(e);
});

canvas.addEventListener("mouseenter", (e) => {
  updateBrushPreview(e);
  brushPreview.style.display = "block";
});

canvas.addEventListener("mouseleave", () => {
  brushPreview.style.display = "none";
});

brushButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const size = btn.getAttribute("data-size");
    if (size === "eraser") {
      eraserMode = true;
      strokeColor = "white"; // background
      brushSize = 20;
    } else {
      eraserMode = false;
      brushSize = parseInt(size, 10);
      strokeColor = selectedColor; // keep chosen color
    }
    brushPreview.style.width = `${brushSize}px`;
    brushPreview.style.height = `${brushSize}px`;
    brushPreview.style.borderColor =
      strokeColor === "white" || strokeColor.toLowerCase() === "#ffffff"
        ? "#aaa"
        : strokeColor;
  });
});

const opacitySlider = document.getElementById("opacitySlider");
const opacityValueSpan = document.getElementById("opacityValue");
opacitySlider.addEventListener("input", (e) => {
  opacity = e.target.value / 100;
  opacityValueSpan.textContent = Math.round(opacity * 100);
});

// initialize from saved settings if present
(function initFromStorage() {
  try {
    const savedColor = localStorage.getItem("cb:selectedColor");
    if (savedColor) {
      setBrushColor(savedColor);
    }
  } catch {}
})();
