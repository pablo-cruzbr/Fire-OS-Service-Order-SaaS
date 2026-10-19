"use client";

import { useState } from "react";
import {
  TbArrowsExchange,
  TbCheck,
  TbChecks,
  TbPlayerPause,
  TbPlayerPlay,
  TbSearch,
  TbSparkles,
  TbTag,
  TbTicket,
  TbTool,
  TbUserCheck,
  TbX,
} from "react-icons/tb";
import { Badge, Button, Card, CardHeader } from "@/components/ui";

type Stage =
  | "idle"
  | "classificando"
  | "buscando"
  | "sugerindo"
  | "aguardando"
  | "trocando"
  | "aprovado"
  | "rejeitado";

const tecnicosDisponiveis = ["Carlos Souza", "Mariana Lima", "Rafael Pereira"];

const casosParecidos = [
  { os: "#48102", resumo: "Troca de rolete, resolvido em 1 visita", dias: "há 12 dias" },
  { os: "#47988", resumo: "Mesmo defeito, chamado foi reaberto 2 vezes", dias: "há 41 dias" },
];

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** A node in the flow: icon badge + connecting line + content, in the order it was reached. */
function FlowNode({
  icon,
  title,
  tone = "primary",
  dashed = false,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  tone?: "primary" | "success" | "error" | "warning";
  dashed?: boolean;
  children: React.ReactNode;
}) {
  const toneClasses = {
    primary: "bg-lightprimary text-primary",
    success: "bg-lightsuccess text-successtext",
    error: "bg-lighterror text-errortext",
    warning: "bg-lightwarning text-warningtext",
  }[tone];

  return (
    <li className="relative pb-8 pl-12 last:pb-0">
      <span className="absolute left-0 top-0 ml-[3px] h-full w-px bg-border last:hidden" aria-hidden />
      <span
        className={`absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full text-sm ${toneClasses}`}
      >
        {icon}
      </span>
      <div className={`rounded-xl border p-4 ${dashed ? "border-dashed border-warning/50 bg-lightwarning/40" : "border-border bg-card"}`}>
        <p className="mb-2 text-sm font-semibold text-link">{title}</p>
        {children}
      </div>
    </li>
  );
}

