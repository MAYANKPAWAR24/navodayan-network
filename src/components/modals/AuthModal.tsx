"use client";

import React, { useState } from "react";
import { X, Sparkles, Mail, Lock, ArrowRight, UserCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSoundFX } from "@/context/SoundContext";
import { motion, AnimatePresence } from "framer-motion";
import { DEMO_PROFILES } from "@/lib/seed/seed-demo";
import { BrandLogo } from "@/components/BrandLogo";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, loginWithGoogle, loginWithEmail, loginDemoUser } = useAuth();
  const { playTap, playPop } = useSoundFX();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    loginWithEmail(email, password);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeAuthModal} className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm" />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} transition={{ duration: 0.2 }} className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10">
          <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-950 p-6 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 bg-amber-500/20 rounded-full blur-xl" />
            <button onClick={() => { playTap(); closeAuthModal(); }} className="absolute top-4 right-4 p-1.5 text-white/70 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"><X className="w-4 h-4" /></button>
            <div className="mb-4 flex justify-center"><BrandLogo compact /></div>
            <h3 className="text-xl font-bold tracking-tight">Join The Navodayan Network</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">Built by Navodayans, For Navodayans — One Campus, One Bond, Forever.</p>
          </div>

          <div className="p-6 space-y-4">
            <button onClick={() => { playPop(); loginWithGoogle(); }} className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold text-slate-800 dark:text-white bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 active:scale-98 transition-all shadow-xs">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
              <span>Continue with Google (₹0 Auth)</span>
            </button>

            <div className="relative flex items-center justify-center my-3"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-zinc-800" /></div><span className="relative px-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 bg-white dark:bg-zinc-900">Or with Email</span></div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <div className="relative"><Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alumnus@navodayan.org" className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-600 dark:focus:ring-blue-500 text-slate-900 dark:text-white" /></div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <div className="relative"><Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-600 dark:focus:ring-blue-500 text-slate-900 dark:text-white" /></div>
              </div>
              <button type="submit" className="w-full py-2.5 px-4 text-xs sm:text-sm font-bold text-white bg-navy-800 hover:bg-navy-900 active:scale-98 rounded-xl shadow-md shadow-navy-900/20 transition-all flex items-center justify-center gap-1.5"><span>{authMode === "login" ? "Sign In" : "Create Account"}</span><ArrowRight className="w-4 h-4" /></button>
            </form>

            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2"><UserCheck className="w-3.5 h-3.5 text-amber-500" /><span>Instant 1-Click Demo Evaluation Profiles</span></div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button type="button" onClick={() => loginDemoUser(0)} className="p-2 text-left bg-slate-50 dark:bg-zinc-800/50 hover:bg-amber-50 dark:hover:bg-amber-950/20 border border-slate-200/80 dark:border-zinc-700 rounded-xl transition-colors"><div className="font-bold text-slate-800 dark:text-slate-200 truncate">Arun Thakur</div><div className="text-[10px] text-slate-500 truncate">Google SDE • JNV Shimla</div></button>
                <button type="button" onClick={() => loginDemoUser(1)} className="p-2 text-left bg-slate-50 dark:bg-zinc-800/50 hover:bg-amber-50 dark:hover:bg-amber-950/20 border border-slate-200/80 dark:border-zinc-700 rounded-xl transition-colors"><div className="font-bold text-slate-800 dark:text-slate-200 truncate">Dr. Priya Singh</div><div className="text-[10px] text-slate-500 truncate">AIIMS Doctor • JNV Gaya</div></button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
