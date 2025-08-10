const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.draggable = false;
canvas.addEventListener("dragstart", (e) => e.preventDefault());

// setup socket
let socket;
try {
  if (window.io) {
    window.cbSocket = window.cbSocket || window.io();
    socket = window.cbSocket;
  }
} catch {}

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

function drawDot(x, y, size, color, a = 1) {
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawLine(x0, y0, x1, y1, size, color, a = 1) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.globalAlpha = a;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.restore();
}

canvas.addEventListener("mousedown", (e) => {
  e.preventDefault();
  drawing = true;
  const rect = canvas.getBoundingClientRect();
  lastX = e.clientX - rect.left;
  lastY = e.clientY - rect.top;
  
  // local draw
  drawDot(lastX, lastY, brushSize, strokeColor, opacity);
  // broadcast
  if (socket) {
    socket.emit("draw:dot", {
      x: lastX,
      y: lastY,
      size: brushSize,
      color: strokeColor,
      opacity,
    });
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // local draw
  drawLine(lastX, lastY, x, y, brushSize, strokeColor, opacity);

  // broadcast
  if (socket) {
    socket.emit("draw:line", {
      x0: lastX,
      y0: lastY,
      x1: x,
      y1: y,
      size: brushSize,
      color: strokeColor,
      opacity,
    });
  }

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

if (socket) {
  socket.on("init", ({ strokes = [] } = {}) => {
    // re-render a fresh canvas from history
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of strokes) {
      if (s.t === "dot") {
        drawDot(s.x, s.y, s.size, s.color, s.opacity);
      } else if (s.t === "line") {
        drawLine(s.x0, s.y0, s.x1, s.y1, s.size, s.color, s.opacity);
      }
    }
  });

  socket.on("draw:dot", ({ x, y, size, color, opacity }) => {
    drawDot(x, y, size, color, opacity);
  });

  socket.on("draw:line", ({ x0, y0, x1, y1, size, color, opacity }) => {
    drawLine(x0, y0, x1, y1, size, color, opacity);
  });
}

// handle window resize keeping current bitmap (scale disabled for simplicity)
window.addEventListener("resize", () => {
  const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.putImageData(snapshot, 0, 0);
});
