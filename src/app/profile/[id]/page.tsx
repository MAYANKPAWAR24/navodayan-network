"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Briefcase, Check, GraduationCap, MapPin, MessageSquare, UserPlus } from "lucide-react";
import { dataService } from "@/services/dataService";
import { useAuth } from "@/context/AuthContext";
import { useSoundFX } from "@/context/SoundContext";
import { toast } from "sonner";
import { NavodayanProfile } from "@/types";
import { connectSupabaseProfile, fetchConnectionIds } from "@/services/supabaseMessagingService";
import { fetchSupabaseProfile } from "@/services/supabaseProfileService";

export default function MemberProfilePage({ params }: { params: { id: string } }) {
  const { user, requireAuth, isSupabaseConfigured } = useAuth();
  const { playTap, playSuccess } = useSoundFX();
  const [profile, setProfile] = useState<NavodayanProfile | null>(() =>
    isSupabaseConfigured ? null : dataService.getProfileById(params.id) ?? null
  );
  const [isProfileLoading, setIsProfileLoading] = useState(isSupabaseConfigured);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let active = true;
    if (!isSupabaseConfigured) {
      setProfile(dataService.getProfileById(params.id) ?? null);
      setIsProfileLoading(false);
      setIsConnected(Boolean(user && dataService.getConnections(user.id).includes(params.id)));
      return () => { active = false; };
    }

    setIsProfileLoading(true);
    void fetchSupabaseProfile(params.id).then((remoteProfile) => {
      if (active) setProfile(remoteProfile);
    }).catch((error: unknown) => {
      if (active) toast.error(error instanceof Error ? error.message : "Could not load this profile.");
    }).finally(() => {
      if (active) setIsProfileLoading(false);
    });
    return () => { active = false; };
  }, [params.id, isSupabaseConfigured, user]);

  useEffect(() => {
    if (!user || !isSupabaseConfigured) return;
    let active = true;
    void fetchConnectionIds(user.id).then((ids) => {
      if (active) setIsConnected(ids.includes(params.id));
    }).catch((error: unknown) => {
      if (active) toast.error(error instanceof Error ? error.message : "Could not check this connection.");
    });
    return () => { active = false; };
  }, [params.id, user, isSupabaseConfigured]);

  if (isProfileLoading) {
    return <div className="mx-auto max-w-3xl animate-pulse rounded-3xl bg-slate-100 p-8 dark:bg-zinc-900">Loading Navodayan profile...</div>;
  }
  if (!profile) {
    return <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 dark:border-white/10 dark:bg-zinc-900 dark:text-slate-300">This Navodayan profile could not be found.</div>;
  }

  const isOwnProfile = user?.id === profile.id;

  const connect = () => {
    requireAuth(() => {
      if (!user) return;
      const connect = isSupabaseConfigured
        ? connectSupabaseProfile(user.id, profile.id)
        : Promise.resolve().then(() => dataService.connectProfile(profile.id));
      void connect.then(() => {
        setIsConnected(true);
        playSuccess();
        toast.success(`Connected with ${profile.full_name}. You can message them now.`);
      }).catch((error: unknown) => {
        toast.error(error instanceof Error ? error.message : "Could not connect with this Navodayan.");
      });
    });
  };

  return (
    <article className="mx-auto max-w-3xl space-y-5">
      <Link href="/directory" onClick={playTap} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-navy-800 dark:text-slate-300 dark:hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Alumni directory
      </Link>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="h-28 bg-gradient-to-r from-navy-950 via-navy-800 to-amber-600" />
        <div className="px-5 pb-6 sm:px-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.avatar_url}
            alt={profile.full_name}
            className="-mt-12 h-24 w-24 rounded-3xl border-4 border-white object-cover shadow-md dark:border-zinc-900"
          />
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">{profile.full_name}</h1>
                {profile.is_verified && <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">Verified Navodayan</span>}
              </div>
              <p className="mt-1 font-mono text-xs font-semibold text-amber-600 dark:text-amber-400">{profile.navodayan_uid}</p>
            </div>

            {!isOwnProfile && (
              <div className="flex shrink-0 flex-wrap gap-2">
                {isConnected ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                      <Check className="h-4 w-4" /> Connected
                    </span>
                    <Link
                      href={`/messages?user=${encodeURIComponent(profile.id)}`}
                      onClick={playTap}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-navy-800 px-3 py-2 text-xs font-bold text-white hover:bg-navy-900"
                    >
                      <MessageSquare className="h-4 w-4" /> Message them
                    </Link>
                  </>
                ) : (
                  <button onClick={connect} className="inline-flex items-center gap-1.5 rounded-xl bg-navy-800 px-3 py-2 text-xs font-bold text-white hover:bg-navy-900">
                    <UserPlus className="h-4 w-4" /> Connect
                  </button>
                )}
              </div>
            )}
          </div>

          {profile.bio && <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">{profile.bio}</p>}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-zinc-800/60">
              <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">JNV &amp; batch</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{profile.jnv_school_name || "Jawahar Navodaya Vidyalaya"}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Class of {profile.passing_year}{profile.jnv_house ? ` • ${profile.jnv_house} House` : ""}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-zinc-800/60">
              <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Profession</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{profile.profession_role}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{profile.organization}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-zinc-800/60 sm:col-span-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Based in</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{profile.current_city}, {profile.current_country}</p>
              </div>
            </div>
          </div>
          <p className="mt-4 text-[11px] text-slate-500 dark:text-slate-400">Contact details remain private. Connect to start a direct message.</p>
        </div>
      </section>
    </article>
  );
}
