"use client";

import React, { useState } from "react";
import { Navbar } from "./Navbar";
import { SpotlightCommand } from "./SpotlightCommand";
import { DesktopSidebar } from "./DesktopSidebar";
import { RightWidgetRail } from "./RightWidgetRail";
import { MobileTabBar } from "./MobileTabBar";
import { MobileDrawer } from "./MobileDrawer";
import { Footer } from "./Footer";
import { PWAInstallPrompt } from "./PWAInstallPrompt";
import { AuthModal } from "@/components/modals/AuthModal";
import { OnboardingWizard } from "@/components/modals/OnboardingWizard";
import { FeedbackButton } from "@/features/feedback/FeedbackButton";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      {/* Fixed Apple-grade Navbar */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
        isMobileDrawerOpen={isMobileDrawerOpen}
      />

      {/* Main Grid Container with Left & Right Rails */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex">
        {/* Left Sticky Navigation Rail */}
        <DesktopSidebar />

        {/* Central Dynamic Feed / Workspace */}
        <main className="flex-1 min-w-0 py-6 lg:px-4">{children}</main>

        {/* Right Sticky Contextual Widget Rail */}
        <RightWidgetRail />
      </div>

      {/* Global Footer */}
      <Footer />

      <FeedbackButton />

      {/* Mobile Sticky Bottom Tab Bar */}
      <MobileTabBar />

      {/* Spotlight Command Modal (Cmd+K) */}
      <SpotlightCommand isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Mobile Navigation Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
      />

      {/* Auth Modal */}
      <AuthModal />

      {/* Mandatory Onboarding Wizard */}
      <OnboardingWizard />

      <PWAInstallPrompt />

    </div>
  );
}
