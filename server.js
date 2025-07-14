import express, { json } from "express";
import cors from "cors";
import { config } from "dotenv";
import connectDB from "./config/db.js";
import deviceRoutes from "./routes/deviceRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";

config();
connectDB();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(json());

console.log("📋 Setting up routes...");
app.use("/api", deviceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
console.log("✅ Routes configured");

app.get("/api/test", (req, res) => {
  res.json({ message: "Server is working!" });
});

app.listen(PORT, "0.0.0.0", () =>
  console.log(
    `🚀 Server is running on port ${PORT} 🔥 and accessible over your local network`
  )
);
