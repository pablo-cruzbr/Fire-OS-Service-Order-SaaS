import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { TbCircleCheck, TbClockHour4, TbTicket } from "react-icons/tb";
import logo from "../../../public/Fire-os-fundo-branco.svg";

type AuthShellProps = {
  title: string;
  subtitle?: ReactNode;
  /** Headline on the illustration side. */
  asideTitle?: string;
  asideText?: string;
  children: ReactNode;
  footer?: ReactNode;
};

/** Stylised preview of the dashboard, used as the auth-page illustration. */
function DashboardPreview() {
  const rows = [
    { os: "#48210", place: "EMEF Monteiro Lobato", tone: "bg-lightwarning text-warningtext", status: "Aberta" },
    { os: "#48224", place: "Secretaria de Educação", tone: "bg-lightprimary text-primary", status: "Em andamento" },
    { os: "#48238", place: "CEU Parque Verde", tone: "bg-lightsuccess text-successtext", status: "Concluída" },
  ];

  return (
    <div aria-hidden className="relative mx-auto w-full max-w-lg select-none">
      <div className="absolute -left-8 -top-8 h-40 w-40 rounded-full bg-primary/15 blur-2xl" />
      <div className="absolute -bottom-10 -right-6 h-44 w-44 rounded-full bg-secondary/20 blur-2xl" />

      <div className="relative rounded-2xl bg-card p-5 shadow-md dark:shadow-dark-md">
        <div className="mb-4 grid grid-cols-3 gap-3">
          {[
            { label: "Abertos", value: "12", icon: <TbTicket />, box: "bg-lightprimary", dot: "bg-primary" },
            { label: "Andamento", value: "8", icon: <TbClockHour4 />, box: "bg-lightwarning", dot: "bg-warning" },
            { label: "Concluídos", value: "96", icon: <TbCircleCheck />, box: "bg-lightsuccess", dot: "bg-success" },
          ].map((tile) => (
            <div key={tile.label} className={`rounded-xl p-3 ${tile.box}`}>
              <span className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg text-white ${tile.dot}`}>
                {tile.icon}
              </span>
              <p className="text-[11px] text-bodytext">{tile.label}</p>
              <p className="text-lg font-semibold text-link">{tile.value}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.os} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
              <span className="text-xs font-semibold text-link">{row.os}</span>
              <span className="flex-1 truncate text-xs text-bodytext">{row.place}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${row.tone}`}>{row.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute -bottom-6 -left-4 flex items-center gap-3 rounded-xl bg-card px-4 py-3 shadow-md sm:-left-10 dark:shadow-dark-md">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-success text-white">
          <TbCircleCheck />
        </span>
        <div>
          <p className="text-xs font-semibold text-link">OS #48238 concluída</p>
          <p className="text-[11px] text-bodytext">Assinada pelo responsável</p>
        </div>
      </div>
    </div>
  );
}

/** Split auth layout, in the style of the Modernize "auth1" pages. */
export function AuthShell({
  title,
  subtitle,
  asideTitle = "Sua central de chamados, rápida e organizada",
  asideText = "Abra chamados, acompanhe ordens de serviço e controle equipamentos em um só lugar.",
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-12">
      <aside className="relative hidden overflow-hidden bg-lightprimary lg:col-span-7 lg:flex lg:flex-col xl:col-span-8">
        <Link href="/" className="absolute left-8 top-7 z-10 rounded-md bg-white px-2 py-1">
          <Image src={logo} alt="Fire OS" width={150} height={34} priority />
        </Link>
        <div className="flex flex-1 flex-col items-center justify-center gap-14 px-10 py-24">
          <DashboardPreview />
          <div className="max-w-md text-center">
            <h2 className="text-2xl font-semibold text-link">{asideTitle}</h2>
            <p className="mt-3 text-bodytext">{asideText}</p>
          </div>
        </div>
      </aside>

      <main className="flex items-center justify-center px-6 py-12 lg:col-span-5 xl:col-span-4">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 inline-block rounded-md bg-white px-1 py-1 lg:hidden">
            <Image src={logo} alt="Fire OS" width={140} height={32} />
          </Link>
          <h1 className="text-2xl font-semibold text-link">{title}</h1>
          {subtitle && <p className="mt-2 text-bodytext">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-sm text-bodytext">{footer}</div>}
        </div>
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
