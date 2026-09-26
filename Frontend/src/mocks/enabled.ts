/** True when running `npm run dev:mock` — the app talks to fixtures, not the API. */
export const MOCK_API = process.env.NEXT_PUBLIC_MOCK_API === "true";
