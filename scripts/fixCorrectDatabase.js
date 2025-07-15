import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";

const fixCorrectDatabase = async () => {
  try {
    // Connect to the CORRECT database (Locator, not locator-app)
    await mongoose.connect("mongodb://localhost:27017/Locator");
    console.log("Connected to MongoDB - Locator database");

    // Check current users in Locator database
    console.log("\n📋 Current users in Locator database:");
    const currentUsers = await User.find({});
    console.log(`Found ${currentUsers.length} users`);

    currentUsers.forEach((user, index) => {
      console.log(
        `${index + 1}. Username: ${user.username}, Email: ${
          user.email
        }, Role: ${user.role || "MISSING"}`
      );
    });

    // Update existing users to have role field if missing
    console.log("\n🔄 Adding role field to existing users...");
    for (const user of currentUsers) {
      if (!user.role) {
        await User.findByIdAndUpdate(user._id, { role: "user" });
        console.log(`✅ Added 'user' role to ${user.username} (${user.email})`);
      }
    }

    // Check if admin exists in Locator database
    let adminUser = await User.findOne({ email: "admin@gmail.com" });

    if (!adminUser) {
      console.log("\n🆕 Creating admin user in Locator database...");
      const hashedPassword = await bcrypt.hash("admin123", 10);

      adminUser = new User({
        username: "admin",
        email: "admin@gmail.com",
        password: hashedPassword,
        role: "admin",
      });

      await adminUser.save();
      console.log("✅ Admin user created successfully in Locator database");
    } else {
      console.log("\n🔄 Admin user exists, ensuring proper role...");
      if (adminUser.role !== "admin") {
        await User.findByIdAndUpdate(adminUser._id, { role: "admin" });
        console.log("✅ Updated admin role");
      }
    }

    // Final check - list all users with roles
    console.log("\n📋 Final user list in Locator database:");
    const finalUsers = await User.find({});
    finalUsers.forEach((user, index) => {
      console.log(
        `${index + 1}. ${user.username} (${user.email}) - Role: ${user.role}`
      );
    });

    // Test admin password
    const testAdmin = await User.findOne({ email: "admin@gmail.com" });
    if (testAdmin) {
      const isValidPassword = await bcrypt.compare(
        "admin123",
        testAdmin.password
      );
      console.log(
        `\n🔐 Admin password test: ${
          isValidPassword ? "✅ VALID" : "❌ INVALID"
        }`
      );
    }

    console.log("\n✅ Locator database fix completed!");
    console.log(
      "⚠️  Now you need to update the backend to use 'Locator' database instead of 'locator-app'"
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

fixCorrectDatabase();
