import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { GlobalModalProvider } from "@/provider/GlobalModalProvider";
import GlobalModal from "@/app/components/GlobalModal";
import { themeScript } from "@/components/layout/ThemeToggle";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Ordem Next — Ordens de serviço do chamado à assinatura",
    template: "%s · Ordem Next",
  },
  description:
    "Gestão de ordens de serviço e chamados para equipes de campo: agenda técnica, OS digital com assinatura, controle de equipamentos e relatórios.",
  applicationName: "Ordem Next",
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
      <body className={dmSans.variable}>
        <GlobalModalProvider>
          {children}
          <GlobalModal />
        </GlobalModalProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
