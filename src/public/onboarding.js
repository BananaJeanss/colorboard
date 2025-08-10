// check if user has savedName and savedColor
let isUserOnboarded = false;
const savedName = localStorage.getItem("cb:username");
const savedColor = localStorage.getItem("cb:selectedColor");
const savedRerolls = localStorage.getItem("cb:rerollsRemaining");

if (savedName && savedColor) {
  isUserOnboarded = true;
}

// onboarding elements
const onboardingPanel = document.getElementById("onboardingPanel");
const obNameInput = document.getElementById("onboardingUsername");
const obColorInput = document.getElementById("onboardingBrushColor");
const obRerollBtn = document.getElementById("onboardingRerollButton");
const obRerollText = document.getElementById("onboardingRerollCount");
const obStartBtn = document.getElementById("onboardingStartButton");

function randomHexColor() {
  return `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0")}`;
}

function syncSettingsPanel() {
  const usernameInput = document.getElementById("usernameInput");
  const colorPicker = document.getElementById("brushColorPicker");
  if (usernameInput && obNameInput) usernameInput.value = obNameInput.value;
  if (colorPicker && obColorInput) colorPicker.value = obColorInput.value;
}

function setBrushColorIfAvailable(color) {
  if (typeof window.setBrushColor === "function") {
    window.setBrushColor(color);
  }
}

function getRerolls() {
  const v = parseInt(localStorage.getItem("cb:rerollsRemaining") || "3", 10);
  return isNaN(v) ? 3 : v;
}

function setRerolls(v) {
    localStorage.setItem("cb:rerollsRemaining", String(v));
    if (obRerollText) obRerollText.textContent = `Rerolls remaining: ${v}`;
    const settingsText = document.getElementById("rerollCount");
    if (settingsText) settingsText.textContent = `Rerolls remaining: ${v}`;
    const settingsBtn = document.getElementById("rerollButton");
    if (settingsBtn) settingsBtn.disabled = v <= 0;
    if (obRerollBtn) obRerollBtn.disabled = v <= 0;
}

function validate() {
  const nameOk = obNameInput && obNameInput.value.trim().length >= 1;
  const colorOk = !!localStorage.getItem("cb:selectedColor");
  if (obStartBtn) obStartBtn.disabled = !(nameOk && colorOk);
}

(function initOnboarding() {
  if (!onboardingPanel) return;

  const shouldShow = !(savedName && savedColor);
  if (shouldShow) {
    onboardingPanel.classList.add("active");
  } else {
    onboardingPanel.classList.remove("active");
  }

  // initialize values
  if (savedName && obNameInput) obNameInput.value = savedName;
  if (savedColor && obColorInput) obColorInput.value = savedColor;

  // set initial rerolls UI
  setRerolls(getRerolls());

  // handlers
  if (obNameInput) {
    obNameInput.addEventListener("input", (e) => {
      const v = e.target.value.slice(0, 20);
      e.target.value = v;
      localStorage.setItem("cb:username", v);
      syncSettingsPanel();
      validate();
    });
  }

  if (obRerollBtn && obColorInput) {
    obRerollBtn.addEventListener("click", () => {
      const remaining = getRerolls();
      if (remaining <= 0) return;
      const color = randomHexColor();
      obColorInput.value = color;
      localStorage.setItem("cb:selectedColor", color);
      setRerolls(remaining - 1);
      setBrushColorIfAvailable(color);
      syncSettingsPanel();
      validate();
    });
  }

  if (obStartBtn) {
    obStartBtn.addEventListener("click", () => {
      // require username and color
      const name = (obNameInput?.value || "").trim();
      const color = localStorage.getItem("cb:selectedColor");
      if (!name || !color) return;
      localStorage.setItem("cb:username", name);
      setBrushColorIfAvailable(color);
      syncSettingsPanel();
      onboardingPanel.classList.remove("active");
    });
  }

  // final validation state
  validate();
})();
