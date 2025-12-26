import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import postsRoutes from "./routes/posts.js";
import usersRoutes from "./routes/users.js";
import errorHandler from "./middleware/errorHandler.js";

// تحميل متغيرات البيئة
dotenv.config();

// الاتصال بقاعدة البيانات
connectDB();

const app = express();

// الوسطاء
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:8080",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// المسارات
app.get("/", (req, res) => {
  res.json({ message: "🚀 Pulsar API جاهز!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/users", usersRoutes);

// معالج الأخطاء
app.use(errorHandler);

// بدء الخادم
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌟 الخادم يعمل على المنفذ ${PORT}`);
});
