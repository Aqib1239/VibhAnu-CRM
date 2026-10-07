"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { MainContentLoader } from "@/components/ui/main-content-loader";
import { PageTransition } from "@/components/ui/page-transition";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isReady } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // If on authentication pages, render full screen without CRM shell
  const isAuthPage = pathname === "/login" || pathname === "/forgot-password";

  useEffect(() => {
    if (isReady && !user && !isAuthPage) {
      router.replace("/login");
    }
  }, [isReady, user, isAuthPage, router]);

  if (isAuthPage) {
    return <main className="min-h-screen bg-background">{children}</main>;
  }

  // Before auth is verified, or when unauthenticated, do NOT render the protected dashboard
  if (!isReady || !user) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <MainContentLoader label="Authenticating session..." description="Verifying security credentials" />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased flex flex-col">
      {/* Sidebar (Desktop + Mobile) */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Layout Area */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-[padding] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] min-w-0",
          isCollapsed ? "md:pl-[72px]" : "md:pl-[244px]"
        )}
      >
        {/* Top Header */}
        <Header onToggleMobileMenu={() => setIsMobileOpen(!isMobileOpen)} />

        {/* Main Content Area — Scoped Page Transition */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto min-h-[calc(100vh-64px)] flex flex-col">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
