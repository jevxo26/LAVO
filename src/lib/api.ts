/**
 * Centralized API base URL.
 *
 * - In development: Express serves BOTH Next.js pages AND /api/* routes on the
 *   same port (3000), so relative "/api" is always correct regardless of what
 *   NEXT_PUBLIC_API_URL is set to.
 * - In production (separate backend): set NEXT_PUBLIC_API_URL=https://your-backend.com/api
 */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL &&
  process.env.NEXT_PUBLIC_API_URL !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL
    : "/api";

/** Helper — perform an authenticated fetch using the stored JWT */
export async function authFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("laundrix_token")
      : null;

  return fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
}
