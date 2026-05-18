import { supabase } from "../config/db.js";

const COLUMNS =
  "id, user_id, brand, manufacturer, model_name, device_name, os_name, os_version, os_build_id, device_type, total_memory, supported_cpu_architectures, device_year_class, is_device, created_at, updated_at";

const toApi = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    userId: row.user_id,
    brand: row.brand,
    manufacturer: row.manufacturer,
    modelName: row.model_name,
    deviceName: row.device_name,
    osName: row.os_name,
    osVersion: row.os_version,
    osBuildId: row.os_build_id,
    deviceType: row.device_type,
    totalMemory: row.total_memory,
    supportedCpuArchitectures: row.supported_cpu_architectures,
    deviceYearClass: row.device_year_class,
    isDevice: row.is_device,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const toDb = (data) => {
  const out = {};
  if (data.userId !== undefined) out.user_id = data.userId;
  if (data.brand !== undefined) out.brand = data.brand;
  if (data.manufacturer !== undefined) out.manufacturer = data.manufacturer;
  if (data.modelName !== undefined) out.model_name = data.modelName;
  if (data.deviceName !== undefined) out.device_name = data.deviceName;
  if (data.osName !== undefined) out.os_name = data.osName;
  if (data.osVersion !== undefined) out.os_version = data.osVersion;
  if (data.osBuildId !== undefined) out.os_build_id = data.osBuildId;
  if (data.deviceType !== undefined) out.device_type = data.deviceType;
  if (data.totalMemory !== undefined) out.total_memory = data.totalMemory;
  if (data.supportedCpuArchitectures !== undefined)
    out.supported_cpu_architectures = data.supportedCpuArchitectures;
  if (data.deviceYearClass !== undefined)
    out.device_year_class = data.deviceYearClass;
  if (data.isDevice !== undefined) out.is_device = data.isDevice;
  return out;
};

const Device = {
  async findByUserAndName(userId, deviceName) {
    const { data, error } = await supabase
      .from("devices")
      .select(COLUMNS)
      .eq("user_id", userId)
      .eq("device_name", deviceName)
      .maybeSingle();
    if (error) throw error;
    return toApi(data);
  },

  async upsert({ userId, deviceName, ...rest }) {
    const existing = await Device.findByUserAndName(userId, deviceName);
    if (existing) {
      const { data, error } = await supabase
        .from("devices")
        .update(toDb(rest))
        .eq("id", existing.id)
        .select(COLUMNS)
        .single();
      if (error) throw error;
      return { device: toApi(data), isNew: false };
    }
    const { data, error } = await supabase
      .from("devices")
      .insert(toDb({ userId, deviceName, ...rest }))
      .select(COLUMNS)
      .single();
    if (error) throw error;
    return { device: toApi(data), isNew: true };
  },
};

export default Device;
