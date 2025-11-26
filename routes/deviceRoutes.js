import { Router } from "express";
import { saveDeviceInfo } from "../controllers/deviceController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// Protect device routes with authentication
router.post("/saveDeviceInfo", authMiddleware, saveDeviceInfo);

export default router;