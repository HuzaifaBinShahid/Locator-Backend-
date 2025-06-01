import { Schema, model } from "mongoose";

const deviceSchema = new Schema({
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
});

export default model("Device", deviceSchema);
