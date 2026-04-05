import { connect } from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI || "mongodb://localhost:27017/Locator";
    await connect(mongoUri);

    console.log("✅ MongoDB connected successfully 🧠", mongoUri);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    throw new Error(`MongoDB connection error: ${error.message}`);
  }
};

export default connectDB;
