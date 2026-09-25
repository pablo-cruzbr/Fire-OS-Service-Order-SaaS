import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { TbCheck, TbCircleCheck } from "react-icons/tb";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { AuthSlide, AuthSlideshow } from "./AuthSlideshow";
import { Logo } from "@/components/brand/Logo";

/** Photo sequences for each auth page (CC0 images in /public/segments). */
export const authSlides = {
  staff: [
    { src: "/segments/hero.webp", label: "Manutenção e reparo" },
    { src: "/segments/eletrica.webp", label: "Elétrica e predial" },
    { src: "/segments/solar.webp", label: "Energia solar" },
    { src: "/segments/oficinas.webp", label: "Oficinas mecânicas" },
  ],
  client: [
    { src: "/segments/assistencia.webp", label: "Assistência técnica" },
    { src: "/segments/helpdesk.webp", label: "Suporte de TI" },
    { src: "/segments/climatizacao.webp", label: "Climatização" },
    { src: "/segments/telecom.webp", label: "Internet e telecom" },
  ],
  signup: [
    { src: "/segments/solar.webp", label: "Energia solar" },
    { src: "/segments/limpeza.webp", label: "Limpeza e conservação" },
    { src: "/segments/serralheria.webp", label: "Serralheria" },
    { src: "/segments/marcenaria.webp", label: "Marcenaria" },
  ],
} satisfies Record<string, AuthSlide[]>;

type AuthShellProps = {
  title: string;
  subtitle?: ReactNode;
  /** Headline on the photo side. */
  asideTitle?: string;
  asideText?: string;
  asidePoints?: string[];
  slides?: AuthSlide[];
  /** Small link shown at the top of the form side (e.g. "É cliente? Área do usuário"). */
  topLink?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * Split auth layout (v2): full-bleed photos of service professionals on the
 * left, form on the right.
 */
export function AuthShell({
  title,
  subtitle,
  asideTitle = "Sua central de chamados, rápida e organizada",
  asideText = "Abra chamados, acompanhe ordens de serviço e controle equipamentos em um só lugar.",
  asidePoints = ["Chamados e OS em tempo real", "Agenda da equipe técnica", "OS digital com assinatura"],
  slides = authSlides.staff,
  topLink,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-12">
      <aside className="relative isolate hidden overflow-hidden bg-[#140d2b] lg:col-span-7 lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-[#140d2b] via-[#140d2b]/55 to-[#140d2b]/20" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-[#2a1760]/50 to-transparent" />

        <div className="flex items-start justify-between gap-6">
          <Link href="/" aria-label="Ordem Next, início" className="text-white">
            <Logo className="h-7" />
          </Link>
          <div aria-hidden className="flex max-w-[280px] items-center gap-3 rounded-xl border border-white/15 bg-white/10 p-3 text-white shadow-lg backdrop-blur-md">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success text-xl">
              <TbCircleCheck />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">OS #48238 concluída</p>
              <p className="truncate text-xs text-white/70">Assinada pelo responsável · agora</p>
            </div>
          </div>
        </div>

        <div className="max-w-xl">
          <AuthSlideshow slides={slides} />
          <h2 className="mt-6 text-3xl font-bold leading-tight text-white xl:text-4xl">{asideTitle}</h2>
          <p className="mt-3 text-base text-white/80">{asideText}</p>
          <ul className="mt-6 flex flex-col gap-2.5">
            {asidePoints.map((point) => (
              <li key={point} className="flex items-center gap-2.5 text-sm text-white/90">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15">
                  <TbCheck className="h-3.5 w-3.5" />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="flex flex-col px-6 py-8 sm:px-10 lg:col-span-5">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" aria-label="Ordem Next, início" className="text-link lg:invisible">
            <Logo className="h-6" />
          </Link>
          <div className="flex items-center gap-3 text-sm text-bodytext">
            {topLink && <span className="hidden sm:inline">{topLink}</span>}
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">
            {slides[0] && (
              <div className="relative mb-8 h-36 overflow-hidden rounded-xl lg:hidden">
                <Image src={slides[0].src} alt="" fill sizes="(max-width: 1023px) 100vw, 0px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#140d2b]/80 to-transparent" />
                <span className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                  {slides[0].label}
                </span>
              </div>
            )}
            <h1 className="text-3xl font-bold text-link">{title}</h1>
            {subtitle && <p className="mt-2 text-bodytext">{subtitle}</p>}
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-8 text-sm text-bodytext">{footer}</div>}
            {topLink && <p className="mt-6 text-center text-sm text-bodytext sm:hidden">{topLink}</p>}
          </div>
        </div>

        <p className="text-center text-xs text-muted">
          © {new Date().getFullYear()} Ordem Next · Fundado por{" "}
          <a
            href="https://pablocruz.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-bodytext hover:text-primary hover:underline"
          >
            Pablo Cruz
          </a>
        </p>
      </main>
    </div>
  );
}

export function AuthError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="mb-5 rounded-md bg-lighterror px-4 py-3 text-sm font-medium text-errortext">
      {message}
    </p>
  );
}

/** "ou" divider between the form and a secondary action. */
export function AuthDivider({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 flex items-center gap-3 text-xs text-muted">
      <span className="h-px flex-1 bg-border" />
      {children}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
