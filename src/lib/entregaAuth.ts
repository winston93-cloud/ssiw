/** Fetch con cookie de sesión SSIW (entregas / alumno). */
export function ssiwFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return fetch(input, { credentials: 'include', ...init });
}

export type MaestraSessionData = {
  id: string;
  nombre: string;
};

export type MaestraSession = {
  success: true;
  role: 'maestra';
  data: MaestraSessionData;
};

export type AlumnoSession = {
  success: true;
  role: 'alumno';
  data: Record<string, unknown>;
};

export type ActiveSession = MaestraSession | AlumnoSession;

export type SessionResponse = ActiveSession | { success: false; error?: string };

/** Valida cookie `ssiw_session` en servidor. */
export async function fetchSsiwSession(): Promise<ActiveSession | null> {
  try {
    const res = await ssiwFetch('/api/auth/session');
    const data = (await res.json()) as SessionResponse;
    if (!res.ok || !data.success) return null;
    return data;
  } catch {
    return null;
  }
}

/** Sesión de maestra auxiliar o null. */
export async function fetchMaestraSession(): Promise<MaestraSessionData | null> {
  const session = await fetchSsiwSession();
  if (!session || session.role !== 'maestra') return null;
  return session.data;
}

export function clearMaestraLocal(): void {
  localStorage.removeItem('maestra');
  localStorage.removeItem('alumno');
}
