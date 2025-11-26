import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: "user",
    });
    const token = jwt.sign({ id: user._id, role: user.role }, "jwt_secret", {
      expiresIn: "7d",
    });
    res
      .status(201)
      .json({
        token,
        user: { id: user._id, username, email, role: user.role, biometricEnabled: user.biometricEnabled, profileImage: user.profileImage },
      });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign({ id: user._id, role: user.role }, "jwt_secret", {
      expiresIn: "7d",
    });
    res
      .status(200)
      .json({
        token,
        user: { id: user._id, username: user.username, email, role: user.role, biometricEnabled: user.biometricEnabled, profileImage: user.profileImage },
      });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = (req, res) => {
  res.status(200).json({ message: "Logged out" });
};

export const getBiometricStatus = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const user = await User.findById(userId).select("biometricEnabled");
    res.status(200).json({ biometricEnabled: user?.biometricEnabled || false });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateBiometricStatus = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { biometricEnabled } = req.body;
    
    if (!userId) {
      console.error("updateBiometricStatus: No userId found");
      return res.status(401).json({ message: "User not authenticated" });
    }
    
    if (biometricEnabled === undefined) {
      console.error("updateBiometricStatus: biometricEnabled not provided in body");
      return res.status(400).json({ message: "biometricEnabled is required" });
    }
    
    console.log(`Updating biometric status for user ${userId}: ${biometricEnabled}`);
    
    const user = await User.findByIdAndUpdate(
      userId,
      { biometricEnabled: biometricEnabled === true },
      { new: true }
    ).select("biometricEnabled");
    
    if (!user) {
      console.error(`updateBiometricStatus: User ${userId} not found`);
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log(`Biometric status updated successfully: ${user.biometricEnabled}`);
    res.status(200).json({ biometricEnabled: user.biometricEnabled });
  } catch (err) {
    console.error("updateBiometricStatus error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const biometricLogin = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (!user.biometricEnabled) {
      return res.status(400).json({ message: "Biometric not enabled for this user" });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, "jwt_secret", {
      expiresIn: "7d",
    });
    res.status(200).json({
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role, biometricEnabled: user.biometricEnabled, profileImage: user.profileImage },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { profileImage } = req.body;
    
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    
    if (!profileImage) {
      return res.status(400).json({ message: "Profile image is required" });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { profileImage },
      { new: true }
    ).select("profileImage");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ profileImage: user.profileImage });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
