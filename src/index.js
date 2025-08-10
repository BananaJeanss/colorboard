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