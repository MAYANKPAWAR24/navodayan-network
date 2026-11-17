import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  BloodGroup,
  JNVHouse,
  NavodayanProfile,
  ProfessionCategory,
} from "@/types";

const professionCategories: ProfessionCategory[] = [
  "IT & Software Engineering",
  "Civil Services & Government (IAS/IPS/SSC/Banking)",
  "Defence & Paramilitary (Army/Navy/Air Force/CAPF)",
  "Medical & Healthcare (Doctor/Surgeon/Pharma)",
  "Business, Startups & Entrepreneurship",
  "Core Engineering & PSUs (ISRO/DRDO/ONGC/NTPC)",
  "Finance, CA, CS & Legal",
  "Education, Research & JNV Faculty",
  "Arts, Media, Design & Sports",
  "Current Student (School / College / Exam Aspirant)",
];

const bloodGroups: BloodGroup[] = [
  "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", "Prefer not to say",
];

const houses: JNVHouse[] = ["Aravali", "Nilgiri", "Shivalik", "Udaigiri"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function mapSupabaseProfile(value: unknown): NavodayanProfile {
  if (!isRecord(value)) throw new Error("Supabase returned an invalid profile.");
  const row = value;
  const profession = String(row.profession_category || "");
  const bloodGroup = String(row.blood_group || "");
  const house = String(row.jnv_house || "");

  return {
    id: String(row.id),
    navodayan_uid: String(row.navodayan_uid || "NVN-PENDING"),
    email: String(row.email || ""),
    full_name: String(row.full_name || ""),
    avatar_url: String(row.avatar_url || ""),
    jnv_school_id: row.jnv_school_id ? String(row.jnv_school_id) : "",
    jnv_school_name: row.jnv_school_name ? String(row.jnv_school_name) : undefined,
    passing_year: Number(row.passing_year || new Date().getFullYear()),
    role_type: row.role_type === "student" || row.role_type === "faculty" || row.role_type === "admin"
      ? row.role_type
      : "alumni",
    current_city: String(row.current_city || ""),
    current_state: String(row.current_state || ""),
    current_country: String(row.current_country || "India"),
    city_lat: Number(row.city_lat || 0),
    city_lng: Number(row.city_lng || 0),
    profession_category: professionCategories.includes(profession as ProfessionCategory)
      ? profession as ProfessionCategory
      : "IT & Software Engineering",
    profession_role: String(row.profession_role || ""),
    organization: String(row.organization || ""),
    blood_group: bloodGroups.includes(bloodGroup as BloodGroup)
      ? bloodGroup as BloodGroup
      : "Prefer not to say",
    is_blood_donor: Boolean(row.is_blood_donor),
    jnv_house: houses.includes(house as JNVHouse) ? house as JNVHouse : undefined,
    show_contact_on_id: Boolean(row.show_contact_on_id),
    whatsapp_number: String(row.whatsapp_number || ""),
    bio: row.bio ? String(row.bio) : undefined,
    is_verified: Boolean(row.is_verified),
    is_campus_correspondent: Boolean(row.is_campus_correspondent),
    onboarding_completed: Boolean(row.onboarding_completed),
    report_count: Number(row.report_count || 0),
    is_blocked: Boolean(row.is_blocked),
    created_at: String(row.created_at || new Date().toISOString()),
  };
}

const publicProfileFields = [
  "id", "navodayan_uid", "full_name", "avatar_url", "jnv_school_id",
  "jnv_school_name", "passing_year", "role_type", "current_city", "current_state",
  "current_country", "city_lat", "city_lng", "profession_category", "profession_role",
  "organization", "blood_group", "is_blood_donor", "jnv_house", "show_contact_on_id",
  "bio", "is_verified", "is_campus_correspondent", "onboarding_completed",
  "created_at",
].join(",");

export async function fetchSupabaseProfile(
  userId: string,
  includePrivateFields = false
): Promise<NavodayanProfile | null> {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("Supabase is not configured. Add its URL and anon key to .env.local.");

  let canReadPrivateFields = false;
  if (includePrivateFields) {
    const { data: { user }, error } = await client.auth.getUser();
    if (error || user?.id !== userId) {
      throw new Error("Private profile details can only be loaded by their owner.");
    }
    canReadPrivateFields = true;
  }

  const { data, error } = await client
    .from("profiles")
    .select(canReadPrivateFields ? "*" : publicProfileFields)
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(`Could not load your profile: ${error.message}`);
  return data ? mapSupabaseProfile(data) : null;
}

export async function fetchSupabaseProfiles(): Promise<NavodayanProfile[]> {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("Supabase is not configured. Add its URL and anon key to .env.local.");

  const { data, error } = await client
    .from("profiles")
    .select(publicProfileFields)
    .eq("onboarding_completed", true)
    .eq("is_blocked", false)
    .order("full_name", { ascending: true })
    .limit(500);

  if (error) throw new Error(`Could not load the Navodayan directory: ${error.message}`);
  const rows: unknown = data;
  return Array.isArray(rows) ? rows.map(mapSupabaseProfile) : [];
}

export async function saveSupabaseProfile(
  userId: string,
  email: string,
  profile: Partial<NavodayanProfile>
): Promise<NavodayanProfile> {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("Supabase is not configured. Add its URL and anon key to .env.local.");

  const { data, error } = await client
    .from("profiles")
    .upsert(
      {
        id: userId,
        email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url || null,
        jnv_school_id: null,
        jnv_school_name: profile.jnv_school_name || null,
        passing_year: profile.passing_year,
        role_type: profile.role_type || "alumni",
        current_city: profile.current_city,
        current_state: profile.current_state,
        current_country: profile.current_country || "India",
        city_lat: profile.city_lat || null,
        city_lng: profile.city_lng || null,
        profession_category: profile.profession_category,
        profession_role: profile.profession_role,
        organization: profile.organization || null,
        blood_group: profile.blood_group || "Prefer not to say",
        is_blood_donor: profile.is_blood_donor ?? false,
        jnv_house: profile.jnv_house || "Aravali",
        show_contact_on_id: profile.show_contact_on_id ?? false,
        whatsapp_number: profile.whatsapp_number,
        bio: profile.bio || null,
        onboarding_completed: true,
      },
      { onConflict: "id" }
    )
    .select("*")
    .single();

  if (error) throw new Error(`Could not save your profile: ${error.message}`);
  return mapSupabaseProfile(data);
}
