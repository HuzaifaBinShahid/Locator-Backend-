import Attendance from "../models/attendanceModel.js";

const getTodayDate = () => new Date().toISOString().split("T")[0];

export const getTodayAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = getTodayDate();

    const attendance = await Attendance.findByUserAndDate(userId, today);

    if (!attendance) {
      return res.status(200).json({ attendance: null, canCheckin: true });
    }

    const canCheckin = false;
    const canCheckout = attendance.isActive && !attendance.checkoutTime;

    res.status(200).json({ attendance, canCheckin, canCheckout });
  } catch (error) {
    console.error("getTodayAttendance error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const checkin = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = getTodayDate();
    const { latitude, longitude, address } = req.body;

    const existing = await Attendance.findByUserAndDate(userId, today);
    if (existing) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    const attendance = await Attendance.create({
      userId,
      date: today,
      checkinTime: new Date().toISOString(),
      checkinLocation: { latitude, longitude, address },
      isActive: true,
    });

    res.status(201).json({ message: "Checked in successfully", attendance });
  } catch (error) {
    console.error("checkin error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const checkout = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = getTodayDate();
    const { latitude, longitude, address } = req.body;

    const attendance = await Attendance.findActiveByUserAndDate(userId, today);
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
      (checkoutTime - new Date(attendance.checkinTime)) / (1000 * 60 * 60);

    const updated = await Attendance.checkout(attendance.id, {
      checkoutTime: checkoutTime.toISOString(),
      checkoutLocation: { latitude, longitude, address },
      totalHours,
    });

    res.status(200).json({
      message: "Checked out successfully",
      attendance: updated,
      totalHours: totalHours.toFixed(2),
    });
  } catch (error) {
    console.error("checkout error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
