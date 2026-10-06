import * as React from "react";
import { Department, LeadStatus } from "@/types/leads";
import { cn } from "@/lib/utils";
import { 
  Megaphone, 
  MessageSquare, 
  ShieldCheck, 
  Headphones, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from "lucide-react";

interface DepartmentBadgeProps {
  department: Department;
  className?: string;
  showIcon?: boolean;
}

export function DepartmentBadge({ department, className, showIcon = true }: DepartmentBadgeProps) {
  const configs: Record<Department, { label: string; icon: React.ReactNode; styles: string }> = {
    marketing: {
      label: "Marketing",
      icon: <Megaphone className="w-3.5 h-3.5" />,
      styles: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200/70 dark:border-blue-800/40",
    },
    communication: {
      label: "Communication",
      icon: <MessageSquare className="w-3.5 h-3.5" />,
      styles: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200/70 dark:border-indigo-800/40",
    },
    vigilance: {
      label: "Vigilance",
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      styles: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200/70 dark:border-amber-800/40",
    },
    support: {
      label: "Support",
      icon: <Headphones className="w-3.5 h-3.5" />,
      styles: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200/70 dark:border-teal-800/40",
    },
    sales: {
      label: "Sales",
      icon: <TrendingUp className="w-3.5 h-3.5" />,
      styles: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200/70 dark:border-purple-800/40",
    },
    claimed: {
      label: "Claimed",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      styles: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-800/40",
    },
  };

  const config = configs[department] || configs.marketing;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium border select-none transition-colors",
        config.styles,
        className
      )}
    >
      {showIcon && <span className="shrink-0">{config.icon}</span>}
      <span>{config.label}</span>
    </span>
  );
}

interface StatusBadgeProps {
  status: LeadStatus;
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({ status, className, showIcon = true }: StatusBadgeProps) {
  const configs: Record<LeadStatus, { label: string; dotColor: string; styles: string }> = {
    new: {
      label: "New Entry",
      dotColor: "bg-blue-500",
      styles: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200/70 dark:border-blue-800/40",
    },
    in_progress: {
      label: "In Outreach",
      dotColor: "bg-indigo-500",
      styles: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200/70 dark:border-indigo-800/40",
    },
    meeting_scheduled: {
      label: "Meeting Scheduled",
      dotColor: "bg-amber-500",
      styles: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200/70 dark:border-amber-800/40",
    },
    verified: {
      label: "Audit Verified",
      dotColor: "bg-teal-500",
      styles: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200/70 dark:border-teal-800/40",
    },
    allocated: {
      label: "Allocated to Sales",
      dotColor: "bg-purple-500",
      styles: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200/70 dark:border-purple-800/40",
    },
    claimed: {
      label: "Claimed & Closed",
      dotColor: "bg-emerald-500",
      styles: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-800/40",
    },
    rejected: {
      label: "Disqualified",
      dotColor: "bg-rose-500",
      styles: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200/70 dark:border-rose-800/40",
    },
  };

  const config = configs[status] || configs.new;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium border select-none transition-colors",
        config.styles,
        className
      )}
    >
      {showIcon && (
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dotColor)} />
      )}
      <span>{config.label}</span>
    </span>
  );
}
