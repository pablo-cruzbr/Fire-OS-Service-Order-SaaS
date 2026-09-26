import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { themeScript } from "@/components/layout/ThemeToggle";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fire OS — Ordens de serviço do chamado à assinatura",
  description:
    "Gestão de ordens de serviço e chamados para equipes de campo: agenda técnica, OS digital com assinatura, controle de equipamentos e relatórios.",
  applicationName: "Fire OS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={dmSans.variable}>{children}</body>
    </html>
  );
}
