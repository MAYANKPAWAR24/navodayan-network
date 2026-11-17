"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Volume2, VolumeX, Moon, Sun, Menu, X, CreditCard, User, LogOut, Sparkles } from "lucide-react";
import { useSoundFX } from "@/context/SoundContext";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { BrandLogo } from "@/components/BrandLogo";

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenMobileDrawer: () => void;
  isMobileDrawerOpen: boolean;
}

export function Navbar({ onOpenSearch, onOpenMobileDrawer, isMobileDrawerOpen }: NavbarProps) {
  const pathname = usePathname();
  const { isMuted, toggleMute, playTap } = useSoundFX();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    playTap();
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (typeof document !== "undefined") {
      if (next) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => { playTap(); onOpenMobileDrawer(); }} className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors" aria-label="Toggle mobile menu">{isMobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
          <Link href="/" onClick={playTap} className="flex items-center gap-2.5 group focus:outline-none"><BrandLogo compact /></Link>
        </div>

        <div className="flex-1 max-w-md hidden md:block">
          <button onClick={() => { playTap(); onOpenSearch(); }} className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-white/10 rounded-xl hover:bg-slate-200/60 dark:hover:bg-zinc-800/80 transition-all shadow-inner group">
            <div className="flex items-center gap-2.5"><Search className="w-4 h-4 text-slate-400 group-hover:text-navy-700 dark:group-hover:text-blue-400 transition-colors" /><span className="text-xs sm:text-sm">Search 660+ JNVs, alumni, cities...</span></div>
            <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono font-medium text-slate-500 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md shadow-sm"><span className="text-[10px]">⌘</span>K</kbd>
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button onClick={() => { playTap(); onOpenSearch(); }} className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors" aria-label="Search"><Search className="w-5 h-5" /></button>
          <button onClick={toggleMute} className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors relative" title={isMuted ? "Unmute UI Sounds" : "Mute UI Sounds"} aria-label="Toggle Sound">{isMuted ? <VolumeX className="w-5 h-5 text-slate-400" /> : <Volume2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />}</button>
          <button onClick={toggleDarkMode} className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors" title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"} aria-label="Toggle Theme">{isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}</button>
          <Link href="/id-card" onClick={playTap} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-navy-800 dark:text-blue-300 bg-navy-50 dark:bg-navy-950/60 border border-navy-200/60 dark:border-navy-800/60 rounded-xl hover:bg-navy-100 dark:hover:bg-navy-900/60 transition-all shadow-sm"><CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400" /><span>Digital ID</span></Link>

          {isAuthenticated && user ? (
            <div className="relative">
              <button onClick={() => { playTap(); setIsUserMenuOpen(!isUserMenuOpen); }} className="flex items-center gap-2 p-1 pl-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-zinc-800">
                <img src={user.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"} alt={user.full_name} className="w-8 h-8 rounded-full object-cover border-2 border-amber-500 shadow-sm" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 hidden lg:block max-w-[120px] truncate">{user.full_name.split(" ")[0]}</span>
              </button>
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ duration: 0.15 }} className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-zinc-800/80 mb-1"><div className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.full_name}</div><div className="text-xs font-mono font-semibold text-amber-600 dark:text-amber-400">{user.navodayan_uid}</div><div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{user.jnv_school_name} • '{user.passing_year}</div></div>
                    <Link href="/id-card" onClick={() => { playTap(); setIsUserMenuOpen(false); }} className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"><CreditCard className="w-4 h-4 text-amber-500" /><span>View 3D Navodayan Card</span></Link>
                    <Link href="/directory" onClick={() => { playTap(); setIsUserMenuOpen(false); }} className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"><User className="w-4 h-4 text-blue-500" /><span>My Profile & Connections</span></Link>
                    <div className="h-px bg-slate-100 dark:bg-zinc-800 my-1" />
                    <button onClick={() => { logout(); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"><LogOut className="w-4 h-4" /><span>Sign Out</span></button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button onClick={openAuthModal} className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-navy-800 to-navy-700 hover:from-navy-900 hover:to-navy-800 rounded-xl shadow-md shadow-navy-900/20 active:scale-95 transition-all"><Sparkles className="w-3.5 h-3.5 text-amber-400" /><span>Join Network</span></button>
          )}
        </div>
      </div>
    </header>
  );
}
