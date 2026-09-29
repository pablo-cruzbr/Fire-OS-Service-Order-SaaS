import Link from "next/link";
import { TbArrowRight, TbDeviceMobile } from "react-icons/tb";
import { ButtonLink } from "@/components/ui";
import { Logo } from "@/components/brand/Logo";
import { appUrl } from "@/lib/appUrl";
import { ThemeToggle } from "./ThemeToggle";

/*
 * Shared across every page (home, /download, ...) — nav hrefs always point
 * to "/#secao" instead of "#secao" so they work the same whether you're
 * already on the homepage or navigating in from a subpage.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-[70px] max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" aria-label="Fire OS, início" className="text-link">
          <Logo className="h-6" />
        </Link>
        <nav aria-label="Seções" className="hidden items-center gap-7 text-sm font-medium text-link lg:flex">
          <Link href="/#recursos" className="hover:text-primary">Recursos</Link>
          <Link href="/#segmentos" className="hover:text-primary">Segmentos</Link>
          <Link href="/#como-funciona" className="hover:text-primary">Como funciona</Link>
          <Link href="/download" className="inline-flex items-center gap-1.5 hover:text-primary">
            <TbDeviceMobile className="h-4 w-4" /> App mobile
          </Link>
          <Link href={appUrl("/AreadeUsuario")} className="hover:text-primary">Área do usuário</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <ButtonLink href={appUrl("/login")} variant="ghost" className="hidden sm:inline-flex">
            Entrar
          </ButtonLink>
          <ButtonLink href={appUrl("/login")} icon={<TbArrowRight className="h-4 w-4" />}>
            Acessar o portal
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
