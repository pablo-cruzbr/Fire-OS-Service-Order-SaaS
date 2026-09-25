"use client";

import { useEffect, useState } from "react";
import { DetailGrid } from "@/components/data/DetailModal";
import { api } from "@/services/api";
import type { OrdemdeServicoProps } from "@/lib/getOrdemdeServico.type";
import { formatDuration, formatTime, groupAtividades } from "./helpers";

type TempoOS = { startedAt?: string | null; endedAt?: string | null; duracao?: number | null };

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h6 className="mb-3 mt-6 text-sm font-semibold text-link first:mt-0">{children}</h6>;
}

/** "Detalhes técnicos": solution, ramal/setor record, app timings and activities. */
export function OrdemAtendimento({ os }: { os: OrdemdeServicoProps }) {
  const [tempo, setTempo] = useState<TempoOS | null>(null);
  const [tempoError, setTempoError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setTempoError(false);
    api
      .get<TempoOS>(`/ordemdeservico/tempo/${os.id}`)
      .then(({ data }) => {
        if (!cancelled) setTempo(data ?? {});
      })
      .catch(() => {
        if (!cancelled) setTempoError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [os.id]);

  const setor = os.informacoesSetor;
  const atividades = (os.atividades ?? []).filter((item) => item.atividadePadrao);
  const pending = !tempo && !tempoError;

  return (
    <div>
      <SectionTitle>Atendimento</SectionTitle>
      <DetailGrid
        fields={[
          { label: "Técnico responsável", value: os.tecnico?.name ?? "Não atribuído" },
          { label: "Quem documentou", value: os.user?.name },
          { label: "Nº do patrimônio", value: os.patrimoniodoequipamento },
          { label: "Solução técnica", value: os.solucao || "Sem detalhes técnicos", full: true },
        ]}
      />

      <SectionTitle>Setor (ramal)</SectionTitle>
      {setor ? (
        <DetailGrid
          fields={[
            { label: "Local", value: setor.cliente?.name ?? setor.instituicaoUnidade?.name },
            { label: "Setor", value: setor.setor?.name },
            { label: "Usuário", value: setor.usuario },
            { label: "Ramal", value: setor.ramal },
            { label: "Andar", value: setor.andar },
          ]}
        />
      ) : (
        <p className="text-sm text-muted">Sem informações do setor.</p>
      )}

      <SectionTitle>Tempo registrado pelo aplicativo</SectionTitle>
      {tempoError ? (
        <p className="text-sm text-muted">Não foi possível carregar o tempo da OS.</p>
      ) : (
        <DetailGrid
          fields={[
            { label: "Início", value: pending ? "Carregando..." : formatTime(tempo?.startedAt, "Sem horário") },
            { label: "Término", value: pending ? "Carregando..." : formatTime(tempo?.endedAt, "Sem horário") },
            { label: "Duração", value: pending ? "Carregando..." : formatDuration(tempo?.duracao) },
          ]}
        />
      )}

      <SectionTitle>Atividades realizadas</SectionTitle>
      {atividades.length === 0 ? (
        <p className="text-sm text-muted">Nenhuma atividade registrada.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {groupAtividades(atividades.map((item) => ({ ...item.atividadePadrao, key: item.id }))).map(
            ([categoria, list]) => (
              <div key={categoria} className="rounded-lg bg-surface px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">{categoria}</p>
                <ul className="mt-1.5 list-disc pl-5 text-sm text-link">
                  {list.map((atividade) => (
                    <li key={atividade.key}>{atividade.descricao}</li>
                  ))}
                </ul>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
