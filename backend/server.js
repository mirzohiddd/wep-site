import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import leadsRouter from "./routes/leads.js";

const app = express();
const PORT = process.env.PORT || 4000;

// Eski frontend + yangi 4 ta frontend — ALLOWED_ORIGIN Render'da o'rnatilmasa ham
// ishlab turishi uchun default qiymat sifatida saqlanadi. Production'da bu ro'yxatni
// Render'dagi ALLOWED_ORIGIN environment variable orqali boshqarish tavsiya etiladi.
const DEFAULT_ALLOWED_ORIGINS = [
  "https://coruscating-frangipane-918c46.netlify.app",
  "https://aesthetic-cuchufli-769539.netlify.app",
  "https://clever-torte-8829b8.netlify.app",
  "https://shimmering-bonbon-b8bb50.netlify.app",
  "https://zippy-hotteok-59dc0b.netlify.app",
];

// Origin'larni solishtirishda oxiridagi "/" farq qilmasligi kerak
// (masalan "https://foo.netlify.app/" va "https://foo.netlify.app" bir xil origin).
const normalizeOrigin = (o) => o.trim().replace(/\/+$/, "");

const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGIN
    ? process.env.ALLOWED_ORIGIN.split(",")
    : DEFAULT_ALLOWED_ORIGINS
)
  .map(normalizeOrigin)
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      // Origin header bo'lmagan so'rovlar (server-to-server, curl, health-check)
      // uchun CORS tekshiruvi qo'llanilmaydi — bloklamaymiz.
      if (!origin) return callback(null, true);

      if (ALLOWED_ORIGINS.includes(normalizeOrigin(origin))) {
        return callback(null, true);
      }

      console.warn(`CORS: ruxsat etilmagan origin rad etildi -> ${origin}`);
      return callback(new Error("CORS: bu origin uchun ruxsat berilmagan"));
    },
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
  if (err && /CORS/.test(err.message)) {
    return res.status(403).json({ message: "Ушбу манбадан мурожаатга рухсат берилмаган" });
  }
  console.error(err);
  res.status(500).json({ message: "Кутилмаган сервер хатоси" });
});

app.listen(PORT, () => {
  console.log(`Halila backend ${PORT}-portda ishga tushdi`);
  console.log(`Ruxsat etilgan originlar: ${ALLOWED_ORIGINS.join(", ")}`);
});