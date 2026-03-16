import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-red-100 text-red-700 hover:bg-red-100/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80",
        warning:
          "border-transparent bg-amber-100 text-amber-700 hover:bg-amber-100/80",
        info:
          "border-transparent bg-blue-100 text-blue-700 hover:bg-blue-100/80",
        violet:
          "border-transparent bg-violet-100 text-violet-700 hover:bg-violet-100/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
