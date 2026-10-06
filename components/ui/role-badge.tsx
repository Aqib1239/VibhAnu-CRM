import * as React from "react";
import { Role } from "@/types/auth";
import { ROLE_CONFIGS } from "@/constants/roles";
import { cn } from "@/lib/utils";

interface RoleBadgeProps {
  role: Role;
  className?: string;
  size?: "sm" | "md";
}

export function RoleBadge({ role, className, size = "sm" }: RoleBadgeProps) {
  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.ADMIN;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md font-mono font-medium border select-none transition-colors",
        config.color,
        size === "sm" ? "px-2 py-0.5 text-[11px] tracking-wider" : "px-2.5 py-1 text-[12px]",
        className
      )}
    >
      {config.badgeLabel.toUpperCase()}
    </span>
  );
}
