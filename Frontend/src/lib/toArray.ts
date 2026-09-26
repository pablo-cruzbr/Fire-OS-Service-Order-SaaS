/**
 * List endpoints are not consistent: some return an array, others wrap it in
 * `controles`, `instituicoes`, `users`... This unwraps the first array found.
 */
export function toArray<T = any>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    for (const key of ["controles", "instituicoes", "users", "items", "data"]) {
      const value = (data as Record<string, unknown>)[key];
      if (Array.isArray(value)) return value as T[];
    }
  }
  return [];
}