export default function TriagemIAPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [tecnicoEscolhido, setTecnicoEscolhido] = useState("Juliana Rocha");

  async function simular() {
    setStage("classificando");
    await wait(900);
    setStage("buscando");
    await wait(1000);
    setStage("sugerindo");
    await wait(900);
    setStage("aguardando");
  }

  const reached = (...stages: Stage[]) => stages.includes(stage) || ["aprovado", "rejeitado"].includes(stage);

  return (
    <div className="flex flex-col gap-6">
      <Card className="relative overflow-hidden bg-lightprimary shadow-none dark:shadow-none">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Badge tone="primary" className="bg-card">
              <TbSparkles className="mr-1 inline h-3.5 w-3.5" /> Triagem automática
            </Badge>
            <h1 className="mt-3 text-2xl font-semibold text-link">Agente de triagem de chamados</h1>
            <p className="mt-1 text-sm text-bodytext">
              Organograma que se abre em etapas — cada passo depende do resultado do anterior, com pausa para sua aprovação.
            </p>
          </div>
          <Button onClick={simular} disabled={stage !== "idle"} icon={<TbPlayerPlay className="h-4 w-4" />}>
            Simular novo chamado
          </Button>
        </div>
        <div aria-hidden className="absolute -bottom-16 -right-10 h-56 w-56 rounded-full bg-primary/15" />
      </Card>

      <div className="rounded-lg border border-warning/30 bg-lightwarning px-4 py-3 text-sm text-warningtext">
        <strong className="font-semibold">Protótipo de interface:</strong> a classificação, os casos parecidos e a
        sugestão de técnico são fixos (exemplo). Na implementação real, isso é um grafo (LangGraph): classificar →
        buscar casos parecidos → sugerir técnico → pausa para aprovação → atribuir — cada seta é um passo de código,
        só a classificação e a redação usam IA de verdade.
      </div>

      <Card>
        <CardHeader title="Chamado recebido" subtitle="Aberto pela Área do Usuário" />
        <ol>
          <FlowNode icon={<TbTicket className="h-4 w-4" />} title="Novo chamado — EMEF Monteiro Lobato" tone="primary">
            <p className="text-sm text-bodytext">
              “A impressora da secretaria parou de imprimir, já tentamos reiniciar e não resolveu. Precisamos com
              urgência, temos boletins pra entregar.”
            </p>
            <p className="mt-2 text-xs text-muted">Aberto por Mariana (usuária) · agora</p>
          </FlowNode>

          {stage === "idle" && (
            <li className="pl-12 text-sm text-muted">Clique em “Simular novo chamado” para ver a triagem acontecer.</li>
          )}

          {reached("classificando", "buscando", "sugerindo", "aguardando", "trocando") && (
            <FlowNode icon={<TbTag className="h-4 w-4" />} title="1. Classificar" tone="primary">
              {stage === "classificando" ? (
                <p className="text-sm text-bodytext">Classificando categoria e prioridade...</p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="info">Categoria: Hardware / Impressora</Badge>
                    <Badge tone="warning">Prioridade sugerida: Alta</Badge>
                  </div>
                  <Badge tone="neutral" className="mt-2 font-mono text-[10px]">classificarChamado()</Badge>
                </>
              )}
            </FlowNode>
          )}

          {reached("buscando", "sugerindo", "aguardando", "trocando") && (
            <FlowNode icon={<TbSearch className="h-4 w-4" />} title="2. Buscar casos parecidos" tone="primary">
              {stage === "buscando" ? (
                <p className="text-sm text-bodytext">Procurando chamados parecidos no histórico...</p>
              ) : (
                <>
                  <ul className="flex flex-col gap-1.5 text-sm text-bodytext">
                    {casosParecidos.map((caso) => (
                      <li key={caso.os}>
                        <strong className="text-link">{caso.os}</strong> — {caso.resumo}{" "}
                        <span className="text-xs text-muted">({caso.dias})</span>
                      </li>
                    ))}
                  </ul>
                  <Badge tone="neutral" className="mt-2 font-mono text-[10px]">buscarCasosParecidos(categoria: impressora)</Badge>
                </>
              )}
            </FlowNode>
          )}

          {reached("sugerindo", "aguardando", "trocando") && (
            <FlowNode icon={<TbUserCheck className="h-4 w-4" />} title="3. Sugerir técnico" tone="primary">
              {stage === "sugerindo" ? (
                <p className="text-sm text-bodytext">Avaliando carga da equipe...</p>
              ) : (
                <>
                  <p className="text-sm text-bodytext">
                    <strong className="text-link">Juliana Rocha</strong> — já atendeu casos parecidos, categoria
                    compatível, e está com a menor carga da equipe (14 chamados, 35% abaixo da média).
                  </p>
                  <Badge tone="neutral" className="mt-2 font-mono text-[10px]">sugerirTecnico(categoria, carga)</Badge>
                </>
              )}
            </FlowNode>
          )}

          {stage === "aguardando" && (
            <FlowNode icon={<TbPlayerPause className="h-4 w-4" />} title="4. Aguardando sua aprovação" tone="warning" dashed>
              <p className="mb-3 text-sm text-bodytext">
                O fluxo parou aqui de propósito. A IA sugere, mas quem decide atribuir é você — o estado fica salvo
                e espera sua resposta, mesmo que o sistema reinicie nesse meio tempo.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" icon={<TbChecks className="h-4 w-4" />} onClick={() => setStage("aprovado")}>
                  Aprovar e atribuir a Juliana Rocha
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  icon={<TbArrowsExchange className="h-4 w-4" />}
                  onClick={() => setStage("trocando")}
                >
                  Trocar técnico
                </Button>
                <Button size="sm" variant="lightDanger" icon={<TbX className="h-4 w-4" />} onClick={() => setStage("rejeitado")}>
                  Rejeitar sugestão
                </Button>
              </div>
            </FlowNode>
          )}

          {stage === "trocando" && (
            <FlowNode icon={<TbArrowsExchange className="h-4 w-4" />} title="4. Escolher outro técnico" tone="warning" dashed>
              <div className="flex flex-wrap gap-1.5">
                {tecnicosDisponiveis.map((nome) => (
                  <button
                    key={nome}
                    type="button"
                    onClick={() => {
                      setTecnicoEscolhido(nome);
                      setStage("aprovado");
                    }}
                    className="rounded-full bg-lightprimary px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-white"
                  >
                    {nome}
                  </button>
                ))}
              </div>
            </FlowNode>
          )}

          {stage === "aprovado" && (
            <FlowNode icon={<TbCheck className="h-4 w-4" />} title="5. Atribuído" tone="success">
              <p className="text-sm text-bodytext">
                Chamado atribuído a <strong className="text-link">{tecnicoEscolhido}</strong>. Ela foi notificada no
                app e o chamado entrou na fila dela.
              </p>
            </FlowNode>
          )}

          {stage === "rejeitado" && (
            <FlowNode icon={<TbX className="h-4 w-4" />} title="5. Sugestão rejeitada" tone="error">
              <p className="text-sm text-bodytext">
                O chamado voltou para a fila manual — nenhum técnico foi atribuído automaticamente.
              </p>
            </FlowNode>
          )}
        </ol>
      </Card>

      {(stage === "aprovado" || stage === "rejeitado") && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setStage("idle")}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <TbTool className="h-4 w-4" /> Simular outro chamado
          </button>
        </div>
      )}
    </div>
  );
}
