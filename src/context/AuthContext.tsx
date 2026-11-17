"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { NavodayanProfile } from "@/types";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/browser";
import { fetchSupabaseProfile, saveSupabaseProfile } from "@/services/supabaseProfileService";
import { sound } from "@/lib/sound";
import { toast } from "sonner";

interface AuthContextType {
  user: NavodayanProfile | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  isSupabaseConfigured: boolean;
  isOnboardingOpen: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<boolean>;
  resendSignUpConfirmation: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  saveOnboarding: (data: Partial<NavodayanProfile>) => Promise<NavodayanProfile>;
  requireAuth: (action: () => void) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isAuthLoading: true,
  isSupabaseConfigured: false,
  isOnboardingOpen: false,
  isAuthModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  loginWithEmail: async () => {},
  signUpWithEmail: async () => false,
  resendSignUpConfirmation: async () => {},
  logout: async () => {},
  saveOnboarding: async () => ({} as NavodayanProfile),
  requireAuth: () => {},
});

function createDraftProfile(authUser: SupabaseUser): NavodayanProfile {
  const email = authUser.email || "";
  const nameFromEmail = email.split("@")[0].replace(/[._-]+/g, " ");
  const fullName = String(authUser.user_metadata?.full_name || nameFromEmail || "Navodayan")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  return {
    id: authUser.id,
    navodayan_uid: "NVN-PENDING",
    email,
    full_name: fullName,
    avatar_url: String(authUser.user_metadata?.avatar_url || ""),
    jnv_school_id: "",
    passing_year: new Date().getFullYear() - 8,
    role_type: "alumni",
    current_city: "Bengaluru",
    current_state: "Karnataka",
    current_country: "India",
    city_lat: 12.9716,
    city_lng: 77.5946,
    profession_category: "IT & Software Engineering",
    profession_role: "Navodayan",
    organization: "",
    blood_group: "Prefer not to say",
    is_blood_donor: false,
    jnv_house: "Aravali",
    show_contact_on_id: false,
    whatsapp_number: "",
    is_verified: false,
    onboarding_completed: false,
    report_count: 0,
    is_blocked: false,
    created_at: new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<NavodayanProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const authError = url.searchParams.get("auth_error") || url.searchParams.get("error_code");
    if (authError) {
      const message = authError === "otp_expired"
        ? "This confirmation link has expired or was already used. Request a new confirmation email and open its latest link."
        : authError === "supabase_not_configured"
          ? "Email confirmation could not be completed because Supabase is not configured."
        : "Email confirmation could not be completed. Request a new confirmation email and try again.";
      toast.error(message);
      url.searchParams.delete("auth_error");
      url.searchParams.delete("error");
      url.searchParams.delete("error_code");
      url.searchParams.delete("error_description");
      url.hash = "";
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }, []);

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      setIsAuthLoading(false);
      return;
    }

    let active = true;
    const hydrateProfile = async (authUser: SupabaseUser | null) => {
      if (!authUser) {
        if (active) {
          setUser(null);
          setIsAuthenticated(false);
          setIsOnboardingOpen(false);
          setIsAuthLoading(false);
        }
        return;
      }

      try {
        const profile = await fetchSupabaseProfile(authUser.id, true);
        if (!active) return;
        const currentProfile = profile || createDraftProfile(authUser);
        setUser(currentProfile);
        setIsAuthenticated(true);
        setIsOnboardingOpen(!currentProfile.onboarding_completed);
        setIsAuthLoading(false);
      } catch (error) {
        if (!active) return;
        setIsAuthLoading(false);
        toast.error(error instanceof Error ? error.message : "Could not load your Navodayan profile.");
      }
    };

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => {
        void hydrateProfile(session?.user || null);
      }, 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = () => {
    sound.playTap();
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  const loginWithEmail = async (email: string, password: string) => {
    const client = getSupabaseBrowserClient();
    if (!client) throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.");
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    sound.playSuccess();
    setIsAuthModalOpen(false);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const client = getSupabaseBrowserClient();
    if (!client) throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.");
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw new Error(error.message);
    sound.playSuccess();
    if (data.session) setIsAuthModalOpen(false);
    return Boolean(data.session);
  };

  const resendSignUpConfirmation = async (email: string) => {
    const client = getSupabaseBrowserClient();
    if (!client) throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.");
    const { error } = await client.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw new Error(error.message);
  };

  const logout = async () => {
    const client = getSupabaseBrowserClient();
    if (!client) return;
    const { error } = await client.auth.signOut();
    if (error) {
      toast.error(`Could not sign out: ${error.message}`);
      return;
    }
    sound.playTap();
    setUser(null);
    setIsAuthenticated(false);
    setIsOnboardingOpen(false);
  };

  const saveOnboarding = async (data: Partial<NavodayanProfile>) => {
    const client = getSupabaseBrowserClient();
    if (!client) throw new Error("Supabase is not configured. Add its URL and anon key to .env.local.");
    const { data: { user: authUser }, error } = await client.auth.getUser();
    if (error || !authUser) throw new Error(error?.message || "Sign in again before completing your profile.");

    const completed = await saveSupabaseProfile(authUser.id, authUser.email || "", data);
    setUser(completed);
    setIsAuthenticated(true);
    setIsOnboardingOpen(false);
    sound.playSuccess();
    return completed;
  };

  const requireAuth = (action: () => void) => {
    if (isAuthenticated && user) action();
    else openAuthModal();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAuthLoading,
        isSupabaseConfigured: isSupabaseConfigured(),
        isOnboardingOpen,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        loginWithEmail,
        signUpWithEmail,
        resendSignUpConfirmation,
        logout,
        saveOnboarding,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
