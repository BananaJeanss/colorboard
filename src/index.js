import express from "express";
import helmet from "helmet";
import { config } from "dotenv";

config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(express.static("src/public"));

app.listen(PORT, () => {
  console.log(`colorboard is running on http://localhost:${PORT}`);
});
