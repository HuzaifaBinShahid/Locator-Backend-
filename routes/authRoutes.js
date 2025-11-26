import express from "express";
import { signup, login, logout, getBiometricStatus, updateBiometricStatus, biometricLogin, uploadProfileImage } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/biometric-login", biometricLogin);
router.get("/biometric-status", authMiddleware, getBiometricStatus);
router.put("/biometric-status", authMiddleware, updateBiometricStatus);
router.put("/upload-profile-image", authMiddleware, uploadProfileImage);

export default router;
