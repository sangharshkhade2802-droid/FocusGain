import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-indigo-600 text-white shadow hover:bg-indigo-500",
    secondary: "border-transparent bg-slate-800 text-slate-300 hover:bg-slate-700",
    destructive: "border-transparent bg-rose-600 text-white shadow hover:bg-rose-500",
    outline: "text-slate-300 border-white/10",
    success: "border-transparent bg-emerald-600/20 text-emerald-300 border border-emerald-500/30",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
