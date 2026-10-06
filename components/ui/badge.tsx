import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "destructive" | "info" | "neutral";
  size?: "sm" | "md";
}

export function Badge({ className, variant = "default", size = "sm", ...props }: BadgeProps) {
  const variants = {
    default: "bg-primary text-primary-foreground border-transparent",
    secondary: "bg-secondary text-secondary-foreground border-transparent",
    neutral: "bg-muted text-muted-foreground border-border/40",
    outline: "text-foreground border-border",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40",
    destructive: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/40",
    info: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800/40",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px] font-medium tracking-tight",
    md: "px-2.5 py-1 text-xs font-medium",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border transition-colors select-none font-sans",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
