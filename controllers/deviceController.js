import Device from "../models/deviceModel.js";

export const saveDeviceInfo = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { deviceName, ...deviceData } = req.body;

    if (!deviceName) {
      return res.status(400).json({ message: "Device name is required" });
    }

    let existingDevice = await Device.findOne({
      userId: userId,
      deviceName: deviceName,
    });

    if (!existingDevice) {
      const oldDevices = await Device.find({
        deviceName: deviceName,
        $or: [
          { userId: { $exists: false } },
          { userId: null }
        ]
      }).sort({ createdAt: -1 });

      if (oldDevices.length > 0) {
        existingDevice = oldDevices[0];

        if (oldDevices.length > 1) {
          const duplicateIds = oldDevices.slice(1).map(d => d._id);
          await Device.deleteMany({ _id: { $in: duplicateIds } });
          console.log(`Deleted ${oldDevices.length - 1} duplicate device entries`);
        }

        existingDevice.set({
          userId: userId,
          ...deviceData,
          updatedAt: new Date(),
        });
        await existingDevice.save();
        return res.status(200).json({
          message: "Device info updated and migrated",
          device: existingDevice,
          isNew: false,
        });
      }
    }

    if (existingDevice) {
      existingDevice.set({
        userId: userId,
        ...deviceData,
        updatedAt: new Date(),
      });
      await existingDevice.save();
      return res.status(200).json({
        message: "Device info updated",
        device: existingDevice,
        isNew: false,
      });
    } else {
      const device = new Device({
        userId: userId,
        deviceName: deviceName,
        ...deviceData,
      });
      await device.save();
      return res.status(201).json({
        message: "Device info saved",
        device: device,
        isNew: true,
      });
    }
  } catch (error) {
    console.error("Error saving device:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Device already exists for this user",
      });
    }

    res.status(500).json({ message: "Failed to save device info" });
  }
};
