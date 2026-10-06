"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Search,
  Bell,
  LogOut,
  Shield,
  RotateCcw,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useLeads } from "@/context/leads-context";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { RoleSwitcher } from "@/components/ui/role-switcher";
import { RoleBadge } from "@/components/ui/role-badge";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";


interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export function Header({ onToggleMobileMenu }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { leads, resetToDefaultMockData } = useLeads();

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const getPageInfo = () => {
    if (pathname === "/") return { title: "Dashboard", section: "Overview" };
    if (pathname === "/marketing")
      return { title: "Marketing Console", section: "Stage 1: Lead Capture" };
    if (pathname === "/communication")
      return { title: "Communication Queue", section: "Stage 2: Outreach" };
    if (pathname === "/vigilance")
      return {
        title: "Vigilance Verification",
        section: "Stage 3: Compliance",
      };
    if (pathname === "/support")
      return { title: "Support Allocation", section: "Stage 4: Verification" };
    if (pathname === "/sales")
      return {
        title: "Sales Executive Queue",
        section: "Stage 5: Audio & Claim",
      };
    if (pathname === "/leads")
      return { title: "Leads Directory", section: "Master Records" };
    if (pathname.startsWith("/leads/"))
      return { title: "Lead Profile", section: "Workflow Details" };
    if (pathname === "/settings")
      return { title: "System Settings", section: "RBAC & Preferences" };
    return { title: "Vibh-Anu CRM", section: "Portal" };
  };

  const pageInfo = getPageInfo();

  const searchResults = searchQuery.trim()
    ? leads
        .filter(
          (l) =>
            l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.leadCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.contactNumber.includes(searchQuery) ||
            (l.city && l.city.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, 5)
    : [];

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/80 bg-background/95 backdrop-blur-xs px-4 sm:px-6 lg:px-8">
        {/* Left Side: Mobile toggle & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[13px] font-mono font-medium text-muted-foreground hidden sm:inline">
              Vibh-Anu
            </span>
            <span className="text-muted-foreground/40 text-xs hidden sm:inline">/</span>
            <span className="text-[15px] font-semibold text-foreground tracking-tight hidden sm:inline">
              {pageInfo.title}
            </span>
          </div>
        </div>

        {/* Right Side Controls: Search, Role Switcher, Notifications, Theme, User Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Button */}
          <button
            type="button"
            onClick={() => setShowSearchModal(true)}
            className="flex justify-between items-center gap-2.5 h-9 w-7 sm:w-64 md:w-72 px-1.5 rounded-lg border border-border bg-muted/30 hover:bg-muted/70 hover:border-border/80 text-[13px] text-muted-foreground transition-all duration-150 shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Search leads, codes...</span>
            </div>
            <kbd className="hidden md:inline-block font-mono text-[10px] bg-background px-1.5 py-0.5 rounded border border-border text-muted-foreground font-semibold">
              ⌘K
            </kbd>
          </button>

          {/* Role Preview Switcher */}
          <RoleSwitcher />

          {/* Theme Toggle */}
          <ThemeToggle className="w-8 h-8 rounded-lg" />

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-transparent hover:border-border"
              title="Pipeline updates"
              aria-label="Pipeline updates"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-background" />
            </button>

            <AnimatePresence>
              {showNotifications && (
                <>
                  {/* Click-away overlay (invisible) */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />

                  {/* Compact dropdown modal */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -4 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-card shadow-lg z-50 origin-top-right overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border/70">
                      <div className="flex items-center gap-2">
                        <Bell className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[13px] font-semibold text-foreground">
                          Pipeline Telemetry
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/20">
                        Live
                      </span>
                    </div>

                    {/* Notification items — each slides in from right, staggered */}
                    <div className="p-2 space-y-1">
                      <motion.div
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 1 }}
                        transition={{ duration: 0.30, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
                        className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-default"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-foreground truncate">
                            Vigilance Verified
                          </p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                            ZenCloud Technologies (VA-2026-1009) audio recorded.
                          </p>
                          <span className="text-[10px] font-mono text-muted-foreground/70 mt-1 inline-block">10m ago</span>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 1 }}
                        transition={{ duration: 0.30, ease: [0.22, 1, 0.36, 1], delay: 0.11 }}
                        className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-default"
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-foreground truncate">
                            Support Allocation Queue
                          </p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                            Horizon Automations (VA-2026-1010) awaiting allocation.
                          </p>
                          <span className="text-[10px] font-mono text-muted-foreground/70 mt-1 inline-block">25m ago</span>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 1 }}
                        transition={{ duration: 0.30, ease: [0.22, 1, 0.36, 1], delay: 0.17 }}
                        className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-default"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-foreground truncate">
                            Enterprise Deal Closed
                          </p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                            OceanWave Maritime (VA-2026-1014) claimed at ₹5,00,000.
                          </p>
                          <span className="text-[10px] font-mono text-muted-foreground/70 mt-1 inline-block">1h ago</span>
                        </div>
                      </motion.div>
                    </div>

                    {/* Footer */}
                    <div className="px-3.5 py-2 border-t border-border/60">
                      <button
                        type="button"
                        onClick={() => setShowNotifications(false)}
                        className="text-[11px] text-muted-foreground hover:text-foreground transition-colors font-medium"
                      >
                        Mark all as read
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Menu with Anchor Motion conforming to Section 7 */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-muted/60 transition-colors"
            >
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm font-mono shrink-0">
                {getInitials(user.name)}
              </div>
              <div className="hidden lg:flex flex-col items-start text-left">
                <span className="text-[13px] font-semibold text-foreground leading-tight">
                  {user.name}
                </span>
                <span className="text-[11px] text-muted-foreground leading-none font-mono">
                  {user.role}
                </span>
              </div>
            </button>

            <AnimatePresence>
              {showUserDropdown && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -4 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-lg z-50 origin-top-right"
                >
                  <div className="px-2.5 py-2 border-b border-border/60 mb-1.5">
                    <p className="text-[13px] font-semibold text-foreground truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] font-mono text-muted-foreground truncate">
                      {user.email}
                    </p>
                    <div className="mt-1.5">
                      <RoleBadge role={user.role} />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <Link
                      href="/settings"
                      onClick={() => setShowUserDropdown(false)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span>RBAC Permissions</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        resetToDefaultMockData();
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 text-muted-foreground" />
                      <span>Reset Mock Data</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setShowUserDropdown(false);
                        router.push("/login");
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Quick Search Modal conforming to Section 12 (Center Modal Motion) */}
      <AnimatePresence>
        {showSearchModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 backdrop-brightness-75 backdrop-blur-sm p-4"
            onClick={() => setShowSearchModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full max-w-xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search leads by name, code, contact or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-[15px] text-foreground focus:outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowSearchModal(false)}
                  className="text-[11px] font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border/80"
                >
                  ESC
                </button>
              </div>

              <div className="p-2 max-h-80 overflow-y-auto">
                {searchQuery.trim() === "" ? (
                  <div className="p-6 text-center text-[13px] text-muted-foreground">
                    Type to search across all leads and pipeline stages.
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-6 text-center text-[13px] text-muted-foreground">
                    No matching leads found for "{searchQuery}".
                  </div>
                ) : (
                  <div className="space-y-1">
                    {searchResults.map((lead) => (
                      <button
                        key={lead.id}
                        type="button"
                        onClick={() => {
                          setShowSearchModal(false);
                          router.push(`/leads/${lead.id}`);
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/70 text-left transition-colors group"
                      >
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="text-[14px] font-semibold text-foreground group-hover:text-primary transition-colors">
                              {lead.name}
                            </span>
                            <span className="text-[11px] font-mono text-muted-foreground bg-muted px-1.5 py-0.2 rounded">
                              {lead.leadCode}
                            </span>
                          </div>
                          <div className="text-[12px] text-muted-foreground font-mono mt-0.5">
                            {lead.contactNumber} • {lead.city || "India"}
                          </div>
                        </div>
                        <span className="text-[11px] font-mono uppercase bg-muted/80 px-2.5 py-1 rounded text-muted-foreground font-medium border border-border/50">
                          {lead.currentDepartment}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
