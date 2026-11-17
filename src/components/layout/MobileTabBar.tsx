"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, GraduationCap, Compass, ShoppingBag, Users } from "lucide-react";
import { useSoundFX } from "@/context/SoundContext";
import { motion } from "framer-motion";

const tabs = [
  { name: "Feed", path: "/", icon: Globe },
  { name: "Schools", path: "/schools", icon: GraduationCap },
  { name: "Guidance", path: "/mentorship", icon: Compass },
  { name: "Business", path: "/business", icon: ShoppingBag },
  { name: "Alumni", path: "/directory", icon: Users },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const { playTap } = useSoundFX();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/80 bg-white/90 px-2 py-1.5 backdrop-blur-lg dark:border-white/10 dark:bg-zinc-950/90 safe-bottom">
      <nav className="mx-auto flex max-w-md items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.path === "/" ? pathname === "/" : pathname.startsWith(tab.path);
          return (
            <Link
              key={tab.path}
              href={tab.path}
              onClick={playTap}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex min-h-[44px] flex-1 flex-col items-center justify-center py-1 transition-colors ${
                isActive
                  ? "font-bold text-navy-800 dark:text-blue-400"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <span className="relative">
                <Icon className="h-5 w-5" />
                {isActive && (
                  <motion.span
                    layoutId="mobileTabActive"
                    className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-amber-500"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </span>
              <span className="mt-0.5 text-[10px] font-medium tracking-tight">{tab.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
