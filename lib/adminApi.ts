/**
 * Admin API helpers — used by admin pages to load/save section data.
 * Auth is handled entirely by NextAuth session cookies (server-side).
 */

export interface AdminValidationError {
  path: string;
  message: string;
}

export class AdminApiError extends Error {
  status: number;
  details?: AdminValidationError[];

  constructor(message: string, status: number, details?: AdminValidationError[]) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
    this.details = details;
  }
}

export async function fetchJsonIfAvailable<T>(url: string): Promise<T | null> {
  const res = await fetch(url);

  if (!res.ok) {
    return null;
  }

  const contentType = res.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return null;
  }

  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function apiGetSection<T>(section: string): Promise<T> {
  const data = await fetchJsonIfAvailable<T>(`/api/admin/${section}`);
  if (data === null) {
    throw new Error(`Failed to load ${section}`);
  }

  return data;
}

export async function apiSaveSection<T>(section: string, data: T): Promise<void> {
  const res = await fetch(`/api/admin/${section}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      // Auth is verified server-side via NextAuth session cookie — no token needed here
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as {
      error?: string;
      details?: AdminValidationError[];
    };
    throw new AdminApiError(
      err.error || `Failed to save ${section}`,
      res.status,
      Array.isArray(err.details) ? err.details : undefined,
    );
  }
}