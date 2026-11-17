"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone, Heart, Shield, Sparkles } from "lucide-react";
import { useSoundFX } from "@/context/SoundContext";
import { BrandLogo } from "@/components/BrandLogo";

export function Footer() {
  const { playTap } = useSoundFX();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-950/80 transition-colors pt-12 pb-24 md:pb-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4 md:col-span-1">
            <Link href="/" onClick={playTap} className="flex items-center gap-2.5 group">
              <BrandLogo compact />
            </Link>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Built by Navodayans, For Navodayans — One Campus, One Bond, Forever.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>100% Free Forever • ₹0 Operating Budget</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Platform Hubs</h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li><Link href="/schools" onClick={playTap} className="hover:text-navy-700 dark:hover:text-blue-400 transition-colors">All 660+ JNV Schools Directory</Link></li>
              <li><Link href="/admissions" onClick={playTap} className="hover:text-navy-700 dark:hover:text-blue-400 transition-colors">NVS Admissions & Results</Link></li>
              <li><Link href="/directory" onClick={playTap} className="hover:text-navy-700 dark:hover:text-blue-400 transition-colors">Alumni Search & Blood Donors</Link></li>
              <li><Link href="/map" onClick={playTap} className="hover:text-navy-700 dark:hover:text-blue-400 transition-colors">Global Diaspora Map</Link></li>
              <li><Link href="/business" onClick={playTap} className="hover:text-navy-700 dark:hover:text-blue-400 transition-colors">Navodaya Business Hub</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Support & Heritage</h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li><Link href="/sos" onClick={playTap} className="text-rose-600 dark:text-rose-400 font-semibold hover:underline flex items-center gap-1"><span>Emergency SOS & Blood Match</span></Link></li>
              <li><Link href="/safe-space" onClick={playTap} className="hover:text-navy-700 dark:hover:text-blue-400 transition-colors">The Real Talk (Safe Space)</Link></li>
              <li><Link href="/capsules" onClick={playTap} className="hover:text-navy-700 dark:hover:text-blue-400 transition-colors">Digital Time Capsules & Yearbooks</Link></li>
              <li><Link href="/hall-of-fame" onClick={playTap} className="hover:text-navy-700 dark:hover:text-blue-400 transition-colors">Hall of Fame Legends</Link></li>
              <li><Link href="/id-card" onClick={playTap} className="hover:text-navy-700 dark:hover:text-blue-400 transition-colors">3D Holographic Digital ID Card</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Connect Directly</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">Have suggestions or want to register as a Campus Correspondent?</p>
            <div className="space-y-2">
              <a href="mailto:connect@navodayan.org" onClick={playTap} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-navy-700 dark:hover:text-blue-400 transition-colors"><Mail className="w-4 h-4 text-amber-500 shrink-0" /><span>connect@navodayan.org</span></a>
              <a href="tel:+919876543210" onClick={playTap} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-navy-700 dark:hover:text-blue-400 transition-colors"><Phone className="w-4 h-4 text-emerald-500 shrink-0" /><span>+91-9876543210</span></a>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-blue-500" /><span>Strict RLS & 10-Report Auto-Moderation</span></div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200/60 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>© {currentYear} The Navodayan Network. Crafted with pride for Jawahar Navodaya Vidyalayas across India & worldwide.</div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Zero Operating Cost</span>
            <span>•</span>
            <span>Open Data Architecture</span>
            <span>•</span>
            <span className="flex items-center gap-1">Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> by Alumni</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
