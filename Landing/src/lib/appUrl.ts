/*
 * The landing is deployed on its own, apart from the app (Frontend), so
 * links into the app are absolute: NEXT_PUBLIC_APP_URL is the app's origin.
 */
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");

export function appUrl(path: string) {
  return `${APP_URL}${path}`;
}
