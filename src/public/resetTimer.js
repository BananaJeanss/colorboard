(function () {
  const el = document.getElementById("resetTimer");
  if (!el) return;

  let socket;
  try {
    socket = window.cbSocket || (window.io ? window.io() : undefined);
  } catch {}

  let nextResetAt = typeof window.__cbNextResetAt === "number" ? window.__cbNextResetAt : null;

  function tick() {
    if (typeof nextResetAt !== "number") {
      el.textContent = "--:--";
      return;
    }
    const ms = Math.max(0, nextResetAt - Date.now());
    const totalSec = Math.floor(ms / 1000);
    const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
    const ss = String(totalSec % 60).padStart(2, "0");
    el.textContent = `${mm}:${ss}`;
  }

  const iv = setInterval(tick, 500);
  tick();

  function applySchedule(payload = {}) {
    if (typeof payload.nextResetAt === "number") {
      nextResetAt = payload.nextResetAt;
      tick();
    }
    if (typeof payload.resetEveryMs === "number") {
      window.__cbResetEveryMs = payload.resetEveryMs;
    }
  }

  if (typeof window.__cbNextResetAt === "number") {
    applySchedule({ nextResetAt: window.__cbNextResetAt, resetEveryMs: window.__cbResetEveryMs });
  }

  if (socket) {
    socket.on("init", (payload = {}) => applySchedule(payload));
    socket.on("reset:schedule", (payload = {}) => applySchedule(payload));

    socket.on("disconnect", () => {
      // keep showing last value; optionally show placeholder
      // nextResetAt = null; // uncomment if you prefer "--:--" on disconnect
    });
  }
})();
