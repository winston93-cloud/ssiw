/** Fetch con cookie de sesión SSIW (entregas / alumno). */
export function ssiwFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return fetch(input, { credentials: 'include', ...init });
}

export type MaestraSessionData = {
  id: string;
  nombre: string;
};

export type SessionResponse =
  | { success: true; role: 'maestra'; data: MaestraSessionData }
  | { success: true; role: 'alumno'; data: Record<string, unknown> }
  | { success: false; error?: string };

/** Valida cookie `ssiw_session` en servidor. */
export async function fetchSsiwSession(): Promise<SessionResponse | null> {
  try {
    const res = await ssiwFetch('/api/auth/session');
    const data = (await res.json()) as SessionResponse;
    if (!res.ok || !data.success) return null;
    return data;
  } catch {
    return null;
  }
}

export function clearMaestraLocal(): void {
  localStorage.removeItem('maestra');
  localStorage.removeItem('alumno');
}
