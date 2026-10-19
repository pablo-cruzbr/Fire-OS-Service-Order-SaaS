"use client";

import { FormEvent, useRef, useState } from "react";
import { TbCheck, TbMenu2, TbRobot, TbSend2, TbSparkles, TbTool, TbUser, TbUserShare } from "react-icons/tb";
import { Badge, Button, Modal, Spinner } from "@/components/ui";

const tecnicosDisponiveis = ["Carlos Souza", "Mariana Lima", "Rafael Pereira", "Juliana Rocha"];

type NextAction = {
  label: string;
  options: string[];
};

type ChatMessage = {
  role: "user" | "ai";
  text: string;
  tools?: string[];
  action?: NextAction;
  /** Once the gestor picks an option from `action`, we record it here and show the result instead of the menu. */
  actionResult?: string;
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
    text: "A OS mais atrasada é a #48217 (UBS Jardim das Flores) — parada há 6 dias aguardando peça, 3 dias além do prazo combinado. Ela ainda não tem técnico atribuído.",
    tools: ["osMaisAtrasada(criterio: sla)"],
    action: { label: "Atribuir a um técnico", options: tecnicosDisponiveis },
  },
  {
    match: /fora do prazo|sla/i,
    text: "4 chamados estão fora do prazo combinado (mais de 48h sem atualização) — 3 deles são da Secretaria de Educação.",
    tools: ["chamadosForaDoPrazo(limiteHoras: 48)"],
  },
  {
    match: /abert[oa]s? agora|quantos chamados.*abert/i,
    text: "Existem 23 chamados abertos agora: 5 em deslocamento, 5 em andamento e 13 aguardando início.",
    tools: ["chamadosPorStatus(status: ABERTA)"],
  },
  {
    match: /sobrecarregad|maior carga|mais chamados.*t[ée]cnico/i,
    text: "Carlos Souza está com a maior carga: 28 chamados neste mês, 40% acima da média da equipe (20).",
    tools: ["cargaPorTecnico(periodo: 2026-09)"],
  },
  {
    match: /demora|tempo m[ée]dio/i,
    text: "Carlos Souza também tem o maior tempo médio por atendimento: 2h40min, cerca de 45 minutos acima da média da equipe (1h55min).",
    tools: ["tempoMedioPorTecnico(periodo: 2026-09)"],
  },
  {
    match: /secretaria/i,
    text: "A Secretaria de Educação teve mais ordens de serviço em setembro: 54 no total, 35% a mais que em agosto. A UBS Jardim das Flores vem em segundo lugar, com 21 OS.",
    tools: ["osPorSecretaria(periodo: 2026-09)"],
  },
  {
    match: /cliente.*abriu|abriu.*chamados/i,
    text: "Construtora Horizonte Ltda abriu 9 chamados este mês, a maioria relacionada a equipamentos de rede.",
    tools: ["chamadosPorCliente(periodo: 2026-09)"],
  },
  {
    match: /equipamento.*quebr|defeito recorrente|voltou.*vezes/i,
    text: "A impressora HP LaserJet (patrimônio 00245) teve 3 chamados em 30 dias pelo mesmo defeito de rolete — considere avaliar a troca em vez de novo reparo.",
    tools: ["equipamentosRecorrentes(periodo: 30d)"],
  },
  {
    match: /aguard.*peça|peça de reposição/i,
    text: "6 equipamentos estão parados aguardando peça de reposição, 2 deles há mais de 10 dias.",
    tools: ["equipamentosPorStatus(status: AGUARDANDO_PECA)"],
  },
  {
    match: /pausad/i,
    text: "Existem 6 chamados pausados agora, 4 deles aguardando peça de reposição há mais de 5 dias.",
    tools: ["chamadosPorStatus(status: PAUSADA)"],
  },
];

const fallbackAnswer: { text: string; tools: string[]; action?: NextAction } = {
  text: "Encontrei 142 ordens de serviço no período consultado. Tente perguntar sobre um técnico, uma secretaria ou um status específico para uma resposta mais detalhada.",
  tools: ["visaoGeralOS()"],
};

function answerFor(question: string) {
  return cannedAnswers.find((entry) => entry.match.test(question)) ?? fallbackAnswer;
}

export function AskPanelModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(true);
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

  /** Gestor picked an option from a suggested next action (e.g. which técnico to assign). */
  function resolveAction(messageIndex: number, option: string) {
    setMessages((prev) => {
      const next = [...prev];
      const target = next[messageIndex];
      if (!target?.action) return prev;
      next[messageIndex] = { ...target, actionResult: option };
      return next;
    });

    const confirmation =
      messages[messageIndex]?.action?.label === "Atribuir a um técnico"
        ? `OS #48217 atribuída a ${option}. Ela foi notificada no app e a OS entrou na fila dela.`
        : `Feito: ${option}.`;

    setLoading(true);
    timeoutRef.current = setTimeout(() => {
      setMessages((prev) => [...prev, { role: "ai", text: confirmation }]);
      setLoading(false);
    }, 700);
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
          <TbSparkles className="h-5 w-5 text-primary" /> Pergunte ao painel
        </span>
      }
      subtitle="Faça uma pergunta em português sobre os chamados e ordens de serviço"
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
                      <div className="flex flex-wrap gap-1.5">
                        {message.action.options.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => resolveAction(index, option)}
                            className="rounded-full bg-lightprimary px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-white"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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
              <Spinner className="h-4 w-4" /> Consultando...
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
