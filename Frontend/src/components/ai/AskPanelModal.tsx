"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import {
  TbBulb,
  TbCheck,
  TbExternalLink,
  TbMenu2,
  TbRobot,
  TbSend2,
  TbSparkles,
  TbTool,
  TbUser,
  TbUserShare,
} from "react-icons/tb";
import { Badge, Button, Modal, Spinner } from "@/components/ui";

/** Fictitious name for the assistant persona — Fire OS's own AI, not a generic "IA". */
const ASSISTANT_NAME = "Ígnis";

const tecnicosDisponiveis = ["Carlos Souza", "Mariana Lima", "Rafael Pereira", "Juliana Rocha"];

/** A confirm can just state what was done, or state it AND suggest the next action — it doesn't have to be a dead end. */
type ConfirmResult = string | { text: string; action?: NextAction; link?: { label: string; href: string } };

type NextAction = {
  label: string;
  options: string[];
  /** Checkboxes instead of single-pick buttons — Ígnis waits for a "Confirmar" click. */
  multi?: boolean;
  /** Confirmation message once the gestor finishes picking — not a generic "Feito: X". */
  confirm: (selected: string[]) => ConfirmResult;
  /** Picking an option can drill into another question instead of confirming right away (e.g. "which técnicos?"). */
  followUp?: (selected: string[]) => NextAction | undefined;
};

type ChatMessage = {
  role: "user" | "ai";
  text: string;
  tools?: string[];
  action?: NextAction;
  /** Once the gestor picks an option from `action`, we record it here and show the result instead of the menu. */
  actionResult?: string;
  /** Some confirmations hand off to the real tool instead of faking the result (e.g. scheduling → the actual calendar). */
  link?: { label: string; href: string };
};

/*
 * Menu of the questions a gestor actually asks day to day, grouped the way
 * they think about the operation — not a flat list. Each one has a matching
 * canned answer below; keep the two in sync when adding a question.
 */
const questionGroups: { label: string; questions: string[] }[] = [
  {
    label: "Chamados",
    questions: [
      "Quantos chamados estão abertos agora?",
      "Quantos chamados estão fora do prazo?",
      "Qual é a OS mais atrasada?",
    ],
  },
  {
    label: "Técnicos",
    questions: ["Qual técnico está mais sobrecarregado?", "Qual técnico demora mais por atendimento?"],
  },
  {
    label: "Clientes e instituições",
    questions: ["Qual secretaria teve mais OS em setembro?", "Qual cliente abriu mais chamados este mês?"],
  },
  {
    label: "Equipamentos",
    questions: ["Qual equipamento quebrou mais vezes?", "Quantos equipamentos aguardam peça?"],
  },
];

/*
 * Canned answers, matched by keyword. This is a UI mockup only — no LLM, no
 * backend call. Each entry mirrors the shape the real feature would return:
 * an answer in Portuguese plus which "tools" (fixed functions) supposedly
 * ran, matching docs/GUIA-IA-FIRE-OS.md's tool-calling design. Order matters:
 * the first regex that matches wins, so the more specific ones come first.
 */
