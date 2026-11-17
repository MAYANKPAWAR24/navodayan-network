"use client";

import React, { useState } from "react";
import { X, Sparkles, Mail, Lock, ArrowRight, Phone } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSoundFX } from "@/context/SoundContext";
import { motion, AnimatePresence } from "framer-motion";
import { BrandLogo } from "@/components/BrandLogo";
import { toast } from "sonner";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, isSupabaseConfigured, loginWithEmail, sendLoginOtp, sendSignupOtp, verifyEmailOtp } = useAuth();
  const { playTap } = useSoundFX();
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [loginWithPassword, setLoginWithPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (authMode === "login") {
        if (loginWithPassword) {
          await loginWithEmail(email, password);
        } else if (otpSent) {
          await verifyEmailOtp(email, otp);
          toast.success("Email verified. You are signed in.");
        } else {
          await sendLoginOtp(email);
          setOtpSent(true);
          toast.success("A 6-digit OTP was sent to your email.");
        }
      } else if (otpSent) {
        await verifyEmailOtp(email, otp);
        toast.success("Email verified. Complete your Navodayan profile.");
      } else {
        await sendSignupOtp(email, mobileNumber);
        setOtpSent(true);
        toast.success("A 6-digit OTP was sent to your email.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setIsSubmitting(true);
    try {
      if (authMode === "signup") await sendSignupOtp(email, mobileNumber);
      else await sendLoginOtp(email);
      setOtp("");
      toast.success("A new OTP was sent. Use the latest code.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not resend the OTP.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeAuthModal} className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm" />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} transition={{ duration: 0.2 }} className="ios-modal-scroll relative w-full max-w-md overflow-y-auto rounded-3xl border border-slate-200/90 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-900">
          <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-950 p-6 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 bg-amber-500/20 rounded-full blur-xl" />
            <button onClick={() => { playTap(); closeAuthModal(); }} className="absolute top-4 right-4 p-1.5 text-white/70 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"><X className="w-4 h-4" /></button>
            <div className="mb-4 flex justify-center"><BrandLogo compact /></div>
            <h3 className="text-xl font-bold tracking-tight">Join The Navodayan Network</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">Built by Navodayans, For Navodayans — One Campus, One Bond, Forever.</p>
          </div>

          <div className="p-6 space-y-4">
            {!isSupabaseConfigured && (
              <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                Authentication is not enabled yet. Add your Supabase project URL and public anon key to <code>.env.local</code>, then restart the app.
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <div className="relative"><Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input type="email" required value={email} readOnly={otpSent} onChange={(e) => setEmail(e.target.value)} placeholder="alumnus@navodayan.org" autoComplete="email" className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-600 dark:focus:ring-blue-500 text-slate-900 dark:text-white read-only:opacity-70" /></div>
              </div>
              {authMode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mobile Number <span className="text-rose-600">*</span></label>
                  <div className="relative"><Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input type="tel" required readOnly={otpSent} value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="+91 9876543210" autoComplete="tel" className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-600 dark:focus:ring-blue-500 text-slate-900 dark:text-white read-only:opacity-70" /></div>
                </div>
              )}
              {authMode === "login" && loginWithPassword && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                  <div className="relative"><Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-600 dark:focus:ring-blue-500 text-slate-900 dark:text-white" /></div>
                </div>
              )}
              {otpSent && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email OTP</label>
                  <input type="text" required value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Enter 6-digit code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} className="w-full px-3 py-2 text-sm tracking-[0.3em] bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-600 dark:focus:ring-blue-500 text-slate-900 dark:text-white" />
                </div>
              )}
              <button type="submit" disabled={!isSupabaseConfigured || isSubmitting} className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-navy-800 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-navy-900/20 transition-all hover:bg-navy-900 active:scale-98 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"><span>{isSubmitting ? "Please wait..." : authMode === "login" && loginWithPassword ? "Sign In" : otpSent ? "Verify OTP" : "Send OTP"}</span><ArrowRight className="h-4 w-4" /></button>
            </form>
            {otpSent && (
              <div className="flex items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300">
                <span>OTP sent to {email}.</span>
                <button type="button" onClick={handleResendOtp} disabled={!isSupabaseConfigured || isSubmitting} className="font-bold underline disabled:opacity-50">
                  Resend OTP
                </button>
              </div>
            )}
            {authMode === "login" && (
              <button type="button" onClick={() => { setLoginWithPassword((value) => !value); setOtpSent(false); setOtp(""); }} className="w-full text-center text-xs font-semibold text-navy-700 hover:underline dark:text-blue-300">
                {loginWithPassword ? "Sign in with email OTP" : "Use password instead"}
              </button>
            )}
            <button type="button" onClick={() => { setAuthMode((mode) => mode === "login" ? "signup" : "login"); setLoginWithPassword(false); setOtpSent(false); setOtp(""); }} className="w-full text-center text-xs font-semibold text-navy-700 hover:underline dark:text-blue-300">
              {authMode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
