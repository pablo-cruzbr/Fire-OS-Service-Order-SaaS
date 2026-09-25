"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { toArray } from "@/lib/toArray";
import { cn } from "@/lib/cn";
import { Spinner } from "@/components/ui";
import { groupAtividades } from "./helpers";

type AtividadePadrao = { id: string; descricao: string; categoria: string };

type AtividadesPickerProps = {
  /** Activities already linked to the OS: shown ticked and locked (the API can only add). */
  existing: Set<string>;
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
};

export function AtividadesPicker({ existing, selected, onChange }: AtividadesPickerProps) {
  const [atividades, setAtividades] = useState<AtividadePadrao[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/listatividade")
      .then(({ data }) => {
        if (!cancelled) setAtividades(toArray<AtividadePadrao>(data));
      })
      .catch(() => {
        if (!cancelled) setAtividades([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  }

  if (atividades === null) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted">
        <Spinner className="h-4 w-4" /> Carregando atividades...
      </div>
    );
  }
  if (atividades.length === 0) return null;

  return (
    <fieldset>
      <legend className="mb-1 text-sm font-semibold text-link">Atividades realizadas</legend>
      <p className="mb-3 text-xs text-muted">
        Marque as atividades novas. As já registradas não podem ser removidas por aqui.
      </p>
      <div className="flex flex-col gap-4">
        {groupAtividades(atividades).map(([categoria, list]) => (
          <div key={categoria}>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">{categoria}</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {list.map((atividade) => {
                const locked = existing.has(atividade.id);
                const checked = locked || selected.has(atividade.id);
                return (
                  <label
                    key={atividade.id}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md border px-3 py-2 text-sm transition-colors",
                      checked ? "border-primary bg-lightprimary text-link" : "border-border text-link hover:border-primary",
                      locked ? "cursor-default" : "cursor-pointer",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={locked}
                      onChange={() => toggle(atividade.id)}
                      className="h-4 w-4 shrink-0 accent-primary"
                    />
                    <span className="min-w-0 flex-1">{atividade.descricao}</span>
                    {locked && <span className="shrink-0 text-xs font-medium text-successtext">já adicionada</span>}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
