import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const publicUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role: user.role,
  biometricEnabled: user.biometricEnabled,
  profileImage: user.profileImage,
  nieOrDni: user.nieOrDni,
  socialSecurityNumber: user.socialSecurityNumber,
});

export const signup = async (req, res) => {
  const {
    username,
    email,
    password,
    nieOrDni,
    socialSecurityNumber,
    profileImage,
  } = req.body;
  try {
    if (!nieOrDni || !socialSecurityNumber) {
      return res
        .status(400)
        .json({ message: "NIE/DNI and Social Security Number are required" });
    }
    const existingUser = await User.findByEmailOrUsername(email, username);
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: "user",
      nieOrDni,
      socialSecurityNumber,
      profileImage: profileImage || null,
    });
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    console.error("signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByEmail(email);
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(200).json({ token, user: publicUser(user) });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = (req, res) => {
  res.status(200).json({ message: "Logged out" });
};

export const getBiometricStatus = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const user = await User.findById(userId, { selectPassword: false });
    res
      .status(200)
      .json({ biometricEnabled: user?.biometricEnabled || false });
  } catch (err) {
    console.error("getBiometricStatus error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateBiometricStatus = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { biometricEnabled } = req.body;

    if (!userId) return res.status(401).json({ message: "User not authenticated" });
    if (biometricEnabled === undefined)
      return res.status(400).json({ message: "biometricEnabled is required" });

    const user = await User.updateById(userId, {
      biometricEnabled: biometricEnabled === true,
    });
    if (!user) return res.status(404).json({ message: "User not found" });
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
    if (!user) return res.status(400).json({ message: "User not found" });
    if (!user.biometricEnabled) {
      return res
        .status(400)
        .json({ message: "Biometric not enabled for this user" });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(200).json({ token, user: publicUser(user) });
  } catch (err) {
    console.error("biometricLogin error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { profileImage } = req.body;

    if (!userId) return res.status(401).json({ message: "User not authenticated" });
    if (!profileImage)
      return res.status(400).json({ message: "Profile image is required" });

    const user = await User.updateById(userId, { profileImage });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ profileImage: user.profileImage });
  } catch (err) {
    console.error("uploadProfileImage error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