const cannedAnswers: { match: RegExp; text: string; tools: string[]; action?: NextAction }[] = [
  {
    match: /os mais atrasada|chamado mais atrasado/i,
    text: "A OS mais atrasada é a #48217 (UBS Jardim das Flores) — parada há 6 dias aguardando peça, 3 dias além do prazo combinado. Ela ainda não tem técnico atribuído. Recomendo atribuir agora pra não passar mais um dia parada.",
    tools: ["osMaisAtrasada(criterio: sla)"],
    action: {
      label: "Atribuir a um técnico",
      options: tecnicosDisponiveis,
      confirm: ([nome]) => `OS #48217 atribuída a ${nome}. Ela foi notificada no app e a OS entrou na fila dela.`,
    },
  },
  {
    match: /fora do prazo|sla/i,
    text: "4 chamados estão fora do prazo combinado (mais de 48h sem atualização) — 3 deles são da Secretaria de Educação. Posso priorizar esses 4 agora, pra não acumularem mais atraso.",
    tools: ["chamadosForaDoPrazo(limiteHoras: 48)"],
    action: {
      label: "O que fazer com esses 4 chamados?",
      options: ["Marcar como urgente", "Notificar os técnicos responsáveis"],
      confirm: () => "Os 4 chamados fora do prazo foram marcados como urgentes e subiram no topo da fila dos técnicos.",
      followUp: ([opcao]) => {
        if (opcao !== "Notificar os técnicos responsáveis") return undefined;
        return {
          label: "Quais técnicos notificar?",
          options: ["Carlos Souza", "Mariana Lima", "Rafael Pereira", "Todos"],
          multi: true,
          confirm: (selected) => {
            const todos = selected.includes("Todos");
            const quem = todos ? "Todos os técnicos responsáveis" : selected.join(" e ");
            const verbo = todos || selected.length > 1 ? "foram notificados" : "foi notificado";
            return `${quem} ${verbo} agora, com o prazo já vencido em destaque.`;
          },
        };
      },
    },
  },
  {
    match: /abert[oa]s? agora|quantos chamados.*abert/i,
    text: "Existem 23 chamados abertos agora: 5 em deslocamento, 5 em andamento e 13 aguardando início.",
    tools: ["chamadosPorStatus(status: ABERTA)"],
    action: {
      label: "O que fazer com esses chamados?",
      options: ["Priorizar os que aguardam início", "Ver detalhamento por técnico"],
      confirm: ([opcao]) =>
        opcao === "Priorizar os que aguardam início"
          ? "Os 13 chamados aguardando início foram priorizados e subiram na fila dos técnicos disponíveis."
          : {
              text: "Por técnico: Carlos Souza (9), Mariana Lima (6), Rafael Pereira (5), Juliana Rocha (3). Carlos Souza está com quase o dobro dos demais.",
              action: {
                label: "Carlos Souza está sobrecarregado — o que fazer?",
                options: ["Redistribuir parte da carga dele", "Manter como está"],
                confirm: ([escolha]) =>
                  escolha === "Redistribuir parte da carga dele"
                    ? "3 chamados de Carlos Souza foram redistribuídos para Juliana Rocha. Os dois técnicos foram notificados no app."
                    : "Ok, mantendo a distribuição atual — vou avisar se a diferença aumentar.",
              },
            },
    },
  },
  {
    match: /sobrecarregad|maior carga|mais chamados.*t[ée]cnico/i,
    text: "Carlos Souza está com a maior carga: 28 chamados neste mês, 40% acima da média da equipe (20). Juliana Rocha e Rafael Pereira estão com folga pra absorver parte disso.",
    tools: ["cargaPorTecnico(periodo: 2026-09)"],
    action: {
      label: "Redistribuir parte da carga de Carlos Souza",
      options: ["Juliana Rocha (14 chamados)", "Rafael Pereira (18 chamados)"],
      confirm: ([nome]) =>
        `3 chamados de Carlos Souza foram redistribuídos para ${nome.split(" (")[0]}. Os dois técnicos foram notificados no app.`,
    },
  },
  {
    match: /demora|tempo m[ée]dio/i,
    text: "Carlos Souza também tem o maior tempo médio por atendimento: 2h40min, cerca de 45 minutos acima da média da equipe (1h55min).",
    tools: ["tempoMedioPorTecnico(periodo: 2026-09)"],
    action: {
      label: "O que fazer com o tempo de atendimento de Carlos Souza?",
      options: ["Agendar treinamento técnico", "Redistribuir próximos chamados dele"],
      confirm: ([opcao]) =>
        // "Agendar treinamento técnico" é sempre interceptado pelo followUp abaixo antes de chegar aqui.
        opcao === "Redistribuir próximos chamados dele"
          ? "Os próximos chamados da categoria dele passam a ser distribuídos para Juliana Rocha e Rafael Pereira."
          : "Treinamento técnico agendado para Carlos Souza.",
      followUp: ([opcao]) => {
        if (opcao !== "Agendar treinamento técnico") return undefined;
        return {
          label:
            "A agenda de Carlos Souza está livre quinta-feira às 14h, logo após o horário de pico de chamados — quer agendar nesse horário?",
          options: ["Confirmar quinta-feira, 14h", "Ver outros horários no calendário"],
          confirm: ([horario]) =>
            horario === "Confirmar quinta-feira, 14h"
              ? {
                  text: "Treinamento agendado para quinta-feira, 14h. Carlos Souza foi notificado e o evento já está no Calendário técnico.",
                  link: { label: "Ver no Calendário técnico", href: "/dashboard/ticketscount" },
                }
              : {
                  text: "Abra o Calendário técnico pra escolher outro horário disponível com a equipe.",
                  link: { label: "Abrir Calendário técnico", href: "/dashboard/ticketscount" },
                },
        };
      },
    },
  },
  {
    match: /secretaria/i,
    text: "A Secretaria de Educação teve mais ordens de serviço em setembro: 54 no total, 35% a mais que em agosto. A UBS Jardim das Flores vem em segundo lugar, com 21 OS.",
    tools: ["osPorSecretaria(periodo: 2026-09)"],
    action: {
      label: "O que fazer com a Secretaria de Educação?",
      options: ["Agendar reunião de alinhamento", "Enviar relatório detalhado por e-mail"],
      confirm: ([opcao]) =>
        opcao === "Agendar reunião de alinhamento"
          ? "Reunião solicitada com a Secretaria de Educação — o contato responsável foi notificado."
          : "Relatório detalhado de setembro enviado por e-mail para a Secretaria de Educação.",
    },
  },
  {
    match: /cliente.*abriu|abriu.*chamados/i,
    text: "Construtora Horizonte Ltda abriu 9 chamados este mês, a maioria relacionada a equipamentos de rede.",
    tools: ["chamadosPorCliente(periodo: 2026-09)"],
    action: {
      label: "O que fazer com a Construtora Horizonte Ltda?",
      options: ["Agendar visita técnica preventiva", "Enviar relatório dos equipamentos de rede"],
      confirm: ([opcao]) =>
        opcao === "Agendar visita técnica preventiva"
          ? "Visita técnica preventiva agendada com a Construtora Horizonte Ltda."
          : "Relatório dos equipamentos de rede enviado para a Construtora Horizonte Ltda.",
    },
  },
  {
    match: /equipamento.*quebr|defeito recorrente|voltou.*vezes/i,
    text: "A impressora HP LaserJet (patrimônio 00245) teve 3 chamados em 30 dias pelo mesmo defeito de rolete. Consertar de novo tende a custar mais do que trocar — o que prefere fazer?",
    tools: ["equipamentosRecorrentes(periodo: 30d)"],
    action: {
      label: "O que fazer com esse equipamento?",
      options: ["Abrir solicitação de troca", "Manter em reparo"],
      confirm: ([opcao]) =>
        opcao === "Abrir solicitação de troca"
          ? "Solicitação de compra criada para substituir a impressora (patrimônio 00245). O setor de Compras foi notificado."
          : "Ok, mantendo em reparo — vou continuar de olho, e aviso se o defeito se repetir de novo.",
    },
  },
  {
    match: /aguard.*peça|peça de reposição/i,
    text: "6 equipamentos estão parados aguardando peça de reposição, 2 deles há mais de 10 dias.",
    tools: ["equipamentosPorStatus(status: AGUARDANDO_PECA)"],
    action: {
      label: "O que fazer com esses equipamentos?",
      options: ["Cobrar fornecedor das peças atrasadas", "Priorizar os parados há mais de 10 dias"],
      confirm: ([opcao]) =>
        opcao === "Cobrar fornecedor das peças atrasadas"
          ? "Cobrança enviada ao fornecedor sobre as peças em atraso."
          : "Os equipamentos parados há mais de 10 dias foram priorizados na fila de reparo.",
    },
  },
  {
    match: /pausad/i,
    text: "Existem 6 chamados pausados agora, 4 deles aguardando peça de reposição há mais de 5 dias.",
    tools: ["chamadosPorStatus(status: PAUSADA)"],
    action: {
      label: "O que fazer com os chamados pausados?",
      options: ["Cobrar fornecedor das peças pendentes", "Reativar os que já têm peça disponível"],
      confirm: ([opcao]) =>
        opcao === "Cobrar fornecedor das peças pendentes"
          ? "Cobrança enviada ao fornecedor sobre as peças pendentes dos chamados pausados."
          : "Os chamados com peça já disponível foram reativados e voltaram para a fila dos técnicos.",
    },
  },
];

