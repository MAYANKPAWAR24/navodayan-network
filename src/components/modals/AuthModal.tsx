"use client";

import React, { useState } from "react";
import { X, Sparkles, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSoundFX } from "@/context/SoundContext";
import { motion, AnimatePresence } from "framer-motion";
import { BrandLogo } from "@/components/BrandLogo";
import { toast } from "sonner";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, isSupabaseConfigured, loginWithEmail, signUpWithEmail, resendSignUpConfirmation } = useAuth();
  const { playTap } = useSoundFX();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationPending, setConfirmationPending] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (authMode === "login") {
        await loginWithEmail(email, password);
      } else {
        const signedIn = await signUpWithEmail(email, password);
        setConfirmationPending(!signedIn);
        toast.success(signedIn ? "Account created. Complete your Navodayan profile." : "Account created. Check your email to confirm, then sign in.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendConfirmation = async () => {
    setIsSubmitting(true);
    try {
      await resendSignUpConfirmation(email);
      toast.success("A new confirmation email has been sent. Use the latest link.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not resend the confirmation email.");
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
                <div className="relative"><Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alumnus@navodayan.org" className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-600 dark:focus:ring-blue-500 text-slate-900 dark:text-white" /></div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <div className="relative"><Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-600 dark:focus:ring-blue-500 text-slate-900 dark:text-white" /></div>
              </div>
              <button type="submit" disabled={!isSupabaseConfigured || isSubmitting} className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-navy-800 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-navy-900/20 transition-all hover:bg-navy-900 active:scale-98 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"><span>{isSubmitting ? "Please wait..." : authMode === "login" ? "Sign In" : "Create Account"}</span><ArrowRight className="h-4 w-4" /></button>
            </form>
            {confirmationPending && authMode === "signup" && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
                <p>Confirmation is pending for {email}. If the link expires, request a fresh one and open the newest email.</p>
                <button type="button" onClick={handleResendConfirmation} disabled={!isSupabaseConfigured || isSubmitting} className="mt-2 font-bold underline disabled:opacity-50">
                  Resend confirmation email
                </button>
              </div>
            )}
            <button type="button" onClick={() => setAuthMode((mode) => mode === "login" ? "signup" : "login")} className="w-full text-center text-xs font-semibold text-navy-700 hover:underline dark:text-blue-300">
              {authMode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
