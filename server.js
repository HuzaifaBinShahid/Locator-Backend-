import cors from "cors";
import express, { json } from "express";

import { config } from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import deviceRoutes from "./routes/deviceRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";

config();
connectDB();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use("/api", deviceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/attendance", attendanceRoutes);

app.get("/api/test", (req, res) => {
  res.json({ message: "Server is working!" });
});

app.listen(PORT, "0.0.0.0", () =>
  console.log(
    `🚀 Server is running on port ${PORT} 🔥 and accessible over your local network`
  )
);
