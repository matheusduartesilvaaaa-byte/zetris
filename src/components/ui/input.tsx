import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, rightElement, ...props }, ref) => {
    if (!icon && !rightElement) {
      return (
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/[0.03] dark:focus-visible:border-sky-400/50",
            className
          )}
          ref={ref}
          {...props}
        />
      );
    }

    return (
      <div className="relative flex items-center">
        {icon && (
          <span className="pointer-events-none absolute left-3 flex text-muted-foreground">{icon}</span>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-lg border border-input bg-background py-2 text-sm ring-offset-background transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/[0.03] dark:focus-visible:border-sky-400/50",
            icon ? "pl-10" : "pl-3",
            rightElement ? "pr-10" : "pr-3",
            className
          )}
          ref={ref}
          {...props}
        />
        {rightElement && <span className="absolute right-3 flex">{rightElement}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
