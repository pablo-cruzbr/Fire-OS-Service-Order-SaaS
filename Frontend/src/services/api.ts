import axios from "axios";
import { getCookie } from "cookies-next";
import { MOCK_API } from "@/mocks/enabled";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// `npm run dev:mock`: answer from fixtures. The condition is a build-time
// constant, so the fixtures are never bundled in a normal build.
if (MOCK_API) {
  api.defaults.adapter = async (config) => (await import("@/mocks/adapter")).mockAdapter(config);
}

// In the browser, attach the session token automatically so components don't
// have to build the Authorization header by hand. Server components still pass
// it explicitly (see lib/serverApi.ts).
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined" && !config.headers.Authorization) {
    const token = getCookie("session");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
