import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "success";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none hover:-translate-y-[0.5px] active:translate-y-0 active:scale-[0.98] select-none text-[14px]";

    const variants = {
      primary:
        "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs border border-primary/20 active:bg-primary/95 font-semibold",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border shadow-xs",
      outline:
        "border border-border bg-card hover:bg-muted/80 text-foreground hover:text-foreground shadow-xs",
      ghost:
        "text-muted-foreground hover:text-foreground hover:bg-muted/70",
      destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xs border border-transparent font-semibold",
      success:
        "bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 shadow-xs border border-transparent font-semibold",
    };

    const sizes = {
      sm: "h-8 px-3 text-[13px] gap-1.5",
      md: "h-10 px-4 text-[14px] gap-2",
      lg: "h-11 px-5 text-[15px] gap-2.5 font-semibold",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
