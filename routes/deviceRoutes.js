const router = Router();
import { Router } from "express";
import { saveDeviceInfo } from "../controllers/deviceController.js";

router.post("/saveDeviceInfo", saveDeviceInfo);

export default router;