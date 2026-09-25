import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { getDynamic, getRoutes } from "./fixtures";


function respond(config: InternalAxiosRequestConfig, data: unknown, status = 200): AxiosResponse {
  return { data, status, statusText: "OK", headers: {}, config };
}

/**
 * Axios adapter that answers from fixtures instead of the network.
 * GETs return fixture data; writes succeed and echo the payload back.
 */
export const mockAdapter: AxiosAdapter = async (config) => {

  const method = (config.method ?? "get").toLowerCase();
  const path = `/${(config.url ?? "").replace(/^https?:\/\/[^/]+/, "").replace(/^\/+/, "").split("?")[0]}`;

  if (method === "get") {
    if (path in getRoutes) return respond(config, getRoutes[path]);
    const dynamic = getDynamic(path);
    if (dynamic !== undefined) return respond(config, dynamic);
    if (path === "/ordens/exportar") return respond(config, new Blob(["mock"]));
    console.warn(`[mock] GET ${path} sem fixture — devolvendo []`);
    return respond(config, []);
  }

  if (path === "/session") {
    return respond(config, { token: "mock-token", role: "ADMIN", id: "usr-admin", name: "Pablo Cruz" });
  }

  let body: unknown = config.data;
  try {
    body = typeof config.data === "string" ? JSON.parse(config.data) : config.data;
  } catch {
    // keep raw body (FormData uploads)
  }
  console.info(`[mock] ${method.toUpperCase()} ${path}`, body);
  return respond(config, { id: `mock-${Date.now()}`, ...(body && typeof body === "object" ? body : {}) });
};
