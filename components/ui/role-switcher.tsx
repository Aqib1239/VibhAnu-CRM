"use client";

import * as React from "react";
import { useAuth } from "@/context/auth-context";
import { Role } from "@/types/auth";
import { ROLE_CONFIGS } from "@/constants/roles";
import { cn } from "@/lib/utils";
import { Shield, ChevronDown, Check } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

export function RoleSwitcher({ className }: { className?: string }) {
  const { role, switchRole } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const rolesList: Role[] = [
    "ADMIN",
    "MARKETING",
    "COMMUNICATION",
    "VIGILANCE",
    "SUPPORT",
    "SALES",
  ];

  // Close when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeConfig = ROLE_CONFIGS[role] || ROLE_CONFIGS.ADMIN;

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className=" flex items-center gap-2.5 h-9 px-2 rounded-lg border border-border bg-card hover:bg-muted/60 text-[13px] font-medium text-foreground shadow-xs transition-colors"
      >
        <Shield className="w-4 h-4 text-primary" />
        <div className="flex flex-col items-start text-left">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono leading-none">
            Role
          </span>
          <span className="font-semibold text-foreground text-[12px] leading-tight">
            {activeConfig.badgeLabel}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-muted-foreground ml-0.5 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute -right-12 sm:right-0 mt-2 w-72 rounded-xl border border-border bg-card p-2 shadow-xl z-50 origin-top-right"
          >
            <div className="px-2.5 py-2 border-b border-border/60 mb-1.5">
              <p className="text-[13px] font-semibold text-foreground">
                Switch Active Role
              </p>
              <p className="text-[11px] text-muted-foreground">
                Test role-aware navigation & workflow gates
              </p>
            </div>

            <div className="space-y-1">
              {rolesList.map((r, index) => {
                const cfg = ROLE_CONFIGS[r];
                const isSelected = role === r;

                return (
                  <motion.button
                    key={r}
                    type="button"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: [0.22, 1, 0.36, 1],
                      delay: 0.08 * index, // stagger each item
                    }}
                    onClick={() => {
                      switchRole(r);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-[13px] transition-colors",
                      isSelected
                        ? "bg-primary/10 text-primary font-semibold border border-primary/20"
                        : "hover:bg-muted/70 text-foreground"
                    )}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-foreground">
                          {cfg.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                        {cfg.description}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 shrink-0 text-primary" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
