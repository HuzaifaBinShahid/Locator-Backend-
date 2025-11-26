import { Schema, model } from "mongoose";

const deviceSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  brand: String,
  manufacturer: String,
  modelName: String,
  deviceName: String,
  osName: String,
  osVersion: String,
  osBuildId: String,
  deviceType: String,
  totalMemory: Number,
  supportedCpuArchitectures: [String],
  deviceYearClass: Number,
  isDevice: Boolean,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index to ensure one device per user per deviceName
deviceSchema.index({ userId: 1, deviceName: 1 }, { unique: true });

export default model("Device", deviceSchema);
