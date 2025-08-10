const openSettingsButton = document.getElementById("openSettingsButton");
const closeSettingsButton = document.getElementById("closeSettingsButton");
const settingsPanel = document.getElementById("settingsPanel");

function openPanel() {
  if (settingsPanel) settingsPanel.style.display = "block";
}
function closePanel() {
  if (settingsPanel) settingsPanel.style.display = "none";
}
function isPanelOpen() {
  return settingsPanel && settingsPanel.style.display === "block";
}

if (openSettingsButton && closeSettingsButton && settingsPanel) {
  openSettingsButton.addEventListener("click", openPanel);
  closeSettingsButton.addEventListener("click", closePanel);

  // close when clicking outside
  document.addEventListener("mousedown", (e) => {
    if (!isPanelOpen()) return;
    const clickInsidePanel = settingsPanel.contains(e.target);
    const clickOnOpenBtn = openSettingsButton.contains(e.target);
    if (!clickInsidePanel && !clickOnOpenBtn) closePanel();
  });
}

// settings controls
const usernameInput = document.getElementById("usernameInput");
const brushColorPicker = document.getElementById("brushColorPicker");
const rerollButton = document.getElementById("rerollButton");
const rerollCountText = document.getElementById("rerollCount");

// load saved settings
(function loadSettings() {
  try {
    const savedName = localStorage.getItem("cb:username");
    const savedColor = localStorage.getItem("cb:selectedColor");
    const savedRerolls = localStorage.getItem("cb:rerollsRemaining");
    if (savedName && usernameInput) usernameInput.value = savedName;
    if (savedColor && brushColorPicker) brushColorPicker.value = savedColor;
    if (savedColor && typeof window.setBrushColor === "function") {
      window.setBrushColor(savedColor);
    }
    if (rerollCountText) {
      const remaining = savedRerolls ? parseInt(savedRerolls, 10) : 3;
      rerollCountText.textContent = `Rerolls remaining: ${remaining}`;
      if (rerollButton) rerollButton.disabled = remaining <= 0;
    }
  } catch {}
})();

// persist username on input
if (usernameInput) {
  usernameInput.addEventListener("input", (e) => {
    const value = e.target.value.slice(0, 20);
    e.target.value = value;
    try {
      localStorage.setItem("cb:username", value);
    } catch {}
  });
}

if (brushColorPicker) {
  brushColorPicker.addEventListener("input", (e) => {
    const color = e.target.value;
    try {
      localStorage.setItem("cb:selectedColor", color);
    } catch {}
    if (typeof window.setBrushColor === "function") {
      window.setBrushColor(color);
    }
  });
}

// pick a random color and decrement counter
function randomHexColor() {
  return `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0")}`;
}

if (rerollButton) {
  rerollButton.addEventListener("click", () => {
    const remaining = parseInt(localStorage.getItem("cb:rerollsRemaining") || "3", 10);
    if (remaining <= 0) return;
    const color = randomHexColor();
    if (brushColorPicker) brushColorPicker.value = color;
    if (typeof window.setBrushColor === "function") {
      window.setBrushColor(color);
    }
    try {
      localStorage.setItem("cb:selectedColor", color);
      localStorage.setItem("cb:rerollsRemaining", String(remaining - 1));
    } catch {}
    if (rerollCountText) rerollCountText.textContent = `Rerolls remaining: ${remaining - 1}`;
    rerollButton.disabled = remaining - 1 <= 0;
  });
}