const fallbackAnswer: { text: string; tools: string[]; action?: NextAction } = {
  text: "Encontrei 142 ordens de serviço no período consultado. Tente perguntar sobre um técnico, uma secretaria ou um status específico para uma resposta mais detalhada.",
  tools: ["visaoGeralOS()"],
};

function answerFor(question: string) {
  return cannedAnswers.find((entry) => entry.match.test(question)) ?? fallbackAnswer;
}

/**
 * Generic "analyze again" — the gestor can ask Ígnis to re-read any answer and propose
 * what to do next, even ones whose original action already ran its course. Keyed off the
 * answer's own text so it still feels specific to the case, with a generic fallback.
 */
function moreActionsFor(text: string): NextAction {
  if (/Carlos Souza/.test(text)) {
    return {
      label: "Analisando de novo — quer que eu continue em cima do caso de Carlos Souza?",
      options: ["Ver histórico de desempenho dele", "Agendar 1:1 de feedback"],
      confirm: ([opcao]) =>
        opcao === "Ver histórico de desempenho dele"
          ? "Abri o histórico de desempenho de Carlos Souza dos últimos 3 meses — ele vem melhorando desde o treinamento de agosto."
          : "1:1 de feedback agendado com Carlos Souza para essa semana. Ele foi notificado.",
    };
  }
  if (/impressora|equipamento/i.test(text)) {
    return {
      label: "Analisando de novo — quer saber mais sobre esse equipamento?",
      options: ["Ver histórico de manutenções", "Agendar manutenção preventiva"],
      confirm: ([opcao]) =>
        opcao === "Ver histórico de manutenções"
          ? "Esse equipamento já teve 5 manutenções nos últimos 6 meses — o custo acumulado já passou do valor de um equipamento novo."
          : "Manutenção preventiva agendada para a próxima semana.",
    };
  }
  if (/Secretaria de Educação/.test(text)) {
    return {
      label: "Analisando de novo — quer ver mais sobre a Secretaria de Educação?",
      options: ["Ver todos os chamados dessa secretaria", "Comparar com o mês anterior"],
      confirm: ([opcao]) =>
        opcao === "Ver todos os chamados dessa secretaria"
          ? {
              text: "Abri a lista completa de chamados da Secretaria de Educação, filtrada por este mês.",
              link: { label: "Abrir Chamados", href: "/dashboard/tickets" },
            }
          : "Em agosto foram 40 OS, contra 54 em setembro — alta de 35%, concentrada em impressoras e rede.",
    };
  }
  if (/UBS Jardim das Flores|#48217/.test(text)) {
    return {
      label: "Analisando de novo — algo mais sobre a OS #48217?",
      options: ["Avisar a UBS do novo prazo", "Ver o histórico completo dessa OS"],
      confirm: ([opcao]) =>
        opcao === "Avisar a UBS do novo prazo"
          ? "UBS Jardim das Flores notificada com o novo prazo estimado."
          : "Abri o histórico completo da OS #48217, desde a abertura.",
    };
  }
  return {
    label: "Analisando de novo — quer mais alguma ação em cima dessa resposta?",
    options: ["Ver mais detalhes na tela de Chamados", "Exportar como PDF"],
    confirm: ([opcao]) =>
      opcao === "Ver mais detalhes na tela de Chamados"
        ? {
            text: "Abri a tela de Chamados com os filtros já aplicados dessa consulta.",
            link: { label: "Abrir Chamados", href: "/dashboard/tickets" },
          }
        : "PDF gerado e pronto pra baixar ou compartilhar.",
  };
}

