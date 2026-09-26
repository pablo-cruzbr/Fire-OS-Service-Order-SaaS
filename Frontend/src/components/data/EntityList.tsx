"use client";

import { ReactNode, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TbChevronLeft, TbChevronRight, TbPlus, TbRefresh, TbSearch, TbTrash } from "react-icons/tb";
import { api } from "@/services/api";
import { apiErrorMessage } from "@/lib/apiError";
import { cn } from "@/lib/cn";
import { Button, ButtonLink, Card, EmptyState, Input, PageHeader, Select, Stat, StatGrid } from "@/components/ui";
import type { Option } from "./useLookups";

export type Column<T> = {
  header: string;
  cell: (item: T) => ReactNode;
  className?: string;
};

export type ListFilter<T> = {
  label: string;
  /** Static options, or derived from the loaded rows. */
  options: Option[] | ((items: T[]) => Option[]);
  match: (item: T, value: string) => boolean;
};

export type DeleteConfig<T> = {
  request: (item: T) => { url: string; params?: Record<string, unknown> };
  /** Used in the confirmation prompt. */
  describe?: (item: T) => string;
};

type EntityListProps<T> = {
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
  description?: string;
  items: T[];
  rowKey: (item: T) => string;
  columns: Column<T>[];
  stats?: Stat[];
  /** Text fields searched by the search box. */
  search?: { placeholder?: string; text: (item: T) => (string | null | undefined)[] };
  filters?: ListFilter<T>[];
  add?: { href: string; label: string };
  onOpen?: (item: T) => void;
  remove?: DeleteConfig<T>;
  pageSize?: number;
  emptyMessage?: string;
  headerActions?: ReactNode;
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/**
 * Generic list page: header, KPI tiles, search + filters, paginated table,
 * row click to open the detail modal and delete with confirmation.
 */
export function EntityList<T>({
  title,
  breadcrumbs,
  description,
  items,
  rowKey,
  columns,
  stats = [],
  search,
  filters = [],
  add,
  onOpen,
  remove,
  pageSize = 10,
  emptyMessage = "Nenhum registro encontrado.",
  headerActions,
}: EntityListProps<T>) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState<string[]>(() => filters.map(() => ""));
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = normalize(query.trim());
    return items.filter((item) => {
      if (term && search) {
        const haystack = normalize(search.text(item).filter(Boolean).join(" "));
        if (!haystack.includes(term)) return false;
      }
      return filters.every((filter, index) => !filterValues[index] || filter.match(item, filterValues[index]));
    });
  }, [items, query, search, filters, filterValues]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * pageSize, current * pageSize);

  function refresh() {
    startRefresh(() => router.refresh());
  }

  async function handleDelete(item: T) {
    if (!remove) return;
    const label = remove.describe?.(item);
    if (!window.confirm(label ? `Excluir "${label}"? Essa ação não pode ser desfeita.` : "Excluir este registro?")) {
      return;
    }
    const key = rowKey(item);
    setDeleting(key);
    try {
      const { url, params } = remove.request(item);
      await api.delete(url, { params });
      toast.success("Registro excluído.");
      refresh();
    } catch (error) {
      toast.error(apiErrorMessage(error, "Não foi possível excluir o registro."));
    } finally {
      setDeleting(null);
    }
  }

  const hasToolbar = Boolean(search) || filters.length > 0;

  return (
    <section>
      <PageHeader
        title={title}
        breadcrumbs={breadcrumbs ?? [{ label: title }]}
        description={description}
        actions={
          <>
            {headerActions}
            <Button
              variant="outline"
              size="icon"
              onClick={refresh}
              aria-label="Atualizar lista"
              title="Atualizar lista"
              className="bg-card"
            >
              <TbRefresh className={cn("h-4 w-4", refreshing && "animate-spin")} />
            </Button>
            {add && (
              <ButtonLink href={add.href} icon={<TbPlus className="h-4 w-4" />}>
                {add.label}
              </ButtonLink>
            )}
          </>
        }
      />

      <StatGrid stats={stats} />

      <Card className="p-0">
        {hasToolbar && (
          <div className="flex flex-col gap-3 border-b border-border p-5 md:flex-row md:flex-wrap md:items-center">
            {search && (
              <div className="relative md:w-72 md:shrink-0">
                <TbSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  type="search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder={search.placeholder ?? "Buscar..."}
                  aria-label="Buscar"
                  className="pl-10"
                />
              </div>
            )}
            {filters.map((filter, index) => {
              const options = typeof filter.options === "function" ? filter.options(items) : filter.options;
              return (
                <div key={filter.label} className="md:w-56">
                  <Select
                    aria-label={filter.label}
                    value={filterValues[index]}
                    onChange={(event) => {
                      const next = [...filterValues];
                      next[index] = event.target.value;
                      setFilterValues(next);
                      setPage(1);
                    }}
                  >
                    <option value="">{filter.label}: todos</option>
                    {options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
              );
            })}
            <p className="text-xs text-muted md:ml-auto">
              {filtered.length} de {items.length} registro{items.length === 1 ? "" : "s"}
            </p>
          </div>
        )}

        {visible.length === 0 ? (
          <EmptyState
            title={items.length === 0 ? emptyMessage : "Nenhum resultado para os filtros"}
            description={items.length === 0 ? undefined : "Ajuste a busca ou limpe os filtros."}
            action={items.length === 0 && add ? <ButtonLink href={add.href}>{add.label}</ButtonLink> : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  {columns.map((column) => (
                    <th
                      key={column.header}
                      scope="col"
                      className={cn("whitespace-nowrap px-5 py-3.5 font-semibold text-link", column.className)}
                    >
                      {column.header}
                    </th>
                  ))}
                  {remove && (
                    <th scope="col" className="w-16 px-5 py-3.5">
                      <span className="sr-only">Ações</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => {
                  const key = rowKey(item);
                  return (
                    <tr
                      key={key}
                      onClick={onOpen ? () => onOpen(item) : undefined}
                      onKeyDown={
                        onOpen
                          ? (event) => {
                              if (event.key === "Enter") onOpen(item);
                            }
                          : undefined
                      }
                      tabIndex={onOpen ? 0 : undefined}
                      className={cn(
                        "border-b border-border last:border-0 transition-colors",
                        onOpen && "cursor-pointer hover:bg-lightprimary/60 focus-visible:bg-lightprimary focus-visible:outline-none",
                      )}
                    >
                      {columns.map((column) => (
                        <td key={column.header} className={cn("px-5 py-3.5 align-middle text-bodytext", column.className)}>
                          {column.cell(item)}
                        </td>
                      ))}
                      {remove && (
                        <td className="px-5 py-3.5 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Excluir"
                            title="Excluir"
                            loading={deleting === key}
                            className="hover:bg-lighterror hover:text-errortext"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDelete(item);
                            }}
                          >
                            {deleting !== key && <TbTrash className="h-4 w-4" />}
                          </Button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3.5">
            <p className="text-xs text-muted">
              Página {current} de {pages}
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                aria-label="Página anterior"
                disabled={current === 1}
                onClick={() => setPage(current - 1)}
              >
                <TbChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Próxima página"
                disabled={current === pages}
                onClick={() => setPage(current + 1)}
              >
                <TbChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </section>
  );
}

/** Primary text + secondary line, for the first column of a table. */
export function CellTitle({ title, subtitle }: { title: ReactNode; subtitle?: ReactNode }) {
  return (
    <div className="min-w-[160px]">
      <p className="font-semibold text-link">{title}</p>
      {subtitle && <p className="mt-0.5 text-xs text-bodytext">{subtitle}</p>}
    </div>
  );
}

/** Unique `{ value, label }` options from a text field of the rows. */
export function optionsFrom<T>(items: T[], pick: (item: T) => string | null | undefined): Option[] {
  const names = new Set<string>();
  items.forEach((item) => {
    const name = pick(item);
    if (name) names.add(name);
  });
  return Array.from(names)
    .sort((a, b) => a.localeCompare(b, "pt-BR"))
    .map((name) => ({ value: name, label: name }));
}
