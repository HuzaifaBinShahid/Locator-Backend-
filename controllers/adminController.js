import User from "../models/userModel.js";

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
