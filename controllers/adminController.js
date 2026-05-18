import User from "../models/userModel.js";
import Attendance from "../models/attendanceModel.js";
import * as XLSX from "xlsx";

export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countByRole("admin", { not: true });
    const totalAdmins = await User.countByRole("admin");
    const allUsers = await User.countByRole(null);
    const recentUsers = await User.listNonAdmins({ limit: 10 });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalAdmins,
        allUsers,
        recentUsers: recentUsers.map((u) => ({
          _id: u.id,
          username: u.username,
          email: u.email,
          createdAt: u.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("getUserStats error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch user statistics" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.listNonAdmins();
    res.status(200).json({
      success: true,
      data: {
        users: users.map((u) => ({
          _id: u.id,
          username: u.username,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
          profileImage: u.profileImage,
          nieOrDni: u.nieOrDni,
          socialSecurityNumber: u.socialSecurityNumber,
        })),
        count: users.length,
      },
    });
  } catch (error) {
    console.error("getAllUsers error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId, { selectPassword: false });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const attendanceHistory = await Attendance.findByUserSince(
      userId,
      thirtyDaysAgo
    );

    const totalHoursLast30Days = attendanceHistory.reduce(
      (total, record) => total + (record.totalHours || 0),
      0
    );

    const currentMonth = new Date();
    const firstDayOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const currentMonthAttendance = await Attendance.countByUserSince(
      userId,
      firstDayOfMonth
    );

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          profileImage: user.profileImage,
          nieOrDni: user.nieOrDni,
          socialSecurityNumber: user.socialSecurityNumber,
        },
        attendanceHistory,
        statistics: {
          totalHoursLast30Days:
            Math.round(totalHoursLast30Days * 100) / 100,
          attendanceDaysLast30Days: attendanceHistory.length,
          currentMonthAttendance,
        },
      },
    });
  } catch (error) {
    console.error("getUserDetails error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch user details" });
  }
};

export const exportUsersData = async (req, res) => {
  try {
    const users = await User.listNonAdmins();

    const exportData = [];
    for (const user of users) {
      const attendanceHistory = await Attendance.findAllByUser(user.id);
      const joinedDate = user.createdAt
        ? new Date(user.createdAt).toISOString().split("T")[0]
        : "";

      if (attendanceHistory.length > 0) {
        attendanceHistory.forEach((a) => {
          exportData.push({
            Name: user.username || "",
            Email: user.email || "",
            "NIE/DNI": user.nieOrDni || "",
            "Social Security Number": user.socialSecurityNumber || "",
            "Joined Date": joinedDate,
            "Attendance Date": a.date || "",
            "Check-in Time": a.checkinTime
              ? new Date(a.checkinTime).toLocaleString()
              : "",
            "Check-out Time": a.checkoutTime
              ? new Date(a.checkoutTime).toLocaleString()
              : "",
            "Check-in Location": a.checkinLocation?.address || "",
            "Check-out Location": a.checkoutLocation?.address || "",
            "Total Hours": a.totalHours || 0,
          });
        });
      } else {
        exportData.push({
          Name: user.username || "",
          Email: user.email || "",
          "NIE/DNI": user.nieOrDni || "",
          "Social Security Number": user.socialSecurityNumber || "",
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
    console.error("exportUsersData error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to export users data" });
  }
};

export const getAttendanceReports = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;
    const records = await Attendance.findReports({ userId, startDate, endDate });

    const total = records.length;
    const totalHours = records.reduce(
      (sum, r) => sum + (r.totalHours || 0),
      0
    );
    const activeCount = records.filter((r) => r.isActive).length;

    res.status(200).json({
      success: true,
      data: {
        records,
        total,
        summary: {
          totalRecords: total,
          totalHours: Math.round(totalHours * 100) / 100,
          activeCount,
        },
      },
    });
  } catch (error) {
    console.error("getAttendanceReports error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch attendance reports" });
  }
};

export const exportAttendanceData = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;
    const records = await Attendance.findReports({ userId, startDate, endDate });

    const exportData = records.map((record) => ({
      Name: record.userId?.username || "",
      Email: record.userId?.email || "",
      "NIE/DNI": record.userId?.nieOrDni || "",
      "Social Security Number": record.userId?.socialSecurityNumber || "",
      "Attendance Date": record.date || "",
      "Check-in Time": record.checkinTime
        ? new Date(record.checkinTime).toLocaleString()
        : "",
      "Check-out Time": record.checkoutTime
        ? new Date(record.checkoutTime).toLocaleString()
        : "",
      "Check-in Location": record.checkinLocation?.address || "",
      "Check-out Location": record.checkoutLocation?.address || "",
      "Total Hours": record.totalHours || 0,
      Status: record.isActive ? "Active" : "Completed",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Data");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=attendance_export_${Date.now()}.xlsx`
    );
    res.send(buffer);
  } catch (error) {
    console.error("exportAttendanceData error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to export attendance data" });
  }
};
