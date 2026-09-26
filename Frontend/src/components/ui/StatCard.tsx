import { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Tone } from "@/lib/status";

const tones: Record<Tone, { box: string; icon: string }> = {
  primary: { box: "bg-lightprimary", icon: "bg-primary text-white" },
  secondary: { box: "bg-lightsecondary", icon: "bg-secondary text-white" },
  success: { box: "bg-lightsuccess", icon: "bg-success text-white" },
  warning: { box: "bg-lightwarning", icon: "bg-warning text-white" },
  error: { box: "bg-lighterror", icon: "bg-error text-white" },
  info: { box: "bg-lightinfo", icon: "bg-info text-white" },
  neutral: { box: "bg-surface", icon: "bg-muted text-white" },
};

export type Stat = {
  label: string;
  value: ReactNode;
  tone?: Tone;
  icon?: ReactNode;
};

/** Coloured KPI tile, like the Modernize dashboard top cards. */
export function StatCard({ label, value, tone = "primary", icon }: Stat) {
  const palette = tones[tone];
  return (
    <div className={cn("flex items-center gap-4 rounded-xl px-5 py-5", palette.box)}>
      {icon && (
        <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-xl", palette.icon)}>
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-sm font-medium leading-snug text-bodytext">{label}</p>
        <p className="text-2xl font-semibold text-link">{value}</p>
      </div>
    </div>
  );
}

export function StatGrid({ stats }: { stats: Stat[] }) {
  if (stats.length === 0) return null;
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
