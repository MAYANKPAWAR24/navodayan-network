export type NVSRegion =
  | "Bhopal"
  | "Chandigarh"
  | "Hyderabad"
  | "Jaipur"
  | "Lucknow"
  | "Patna"
  | "Pune"
  | "Shillong";

export interface JNVSchool {
  id: string;
  slug: string;
  school_name: string;
  jnv_code: string;
  district: string;
  state: string;
  state_code: string;
  region: NVSRegion;
  established_year: number;
  official_website: string;
  email: string;
  phone_number: string;
  principal_name: string;
  address: string;
  latitude: number;
  longitude: number;
  is_dual_district?: boolean;
}

export type ProfessionCategory =
  | "IT & Software Engineering"
  | "Civil Services & Government (IAS/IPS/SSC/Banking)"
  | "Defence & Paramilitary (Army/Navy/Air Force/CAPF)"
  | "Medical & Healthcare (Doctor/Surgeon/Pharma)"
  | "Business, Startups & Entrepreneurship"
  | "Core Engineering & PSUs (ISRO/DRDO/ONGC/NTPC)"
  | "Finance, CA, CS & Legal"
  | "Education, Research & JNV Faculty"
  | "Arts, Media, Design & Sports"
  | "Current Student (School / College / Exam Aspirant)";

export type JNVHouse = "Aravali" | "Nilgiri" | "Shivalik" | "Udaigiri";

export type BloodGroup =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "O+"
  | "O-"
  | "AB+"
  | "AB-"
  | "Prefer not to say";

export interface NavodayanProfile {
  id: string;
  navodayan_uid: string; // e.g. NVN-HP-2018-0492
  email: string;
  full_name: string;
  avatar_url: string;
  jnv_school_id: string;
  jnv_school_name?: string;
  passing_year: number;
  role_type: "alumni" | "student" | "faculty" | "admin";
  current_city: string;
  current_state: string;
  current_country: string;
  city_lat: number;
  city_lng: number;
  profession_category: ProfessionCategory;
  profession_role: string;
  organization: string;
  blood_group: BloodGroup;
  is_blood_donor: boolean;
  jnv_house?: JNVHouse;
  show_contact_on_id?: boolean;
  whatsapp_number: string;
  bio?: string;
  is_verified: boolean;
  is_campus_correspondent?: boolean;
  onboarding_completed: boolean;
  report_count: number;
  is_blocked: boolean;
  created_at: string;
}

export type PlatformFeedbackType = "bug_report" | "feature_suggestion";
export type PlatformFeedbackStatus = "new" | "reviewed" | "resolved";

export interface PlatformFeedbackEntry {
  id: string;
  user_id: string | null;
  type: PlatformFeedbackType;
  page_url: string;
  description: string;
  contact_whatsapp?: string | null;
  status: PlatformFeedbackStatus;
  created_at: string;
}

export interface PostReaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: "salute" | "nostalgia" | "proud_jnv" | "support_hug" | "stay_strong";
}

export interface PostComment {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  content: string;
  created_at: string;
}

export interface PollOption {
  text: string;
  votes: string[]; // user IDs who voted
}

export interface Post {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  author_school?: string;
  author_batch?: number;
  author_uid?: string;
  school_id?: string;
  content: string;
  media_urls?: string[];
  category: "general" | "memories" | "achievements" | "campus_live" | "safe_space";
  is_safe_space: boolean;
  is_anonymous: boolean;
  poll_data?: {
    question?: string;
    options: PollOption[];
  };
  reactions: Record<string, number>;
  user_reaction?: string;
  comments: PostComment[];
  report_count: number;
  is_hidden: boolean;
  created_at: string;
}

export interface MentorshipListing {
  id: string;
  mentor_id: string;
  mentor_name: string;
  mentor_avatar?: string;
  mentor_role: string;
  mentor_org: string;
  mentor_school: string;
  mentor_batch: number;
  category: "competitive_exams" | "higher_studies" | "business_startups" | "work_life_corporate";
  expertise_tags: string[];
  headline: string;
  description: string;
  availability_note?: string;
  is_active: boolean;
  created_at: string;
}

export interface MentorshipRequest {
  id: string;
  listing_id: string;
  mentee_id: string;
  mentee_name: string;
  mentor_id: string;
  topic: string;
  message: string;
  status: "pending" | "accepted" | "completed";
  created_at: string;
}

export interface BusinessListing {
  id: string;
  owner_id: string;
  owner_name: string;
  owner_school: string;
  owner_batch: number;
  business_name: string;
  category: string;
  logo_url?: string;
  banner_url?: string;
  description: string;
  website_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  whatsapp_number: string;
  phone_number?: string;
  email?: string;
  physical_address?: string;
  city: string;
  navodayan_offer?: string;
  approved_status: boolean;
  report_count: number;
  created_at: string;
}

export interface EmergencySOS {
  id: string;
  user_id: string;
  author_name: string;
  author_school: string;
  author_batch: number;
  urgency_level: "critical" | "important" | "general";
  sos_type: "blood_medical" | "job_referral" | "accommodation" | "city_help";
  required_blood_group?: BloodGroup;
  title: string;
  description: string;
  target_city: string;
  contact_phone: string;
  status: "active" | "resolved";
  helpers_count: number;
  created_at: string;
}

export interface EventItem {
  id: string;
  creator_id: string;
  creator_name: string;
  title: string;
  description: string;
  event_date: string;
  mode: "online" | "offline";
  location_or_link: string;
  city?: string;
  category: "reunion" | "career_webinar" | "sports" | "city_meetup";
  banner_url?: string;
  rsvps_going: number;
  rsvps_interested: number;
  user_rsvp?: "going" | "interested" | "not_going";
  created_at: string;
}

export interface TimeCapsule {
  id: string;
  school_id: string;
  school_name: string;
  batch_year: number;
  creator_id: string;
  creator_name: string;
  title: string;
  unlock_date: string;
  memories_json: {
    dorm_stories: string[];
    mess_memories: string[];
    famous_slang: string[];
    batch_secrets: string[];
    photos?: string[];
  };
  is_unlocked: boolean;
  created_at: string;
}

export interface HallOfFameEntry {
  id: string;
  full_name: string;
  jnv_school_name: string;
  passing_year: number;
  achievement_title: string;
  domain: string;
  story_summary: string;
  quote?: string;
  photo_url: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  sender_school?: string;
  content: string;
  media_url?: string;
  created_at: string;
}

export interface CityData {
  city: string;
  district?: string;
  state: string;
  state_code?: string;
  stateCode?: string;
  country: string;
  latitude: number;
  longitude: number;
  lng?: number;
  alumni_count?: number;
}
