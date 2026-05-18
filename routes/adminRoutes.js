import { Router } from "express";
import {
  getUserStats,
  getAllUsers,
  getUserDetails,
  exportUsersData,
  getAttendanceReports,
  exportAttendanceData,
} from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";


const router = Router();

const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }
};

router.use(authMiddleware);
router.get("/stats", adminMiddleware, getUserStats);
router.get("/users", adminMiddleware, getAllUsers);
router.get("/users/:userId", adminMiddleware, getUserDetails);
router.get("/export-users", adminMiddleware, exportUsersData);
router.get("/attendance-reports", adminMiddleware, getAttendanceReports);
router.get("/export-attendance", adminMiddleware, exportAttendanceData);

export default router;
