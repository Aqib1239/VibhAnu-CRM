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
        className="flex items-center gap-2.5 h-9 px-3 rounded-xl border border-border/80 bg-card shadow-neu-btn hover:shadow-neu-btn-hover active:shadow-neu-inset text-[13px] font-medium text-foreground transition-all duration-200"
      >
        <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Shield className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col items-start text-left">
          <span className="text-[9.5px] text-muted-foreground uppercase tracking-wider font-mono leading-none">
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
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -right-12 sm:right-0 mt-2 w-72 rounded-2xl border border-border/80 bg-card p-2 shadow-neu-raised-lg z-50 origin-top-right backdrop-blur-md overflow-hidden"
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
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{
                      duration: 0.25,
                      ease: [0.22, 1, 0.36, 1],
                      delay: isOpen ? index * 0.08 : 0,
                    }}
                    onClick={() => {
                      switchRole(r);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "relative w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-[13px] transition-colors duration-200 border",
                      isSelected
                        ? "shadow-neu-inset bg-primary/10 text-primary font-semibold border-primary/20"
                        : "hover:bg-muted/50 hover:shadow-neu-btn-hover active:shadow-neu-inset text-foreground border-transparent"
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

                    {/* Animate the check icon so it fades/scales in with the item */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{
                            duration: 0.2,
                            ease: [0.22, 1, 0.36, 1],
                            delay: isOpen ? index * 0.04 + 0.05 : 0,
                          }}
                          className="shrink-0"
                        >
                          <Check className="w-4 h-4 text-primary" />
                        </motion.span>
                      )}
                    </AnimatePresence>
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