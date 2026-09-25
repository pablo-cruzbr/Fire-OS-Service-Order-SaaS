import type { OrdemdeServicoProps } from "@/lib/getOrdemdeServico.type";

export type Foto = { id: string; url: string };

type Place = { name: string; endereco?: string };

/** Where the service happens: the OS's own unit/client, falling back to the ramal record. */
export function osPlace(os: OrdemdeServicoProps): Place | null {
  const place =
    os.instituicaoUnidade ??
    os.cliente ??
    os.informacoesSetor?.instituicaoUnidade ??
    os.informacoesSetor?.cliente ??
    null;
  return place ? { name: place.name, endereco: place.endereco } : null;
}

/** Unit/client of the user who opened the OS. */
export function openerPlace(os: OrdemdeServicoProps): Place | null {
  const place = os.user?.instituicaoUnidade ?? os.user?.cliente ?? null;
  return place ? { name: place.name, endereco: place.endereco } : null;
}

/** Short label for tables: unit/client of the OS, else of the opener. */
export function osPlaceName(os: OrdemdeServicoProps) {
  return osPlace(os)?.name ?? openerPlace(os)?.name ?? null;
}

export function osClienteName(os: OrdemdeServicoProps) {
  return os.cliente?.name ?? os.informacoesSetor?.cliente?.name ?? os.user?.cliente?.name ?? null;
}

export function osInstituicaoName(os: OrdemdeServicoProps) {
  return (
    os.instituicaoUnidade?.name ??
    os.informacoesSetor?.instituicaoUnidade?.name ??
    os.user?.instituicaoUnidade?.name ??
    null
  );
}

export function osEquipamento(os: OrdemdeServicoProps) {
  if (os.equipamento) {
    return os.equipamento.patrimonio
      ? `${os.equipamento.name} — Patrimônio: ${os.equipamento.patrimonio}`
      : os.equipamento.name;
  }
  return os.patrimoniodoequipamento ? `Patrimônio: ${os.patrimoniodoequipamento}` : null;
}

/** Seconds → HH:MM:SS. */
export function formatDuration(seconds?: number | null, fallback = "Sem duração") {
  if (seconds === null || seconds === undefined || Number.isNaN(Number(seconds))) return fallback;
  const total = Math.floor(Math.abs(Number(seconds)));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((value) => String(value).padStart(2, "0")).join(":");
}

/** 14:05 in Brasília time. */
export function formatTime(value?: string | null, fallback = "—") {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? fallback
    : date.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" });
}

/** Activities grouped by category, categories sorted. */
export function groupAtividades<T extends { categoria: string }>(items: T[]) {
  const groups = new Map<string, T[]>();
  items.forEach((item) => {
    const list = groups.get(item.categoria) ?? [];
    list.push(item);
    groups.set(item.categoria, list);
  });
  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b, "pt-BR"));
}

/** Sort newest first. */
export function byNewest(a: OrdemdeServicoProps, b: OrdemdeServicoProps) {
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}
