import Image from "next/image";
import { ReactNode } from "react";
import { TbLogout } from "react-icons/tb";
import { logoutAction } from "@/actions/logout";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import logo from "../../../public/Fire-os-fundo-branco.svg";

/** Simple top-bar layout for the end-user area (no admin sidebar). */
export function UserPortalShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-[70px] max-w-5xl items-center gap-3 px-4 sm:px-6">
          <span className="rounded-md bg-white px-1 py-1">
            <Image src={logo} alt="Fire OS" width={130} height={30} priority />
          </span>
          <span className="hidden rounded-full bg-lightprimary px-2.5 py-1 text-xs font-medium text-primary sm:inline">
            Área do usuário
          </span>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <form action={logoutAction}>
              <input type="hidden" name="redirectTo" value="/AreadeUsuario" />
              <button
                type="submit"
                className="flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-link transition-colors hover:bg-lightprimary hover:text-primary"
              >
                <TbLogout className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
