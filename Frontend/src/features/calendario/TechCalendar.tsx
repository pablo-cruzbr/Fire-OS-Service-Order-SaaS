"use client";

import { DragEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  TbCalendarTime,
  TbChevronLeft,
  TbChevronRight,
  TbClock,
  TbList,
  TbRefresh,
} from "react-icons/tb";
import { api } from "@/services/api";
import { apiErrorMessage } from "@/lib/apiError";
import { cn } from "@/lib/cn";
import { statusTone, Tone } from "@/lib/status";
import { useGlobalModal } from "@/provider/GlobalModalProvider";
import { Badge, Button, Card, Field, Input, Modal } from "@/components/ui";
import type { OrdemdeServicoProps } from "@/lib/getOrdemdeServico.type";

type Ordem = OrdemdeServicoProps & { agendadoEm?: string | null };
type View = "month" | "week" | "agenda";

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  status?: string;
  tone: Tone;
  ordem: Ordem;
};

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MAX_PER_CELL = 3;

const eventTone: Record<Tone, string> = {
  primary: "bg-lightprimary text-primary border-primary",
  secondary: "bg-lightsecondary text-secondary border-secondary",
  success: "bg-lightsuccess text-successtext border-success",
  warning: "bg-lightwarning text-warningtext border-warning",
  error: "bg-lighterror text-errortext border-error",
  info: "bg-lightinfo text-info border-info",
  neutral: "bg-surface text-bodytext border-muted",
};

function place(os: Ordem) {
  return (
    os.instituicaoUnidade?.name ??
    os.informacoesSetor?.instituicaoUnidade?.name ??
    os.user?.instituicaoUnidade?.name ??
    os.cliente?.name ??
    `OS ${os.numeroOS}`
  );
}

function toEvent(os: Ordem): CalendarEvent {
  const status = os.statusOrdemdeServico?.name;
  return {
    id: os.id,
    title: place(os),
    start: new Date(os.agendadoEm ?? os.created_at),
    status,
    tone: statusTone(status),
    ordem: os,
  };
}

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
const sameDay = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime();
const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
const time = (date: Date) => date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
const longDate = (date: Date) => date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
const pad = (value: number) => String(value).padStart(2, "0");
const toDateValue = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const toTimeValue = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

function monthGrid(cursor: Date) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const start = addDays(first, -first.getDay());
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

