"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  ShieldCheck,
  Headphones,
  TrendingUp,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  Lock,
} from "lucide-react";
import {
  MAIN_NAV_ITEMS,
  SECONDARY_NAV_ITEMS,
  NavItem,
} from "@/constants/navigation";
import { useAuth } from "@/context/auth-context";
import { useLeads } from "@/context/leads-context";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

const ICON_MAP = {
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  ShieldCheck,
  Headphones,
  TrendingUp,
  Users,
  Settings,
};

export function Sidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen = false,
  setIsMobileOpen,
}: SidebarProps) {
  const pathname = usePathname();
  const { role } = useAuth();
  const { stats } = useLeads();

  const getBadgeCount = (badgeKey?: NavItem["badgeKey"]): number | null => {
    if (!stats || !badgeKey) return null;
    switch (badgeKey) {
      case "marketing":
        return stats.marketingCount;
      case "communication":
        return stats.communicationCount;
      case "vigilance":
        return stats.vigilanceCount;
      case "support":
        return stats.supportCount;
      case "sales":
        return stats.salesCount;
      case "total":
        return stats.totalLeads;
      default:
        return null;
    }
  };

  const isNavVisible = (item: NavItem): boolean => {
    if (role === "ADMIN") return true;
    if (!item.allowedRoles) return true;
    return item.allowedRoles.includes(role);
  };

  const renderNavList = (items: NavItem[]) => (
    <ul className="space-y-1">
      {items.filter(isNavVisible).map((item) => {
        const Icon = ICON_MAP[item.iconName] || Users;
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));
        const badgeCount = getBadgeCount(item.badgeKey);

        return (
          <li key={item.href} className="relative group">
            <Link
              href={item.href}
              onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
              className={cn(
                "flex items-center rounded-lg text-[14px] font-medium transition-colors duration-200 select-none",
                isActive
                  ? "bg-primary/10 text-primary font-semibold border border-primary/15 shadow-2xs dark:bg-primary/15 dark:text-primary dark:border-primary/20"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground border border-transparent",
                isCollapsed
                  ? "justify-center px-0 h-10 w-10 mx-auto"
                  : "gap-3 px-3 py-2 w-full"
              )}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />

              <div
                className={cn(
                  "flex flex-1 items-center justify-between min-w-0 overflow-hidden transition-all duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  isCollapsed
                    ? "max-w-0 opacity-0 -translate-x-1.5 pointer-events-none"
                    : "max-w-[180px] opacity-100 translate-x-0"
                )}
              >
                <span className="truncate tracking-tight whitespace-nowrap">{item.title}</span>
                {badgeCount !== null && badgeCount > 0 && (
                  <span
                    className={cn(
                      "ml-auto text-[11px] font-mono tabular-nums px-2 py-0.5 rounded-full border shrink-0 transition-colors duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground border-transparent font-semibold shadow-2xs"
                        : "bg-muted text-muted-foreground border-border/50 group-hover:border-border"
                    )}
                  >
                    {badgeCount}
                  </span>
                )}
              </div>
            </Link>

            {/* Hover Tooltip when collapsed */}
            {isCollapsed && (
              <div className="fixed left-[78px] ml-1 hidden group-hover:flex items-center gap-2 z-50 rounded-md bg-popover px-3 py-1.5 text-[13px] text-popover-foreground shadow-md border border-border whitespace-nowrap animate-in fade-in-50">
                <span className="font-medium">{item.title}</span>
                {badgeCount !== null && badgeCount > 0 && (
                  <span className="bg-primary/15 text-primary font-mono text-[11px] px-1.5 py-0.5 rounded-full font-semibold">
                    {badgeCount}
                  </span>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-border bg-card transition-[width,transform] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] md:translate-x-0 ",
          isCollapsed ? "w-[72px]" : "w-[244px]",
          isMobileOpen
            ? "translate-x-0 w-[244px] shadow-xl"
            : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Brand Header — Aligned with 64px main header datum line */}
        <div
          className={cn(
            "relative flex h-16 shrink-0 items-center border-b border-border/80 transition-all duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]",
            isCollapsed ? "justify-center px-0" : "px-4"
          )}
        >
          <Link
            href="/"
            className={cn(
              "flex items-center overflow-hidden h-10 w-full transition-all duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]",
              isCollapsed ? "justify-center px-0" : "gap-2.5 pr-6"
            )}
            aria-label="Vibh-Anu CRM"
          >
            {/* Brand Mark — Centered in collapsed mode, stable size */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-mono text-sm font-bold shadow-xs transition-transform duration-200">
              VA
            </div>

            {/* Brand Text — Smoothly transitions width & opacity */}
            <div
              className={cn(
                "flex min-w-0 flex-col overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                isCollapsed
                  ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none"
                  : "max-w-[160px] opacity-100 translate-x-0"
              )}
            >
              <span className="truncate text-[15px] font-bold tracking-tight text-foreground leading-tight whitespace-nowrap">
                Vibh-Anu CRM
              </span>
              <span className="truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                Enterprise Lead OS
              </span>
            </div>
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "absolute hidden md:flex h-7 w-7 items-center justify-center z-80",
              "border border-gray-300 dark:border-gray-600 rounded-full text-muted-foreground",
              "bg-card hover:bg-muted hover:text-foreground shadow-sm",
              "transition-colors duration-150",
              "top-1/2 -translate-y-1/2",
              "-right-3"
            )}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <h5
              className={cn(
                "px-2 mb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider font-mono overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                isCollapsed ? "max-h-0 opacity-0 pointer-events-none mb-0" : "max-h-6 opacity-100"
              )}
            >
              Pipeline Stages
            </h5>
            {renderNavList(MAIN_NAV_ITEMS)}
          </div>

          <div>
            <h5
              className={cn(
                "px-2 mb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider font-mono overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                isCollapsed ? "max-h-0 opacity-0 pointer-events-none mb-0" : "max-h-6 opacity-100"
              )}
            >
              System & Settings
            </h5>
            {renderNavList(SECONDARY_NAV_ITEMS)}
          </div>
        </div>

        {/* Footer info — smoothly transitions */}
        <div
          className={cn(
            "border-t border-border/80 text-[12px] text-muted-foreground bg-muted/20 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            isCollapsed ? "max-h-0 p-0 border-t-0 opacity-0 pointer-events-none" : "max-h-16 p-3 opacity-100"
          )}
        >
          <div className="flex items-center gap-2.5 px-1 whitespace-nowrap">
            <Building2 className="w-4 h-4 text-muted-foreground/70 shrink-0" />
            <div className="truncate">
              <p className="font-semibold text-foreground text-[12px] truncate">
                Vibh-Anu CRM
              </p>
              <p className="text-[10px] text-muted-foreground font-mono">
                Production v1.0
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
