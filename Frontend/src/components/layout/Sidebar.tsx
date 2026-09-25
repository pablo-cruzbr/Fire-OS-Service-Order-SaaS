"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { TbChevronDown, TbPointFilled } from "react-icons/tb";
import { cn } from "@/lib/cn";
import type { NavItem, NavSection } from "./navigation";

import logoLight from "../../../public/Fire-os-fundo-branco.svg";

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

const itemClasses =
  "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all duration-200 hover:translate-x-1";

function NavEntry({ item, pathname, onNavigate }: { item: NavItem; pathname: string; onNavigate: () => void }) {
  const childActive = item.children?.some((child) => isActive(pathname, child.href)) ?? false;
  const [open, setOpen] = useState(childActive);

  if (item.href) {
    const active = isActive(pathname, item.href);
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          itemClasses,
          active
            ? "bg-primary text-white shadow-btn hover:translate-x-0"
            : "text-link hover:bg-lightprimary hover:text-primary",
        )}
      >
        <span className="text-xl">{item.icon}</span>
        <span className="truncate">{item.label}</span>
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={cn(
          itemClasses,
          childActive ? "text-primary" : "text-link",
          "hover:bg-lightprimary hover:text-primary",
        )}
      >
        <span className="text-xl">{item.icon}</span>
        <span className="flex-1 truncate text-left">{item.label}</span>
        <TbChevronDown className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <ul className="mt-1 flex flex-col gap-0.5 pl-4">
          {item.children?.map((child) => {
            const active = isActive(pathname, child.href);
            return (
              <li key={child.href}>
                <Link
                  href={child.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                    active ? "font-medium text-primary" : "text-bodytext hover:text-primary",
                  )}
                >
                  <TbPointFilled className={cn("h-2.5 w-2.5", active ? "text-primary" : "text-muted")} />
                  {child.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

type SidebarProps = {
  sections: NavSection[];
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ sections, open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-[#1c2536]/40 transition-opacity xl:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-border bg-card transition-transform duration-300",
          "xl:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-[70px] shrink-0 items-center px-6">
          <Link href="/dashboard" onClick={onClose} className="rounded-md bg-white px-1 py-1 dark:px-2">
            <Image src={logoLight} alt="Fire OS" width={150} height={34} priority />
          </Link>
        </div>

        <nav aria-label="Menu principal" className="flex-1 overflow-y-auto px-5 pb-6">
          {sections.map((section) => (
            <div key={section.heading} className="mt-4 first:mt-1">
              <h6 className="mb-1.5 px-3 text-xs font-bold uppercase tracking-wide text-muted">
                {section.heading}
              </h6>
              <ul className="flex flex-col gap-0.5">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <NavEntry item={item} pathname={pathname} onNavigate={onClose} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
