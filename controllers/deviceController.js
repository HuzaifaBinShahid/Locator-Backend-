import Device from "../models/deviceModel.js";

export const saveDeviceInfo = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { deviceName, ...deviceData } = req.body;
    if (!deviceName) {
      return res.status(400).json({ message: "Device name is required" });
    }

    const { device, isNew } = await Device.upsert({
      userId,
      deviceName,
      ...deviceData,
    });

    return res.status(isNew ? 201 : 200).json({
      message: isNew ? "Device info saved" : "Device info updated",
      device,
      isNew,
    });
  } catch (error) {
    console.error("saveDeviceInfo error:", error);
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ message: "Device already exists for this user" });
    }
    res.status(500).json({ message: "Failed to save device info" });
  }
};
