import express, { json } from "express";
import cors from "cors";
import { config } from "dotenv";
import connectDB from "./config/db.js";
import deviceRoutes from './routes/deviceRoutes.js'

config();
connectDB();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(json());

app.use("/api", deviceRoutes);

app.listen(PORT, "0.0.0.0", () =>
  console.log(
    `🚀 Server is running on port ${PORT} 🔥 and accessible over your local network`
  )
);