function weekDays(cursor: Date) {
  const start = addDays(startOfDay(cursor), -cursor.getDay());
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

type Reschedule = { event: CalendarEvent; date: string; time: string };

function EventChip({
  event,
  onOpen,
  compact,
}: {
  event: CalendarEvent;
  onOpen: (event: CalendarEvent) => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      draggable
      onDragStart={(dragEvent: DragEvent) => {
        dragEvent.dataTransfer.setData("text/os-id", event.id);
        dragEvent.dataTransfer.effectAllowed = "move";
      }}
      onClick={(clickEvent) => {
        clickEvent.stopPropagation();
        onOpen(event);
      }}
      title={`${time(event.start)} · ${event.title}${event.status ? ` · ${event.status}` : ""}`}
      className={cn(
        "flex w-full cursor-grab items-center gap-1.5 truncate rounded-md border-l-[3px] px-2 text-left text-xs font-medium transition-opacity hover:opacity-80 active:cursor-grabbing",
        compact ? "py-0.5" : "py-1.5",
        eventTone[event.tone],
      )}
    >
      <span className="shrink-0 tabular-nums opacity-80">{time(event.start)}</span>
      <span className="truncate">{event.title}</span>
    </button>
  );
}

export function TechCalendar({ ordens }: { ordens: Ordem[] }) {
  const router = useRouter();
  const { openModal } = useGlobalModal();
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(() => startOfDay(new Date()));
  const [events, setEvents] = useState<CalendarEvent[]>(() => ordens.map(toEvent));
  const [dayOpen, setDayOpen] = useState<Date | null>(null);
  const [reschedule, setReschedule] = useState<Reschedule | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setEvents(ordens.map(toEvent));
    setRefreshing(false);
  }, [ordens]);

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    [...events]
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .forEach((event) => {
        const key = dayKey(event.start);
        map.set(key, [...(map.get(key) ?? []), event]);
      });
    return map;
  }, [events]);

  const today = startOfDay(new Date());
  const title =
    view === "week"
      ? (() => {
          const days = weekDays(cursor);
          return `${days[0].toLocaleDateString("pt-BR", { day: "numeric", month: "short" })} – ${days[6].toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })}`;
        })()
      : cursor.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  function move(step: number) {
    setCursor((current) =>
      view === "week"
        ? addDays(current, step * 7)
        : new Date(current.getFullYear(), current.getMonth() + step, 1),
    );
  }

  function openEvent(event: CalendarEvent) {
    openModal("OrdemdeServico", event.ordem);
  }

  function startReschedule(event: CalendarEvent, day?: Date) {
    const target = day ?? event.start;
    setReschedule({ event, date: toDateValue(target), time: toTimeValue(event.start) });
  }

  function handleDrop(day: Date, dropEvent: DragEvent) {
    dropEvent.preventDefault();
    setDragOver(null);
    const id = dropEvent.dataTransfer.getData("text/os-id");
    const event = events.find((item) => item.id === id);
    if (!event || sameDay(event.start, day)) return;
    startReschedule(event, day);
  }

  async function confirmReschedule() {
    if (!reschedule) return;
    const [year, month, date] = reschedule.date.split("-").map(Number);
    const [hours, minutes] = reschedule.time.split(":").map(Number);
    const next = new Date(year, month - 1, date, hours, minutes);

    setSaving(true);
    try {
      await api.patch(`/ordemdeservico/update/${reschedule.event.id}`, { agendadoEm: next.toISOString() });
      setEvents((current) =>
        current.map((item) =>
          item.id === reschedule.event.id
            ? { ...item, start: next, ordem: { ...item.ordem, agendadoEm: next.toISOString() } }
            : item,
        ),
      );
      toast.success(`OS #${reschedule.event.ordem.numeroOS} reagendada para ${longDate(next)}, ${time(next)}.`);
      setReschedule(null);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Não foi possível reagendar a OS."));
    } finally {
      setSaving(false);
    }
  }

  function dropTarget(day: Date) {
    const key = dayKey(day);
    return {
      onDragOver: (dragEvent: DragEvent) => {
        if (!dragEvent.dataTransfer.types.includes("text/os-id")) return;
        dragEvent.preventDefault();
        setDragOver(key);
      },
      onDragLeave: () => setDragOver((current) => (current === key ? null : current)),
      onDrop: (dropEvent: DragEvent) => handleDrop(day, dropEvent),
    };
  }

  const dayEvents = dayOpen ? byDay.get(dayKey(dayOpen)) ?? [] : [];
  const agenda = events
    .filter((event) => event.start >= today)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 60);

  const views: { key: View; label: string }[] = [
    { key: "month", label: "Mês" },
    { key: "week", label: "Semana" },
    { key: "agenda", label: "Agenda" },
  ];

  return (
    <Card className="p-0">
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-5">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" aria-label="Anterior" onClick={() => move(-1)} disabled={view === "agenda"}>
            <TbChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" aria-label="Próximo" onClick={() => move(1)} disabled={view === "agenda"}>
            <TbChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-9" onClick={() => setCursor(startOfDay(new Date()))}>
            Hoje
          </Button>
        </div>
        <h2 className="text-lg font-semibold text-link first-letter:uppercase">{view === "agenda" ? "Próximos atendimentos" : title}</h2>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Atualizar"
            onClick={() => {
              setRefreshing(true);
              router.refresh();
            }}
          >
            <TbRefresh className={cn("h-4 w-4", refreshing && "animate-spin")} />
          </Button>
          <div role="tablist" aria-label="Visualização" className="flex rounded-md bg-surface p-1">
            {views.map((item) => (
              <button
                key={item.key}
                role="tab"
                aria-selected={view === item.key}
                onClick={() => setView(item.key)}
                className={cn(
                  "rounded px-3 py-1.5 text-xs font-medium transition-colors",
                  view === item.key ? "bg-card text-primary shadow-md dark:shadow-dark-md" : "text-bodytext hover:text-primary",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === "month" && (
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-7 border-b border-border">
              {WEEKDAYS.map((weekday) => (
                <div key={weekday} className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted">
                  {weekday}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {monthGrid(cursor).map((day, index) => {
                const list = byDay.get(dayKey(day)) ?? [];
                const outside = day.getMonth() !== cursor.getMonth();
                const isToday = sameDay(day, today);
                return (
                  <div
                    key={day.toISOString()}
                    {...dropTarget(day)}
                    className={cn(
                      "min-h-[118px] border-b border-border p-1.5 transition-colors",
                      index % 7 !== 6 && "border-r",
                      outside && "bg-surface/60",
                      dragOver === dayKey(day) && "bg-lightprimary",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setDayOpen(day)}
                      aria-label={`Ver ${longDate(day)}`}
                      className={cn(
                        "mb-1 flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors hover:bg-lightprimary",
                        isToday ? "bg-primary text-white hover:bg-primary" : outside ? "text-muted" : "text-link",
                      )}
                    >
                      {day.getDate()}
                    </button>
                    <div className="flex flex-col gap-1">
                      {list.slice(0, MAX_PER_CELL).map((event) => (
                        <EventChip key={event.id} event={event} onOpen={openEvent} compact />
                      ))}
                      {list.length > MAX_PER_CELL && (
                        <button
                          type="button"
                          onClick={() => setDayOpen(day)}
                          className="rounded px-2 text-left text-xs font-semibold text-primary hover:underline"
                        >
                          +{list.length - MAX_PER_CELL} mais
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {view === "week" && (
        <div className="overflow-x-auto">
          <div className="grid min-w-[860px] grid-cols-7">
            {weekDays(cursor).map((day, index) => {
              const list = byDay.get(dayKey(day)) ?? [];
              const isToday = sameDay(day, today);
              return (
                <div
                  key={day.toISOString()}
                  {...dropTarget(day)}
                  className={cn(
                    "min-h-[480px] p-2 transition-colors",
                    index !== 6 && "border-r border-border",
                    dragOver === dayKey(day) && "bg-lightprimary",
                  )}
                >
                  <div className="mb-3 flex flex-col items-center gap-1 border-b border-border pb-3">
                    <span className="text-xs font-semibold uppercase text-muted">{WEEKDAYS[day.getDay()]}</span>
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full text-base font-semibold",
                        isToday ? "bg-primary text-white" : "text-link",
                      )}
                    >
                      {day.getDate()}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {list.map((event) => (
                      <EventChip key={event.id} event={event} onOpen={openEvent} />
                    ))}
                    {list.length === 0 && <p className="pt-4 text-center text-xs text-muted">Sem atendimentos</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === "agenda" && (
        <ul className="divide-y divide-border">
          {agenda.length === 0 && <li className="p-10 text-center text-bodytext">Nenhum atendimento agendado.</li>}
          {agenda.map((event) => (
            <li key={event.id} className="flex flex-wrap items-center gap-4 px-5 py-3.5">
              <div className="w-28 shrink-0">
                <p className="text-sm font-semibold capitalize text-link">
                  {event.start.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })}
                </p>
                <p className="flex items-center gap-1 text-xs text-muted">
                  <TbClock /> {time(event.start)}
                </p>
              </div>
              <button type="button" onClick={() => openEvent(event)} className="min-w-0 flex-1 text-left">
                <p className="truncate font-medium text-link hover:text-primary">{event.title}</p>
                <p className="text-xs text-bodytext">
                  OS #{event.ordem.numeroOS} · {event.ordem.tecnico?.name ?? "Técnico não atribuído"}
                </p>
              </button>
              {event.status && <Badge tone={event.tone}>{event.status}</Badge>}
              <Button variant="light" size="sm" icon={<TbCalendarTime className="h-4 w-4" />} onClick={() => startReschedule(event)}>
                Reagendar
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border px-5 py-3 text-xs text-bodytext">
        <span className="flex items-center gap-1.5">
          <TbList /> Arraste um atendimento para outro dia para reagendar.
        </span>
      </div>

      <Modal
        open={Boolean(dayOpen)}
        onClose={() => setDayOpen(null)}
        size="md"
        title={dayOpen ? longDate(dayOpen) : ""}
        subtitle={`${dayEvents.length} atendimento(s)`}
      >
        {dayEvents.length === 0 ? (
          <p className="py-6 text-center text-bodytext">Nenhum atendimento neste dia.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {dayEvents.map((event) => (
              <li key={event.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => {
                    setDayOpen(null);
                    openEvent(event);
                  }}
                >
                  <p className="truncate text-sm font-medium text-link hover:text-primary">
                    {time(event.start)} · {event.title}
                  </p>
                  <p className="text-xs text-bodytext">
                    OS #{event.ordem.numeroOS} · {event.ordem.tecnico?.name ?? "Técnico não atribuído"}
                  </p>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Reagendar"
                  title="Reagendar"
                  onClick={() => {
                    setDayOpen(null);
                    startReschedule(event);
                  }}
                >
                  <TbCalendarTime className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Modal>

      <Modal
        open={Boolean(reschedule)}
        onClose={() => !saving && setReschedule(null)}
        size="md"
        title="Confirmar reagendamento"
        subtitle={reschedule ? `OS #${reschedule.event.ordem.numeroOS} · ${reschedule.event.title}` : undefined}
        footer={
          <>
            <Button variant="outline" onClick={() => setReschedule(null)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={confirmReschedule} loading={saving}>
              Confirmar
            </Button>
          </>
        }
      >
        {reschedule && (
          <div className="flex flex-col gap-5">
            <p className="rounded-lg bg-surface px-4 py-3 text-sm text-bodytext">
              Agendamento atual:{" "}
              <strong className="text-link">
                {longDate(reschedule.event.start)}, {time(reschedule.event.start)}
              </strong>
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nova data" htmlFor="reschedule-date">
                <Input
                  id="reschedule-date"
                  type="date"
                  value={reschedule.date}
                  onChange={(event) => setReschedule({ ...reschedule, date: event.target.value })}
                />
              </Field>
              <Field label="Horário" htmlFor="reschedule-time">
                <Input
                  id="reschedule-time"
                  type="time"
                  value={reschedule.time}
                  onChange={(event) => setReschedule({ ...reschedule, time: event.target.value })}
                />
              </Field>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
}
