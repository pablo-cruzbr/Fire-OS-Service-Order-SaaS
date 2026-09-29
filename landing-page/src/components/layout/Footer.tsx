import Link from "next/link";
import { TbExternalLink } from "react-icons/tb";
import { Logo } from "@/components/brand/Logo";
import { segments } from "@/features/landing/segments";
import { appUrl } from "@/lib/appUrl";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo className="h-6 text-link" />
          <p className="mt-4 max-w-xs text-sm text-bodytext">
            Software de ordens de serviço e chamados para empresas de assistência técnica e manutenção.
          </p>
        </div>
        <div className="md:col-span-2">
          <h3 className="text-sm font-semibold text-link">Produto</h3>
          <ul className="mt-4 flex flex-col gap-2.5 text-sm text-bodytext">
            <li><Link href="/#recursos" className="hover:text-primary">Recursos</Link></li>
            <li><Link href="/#como-funciona" className="hover:text-primary">Como funciona</Link></li>
            <li><Link href="/#segmentos" className="hover:text-primary">Segmentos</Link></li>
            <li><Link href="/download" className="hover:text-primary">App mobile</Link></li>
          </ul>
        </div>
        <div className="md:col-span-4">
          <h3 className="text-sm font-semibold text-link">Segmentos</h3>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm text-bodytext">
            {segments.map((segment) => (
              <li key={segment.id}>
                <Link href="/#segmentos" className="hover:text-primary">{segment.short}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2">
          <h3 className="text-sm font-semibold text-link">Acesso</h3>
          <ul className="mt-4 flex flex-col gap-2.5 text-sm text-bodytext">
            <li><Link href={appUrl("/login")} className="hover:text-primary">Portal administrativo</Link></li>
            <li><Link href={appUrl("/AreadeUsuario")} className="hover:text-primary">Área do usuário</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-sm text-bodytext sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Fire OS. Todos os direitos reservados.</p>
          <p>
            Fundado por{" "}
            <a
              href="https://pablocruz.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              Pablo Cruz <TbExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
