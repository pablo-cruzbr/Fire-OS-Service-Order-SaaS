import { api } from "@/services/api";
import { getCookieServer } from "@/lib/cookieServer";

/**
 * GET from a server component with the session token. Returns `fallback` when
 * the request fails so a list page renders empty instead of crashing.
 */
export async function serverGet<T>(path: string, fallback: T): Promise<T> {
  try {
    const token = await getCookieServer();
    const response = await api.get(path, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return (response.data ?? fallback) as T;
  } catch (err: any) {
    console.error(`GET ${path} falhou:`, err?.response?.status ?? err?.message);
    return fallback;
  }
}
