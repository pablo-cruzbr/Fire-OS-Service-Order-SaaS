"use client";

import { FormEvent, useRef, useState } from "react";
import { TbRobot, TbSend2, TbSparkles, TbTool, TbUser } from "react-icons/tb";
import { Badge, Button, Modal, Spinner } from "@/components/ui";

type ChatMessage = {
  role: "user" | "ai";
  text: string;
  tools?: string[];
};

const quickQuestions = [
  "Qual secretaria teve mais OS em setembro?",
  "Qual técnico demora mais por atendimento?",
  "Quantos chamados estão pausados agora?",
];

/*
 * Canned answers, matched by keyword. This is a UI mockup only — no LLM, no
 * backend call. Each entry mirrors the shape the real feature would return:
 * an answer in Portuguese plus which "tools" (fixed functions) supposedly
 * ran, matching docs/GUIA-IA-FIRE-OS.md's tool-calling design.
 */
const cannedAnswers: { match: RegExp; text: string; tools: string[] }[] = [
  {
    match: /secretaria/i,
    text: "A Secretaria de Educação teve mais ordens de serviço em setembro: 54 no total, 35% a mais que em agosto. A UBS Jardim das Flores vem em segundo lugar, com 21 OS.",
    tools: ["osPorSecretaria(periodo: 2026-09)"],
  },
  {
    match: /técnico|tecnico|demora/i,
    text: "Carlos Souza tem o maior tempo médio por atendimento: 2h40min, cerca de 45 minutos acima da média da equipe (1h55min).",
    tools: ["tempoMedioPorTecnico(periodo: 2026-09)"],
  },
  {
    match: /pausad/i,
    text: "Existem 6 chamados pausados agora, 4 deles aguardando peça de reposição há mais de 5 dias.",
    tools: ["chamadosPorStatus(status: PAUSADA)"],
  },
];

const fallbackAnswer = {
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
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setQuestion("");
    setLoading(true);

    const answer = answerFor(trimmed);
    timeoutRef.current = setTimeout(() => {
      setMessages((prev) => [...prev, { role: "ai", text: answer.text, tools: answer.tools }]);
      setLoading(false);
    }, 900);
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

      {messages.length === 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {quickQuestions.map((item) => (
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
