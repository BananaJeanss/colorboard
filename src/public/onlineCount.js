(function () {
  // establish socket connection
  let socket;
  try {
    if (window.io) {
      socket = window.io();
    }
  } catch {}

  const onlineCountElement = document.getElementById("count");

  async function refreshCount() {
    try {
      const resp = await fetch("/onlineCount", { cache: "no-store" });
      const data = await resp.json();
      if (onlineCountElement && data && typeof data.online === "number") {
        onlineCountElement.textContent = String(data.online);
      }
    } catch (e) {
      // ignore
    }
  }

  // initial fetch (in case socket not ready yet)
  refreshCount();

  // if socket connected, listen for live updates and also refetch once after connect
  if (socket) {
    socket.on("connect", () => {
      // fetch once so this client is counted
      refreshCount();
    });
    socket.on("onlineCount", (payload) => {
      if (
        onlineCountElement &&
        payload &&
        typeof payload.online === "number"
      ) {
        onlineCountElement.textContent = String(payload.online);
      }
    });
  }
})();