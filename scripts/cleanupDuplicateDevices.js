import mongoose from "mongoose";
import Device from "../models/deviceModel.js";
import { config } from "dotenv";

config();

const cleanupDuplicateDevices = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/Locator";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB - Locator database");

    // Find all devices
    const allDevices = await Device.find({});
    console.log(`\n📋 Found ${allDevices.length} total devices`);

    // Group devices by deviceName
    const devicesByName = {};
    allDevices.forEach((device) => {
      const key = device.deviceName || "unknown";
      if (!devicesByName[key]) {
        devicesByName[key] = [];
      }
      devicesByName[key].push(device);
    });

    // Find duplicates (same deviceName)
    let duplicatesRemoved = 0;
    for (const [deviceName, devices] of Object.entries(devicesByName)) {
      if (devices.length > 1) {
        console.log(`\n🔍 Found ${devices.length} entries for device: ${deviceName}`);
        
        // Sort by createdAt (most recent first)
        devices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Keep the most recent one, delete the rest
        const toKeep = devices[0];
        const toDelete = devices.slice(1);
        
        console.log(`  ✅ Keeping: ${toKeep._id} (created: ${toKeep.createdAt})`);
        console.log(`  ❌ Deleting ${toDelete.length} duplicate(s):`);
        toDelete.forEach((d) => {
          console.log(`     - ${d._id} (created: ${d.createdAt})`);
        });
        
        const deleteIds = toDelete.map((d) => d._id);
        await Device.deleteMany({ _id: { $in: deleteIds } });
        duplicatesRemoved += toDelete.length;
      }
    }

    console.log(`\n✅ Cleanup completed! Removed ${duplicatesRemoved} duplicate device entries`);
    
    // Show final count
    const finalCount = await Device.countDocuments({});
    console.log(`📊 Final device count: ${finalCount}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

cleanupDuplicateDevices();

