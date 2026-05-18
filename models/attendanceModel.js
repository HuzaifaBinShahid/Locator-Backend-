import { supabase } from "../config/db.js";

const COLUMNS =
  "id, user_id, date, checkin_time, checkout_time, checkin_latitude, checkin_longitude, checkin_address, checkout_latitude, checkout_longitude, checkout_address, total_hours, is_active, created_at, updated_at";

const toApi = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    userId: row.user_id,
    date: row.date,
    checkinTime: row.checkin_time,
    checkoutTime: row.checkout_time,
    checkinLocation: {
      latitude: row.checkin_latitude,
      longitude: row.checkin_longitude,
      address: row.checkin_address,
    },
    checkoutLocation:
      row.checkout_latitude !== null && row.checkout_latitude !== undefined
        ? {
            latitude: row.checkout_latitude,
            longitude: row.checkout_longitude,
            address: row.checkout_address,
          }
        : { latitude: null, longitude: null, address: null },
    totalHours: row.total_hours,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const Attendance = {
  async findByUserAndDate(userId, date) {
    const { data, error } = await supabase
      .from("attendance")
      .select(COLUMNS)
      .eq("user_id", userId)
      .eq("date", date)
      .maybeSingle();
    if (error) throw error;
    return toApi(data);
  },

  async findActiveByUserAndDate(userId, date) {
    const { data, error } = await supabase
      .from("attendance")
      .select(COLUMNS)
      .eq("user_id", userId)
      .eq("date", date)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw error;
    return toApi(data);
  },

  async create({ userId, date, checkinTime, checkinLocation, isActive = true }) {
    const { data, error } = await supabase
      .from("attendance")
      .insert({
        user_id: userId,
        date,
        checkin_time: checkinTime,
        checkin_latitude: checkinLocation.latitude,
        checkin_longitude: checkinLocation.longitude,
        checkin_address: checkinLocation.address,
        is_active: isActive,
      })
      .select(COLUMNS)
      .single();
    if (error) throw error;
    return toApi(data);
  },

  async checkout(id, { checkoutTime, checkoutLocation, totalHours }) {
    const { data, error } = await supabase
      .from("attendance")
      .update({
        checkout_time: checkoutTime,
        checkout_latitude: checkoutLocation.latitude,
        checkout_longitude: checkoutLocation.longitude,
        checkout_address: checkoutLocation.address,
        total_hours: totalHours,
        is_active: false,
      })
      .eq("id", id)
      .select(COLUMNS)
      .single();
    if (error) throw error;
    return toApi(data);
  },

  async findByUserSince(userId, sinceDate) {
    const { data, error } = await supabase
      .from("attendance")
      .select(COLUMNS)
      .eq("user_id", userId)
      .gte("checkin_time", sinceDate.toISOString())
      .order("date", { ascending: false });
    if (error) throw error;
    return (data || []).map(toApi);
  },

  async countByUserSince(userId, sinceDate) {
    const { count, error } = await supabase
      .from("attendance")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("checkin_time", sinceDate.toISOString());
    if (error) throw error;
    return count || 0;
  },

  async findAllByUser(userId) {
    const { data, error } = await supabase
      .from("attendance")
      .select(COLUMNS)
      .eq("user_id", userId)
      .order("date", { ascending: false });
    if (error) throw error;
    return (data || []).map(toApi);
  },

  async findReports({ userId, startDate, endDate }) {
    let q = supabase
      .from("attendance")
      .select(
        `${COLUMNS}, users:user_id(id, username, email, nie_or_dni, social_security_number, profile_image)`
      )
      .order("date", { ascending: false })
      .order("checkin_time", { ascending: false });

    if (userId) q = q.eq("user_id", userId);
    if (startDate) q = q.gte("date", startDate);
    if (endDate) q = q.lte("date", endDate);

    const { data, error } = await q;
    if (error) throw error;
    return (data || []).map((row) => {
      const base = toApi(row);
      base.userId = row.users
        ? {
            id: row.users.id,
            _id: row.users.id,
            username: row.users.username,
            email: row.users.email,
            nieOrDni: row.users.nie_or_dni,
            socialSecurityNumber: row.users.social_security_number,
            profileImage: row.users.profile_image,
          }
        : row.user_id;
      return base;
    });
  },
};

export default Attendance;
