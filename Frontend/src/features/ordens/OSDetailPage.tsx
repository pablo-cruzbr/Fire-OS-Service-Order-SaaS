"use client";

import { TbFileText, TbPrinter } from "react-icons/tb";
import { Button, ButtonLink, Card, EmptyState, PageHeader } from "@/components/ui";
import type { OrdemdeServicoProps } from "@/lib/getOrdemdeServico.type";
import { OSDocument } from "./OSDocument";
import type { Foto } from "./helpers";

/** /dashboard/ordemdeservico/[id]: the printable OS inside the dashboard. */
export function OSDetailPage({ os, fotos }: { os: OrdemdeServicoProps | null; fotos: Foto[] }) {
  if (!os) {
    return (
      <section>
        <PageHeader title="Ordem de serviço" breadcrumbs={[{ label: "Chamados", href: "/dashboard/tickets" }, { label: "OS" }]} />
        <Card>
          <EmptyState
            title="Ordem de serviço não encontrada"
            action={<ButtonLink href="/dashboard/tickets">Voltar aos chamados</ButtonLink>}
          />
        </Card>
      </section>
    );
  }

  return (
    <section>
      <div className="print:hidden">
        <PageHeader
          title={`OS #${os.numeroOS ?? "—"}`}
          breadcrumbs={[{ label: "Chamados", href: "/dashboard/tickets" }, { label: `OS #${os.numeroOS ?? "—"}` }]}
          actions={
            <>
              <ButtonLink
                href={`/os-digital/${os.id}`}
                target="_blank"
                variant="outline"
                className="bg-card"
                icon={<TbFileText className="h-4 w-4" />}
              >
                OS digital
              </ButtonLink>
              <Button onClick={() => window.print()} icon={<TbPrinter className="h-4 w-4" />}>
                Imprimir / salvar PDF
              </Button>
            </>
          }
        />
      </div>
      <OSDocument os={os} fotos={fotos} />
    </section>
  );
}
