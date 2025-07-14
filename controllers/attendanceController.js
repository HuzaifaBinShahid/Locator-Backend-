import Attendance from "../models/attendanceModel.js";

console.log("📋 Loading attendance controller...");

const getTodayDate = () => {
  return new Date().toISOString().split("T")[0];
};

export const getTodayAttendance = async (req, res) => {
  console.log("📅 getTodayAttendance called for user:", req.user.id);
  try {
    const userId = req.user.id;
    const today = getTodayDate();

    const attendance = await Attendance.findOne({ userId, date: today });

    if (!attendance) {
      return res.status(200).json({ attendance: null, canCheckin: true });
    }

    const canCheckin = false;
    const canCheckout = attendance.isActive && !attendance.checkoutTime;

    res.status(200).json({
      attendance,
      canCheckin,
      canCheckout,
    });
  } catch (error) {
    console.error("❌ Error in getTodayAttendance:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const checkin = async (req, res) => {
  console.log("⏰ checkin called for user:", req.user.id);
  try {
    const userId = req.user.id;
    const today = getTodayDate();
    const { latitude, longitude, address } = req.body;

    const existingAttendance = await Attendance.findOne({
      userId,
      date: today,
    });
    if (existingAttendance) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    const attendance = await Attendance.create({
      userId,
      date: today,
      checkinTime: new Date(),
      checkinLocation: { latitude, longitude, address },
      isActive: true,
    });

    res.status(201).json({
      message: "Checked in successfully",
      attendance,
    });
  } catch (error) {
    console.error("❌ Error in checkin:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const checkout = async (req, res) => {
  console.log("⏰ checkout called for user:", req.user.id);
  try {
    const userId = req.user.id;
    const today = getTodayDate();
    const { latitude, longitude, address } = req.body;

    const attendance = await Attendance.findOne({
      userId,
      date: today,
      isActive: true,
    });
    if (!attendance) {
      return res
        .status(400)
        .json({ message: "No active check-in found for today" });
    }

    if (attendance.checkoutTime) {
      return res.status(400).json({ message: "Already checked out today" });
    }

    const checkoutTime = new Date();
    const totalHours =
      (checkoutTime - attendance.checkinTime) / (1000 * 60 * 60);

    attendance.checkoutTime = checkoutTime;
    attendance.checkoutLocation = { latitude, longitude, address };
    attendance.totalHours = totalHours;
    attendance.isActive = false;

    await attendance.save();

    res.status(200).json({
      message: "Checked out successfully",
      attendance,
      totalHours: totalHours.toFixed(2),
    });
  } catch (error) {
    console.error("❌ Error in checkout:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

console.log("✅ Attendance controller loaded");
