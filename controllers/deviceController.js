import Device from "../models/deviceModel.js";

export const saveDeviceInfo = async (req, res) => {
  try {

    console.log("req",req)
    const device = new Device(req.body);
    await device.save();
    res.status(201).json({ message: "Device info saved", device });
  } catch (error) {
    console.error("Error saving device:", error);
    res.status(500).json({ message: "Failed to save device info" });
  }
};

