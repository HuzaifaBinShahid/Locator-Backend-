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
        user: { id: user._id, username, email, role: user.role },
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
        user: { id: user._id, username: user.username, email, role: user.role },
      });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = (req, res) => {
  res.status(200).json({ message: "Logged out" });
};
