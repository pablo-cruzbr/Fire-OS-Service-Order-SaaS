"use client";

import { ReactNode, useState } from "react";
import type { SessionUser } from "@/lib/session";
import { Header } from "./Header";
import { navigationFor } from "./navigation";
import { Sidebar } from "./Sidebar";

type DashboardShellProps = {
  user: SessionUser;
  children: ReactNode;
};

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="print:hidden">
        <Sidebar sections={navigationFor(user.role)} open={menuOpen} onClose={() => setMenuOpen(false)} />
      </div>
      <div className="flex min-h-screen min-w-0 flex-col xl:pl-[270px] print:pl-0">
        <div className="sticky top-0 z-30 print:hidden">
          <Header user={user} onMenuClick={() => setMenuOpen(true)} />
        </div>
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 pb-10 pt-2 sm:px-6 print:max-w-none print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
