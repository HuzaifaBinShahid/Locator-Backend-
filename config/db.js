import { connect } from "mongoose";

const connectDB = async () => {
  try {
    // Use Locator database (the correct one with user data)
    const mongoUri =
      process.env.MONGO_URI || "mongodb://localhost:27017/Locator";
    await connect(mongoUri);

    console.log("✅ MongoDB connected successfully 🧠", mongoUri);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
