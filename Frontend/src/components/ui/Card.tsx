import { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-xl bg-card p-6 shadow-md dark:shadow-dark-md", className)}
      {...props}
    />
  );
}

type CardHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={cn("mb-5 flex flex-wrap items-start justify-between gap-3", className)}>
      <div>
        <h5 className="text-lg font-semibold text-link">{title}</h5>
        {subtitle && <p className="mt-0.5 text-sm text-bodytext">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
