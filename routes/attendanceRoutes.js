import express from "express";
import {
  getTodayAttendance,
  checkin,
  checkout,
} from "../controllers/attendanceController.js";
import authMiddleware from "../middleware/authMiddleware.js";

console.log("📋 Loading attendance routes...");

const router = express.Router();

router.get("/today", authMiddleware, getTodayAttendance);
router.post("/checkin", authMiddleware, checkin);
router.post("/checkout", authMiddleware, checkout);

console.log("✅ Attendance routes loaded");

export default router;
