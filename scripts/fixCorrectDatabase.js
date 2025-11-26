import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";

const fixCorrectDatabase = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/Locator");

    const currentUsers = await User.find({});

    currentUsers.forEach((user, index) => {
      console.log(
        `${index + 1}. Username: ${user.username}, Email: ${user.email
        }, Role: ${user.role || "MISSING"}`
      );
    });

    for (const user of currentUsers) {
      if (!user.role) {
        await User.findByIdAndUpdate(user._id, { role: "user" });
      }
    }

    let adminUser = await User.findOne({ email: "admin@gmail.com" });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

      adminUser = new User({
        username: "admin",
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin",
      });

      await adminUser.save();
    } else {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const updateData = { role: "admin", password: hashedPassword };
      await User.findByIdAndUpdate(adminUser._id, updateData);
    }

    const finalUsers = await User.find({});
    finalUsers.forEach((user, index) => {
      console.log(
        `${index + 1}. ${user.username} (${user.email}) - Role: ${user.role}`
      );
    });

    const testAdmin = await User.findOne({ email: "admin@gmail.com" });
    if (testAdmin) {
      const isValidPassword = await bcrypt.compare(
        "admin123",
        testAdmin.password
      );
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

fixCorrectDatabase();