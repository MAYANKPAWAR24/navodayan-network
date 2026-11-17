-- ============================================================================
-- THE NAVODAYAN NETWORK: MASTER POSTGRESQL SCHEMA (SUPABASE)
-- Zero-Operating-Cost Super App for ~660+ JNV Schools Worldwide
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SCHOOLS (All ~660+ JNVs)
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    school_name TEXT NOT NULL,
    jnv_code TEXT,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    state_code VARCHAR(5) NOT NULL,
    region TEXT NOT NULL, -- Bhopal, Chandigarh, Hyderabad, Jaipur, Lucknow, Patna, Pune, Shillong
    established_year INT,
    official_website TEXT,
    email TEXT,
    phone_number TEXT,
    principal_name TEXT,
    address TEXT,
    latitude FLOAT8,
    longitude FLOAT8,
    is_dual_district BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schools_slug ON public.schools(slug);
CREATE INDEX IF NOT EXISTS idx_schools_state ON public.schools(state);
CREATE INDEX IF NOT EXISTS idx_schools_region ON public.schools(region);

-- 2. PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    navodayan_uid TEXT UNIQUE,
    email TEXT,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    jnv_school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
    passing_year INT NOT NULL,
    role_type TEXT NOT NULL DEFAULT 'alumni' CHECK (role_type IN ('alumni', 'student', 'faculty', 'admin')),
    current_city TEXT NOT NULL,
    current_state TEXT NOT NULL,
    current_country TEXT NOT NULL DEFAULT 'India',
    city_lat FLOAT8,
    city_lng FLOAT8,
    profession_category TEXT NOT NULL,
    profession_role TEXT NOT NULL,
    organization TEXT,
    blood_group TEXT DEFAULT 'Prefer not to say',
    is_blood_donor BOOLEAN DEFAULT false,
    jnv_house TEXT CHECK (jnv_house IN ('Aravali', 'Nilgiri', 'Shivalik', 'Udaigiri')) DEFAULT 'Aravali',
    show_contact_on_id BOOLEAN DEFAULT false,
    whatsapp_number TEXT NOT NULL,
    bio TEXT,
    is_verified BOOLEAN DEFAULT true,
    is_campus_correspondent BOOLEAN DEFAULT false,
    onboarding_completed BOOLEAN DEFAULT false,
    report_count INT DEFAULT 0,
    is_blocked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_jnv_school ON public.profiles(jnv_school_id);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(current_city);
CREATE INDEX IF NOT EXISTS idx_profiles_passing_year ON public.profiles(passing_year);
CREATE INDEX IF NOT EXISTS idx_profiles_blood_donor ON public.profiles(is_blood_donor, blood_group);

-- UNIQUE NAVODAYAN ID GENERATION FUNCTION & TRIGGER
CREATE SEQUENCE IF NOT EXISTS navodayan_uid_seq START 1001;

CREATE OR REPLACE FUNCTION generate_navodayan_uid()
RETURNS TRIGGER AS $$
DECLARE
    s_code TEXT;
    seq_num INT;
BEGIN
    IF NEW.navodayan_uid IS NULL OR NEW.navodayan_uid = '' THEN
        -- Get state code from school if available, else from profile current_state
        SELECT state_code INTO s_code FROM public.schools WHERE id = NEW.jnv_school_id LIMIT 1;
        IF s_code IS NULL OR s_code = '' THEN
            s_code := COALESCE(SUBSTRING(UPPER(NEW.current_state) FROM 1 FOR 2), 'IN');
        END IF;
        
        seq_num := nextval('navodayan_uid_seq');
        NEW.navodayan_uid := 'NVN-' || UPPER(s_code) || '-' || COALESCE(NEW.passing_year::TEXT, '2026') || '-' || LPAD(seq_num::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_navodayan_uid ON public.profiles;
CREATE TRIGGER trigger_generate_navodayan_uid
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION generate_navodayan_uid();

-- 3. CONNECTIONS
CREATE TABLE IF NOT EXISTS public.connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_connection_pair UNIQUE(requester_id, receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_connections_users ON public.connections(requester_id, receiver_id);

-- 4. POSTS
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    media_urls TEXT[] DEFAULT '{}',
    category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'memories', 'achievements', 'campus_live', 'safe_space')),
    is_safe_space BOOLEAN DEFAULT false,
    is_anonymous BOOLEAN DEFAULT false,
    poll_data JSONB, -- { options: [{ text, votes: [] }] }
    report_count INT DEFAULT 0,
    is_hidden BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_school ON public.posts(school_id);

