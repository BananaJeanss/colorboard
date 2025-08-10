import express from "express";
import helmet from "helmet";
import { config } from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

config();

const app = express();
const PORT = process.env.PORT || 3000;

const server = createServer(app);
const io = new Server(server);

let onlineCount = 0;

const strokes = [];
const MAX_EVENTS = 5000;

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": ["'self'", "'wasm-unsafe-eval'", "'unsafe-eval'"],
        "connect-src": ["'self'", "ws:", "wss:"],
      },
    },
  })
);
app.use(express.static("src/public"));

io.on("connection", (socket) => {
  onlineCount++;
  io.emit("onlineCount", { online: onlineCount });

  // send current canvas history to the new client
  socket.emit("init", { strokes });

  // receive draw events and broadcast to everyone else
  socket.on("draw:dot", (evt) => {
    try {
      const { x, y, size, color, opacity } = evt || {};
      if (
        typeof x === "number" &&
        typeof y === "number" &&
        typeof size === "number" &&
        typeof color === "string" &&
        typeof opacity === "number"
      ) {
        strokes.push({ t: "dot", x, y, size, color, opacity });
        if (strokes.length > MAX_EVENTS) strokes.splice(0, strokes.length - MAX_EVENTS);
        socket.broadcast.emit("draw:dot", { x, y, size, color, opacity });
      }
    } catch {}
  });

  socket.on("draw:line", (evt) => {
    try {
      const { x0, y0, x1, y1, size, color, opacity } = evt || {};
      if (
        [x0, y0, x1, y1].every((n) => typeof n === "number") &&
        typeof size === "number" &&
        typeof color === "string" &&
        typeof opacity === "number"
      ) {
        strokes.push({ t: "line", x0, y0, x1, y1, size, color, opacity });
        if (strokes.length > MAX_EVENTS) strokes.splice(0, strokes.length - MAX_EVENTS);
        socket.broadcast.emit("draw:line", { x0, y0, x1, y1, size, color, opacity });
      }
    } catch {}
  });

  socket.on("disconnect", () => {
    onlineCount--;
    io.emit("onlineCount", { online: onlineCount });
  });
});

app.get("/onlineCount", (req, res) => {
  res.json({ online: onlineCount });
});

server.listen(PORT, () => {
  console.log(`colorboard is running on http://localhost:${PORT}`);
});