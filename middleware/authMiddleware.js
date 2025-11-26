import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("authMiddleware: No token provided");
    return res.status(401).json({ message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, "jwt_secret");
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      console.error("authMiddleware: User not found for decoded ID:", decoded.id);
      return res.status(401).json({ message: "User not found" });
    }
    next();
  } catch (err) {
    console.error("authMiddleware error:", err.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};

export default authMiddleware;
