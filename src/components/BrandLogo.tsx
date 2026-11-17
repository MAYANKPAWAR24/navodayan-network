import React from "react";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-amber-400/40 bg-gradient-to-br from-navy-900 via-navy-800 to-blue-900 shadow-md shadow-navy-900/20">
        <svg viewBox="0 0 120 120" className="h-8 w-8" aria-label="Navodaya emblem">
          <path d="M18 84C36 58 62 30 94 18C89 43 75 61 56 79C42 90 29 92 18 84Z" fill="#D97706" opacity="0.95" />
          <path d="M31 78c14-18 30-31 58-40-4 18-17 33-37 46-9 6-16 9-21 9Z" fill="#F8FAFC" opacity="0.75" />
          <path d="M21 78c15-7 31-9 44-5 13 5 23 14 35 28H21v-23Z" fill="#1E3A8A" opacity="0.9" />
          <path d="M45 24h12v18H45zm0 20h12v30H45zM62 24h12v18H62zm0 20h12v30H62z" fill="#F8FAFC" opacity="0.9"/>
          <path d="M18 92c17-8 32-13 50-13 16 0 31 3 43 11v10H18v-8Z" fill="#D97706" opacity="0.95"/>
          <path d="M28 38c7-7 16-10 29-10 14 0 24 3 33 10l-28 12L28 38Z" fill="#F8FAFC" opacity="0.85"/>
        </svg>
      </div>
      {!compact && (
        <div className="flex flex-col leading-none">
          <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">The Navodayan Network</span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            One Campus • One Bond • Forever
          </span>
        </div>
      )}
    </div>
  );
}
