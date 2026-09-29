import { cn } from "@/lib/cn";

/*
 * Fire OS brand, drawn as monoline strokes (14px, round caps/joins) so it
 * stays crisp at any size and follows the text colour (`currentColor`):
 * dark on light surfaces, white in dark mode, no background box needed.
 * Centerline guides: cap 47 · x-height 87 · baseline 153.
 */

type LogoProps = {
  className?: string;
  /** Paints "OS" in the brand purple. */
  accent?: boolean;
  title?: string;
};

export function Logo({ className, accent = false, title = "Fire OS" }: LogoProps) {
  return (
    <svg
      viewBox="33 40 576 120"
      role="img"
      aria-label={title}
      className={cn("h-7 w-auto", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={14}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title>{title}</title>
      {/* Fire */}
      <path d="M100 47 H40 V153 M40 100 H88" />
      <path d="M138 87 V153" />
      <circle cx="138" cy="57" r="8" fill="currentColor" stroke="none" />
      <path d="M176 153 V113 A26 26 0 0 1 202 87" />
      <path d="M271 120 H304 A33 33 0 1 0 295 143" />
      {/* OS */}
      <g stroke={accent ? "var(--primary)" : undefined}>
        <circle cx="451" cy="100" r="53" />
        <path d="M598 60.25 A30 26.5 0 1 0 572 100 A30 26.5 0 1 1 546 139.75" />
      </g>
    </svg>
  );
}

/** Square app mark: the "O" of OS with a check — an order done. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="Fire OS" className={cn("h-9 w-9", className)}>
      <rect width="64" height="64" rx="16" fill="var(--primary, #6d44e4)" />
      <g fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="32" cy="32" r="17" />
        <path d="M24.5 32.5 L30 38 L40 27" />
      </g>
    </svg>
  );
}
