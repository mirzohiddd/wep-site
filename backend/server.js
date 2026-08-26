import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import leadsRouter from "./routes/leads.js";

const app = express();
const PORT = process.env.PORT || 4000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:5173";

app.use(helmet());
app.use(
  cors({
    origin: ALLOWED_ORIGIN.split(",").map((o) => o.trim()),
  })
);
app.use(express.json({ limit: "20kb" }));

// Basic protection against form-spam / brute force on the public endpoint
const leadsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 submissions per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Жуда кўп уриниш. Бироздан сўнг қайта уриниб кўринг." },
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/leads", leadsLimiter, leadsRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Топилмади" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Кутилмаган сервер хатоси" });
});

app.listen(PORT, () => {
  console.log(`Halila backend ${PORT}-portda ishga tushdi`);
  console.log(`Ruxsat etilgan origin: ${ALLOWED_ORIGIN}`);
});
