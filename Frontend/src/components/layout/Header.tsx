"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TbLogout, TbMenu2, TbTicket, TbUser } from "react-icons/tb";
import { logoutAction } from "@/actions/logout";
import type { SessionUser } from "@/lib/session";
import { ThemeToggle } from "./ThemeToggle";

const roleLabel: Record<string, string> = {
  ADMIN: "Administrador",
  TECNICO: "Técnico",
  USER: "Usuário",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function ProfileMenu({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-3 rounded-full p-1 pr-1 transition-colors hover:bg-lightprimary sm:pr-3"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
          {initials(user.name) || <TbUser />}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-semibold leading-tight text-link">{user.name}</span>
          <span className="block text-xs text-bodytext">{roleLabel[user.role] ?? user.role}</span>
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl bg-card p-5 shadow-md dark:shadow-dark-md"
        >
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-base font-semibold text-white">
              {initials(user.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-link">{user.name}</p>
              <p className="text-xs text-bodytext">{roleLabel[user.role] ?? user.role}</p>
              {user.email && <p className="truncate text-xs text-muted">{user.email}</p>}
            </div>
          </div>
          <Link
            href="/dashboard/tickets"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="mt-3 flex items-center gap-3 rounded-md px-2 py-2 text-sm text-link hover:bg-lightprimary hover:text-primary"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-lightprimary text-lg text-primary">
              <TbTicket />
            </span>
            Meus chamados
          </Link>
          <form action={logoutAction} className="mt-3">
            <button
              type="submit"
              role="menuitem"
              className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-primary text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white"
            >
              <TbLogout className="h-4 w-4" />
              Sair do sistema
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

type HeaderProps = {
  user: SessionUser;
  onMenuClick: () => void;
};

export function Header({ user, onMenuClick }: HeaderProps) {
  return (
    <header className="flex h-[70px] items-center gap-2 bg-background/90 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Abrir menu"
        className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-link hover:bg-lightprimary hover:text-primary xl:hidden"
      >
        <TbMenu2 />
      </button>
      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <ThemeToggle />
        <ProfileMenu user={user} />
      </div>
    </header>
  );
}
