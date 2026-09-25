"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { toArray } from "@/lib/toArray";

export type Option = { value: string; label: string };

export type Lookup = {
  endpoint: string;
  /** Picks the rows out of the response. Defaults to `toArray`. */
  unwrap?: (data: any) => any[];
  /** Turns a row into an option. Defaults to `{ value: row.id, label: row.name }`. */
  map?: (row: any) => Option;
};

const defaultMap = (row: any): Option => ({ value: String(row.id), label: String(row.name ?? row.id) });

/**
 * Loads the options for every lookup in parallel (one request per endpoint).
 * A failing endpoint yields an empty list and is reported in `failed`
 * instead of leaving the whole form stuck on "Carregando...".
 */
export function useLookups(lookups: Lookup[]) {
  const key = lookups.map((lookup) => lookup.endpoint).join("|");
  const [options, setOptions] = useState<Record<string, Option[]>>({});
  const [loading, setLoading] = useState(lookups.length > 0);
  const [failed, setFailed] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    const unique = Array.from(new Map(lookups.map((lookup) => [lookup.endpoint, lookup])).values());
    if (unique.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.allSettled(unique.map((lookup) => api.get(lookup.endpoint))).then((results) => {
      if (cancelled) return;
      const next: Record<string, Option[]> = {};
      const errors: string[] = [];
      results.forEach((result, index) => {
        const lookup = unique[index];
        if (result.status === "fulfilled") {
          const rows = (lookup.unwrap ?? toArray)(result.value.data);
          next[lookup.endpoint] = rows.map(lookup.map ?? defaultMap);
        } else {
          next[lookup.endpoint] = [];
          errors.push(lookup.endpoint);
        }
      });
      setOptions(next);
      setFailed(errors);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // `key` captures the endpoints; the lookup objects are recreated every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { options, loading, failed };
}
