"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { api } from "@/services/api";
import { getCookieClient } from "@/lib/cookieClient";
import { useGlobalModal } from "@/provider/GlobalModalProvider";

import "dhtmlx-scheduler/codebase/dhtmlxscheduler.css";
import "./calendar.css";

interface CalendarProps {
  initialToken?: string;
  events?: any[];
}

interface PendingReschedule {
  ev: any;
  oldDate: Date;
}

export default function Calendar({ initialToken, events }: CalendarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const schedulerInstance = useRef<any>(null);
  const isInitialized = useRef(false);
  const { openModal } = useGlobalModal();

  const [pending, setPending] = useState<PendingReschedule | null>(null);
  const [saving, setSaving] = useState(false);

  // Ref para evitar que o modal abra duas vezes
  const pendingRef = useRef<PendingReschedule | null>(null);

  const parseToScheduler = useCallback((data: any[]) => {
    return data.map((os: any) => {
      const startDate = os.agendadoEm
        ? new Date(os.agendadoEm)
        : new Date(os.created_at);

      return {
        id: os.id,
        text: `OS ${os.numeroOS}: ${os.cliente?.name || "Chamado"}`,
        start_date: startDate,
        end_date: new Date(startDate.getTime() + 30 * 60 * 1000),
        color: os.statusOrdemdeServico?.name === "CONCLUIDA" ? "#10b981" : "#f59e0b",
        rawTicket: os,
      };
    });
  }, []);

  const updateEventOnServer = async (ev: any) => {
    const token = initialToken || (await getCookieClient());
    await api.patch(
      `/ordemdeservico/update/${ev.id}`,
      { agendadoEm: ev.start_date },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  const handleConfirm = async () => {
    if (!pendingRef.current) return;
    setSaving(true);
    try {
      await updateEventOnServer(pendingRef.current.ev);

      // Atualiza o rawTicket em memória para futuras movimentações
      const scheduler = schedulerInstance.current;
      if (scheduler) {
        const ev = scheduler.getEvent(pendingRef.current.ev.id);
        if (ev?.rawTicket) {
          ev.rawTicket.agendadoEm = pendingRef.current.ev.start_date;
        }
      }
    } catch (err) {
      console.error("Erro ao reagendar:", err);
      revertEvent(pendingRef.current);
    } finally {
      setSaving(false);
      pendingRef.current = null;
      setPending(null);

      // Reativa o drag após confirmar
      const scheduler = schedulerInstance.current;
      if (scheduler) {
        scheduler.config.drag_move = true;
        scheduler.config.readonly = false;
      }
    }
  };

  const revertEvent = (p: PendingReschedule) => {
    const scheduler = schedulerInstance.current;
    if (!scheduler) return;
    const ev = scheduler.getEvent(p.ev.id);
    if (ev) {
      ev.start_date = new Date(p.oldDate);
      ev.end_date = new Date(p.oldDate.getTime() + 30 * 60 * 1000);
      scheduler.updateEvent(ev.id);
    }
  };

  const handleCancel = () => {
    if (!pendingRef.current) return;
    revertEvent(pendingRef.current);
    pendingRef.current = null;
    setPending(null);

    // Reativa o drag após cancelar
    const scheduler = schedulerInstance.current;
    if (scheduler) {
      scheduler.config.drag_move = true;
      scheduler.config.readonly = false;
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || isInitialized.current) return;

    const initScheduler = async () => {
      const schedulerModule = await import("dhtmlx-scheduler");
      const scheduler = schedulerModule.default;
      schedulerInstance.current = scheduler;

      scheduler.i18n.setLocale("pt");
      scheduler.skin = "terrace";
      scheduler.config.readonly = false;
      scheduler.config.drag_resize = false; // desativa resize, só move
      scheduler.config.drag_move = true;
      scheduler.config.header = ["day", "week", "month", "date", "prev", "today", "next"];

      if (containerRef.current) {
        scheduler.init(containerRef.current, new Date(), "month");
        isInitialized.current = true;

        if (events && events.length > 0) {
          scheduler.parse(parseToScheduler(events));
        } else {
          const token = initialToken || (await getCookieClient());
          if (token) {
            const { data } = await api.get("/ordens", {
              headers: { Authorization: `Bearer ${token}` },
            });
            scheduler.parse(parseToScheduler(data?.controles || []));
          }
        }
      }

      scheduler.attachEvent("onClick", (id: string) => {
        const ev = scheduler.getEvent(id);
        if (ev?.rawTicket) {
          openModal("OrdemdeServico", [ev.rawTicket]);
        }
        return false;
      });

      let oldDateBeforeMove: Date | null = null;

      scheduler.attachEvent(
        "onBeforeEventChanged",
        (_ev: any, _e: any, is_new: boolean, original: any) => {
          // Bloqueia nova movimentação se já tem uma pendente
          if (pendingRef.current) return false;
          if (!is_new) {
            oldDateBeforeMove = new Date(original.start_date);
          }
          return true;
        }
      );

      scheduler.attachEvent("onEventChanged", (_id: string, ev: any) => {
        const p: PendingReschedule = {
          ev,
          oldDate: oldDateBeforeMove ?? new Date(ev.start_date),
        };
        pendingRef.current = p;
        setPending(p);

        // Desativa drag enquanto modal está aberto
        scheduler.config.drag_move = false;

        return true;
      });
    };

    initScheduler();
  }, [events, parseToScheduler, initialToken, openModal]);

  const formatDate = (d: Date) =>
    new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(d));

  return (
    <div style={{ width: "100%", marginTop: "20px" }}>

      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Confirmar reagendamento
            </h2>
            <p className="text-gray-600 text-sm mb-1">
              <span className="font-medium">De:</span> {formatDate(pending.oldDate)}
            </p>
            <p className="text-gray-600 text-sm mb-5">
              <span className="font-medium">Para:</span> {formatDate(pending.ev.start_date)}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-sm text-gray-600 border border-gray-300 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-sm text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-60"
              >
                {saving ? "Salvando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="dhx_cal_container shadow-sm border rounded-xl"
        style={{ width: "100%", height: "600px", backgroundColor: "#fff" }}
      >
        <div className="dhx_cal_navline">
          <div className="dhx_cal_prev_button">&nbsp;</div>
          <div className="dhx_cal_next_button">&nbsp;</div>
          <div className="dhx_cal_today_button"></div>
          <div className="dhx_cal_date"></div>
          <div className="dhx_cal_tab" data-tab="day"></div>
          <div className="dhx_cal_tab" data-tab="week"></div>
          <div className="dhx_cal_tab" data-tab="month"></div>
        </div>
        <div className="dhx_cal_header"></div>
        <div className="dhx_cal_data"></div>
      </div>
    </div>
  );
}