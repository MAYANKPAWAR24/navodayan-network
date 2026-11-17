"use client";

import React, { useMemo, useState } from "react";
import { NavodayanProfile } from "@/types";
import { useSoundFX } from "@/context/SoundContext";
import { CreditCard, RotateCw, Share2, Droplet, QrCode, ShieldCheck, MapPin, Sparkles, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface HolographicIDCardProps {
  profile: NavodayanProfile;
}

const HOUSE_COLORS: Record<string, { label: string; ring: string; fill: string }> = {
  Aravali: { label: "Aravali", ring: "border-blue-500/40 bg-blue-500/10 text-blue-400", fill: "bg-blue-600" },
  Nilgiri: { label: "Nilgiri", ring: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400", fill: "bg-emerald-600" },
  Shivalik: { label: "Shivalik", ring: "border-red-500/40 bg-red-500/10 text-red-400", fill: "bg-red-600" },
  Udaigiri: { label: "Udaigiri", ring: "border-amber-500/40 bg-amber-500/10 text-amber-400", fill: "bg-amber-600" },
};

export function HolographicIDCard({ profile }: HolographicIDCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { playWhoosh, playPop } = useSoundFX();
  const houseColor = useMemo(() => HOUSE_COLORS[profile.jnv_house || "Aravali"], [profile.jnv_house]);

  const handleFlip = () => { playWhoosh(); setIsFlipped(!isFlipped); };
  const handleShare = () => {
    playPop();
    const text = encodeURIComponent(`🎖️ Check out my Official Navodayan Digital ID Card (${profile.navodayan_uid}) on The Navodayan Network Super App: https://navodayan.org`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
    toast.success("ID Card share link generated!");
    try { confetti({ particleCount: 80, spread: 60 }); } catch { }
  };

  const contactText = profile.show_contact_on_id ? profile.whatsapp_number : "Contact Protected • Message via App DM";

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-sm h-56 sm:h-64 cursor-pointer perspective-1000 select-none group" onClick={handleFlip}>
        <motion.div animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="relative w-full h-full rounded-3xl transform-style-3d shadow-2xl">
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl bg-gradient-to-tr from-navy-950 via-navy-900 to-navy-800 p-5 text-white border border-amber-500/40 shadow-xl overflow-hidden flex flex-col justify-between">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-amber-400/10 pointer-events-none group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-serif font-black flex items-center justify-center text-sm border border-amber-500/30">JN</div>
                <div>
                  <div className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">The Navodayan Network</div>
                  <div className="text-[9px] text-slate-300 font-medium">National Alumni & Student Federation</div>
                </div>
              </div>
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold ${houseColor.ring}`}>
                <span className={`h-2 w-2 rounded-full ${houseColor.fill}`} />
                <span>{houseColor.label}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 relative z-10 my-auto">
              <img src={profile.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"} alt={profile.full_name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400/80 shadow-md shrink-0" />
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white truncate">{profile.full_name}</h3>
                <div className="text-xs font-mono font-bold text-amber-400 tracking-wider">{profile.navodayan_uid}</div>
                <div className="text-[11px] text-slate-300 font-medium truncate mt-0.5">{profile.jnv_school_name}</div>
                <div className="text-[10px] text-slate-400 truncate">Batch of {profile.passing_year} • {profile.profession_role}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 relative z-10 text-[10px] text-slate-400">
              <div className="flex items-center gap-1"><MapPin className="w-3 h-3 text-amber-400" /><span>{profile.current_city}, {profile.current_country}</span></div>
              <div className="flex items-center gap-1 text-slate-300 font-mono"><RotateCw className="w-3 h-3 text-amber-400" /><span>Tap to flip</span></div>
            </div>
          </div>

          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl bg-gradient-to-br from-zinc-900 via-navy-950 to-black p-5 text-white border border-amber-500/40 shadow-xl overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs font-bold text-amber-400 uppercase tracking-wider"><Sparkles className="w-3.5 h-3.5" /><span>Emergency & Security Matrix</span></div>
              <span className="text-[9px] font-mono text-slate-400">UID: {profile.navodayan_uid}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 my-auto">
              <div className="p-3 bg-white rounded-2xl flex flex-col items-center justify-center text-slate-900 shadow-inner"><QrCode className="w-16 h-16 text-slate-900" /><span className="text-[9px] font-bold text-center mt-1 uppercase tracking-tight">Scan to Verify</span></div>
              <div className="flex flex-col justify-between space-y-2">
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30">
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold text-[10px] uppercase"><Droplet className="w-3.5 h-3.5 fill-rose-500" /><span>Blood Group</span></div>
                  <div className="text-sm font-black text-white mt-0.5">{profile.blood_group}</div>
                  <div className="text-[9px] text-rose-300">{profile.is_blood_donor ? "✓ Active Donor" : "Registered"}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold"><Phone className="w-3 h-3 text-emerald-400" /><span>WhatsApp</span></div>
                  <div className="text-xs font-mono font-bold text-slate-200 truncate mt-0.5">{contactText}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[9px] text-slate-400"><span>JNV Non-Transferable Member Credential</span><span className="font-mono text-amber-400">Tap to flip back</span></div>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button onClick={handleFlip} className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors shadow-xs"><RotateCw className="w-3.5 h-3.5" /><span>Flip 3D Card</span></button>
        <button onClick={handleShare} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"><Share2 className="w-3.5 h-3.5" /><span>Share WhatsApp Card</span></button>
      </div>
    </div>
  );
}
