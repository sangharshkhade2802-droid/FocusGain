import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const base = "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    
    const variants = {
      default: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-md",
      destructive: "bg-rose-600 text-white hover:bg-rose-500 shadow-sm",
      outline: "border border-white/10 bg-transparent hover:bg-white/5 text-slate-200",
      secondary: "bg-slate-800 text-slate-200 hover:bg-slate-700",
      ghost: "hover:bg-white/5 hover:text-white text-slate-400",
      link: "text-indigo-400 underline-offset-4 hover:underline",
    };

    const sizes = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-lg px-3",
      lg: "h-11 rounded-xl px-8 text-sm",
      icon: "h-9 w-9",
    };

    return (
      <button
        className={cn(base, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
