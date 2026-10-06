import * as React from "react";
import { Department } from "@/types/leads";
import { cn } from "@/lib/utils";
import { 
  Check, 
  Megaphone, 
  MessageSquare, 
  ShieldCheck, 
  Headphones, 
  TrendingUp, 
  CheckCircle2 
} from "lucide-react";

interface WorkflowStepperProps {
  currentDepartment: Department;
  className?: string;
}

const STAGES: { id: Department; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "marketing", label: "Marketing", icon: Megaphone },
  { id: "communication", label: "Communication", icon: MessageSquare },
  { id: "vigilance", label: "Vigilance", icon: ShieldCheck },
  { id: "support", label: "Support", icon: Headphones },
  { id: "sales", label: "Sales", icon: TrendingUp },
  { id: "claimed", label: "Claimed", icon: CheckCircle2 },
];

export function WorkflowStepper({ currentDepartment, className }: WorkflowStepperProps) {
  const currentIndex = STAGES.findIndex((s) => s.id === currentDepartment);

  return (
    <div className={cn("w-full py-2 overflow-x-auto", className)}>
      <div className="flex items-center min-w-[620px] justify-between relative px-4">
        {/* Background track line */}
        <div className="absolute top-4 left-8 right-8 h-0.5 bg-border/80 -z-0" />
        
        {/* Active filled line */}
        <div
          className="absolute top-4 left-8 h-0.5 bg-primary transition-all duration-300 -z-0"
          style={{
            width: `${Math.max(0, (currentIndex / (STAGES.length - 1)) * 100)}%`,
          }}
        />

        {STAGES.map((stage, index) => {
          const isCompleted = index < currentIndex || currentDepartment === "claimed";
          const isCurrent = index === currentIndex && currentDepartment !== "claimed";
          const isPending = index > currentIndex && currentDepartment !== "claimed";
          const Icon = stage.icon;

          return (
            <div key={stage.id} className="flex flex-col items-center relative z-10">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border transition-all duration-150 bg-background",
                  isCompleted && "bg-primary border-primary text-primary-foreground shadow-2xs",
                  isCurrent && "border-primary text-primary ring-4 ring-primary/15 font-bold bg-background shadow-xs",
                  isPending && "border-border text-muted-foreground/60 bg-muted/50"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-[13px] tracking-tight whitespace-nowrap",
                  isCompleted && "text-foreground font-medium",
                  isCurrent && "text-primary font-bold",
                  isPending && "text-muted-foreground/70 font-normal"
                )}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
