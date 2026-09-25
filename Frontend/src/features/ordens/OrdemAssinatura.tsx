"use client";

import { useEffect, useState } from "react";
import { DetailGrid } from "@/components/data/DetailModal";
import { EmptyState, Spinner } from "@/components/ui";
import { api } from "@/services/api";
import type { OrdemdeServicoProps } from "@/lib/getOrdemdeServico.type";

/** Digital signature captured by the app (from the OS or `/assinatura/:id`). */
export function OrdemAssinatura({ os }: { os: OrdemdeServicoProps }) {
  const [url, setUrl] = useState<string | null>(os.bannerassinatura || null);
  const [loading, setLoading] = useState(!os.bannerassinatura);

  useEffect(() => {
    if (os.bannerassinatura) {
      setUrl(os.bannerassinatura);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api
      .get(`/assinatura/${os.id}`)
      .then(({ data }) => {
        const found = data?.bannerassinatura || data?.assinatura || data?.assinaturaDigital;
        if (!cancelled && typeof found === "string") setUrl(found);
      })
      .catch(() => {
        // no signature yet — the empty state covers it
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [os.id, os.bannerassinatura]);

  return (
    <div className="flex flex-col gap-4">
      {loading ? (
        <div className="flex justify-center py-10 text-primary">
          <Spinner />
        </div>
      ) : url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block rounded-lg border border-border bg-surface p-4">
          {/* the signature is dark ink on a transparent background: keep it on white */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Assinatura do responsável" className="mx-auto max-h-56 rounded-md bg-white object-contain" />
        </a>
      ) : (
        <EmptyState title="Nenhuma assinatura encontrada" description="A assinatura é coletada pelo aplicativo ao concluir a OS." />
      )}
      <DetailGrid fields={[{ label: "Quem assinou", value: os.assinante || "Não informado", full: true }]} />
    </div>
  );
}
