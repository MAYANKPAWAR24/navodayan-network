CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    navodayan_uid TEXT UNIQUE,
    email TEXT,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    jnv_school_id UUID,
    jnv_school_name TEXT,
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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'profiles'
          AND policyname = 'Public profiles are viewable by everyone'
    ) THEN
        CREATE POLICY "Public profiles are viewable by everyone"
            ON public.profiles FOR SELECT USING (is_blocked = false);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'profiles'
          AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile"
            ON public.profiles FOR UPDATE USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'profiles'
          AND policyname = 'Authenticated users can create own profile'
    ) THEN
        CREATE POLICY "Authenticated users can create own profile"
            ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END
$$;

GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;

NOTIFY pgrst, 'reload schema';
