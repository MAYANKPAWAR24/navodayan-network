"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { CityData, NavodayanProfile } from "@/types";
import { ALL_CITIES_DATA } from "@/lib/seed/seed-cities";
import { dataService } from "@/services/dataService";
import { useAuth } from "@/context/AuthContext";
import { useSoundFX } from "@/context/SoundContext";
import {
  MapPin,
  Users,
  MessageSquare,
  X,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { fetchConnectionIds, connectSupabaseProfile } from "@/services/supabaseMessagingService";
import { fetchSupabaseProfiles } from "@/services/supabaseProfileService";

// Dynamic import of Leaflet component to prevent SSR 'window is not defined'
const LeafletMap = dynamic(() => import("./LeafletMapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 sm:h-[500px] rounded-3xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-xs text-slate-400">
      Loading interactive OpenStreetMap clusters...
    </div>
  ),
});

export default function MapClient() {
  const { user, requireAuth, isSupabaseConfigured } = useAuth();
  const { playTap, playSuccess } = useSoundFX();

  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [citySearch, setCitySearch] = useState("");
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [remoteProfiles, setRemoteProfiles] = useState<NavodayanProfile[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured || !user) {
      setConnectedUsers([]);
      return;
    }
    let active = true;
    void fetchConnectionIds(user.id).then((ids) => {
      if (active) setConnectedUsers(ids);
    }).catch((error: unknown) => {
      if (active) toast.error(error instanceof Error ? error.message : "Could not load connections.");
    });
    return () => { active = false; };
  }, [user, isSupabaseConfigured]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    void fetchSupabaseProfiles().then((profiles) => {
      if (active) setRemoteProfiles(profiles);
    }).catch((error: unknown) => {
      if (active) toast.error(error instanceof Error ? error.message : "Could not load Navodayan profiles.");
    });
    return () => { active = false; };
  }, [isSupabaseConfigured]);

  const filteredCities = ALL_CITIES_DATA.filter((c) =>
    c.city.toLowerCase().includes(citySearch.toLowerCase()) ||
    c.country.toLowerCase().includes(citySearch.toLowerCase())
  );

  const localAlumni: NavodayanProfile[] = selectedCity
    ? (isSupabaseConfigured
      ? remoteProfiles.filter((profile) => profile.current_city.toLowerCase() === selectedCity.city.toLowerCase() && profile.id !== user?.id)
      : dataService.getProfiles({ city: selectedCity.city }))
    : [];

  const handleConnect = (profileId: string, name: string) => {
    requireAuth(() => {
      if (!user) return;
      const connect = isSupabaseConfigured
        ? connectSupabaseProfile(user.id, profileId)
        : Promise.resolve().then(() => dataService.connectProfile(profileId));
      void connect.then(() => {
        setConnectedUsers((current) => current.includes(profileId) ? current : [...current, profileId]);
        playSuccess();
        toast.success(`Connected with ${name}. You can message them now.`);
      }).catch((error: unknown) => {
        toast.error(error instanceof Error ? error.message : "Could not connect with this Navodayan.");
      });
    });
  };

  const handleJoinCityGroup = () => {
    requireAuth(() => {
      playSuccess();
      toast.success(`Joined ${selectedCity?.city} Navodayan City Group!`);
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white border border-navy-700/60 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-36 h-36 bg-amber-500/15 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <MapPin className="w-4 h-4" />
            <span>OpenStreetMap Global Clusters</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Navodayan Diaspora Map
          </h1>
          <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
            Visual map of alumni and students across Indian metros, district headquarters, and global diaspora hubs. Discover who lives in your city and ping for coffee!
          </p>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative w-full h-[450px] sm:h-[550px] rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/10 shadow-md">
        <LeafletMap
          cities={ALL_CITIES_DATA}
          onSelectCity={(c) => {
            playTap();
            setSelectedCity(c);
          }}
        />

        {/* Quick Search Floating Bar on Map */}
        <div className="absolute top-4 left-4 z-20 max-w-xs w-full">
          <input
            type="text"
            value={citySearch}
            onChange={(e) => setCitySearch(e.target.value)}
            placeholder="Search city hub (e.g. Bengaluru, London)..."
            className="w-full px-3.5 py-2 text-xs bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-slate-200 dark:border-zinc-700 rounded-xl shadow-md text-slate-900 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      {/* City Hub Quick Chips */}
      <div>
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
          Major Navodayan Hubs ({filteredCities.length})
        </div>
        <div className="flex flex-wrap gap-2">
          {filteredCities.slice(0, 12).map((c) => (
            <button
              key={c.city}
              onClick={() => {
                playTap();
                setSelectedCity(c);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                selectedCity?.city === c.city
                  ? "bg-navy-900 text-white border-navy-700 shadow-xs"
                  : "bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>{c.city}</span>
              <span className="text-[10px] text-slate-400">({c.alumni_count || 100})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Slide-Over Right Drawer for Selected City */}
      <AnimatePresence>
        {selectedCity && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCity(null)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 shadow-2xl p-6 flex flex-col h-full z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    {selectedCity.city} Hub
                  </h3>
                  <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                    {selectedCity.country} • {selectedCity.alumni_count || 120}+ Navodayans
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCity(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-2 my-4">
                <button
                  onClick={handleJoinCityGroup}
                  className="flex-1 py-2 px-3 text-xs font-bold text-white bg-navy-800 hover:bg-navy-900 rounded-xl transition-colors shadow-xs"
                >
                  Join City Group
                </button>
              </div>

              {/* Local Alumni Roster */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Local Members in {selectedCity.city}
                </div>

                {localAlumni.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No registered members listed here yet. Claim your spot during onboarding!
                  </div>
                ) : (
                  localAlumni.map((alumnus) => (
                    <div
                      key={alumnus.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 space-y-2"
                    >
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <Link href={`/profile/${alumnus.id}`} aria-label={`View ${alumnus.full_name}'s profile`} className="shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={alumnus.avatar_url}
                            alt={alumnus.full_name}
                            className="h-10 w-10 rounded-full border border-amber-400 object-cover"
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link href={`/profile/${alumnus.id}`} className="block truncate text-xs font-bold text-slate-900 hover:text-navy-700 dark:text-white dark:hover:text-blue-300">
                            {alumnus.full_name}
                          </Link>
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                            {alumnus.profession_role} @ {alumnus.organization}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {alumnus.jnv_school_name} (&apos;{alumnus.passing_year})
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400">
                          {alumnus.navodayan_uid}
                        </span>

                        {connectedUsers.includes(alumnus.id) ? (
                          <Link href={`/messages?user=${encodeURIComponent(alumnus.id)}`} className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700">
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>Message</span>
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleConnect(alumnus.id, alumnus.full_name)}
                            className="flex items-center gap-1 rounded-lg bg-navy-800 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-navy-900"
                          >
                            <UserPlus className="h-3.5 w-3.5" />
                            <span>Connect</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
