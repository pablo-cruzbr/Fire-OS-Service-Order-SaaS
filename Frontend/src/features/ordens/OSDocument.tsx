"use client";

import { ReactNode, Ref, useEffect } from "react";
import type { OrdemdeServicoProps } from "@/lib/getOrdemdeServico.type";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import { formatDuration, groupAtividades, osClienteName, osInstituicaoName, type Foto } from "./helpers";

/**
 * Printing (Ctrl+P or window.print) always uses the light theme: the `dark`
 * class is dropped while the print dialog is open and restored afterwards.
 */
export function usePrintLightTheme() {
  useEffect(() => {
    let wasDark = false;
    const before = () => {
      wasDark = document.documentElement.classList.contains("dark");
      document.documentElement.classList.remove("dark");
    };
    const after = () => {
      if (wasDark) document.documentElement.classList.add("dark");
    };
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
  }, []);
}

/*
 * Only hex-backed tokens are used inside the sheet (no `light*` colours or
 * opacity modifiers): html2canvas, used for the PDF download on /os-digital,
 * cannot parse the oklab() colours those compile to.
 */

function Section({ title, dark, children }: { title: ReactNode; dark?: boolean; children: ReactNode }) {
  return (
    <section className="mb-5 overflow-hidden rounded-lg border border-border break-inside-avoid-page">
      <h2
        className={cn(
          "px-4 py-2.5 text-sm font-semibold",
          dark ? "bg-primary text-white" : "border-b border-border bg-surface text-link",
        )}
      >
        {title}
      </h2>
      <div className="grid grid-cols-2">{children}</div>
    </section>
  );
}

function Cell({ label, children, full }: { label: ReactNode; children?: ReactNode; full?: boolean }) {
  return (
    <div className={cn("border-b border-border px-4 py-3 last:border-b-0 break-inside-avoid", full ? "col-span-2" : "col-span-2 sm:col-span-1 print:col-span-1")}>
      <p className="text-xs font-semibold text-bodytext">{label}</p>
      <div className="mt-1 whitespace-pre-line text-sm text-link">{children || "—"}</div>
    </div>
  );
}

type OSDocumentProps = {
  os: OrdemdeServicoProps;
  fotos: Foto[];
  /** Load images with CORS so html2canvas can draw them into the PDF. */
  crossOrigin?: boolean;
  ref?: Ref<HTMLDivElement>;
  className?: string;
};

