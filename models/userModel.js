import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  biometricEnabled: { type: Boolean, default: false },
  profileImage: { type: String, default: null },
});
export default mongoose.model("User", userSchema);
