import { supabase } from "../config/db.js";

const COLUMNS =
  "id, username, email, password, role, biometric_enabled, profile_image, nie_or_dni, social_security_number, created_at, updated_at";

const toApi = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    username: row.username,
    email: row.email,
    password: row.password,
    role: row.role,
    biometricEnabled: row.biometric_enabled,
    profileImage: row.profile_image,
    nieOrDni: row.nie_or_dni,
    socialSecurityNumber: row.social_security_number,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const toDb = (data) => {
  const out = {};
  if (data.username !== undefined) out.username = data.username;
  if (data.email !== undefined) out.email = data.email;
  if (data.password !== undefined) out.password = data.password;
  if (data.role !== undefined) out.role = data.role;
  if (data.biometricEnabled !== undefined)
    out.biometric_enabled = data.biometricEnabled;
  if (data.profileImage !== undefined) out.profile_image = data.profileImage;
  if (data.nieOrDni !== undefined) out.nie_or_dni = data.nieOrDni;
  if (data.socialSecurityNumber !== undefined)
    out.social_security_number = data.socialSecurityNumber;
  return out;
};

const User = {
  async findById(id, { selectPassword = true } = {}) {
    if (!id) return null;
    const cols = selectPassword
      ? COLUMNS
      : COLUMNS.replace(", password", "");
    const { data, error } = await supabase
      .from("users")
      .select(cols)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return toApi(data);
  },

  async findByEmail(email) {
    const { data, error } = await supabase
      .from("users")
      .select(COLUMNS)
      .eq("email", email)
      .maybeSingle();
    if (error) throw error;
    return toApi(data);
  },

  async findByEmailOrUsername(email, username) {
    const { data, error } = await supabase
      .from("users")
      .select(COLUMNS)
      .or(`email.eq.${email},username.eq.${username}`)
      .maybeSingle();
    if (error && error.code !== "PGRST116") throw error;
    return toApi(data);
  },

  async create(data) {
    const row = toDb(data);
    const { data: created, error } = await supabase
      .from("users")
      .insert(row)
      .select(COLUMNS)
      .single();
    if (error) throw error;
    return toApi(created);
  },

  async updateById(id, patch) {
    const row = toDb(patch);
    const { data, error } = await supabase
      .from("users")
      .update(row)
      .eq("id", id)
      .select(COLUMNS)
      .maybeSingle();
    if (error) throw error;
    return toApi(data);
  },

  async countByRole(role, { not = false } = {}) {
    let q = supabase.from("users").select("id", { count: "exact", head: true });
    if (role !== null) {
      q = not ? q.neq("role", role) : q.eq("role", role);
    }
    const { count, error } = await q;
    if (error) throw error;
    return count || 0;
  },

  async listNonAdmins({ limit = null } = {}) {
    let q = supabase
      .from("users")
      .select(COLUMNS.replace(", password", ""))
      .neq("role", "admin")
      .order("created_at", { ascending: false });
    if (limit) q = q.limit(limit);
    const { data, error } = await q;
    if (error) throw error;
    return (data || []).map(toApi);
  },
};

export default User;