-- 5. POST REACTIONS
CREATE TABLE IF NOT EXISTS public.post_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('salute', 'nostalgia', 'proud_jnv', 'support_hug', 'stay_strong')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_post_reaction UNIQUE (post_id, user_id)
);

-- 6. POST COMMENTS (RLS Blocks Safe Space Posts)
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MENTORSHIP LISTINGS
CREATE TABLE IF NOT EXISTS public.mentorship_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('competitive_exams', 'higher_studies', 'business_startups', 'work_life_corporate')),
    expertise_tags TEXT[] DEFAULT '{}',
    headline TEXT NOT NULL,
    description TEXT NOT NULL,
    availability_note TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. MENTORSHIP REQUESTS
CREATE TABLE IF NOT EXISTS public.mentorship_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.mentorship_listings(id) ON DELETE CASCADE,
    mentee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. BUSINESS HUB
CREATE TABLE IF NOT EXISTS public.business_hub (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    category TEXT NOT NULL,
    logo_url TEXT,
    banner_url TEXT,
    description TEXT NOT NULL,
    website_url TEXT,
    instagram_url TEXT,
    linkedin_url TEXT,
    whatsapp_number TEXT NOT NULL,
    phone_number TEXT,
    email TEXT,
    physical_address TEXT,
    city TEXT NOT NULL,
    navodayan_offer TEXT,
    approved_status BOOLEAN DEFAULT false,
    report_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. EMERGENCY SOS
CREATE TABLE IF NOT EXISTS public.emergency_sos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    urgency_level TEXT NOT NULL CHECK (urgency_level IN ('critical', 'important', 'general')),
    sos_type TEXT NOT NULL CHECK (sos_type IN ('blood_medical', 'job_referral', 'accommodation', 'city_help')),
    required_blood_group TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_city TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
    helpers_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. EVENTS
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('online', 'offline')),
    location_or_link TEXT NOT NULL,
    city TEXT,
    category TEXT NOT NULL CHECK (category IN ('reunion', 'career_webinar', 'sports', 'city_meetup')),
    banner_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. EVENT RSVPS
CREATE TABLE IF NOT EXISTS public.event_rsvps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('going', 'interested', 'not_going')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_event_rsvp UNIQUE(event_id, user_id)
);

-- 13. TIME CAPSULES
CREATE TABLE IF NOT EXISTS public.time_capsules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    batch_year INT NOT NULL,
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    unlock_date TIMESTAMPTZ NOT NULL,
    memories_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. HALL OF FAME
CREATE TABLE IF NOT EXISTS public.hall_of_fame (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    jnv_school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
    passing_year INT,
    achievement_title TEXT NOT NULL,
    domain TEXT NOT NULL,
    story_summary TEXT NOT NULL,
    quote TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. CHAT ROOMS & MESSAGES
CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_type TEXT NOT NULL CHECK (room_type IN ('direct', 'school', 'batch', 'city')),
    reference_id TEXT NOT NULL, -- e.g., 'school-[school_id]', 'batch-[year]', 'city-[city]'
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. REPORTS (10-Report Auto-Block Trigger)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('post', 'profile', 'business')),
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_report_per_user UNIQUE(reporter_id, target_type, target_id)
);

-- 17. PLATFORM FEEDBACK (Bug Reports + Feature Suggestions)
CREATE TABLE IF NOT EXISTS public.platform_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('bug_report', 'feature_suggestion')),
    page_url TEXT NOT NULL,
    description TEXT NOT NULL,
    contact_whatsapp TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_feedback_status ON public.platform_feedback(status);
CREATE INDEX IF NOT EXISTS idx_platform_feedback_type ON public.platform_feedback(type);

-- 10-REPORT AUTO-MODERATION TRIGGER
CREATE OR REPLACE FUNCTION handle_auto_moderation()
RETURNS TRIGGER AS $$
DECLARE
    cur_reports INT;
