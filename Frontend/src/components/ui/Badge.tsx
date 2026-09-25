import { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { statusTone, Tone } from "@/lib/status";

const tones: Record<Tone, string> = {
  primary: "bg-lightprimary text-primary",
  secondary: "bg-lightsecondary text-secondary",
  success: "bg-lightsuccess text-successtext",
  warning: "bg-lightwarning text-warningtext",
  error: "bg-lighterror text-errortext",
  info: "bg-lightinfo text-info",
  neutral: "bg-surface text-bodytext",
};

type BadgeProps = {
  tone?: Tone;
  children: ReactNode;
  className?: string;
};

export function Badge({ tone = "primary", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Badge whose colour is derived from the status name. */
export function StatusBadge({ status, fallback = "—" }: { status?: string | null; fallback?: string }) {
  if (!status) return <span className="text-muted">{fallback}</span>;
  return <Badge tone={statusTone(status)}>{status}</Badge>;
}
