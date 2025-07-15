import User from "../models/userModel.js";
import Attendance from "../models/attendanceModel.js";

export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const allUsers = await User.countDocuments();

    const recentUsers = await User.find(
      { role: { $ne: "admin" } },
      "username email createdAt"
    )
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalAdmins,
        allUsers,
        recentUsers,
      },
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user statistics",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(
      { role: { $ne: "admin" } },
      "username email role createdAt"
    ).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        users,
        count: users.length,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// Get specific user details with attendance history
export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user details
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user's attendance history (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const attendanceHistory = await Attendance.find({
      userId: userId,
      checkinTime: { $gte: thirtyDaysAgo },
    }).sort({ date: -1 });

    // Calculate total hours worked in last 30 days
    const totalHoursLast30Days = attendanceHistory.reduce((total, record) => {
      return total + (record.totalHours || 0);
    }, 0);

    // Get current month attendance count
    const currentMonth = new Date();
    const firstDayOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );

    const currentMonthAttendance = await Attendance.countDocuments({
      userId: userId,
      checkinTime: { $gte: firstDayOfMonth },
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        attendanceHistory,
        statistics: {
          totalHoursLast30Days: Math.round(totalHoursLast30Days * 100) / 100,
          attendanceDaysLast30Days: attendanceHistory.length,
          currentMonthAttendance,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user details",
    });
  }
};
