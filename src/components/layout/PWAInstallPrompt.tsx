"use client";

import React, { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    if (isStandalone || sessionStorage.getItem("navodayan-install-dismissed") === "true") {
      setVisible(false);
      return;
    }

    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));
    setVisible(true);

    const handleInstallAvailable = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const handleInstalled = () => {
      setVisible(false);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleInstallAvailable);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallAvailable);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!installPrompt) {
      setShowInstructions((current) => !current);
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setVisible(false);
    setInstallPrompt(null);
  };

  const dismiss = () => {
    sessionStorage.setItem("navodayan-install-dismissed", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside className="fixed left-3 right-3 top-[4.5rem] z-50 mx-auto max-w-md rounded-2xl border border-navy-200 bg-white p-3 shadow-xl dark:border-navy-800 dark:bg-zinc-900 sm:left-auto sm:right-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-800 dark:bg-navy-950 dark:text-blue-300">
          <Download className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900 dark:text-white">Install Navodayan Network</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            Add the app to your home screen for quicker access.
          </p>
          {showInstructions && (
            <p className="mt-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
              {isIOS
                ? "In Safari, tap Share, then choose Add to Home Screen."
                : "Open your browser menu and choose Install app or Add to Home Screen."}
            </p>
          )}
          <button onClick={installApp} className="mt-2 rounded-lg bg-navy-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-navy-900">
            {installPrompt ? "Install app" : showInstructions ? "Hide instructions" : "How to install"}
          </button>
        </div>
        <button onClick={dismiss} aria-label="Dismiss install prompt" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