export function AskPanelModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(true);
  /** Selections in progress for multi-select actions, keyed by message index. */
  const [selections, setSelections] = useState<Record<number, string[]>>({});
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setQuestion("");
    setLoading(true);
    setMenuOpen(false);

    const answer = answerFor(trimmed);
    timeoutRef.current = setTimeout(() => {
      setMessages((prev) => [...prev, { role: "ai", text: answer.text, tools: answer.tools, action: answer.action }]);
      setLoading(false);
    }, 900);
  }

  /** Marks the action as resolved and schedules Ígnis's confirmation message. */
  function finishAction(messageIndex: number, action: NextAction, selected: string[], resultLabel: string) {
    setMessages((prev) => {
      const next = [...prev];
      const target = next[messageIndex];
      if (!target?.action) return prev;
      next[messageIndex] = { ...target, actionResult: resultLabel };
      return next;
    });

    const result = action.confirm(selected);
    const resolved = typeof result === "string" ? { text: result, action: undefined, link: undefined } : result;

    setLoading(true);
    timeoutRef.current = setTimeout(() => {
      setMessages((prev) => [...prev, { role: "ai", text: resolved.text, action: resolved.action, link: resolved.link }]);
      setLoading(false);
    }, 700);
  }

  /** Gestor picked a single option (e.g. which técnico to assign). May drill into a follow-up question instead of confirming right away. */
  function pickOption(messageIndex: number, option: string) {
    const action = messages[messageIndex]?.action;
    if (!action) return;

    const next = action.followUp?.([option]);
    if (next) {
      setMessages((prev) => {
        const copy = [...prev];
        const target = copy[messageIndex];
        if (!target?.action) return prev;
        copy[messageIndex] = { ...target, action: next };
        return copy;
      });
      return;
    }

    finishAction(messageIndex, action, [option], option);
  }

  /** Toggles one técnico in/out of a multi-select action; picking "Todos" clears the rest, and vice versa. */
  function toggleMultiOption(messageIndex: number, option: string) {
    setSelections((prev) => {
      const current = prev[messageIndex] ?? [];
      let nextSelected: string[];
      if (option === "Todos") {
        nextSelected = current.includes("Todos") ? [] : ["Todos"];
      } else if (current.includes(option)) {
        nextSelected = current.filter((item) => item !== option);
      } else {
        nextSelected = [...current.filter((item) => item !== "Todos"), option];
      }
      return { ...prev, [messageIndex]: nextSelected };
    });
  }

  function confirmMultiSelect(messageIndex: number) {
    const action = messages[messageIndex]?.action;
    const selected = selections[messageIndex];
    if (!action || !selected?.length) return;

    finishAction(messageIndex, action, selected, selected.includes("Todos") ? "Todos" : selected.join(", "));
    setSelections((prev) => {
      const copy = { ...prev };
      delete copy[messageIndex];
      return copy;
    });
  }

  /** Gestor asks Ígnis to look at an answer again and propose what to do next — works on any ai message, repeatably. */
  function suggestNextStep(messageIndex: number) {
    const message = messages[messageIndex];
    if (!message || message.role !== "ai") return;

    setLoading(true);
    timeoutRef.current = setTimeout(() => {
      setMessages((prev) => {
        const next = [...prev];
        const target = next[messageIndex];
        if (!target) return prev;
        next[messageIndex] = { ...target, action: moreActionsFor(target.text), actionResult: undefined };
        return next;
      });
      setLoading(false);
    }, 800);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    ask(question);
  }

  function handleClose() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setMessages([]);
    setQuestion("");
    setLoading(false);
    setMenuOpen(true);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="lg"
      title={
        <span className="flex items-center gap-2">
          <TbSparkles className="h-5 w-5 text-primary" /> {ASSISTANT_NAME}
        </span>
      }
      subtitle="Assistente de IA do Fire OS — pergunte sobre chamados e ordens de serviço"
    >
      <div className="mb-4 flex items-start gap-2 rounded-lg border border-warning/30 bg-lightwarning px-3.5 py-2.5 text-xs text-warningtext">
        <TbTool className="mt-0.5 h-4 w-4 shrink-0" />
        Protótipo de interface — as respostas abaixo são fixas (exemplos), ainda sem IA real por trás.
      </div>

      {messages.length > 0 && (
        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          className="mb-3 flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          <TbMenu2 className="h-3.5 w-3.5" /> {menuOpen ? "Ocultar perguntas" : "Ver mais perguntas"}
        </button>
      )}

      {menuOpen && (
        <div className="mb-5 flex flex-col gap-3.5 border-b border-border pb-5">
          {questionGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{group.label}</p>
              <div className="flex flex-wrap gap-2">
                {group.questions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => ask(item)}
                    className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-link transition-colors hover:border-primary hover:text-primary"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex min-h-[160px] flex-col gap-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
                message.role === "user" ? "bg-primary text-white" : "bg-lightprimary text-primary"
              }`}
            >
              {message.role === "user" ? <TbUser /> : <TbRobot />}
            </span>
            <div className={`max-w-[80%] ${message.role === "user" ? "text-right" : ""}`}>
              {message.role === "ai" && <p className="mb-1 text-xs font-semibold text-primary">{ASSISTANT_NAME}</p>}
              <div
                className={`inline-block rounded-xl px-4 py-2.5 text-sm ${
                  message.role === "user" ? "bg-primary text-white" : "bg-surface text-link"
                }`}
              >
                {message.text}
              </div>
              {message.tools && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {message.tools.map((tool) => (
                    <Badge key={tool} tone="neutral" className="font-mono text-[10px]">
                      {tool}
                    </Badge>
                  ))}
                </div>
              )}

              {message.link && (
                <Link
                  href={message.link.href}
                  onClick={handleClose}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-primary px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-white"
                >
                  <TbExternalLink className="h-3.5 w-3.5" /> {message.link.label}
                </Link>
              )}

              {message.action && (
                <div className="mt-2.5 text-left">
                  {message.actionResult ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-lightsuccess px-3 py-1.5 text-xs font-medium text-successtext">
                      <TbCheck className="h-3.5 w-3.5" /> {message.action.label}: {message.actionResult}
                    </span>
                  ) : (
                    <div className="inline-block rounded-xl border border-border bg-card p-3">
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-link">
                        <TbUserShare className="h-3.5 w-3.5 text-primary" /> {message.action.label}
                      </p>
                      {message.action.multi ? (
                        <>
                          <div className="flex flex-wrap gap-1.5">
                            {message.action.options.map((option) => {
                              const checked = (selections[index] ?? []).includes(option);
                              return (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => toggleMultiOption(index, option)}
                                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                    checked
                                      ? "border-primary bg-primary text-white"
                                      : "border-border bg-transparent text-link hover:border-primary hover:text-primary"
                                  }`}
                                >
                                  {checked && <TbCheck className="h-3 w-3" />}
                                  {option}
                                </button>
                              );
                            })}
                          </div>
                          <Button
                            size="sm"
                            className="mt-2.5"
                            disabled={!(selections[index] ?? []).length}
                            onClick={() => confirmMultiSelect(index)}
                          >
                            Confirmar
                          </Button>
                        </>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {message.action.options.map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => pickOption(index, option)}
                              className="rounded-full bg-lightprimary px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-white"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {message.role === "ai" && !(message.action && !message.actionResult) && (
                <button
                  type="button"
                  onClick={() => suggestNextStep(index)}
                  className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  <TbBulb className="h-3.5 w-3.5" /> Sugerir próximo passo
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lightprimary text-primary">
              <TbRobot />
            </span>
            <div className="flex items-center gap-2 rounded-xl bg-surface px-4 py-2.5 text-sm text-bodytext">
              <Spinner className="h-4 w-4" /> {ASSISTANT_NAME} está consultando...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 flex gap-2 border-t border-border pt-4">
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ex.: quantos chamados estão em aberto?"
          className="h-11 flex-1 rounded-md border border-border bg-transparent px-3.5 text-sm text-link placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-lightprimary"
        />
        <Button type="submit" icon={<TbSend2 className="h-4 w-4" />} disabled={loading || !question.trim()}>
          Perguntar
        </Button>
      </form>
    </Modal>
  );
}