BEGIN
    IF NEW.target_type = 'post' THEN
        UPDATE public.posts 
        SET report_count = report_count + 1 
        WHERE id = NEW.target_id 
        RETURNING report_count INTO cur_reports;

        IF cur_reports >= 10 THEN
            UPDATE public.posts SET is_hidden = true WHERE id = NEW.target_id;
        END IF;

    ELSIF NEW.target_type = 'profile' THEN
        UPDATE public.profiles 
        SET report_count = report_count + 1 
        WHERE id = NEW.target_id 
        RETURNING report_count INTO cur_reports;

        IF cur_reports >= 10 THEN
            UPDATE public.profiles SET is_blocked = true WHERE id = NEW.target_id;
        END IF;

    ELSIF NEW.target_type = 'business' THEN
        UPDATE public.business_hub 
        SET report_count = report_count + 1 
        WHERE id = NEW.target_id 
        RETURNING report_count INTO cur_reports;

        IF cur_reports >= 10 THEN
            UPDATE public.business_hub SET approved_status = false WHERE id = NEW.target_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_moderation ON public.reports;
CREATE TRIGGER trigger_auto_moderation
AFTER INSERT ON public.reports
FOR EACH ROW
EXECUTE FUNCTION handle_auto_moderation();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hub ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_sos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hall_of_fame ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_feedback ENABLE ROW LEVEL SECURITY;

-- Schools: Public read
CREATE POLICY "Schools are viewable by everyone" ON public.schools FOR SELECT USING (true);

-- Profiles: Public read unblocked, Authenticated update own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (is_blocked = false);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Posts: Public read standard posts; Safe Space read ONLY if author or accepted connection
CREATE POLICY "Standard posts viewable by everyone" ON public.posts FOR SELECT USING (
    is_hidden = false AND (
        is_safe_space = false 
        OR author_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.connections 
            WHERE status = 'accepted' 
            AND ((requester_id = auth.uid() AND receiver_id = posts.author_id)
              OR (receiver_id = auth.uid() AND requester_id = posts.author_id))
        )
    )
);
CREATE POLICY "Users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own posts" ON public.posts FOR UPDATE USING (auth.uid() = author_id);

-- Post Comments: Prevent comment insert on Safe Space posts
CREATE POLICY "Comments viewable by everyone" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Cannot comment on Safe Space posts" ON public.post_comments FOR INSERT WITH CHECK (
    auth.uid() = author_id 
    AND NOT EXISTS (
        SELECT 1 FROM public.posts 
        WHERE id = post_id AND (is_safe_space = true OR category = 'safe_space')
    )
);

-- Business Hub: Approved businesses viewable by all, Owners can edit
CREATE POLICY "Approved businesses viewable by all" ON public.business_hub FOR SELECT USING (approved_status = true OR owner_id = auth.uid());
CREATE POLICY "Users can create business listing" ON public.business_hub FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update business" ON public.business_hub FOR UPDATE USING (auth.uid() = owner_id);

-- Mentorship: Active listings viewable by all
CREATE POLICY "Active mentorship listings viewable" ON public.mentorship_listings FOR SELECT USING (is_active = true OR mentor_id = auth.uid());
CREATE POLICY "Users can create mentor listings" ON public.mentorship_listings FOR INSERT WITH CHECK (auth.uid() = mentor_id);

-- SOS: Active SOS viewable by all
CREATE POLICY "Active SOS viewable by all" ON public.emergency_sos FOR SELECT USING (true);
CREATE POLICY "Users can create SOS" ON public.emergency_sos FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Events & Hall of Fame: Viewable by all
CREATE POLICY "Events viewable by all" ON public.events FOR SELECT USING (true);
CREATE POLICY "Hall of fame viewable by all" ON public.hall_of_fame FOR SELECT USING (true);

-- Platform Feedback: Guest insert, admin read/update
CREATE POLICY "Anyone can submit feedback" ON public.platform_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read feedback" ON public.platform_feedback FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role_type = 'admin'
    )
);
CREATE POLICY "Admins can update feedback status" ON public.platform_feedback FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role_type = 'admin'
    )
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS jnv_house TEXT CHECK (jnv_house IN ('Aravali', 'Nilgiri', 'Shivalik', 'Udaigiri')) DEFAULT 'Aravali';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_contact_on_id BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ALTER COLUMN whatsapp_number SET NOT NULL;
