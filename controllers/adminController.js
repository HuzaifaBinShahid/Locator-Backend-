import User from "../models/userModel.js";
import Attendance from "../models/attendanceModel.js";
import * as XLSX from "xlsx";

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
      "username email role createdAt profileImage"
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
          profileImage: user.profileImage,
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

export const exportUsersData = async (req, res) => {
  try {
    const users = await User.find(
      { role: { $ne: "admin" } },
      "username email createdAt"
    ).sort({ createdAt: -1 });

    const exportData = [];

    for (const user of users) {
      const attendanceHistory = await Attendance.find({
        userId: user._id,
      }).sort({ date: -1 });

      const joinedDate = user.createdAt
        ? new Date(user.createdAt).toISOString().split("T")[0]
        : "";

      if (attendanceHistory.length > 0) {
        attendanceHistory.forEach((attendance) => {
          exportData.push({
            Name: user.username || "",
            Email: user.email || "",
            "Joined Date": joinedDate,
            "Attendance Date": attendance.date || "",
            "Check-in Time": attendance.checkinTime
              ? new Date(attendance.checkinTime).toLocaleString()
              : "",
            "Check-out Time": attendance.checkoutTime
              ? new Date(attendance.checkoutTime).toLocaleString()
              : "",
            "Check-in Location": attendance.checkinLocation?.address || "",
            "Check-out Location": attendance.checkoutLocation?.address || "",
            "Total Hours": attendance.totalHours || 0,
          });
        });
      } else {
        exportData.push({
          Name: user.username || "",
          Email: user.email || "",
          "Joined Date": joinedDate,
          "Attendance Date": "",
          "Check-in Time": "",
          "Check-out Time": "",
          "Check-in Location": "",
          "Check-out Location": "",
          "Total Hours": "",
        });
      }
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users Data");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=users_export_${Date.now()}.xlsx`
    );

    res.send(buffer);
  } catch (error) {
    console.error("Error exporting users data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export users data",
    });
  }
};