/** Printable service order ("OS digital"), shared by the dashboard page and the public page. */
export function OSDocument({ os, fotos, crossOrigin, ref, className }: OSDocumentProps) {
  usePrintLightTheme();

  const cors = crossOrigin ? ("anonymous" as const) : undefined;
  const cliente = osClienteName(os);
  const instituicao = osInstituicaoName(os);
  const cnpj = os.cliente?.cnpj || os.informacoesSetor?.cliente?.cnpj;
  const endereco =
    os.instituicaoUnidade?.endereco ||
    os.cliente?.endereco ||
    os.informacoesSetor?.instituicaoUnidade?.endereco ||
    os.informacoesSetor?.cliente?.endereco ||
    os.user?.instituicaoUnidade?.endereco ||
    os.user?.cliente?.endereco;
  const tecnico = os.tecnico?.name || os.nameTecnico || "Não atribuído";
  const concluida = os.statusOrdemdeServico?.name?.toUpperCase() === "CONCLUIDA";
  const atividades = (os.atividades ?? []).filter((item) => item.atividadePadrao);

  return (
    <div
      ref={ref}
      className={cn(
        "mx-auto w-full max-w-4xl rounded-xl bg-card p-6 shadow-md sm:p-8 dark:shadow-dark-md",
        "print:max-w-none print:rounded-none print:p-0 print:shadow-none",
        className,
      )}
    >
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/Fire-os-fundo-branco.svg" alt="Fire OS" width={185} height={42} className="h-11 w-auto dark:hidden" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/Fire-os-fundo-roxo.svg" alt="Fire OS" width={185} height={42} className="hidden h-11 w-auto rounded-md dark:block" />
        <div className="text-right">
          <h1 className="text-xl font-semibold text-link">Ordem de serviço</h1>
          <p className="text-sm text-bodytext">
            Nº <span className="font-semibold text-link">{os.numeroOS ?? "—"}</span> · {formatDateTime(os.created_at)}
          </p>
          {os.statusOrdemdeServico?.name && (
            <p className="text-sm text-bodytext">
              Status: <span className="font-semibold text-link">{os.statusOrdemdeServico.name}</span>
            </p>
          )}
        </div>
      </header>

      <Section title="Informações do cliente">
        <Cell label="Cliente">{cliente}</Cell>
        <Cell label="CPF/CNPJ">{cnpj}</Cell>
        <Cell label="Instituição / unidade">{instituicao}</Cell>
        <Cell label="Solicitante">{os.name}</Cell>
        <Cell label="Endereço" full>
          {endereco}
        </Cell>
        <Cell label="Telefone / ramal" full>
          {os.informacoesSetor?.ramal}
        </Cell>
      </Section>

      <Section title={`Tarefa #${os.numeroOS ?? "—"}`}>
        <Cell label="Colaborador responsável">{tecnico}</Cell>
        <Cell label="Data/hora">{formatDateTime(os.created_at)}</Cell>
        <Cell label="Tipo de tarefa" full>
          {os.tipodeChamado?.name}
        </Cell>
        <Cell label="Orientação" full>
          {os.descricaodoProblemaouSolicitacao}
        </Cell>
        <Cell label="Início">{formatDateTime(os.startedAt)}</Cell>
        <Cell label="Finalização">{formatDateTime(os.endedAt)}</Cell>
        <Cell label="Duração" full>
          {formatDuration(os.duracao, "00:00:00")}
        </Cell>
      </Section>

      <Section title="Ordem de serviço" dark>
        <Cell label="1) Nome do responsável no local (quem acompanhou)" full>
          {os.nomedoContatoaserProcuradonoLocal}
        </Cell>
        <Cell label="2) Fotos do serviço" full>
          {fotos.length > 0 ? (
            <div className="mt-1 grid grid-cols-2 gap-3 sm:grid-cols-3 print:grid-cols-3">
              {fotos.map((foto) => (
                <div key={foto.id} className="overflow-hidden rounded-md border border-border break-inside-avoid">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={foto.url} alt="Foto do serviço" crossOrigin={cors} className="aspect-[4/3] w-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <span className="text-muted">Nenhuma foto anexada.</span>
          )}
        </Cell>
        <Cell label="3) Procedimento realizado (resolução do atendimento)" full>
          {os.solucao || "—"}
          {atividades.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-bodytext">Atividades realizadas</p>
              {groupAtividades(atividades.map((item) => ({ ...item.atividadePadrao, key: item.id }))).map(
                ([categoria, list]) => (
                  <div key={categoria} className="mt-1.5">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted">{categoria}</p>
                    <ul className="list-disc pl-5">
                      {list.map((atividade) => (
                        <li key={atividade.key}>{atividade.descricao}</li>
                      ))}
                    </ul>
                  </div>
                ),
              )}
            </div>
          )}
        </Cell>
        <Cell label="4) Serviço concluído?" full>
          {concluida ? "Sim" : "Não"}
        </Cell>
        <Cell label="5) Assinatura do responsável do local" full>
          <div className="mt-1 flex min-h-28 items-center justify-center rounded-md border border-border bg-white p-3">
            {os.bannerassinatura ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={os.bannerassinatura} alt="Assinatura" crossOrigin={cors} className="max-h-32 object-contain" />
            ) : (
              <span className="text-sm text-muted">Sem assinatura</span>
            )}
          </div>
          {os.assinante && <p className="mt-2 text-sm text-bodytext">Assinado por: {os.assinante}</p>}
        </Cell>
      </Section>
    </div>
  );
}
