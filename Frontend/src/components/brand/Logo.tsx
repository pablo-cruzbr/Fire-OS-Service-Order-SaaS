import { cn } from "@/lib/cn";

/*
 * Ordem Next brand, drawn as monoline strokes (14px, round caps/joins) so it
 * stays crisp at any size and follows the text colour (`currentColor`):
 * dark on light surfaces, white in dark mode, no background box needed.
 * Centerline guides: cap 47 · x-height 87 · baseline 153.
 */

type LogoProps = {
  className?: string;
  /** Paints "Next" in the brand purple. */
  accent?: boolean;
  title?: string;
};

export function Logo({ className, accent = false, title = "Ordem Next" }: LogoProps) {
  return (
    <svg
      viewBox="20 40 968 120"
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
      {/* Ordem */}
      <circle cx="80" cy="100" r="53" />
      <path d="M171 153 V113 A26 26 0 0 1 197 87" />
      <circle cx="266" cy="120" r="33" />
      <path d="M299 47 V153" />
      <path d="M370 120 H403 A33 33 0 1 0 394 143" />
      <path d="M441 153 V111 A24 24 0 0 1 489 111 V153 M489 111 A24 24 0 0 1 537 111 V153" />
      {/* Next */}
      <g stroke={accent ? "var(--primary)" : undefined}>
        <path d="M631 153 V47 L711 153 V47" />
        <path d="M782 120 H815 A33 33 0 1 0 806 143" />
        <path d="M849 87 L909 153 M909 87 L849 153" />
        <path d="M959 60 V136 A17 17 0 0 0 976 153 H981 M943 87 H981" />
      </g>
    </svg>
  );
}

/** Square app mark: the "O" of Ordem with a check — an order done. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="Ordem Next" className={cn("h-9 w-9", className)}>
      <rect width="64" height="64" rx="16" fill="var(--primary, #6d44e4)" />
      <g fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="32" cy="32" r="17" />
        <path d="M24.5 32.5 L30 38 L40 27" />
      </g>
    </svg>
  );
}
