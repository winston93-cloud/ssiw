import { createAdminClient, createClient, type InsForgeClient } from '@insforge/sdk'

function requireSsiwPublicEnv() {
  const baseUrl =
    process.env.NEXT_PUBLIC_INSFORGE_URL ?? process.env.INSFORGE_URL
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY
  if (!baseUrl || !anonKey) {
    throw new Error('Faltan NEXT_PUBLIC_INSFORGE_URL / NEXT_PUBLIC_INSFORGE_ANON_KEY')
  }
  return { baseUrl, anonKey }
}

/** Winston-Ssiw (registro_salida_pie, entregas_alumnos). No mover esas tablas. */
export const insforge = createClient(requireSsiwPublicEnv())

let ssiwAdmin: InsForgeClient | null = null

export function createDbSsiwAdmin() {
  const baseUrl =
    process.env.NEXT_PUBLIC_INSFORGE_URL ?? process.env.INSFORGE_URL
  const apiKey =
    process.env.INSFORGE_API_KEY ?? process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY
  if (!baseUrl || !apiKey) {
    throw new Error('Faltan credenciales admin de Winston-Ssiw')
  }
  if (!ssiwAdmin) {
    ssiwAdmin = createAdminClient({ baseUrl, apiKey })
  }
  return ssiwAdmin!.database
}

function requireServiciosAdminEnv() {
  const baseUrl =
    process.env.INSFORGE_SERVICIOS_URL ??
    process.env.NEXT_PUBLIC_INSFORGE_SERVICIOS_URL
  const apiKey = process.env.INSFORGE_SERVICIOS_API_KEY
  if (!baseUrl || !apiKey) {
    throw new Error(
      'Faltan INSFORGE_SERVICIOS_URL e INSFORGE_SERVICIOS_API_KEY (Winston Servicios)'
    )
  }
  return { baseUrl, apiKey }
}

let serviciosAdmin: InsForgeClient | null = null

/** Winston Servicios — alumno / alumno_familiar (reemplazo de MySQL). */
export function createDbServiciosAdmin() {
  if (!serviciosAdmin) {
    serviciosAdmin = createAdminClient(requireServiciosAdminEnv())
  }
  return serviciosAdmin!.database
}

export function nombreCompletoAlumno(alumno: {
  alumno_nombre?: string | null
  alumno_app?: string | null
  alumno_apm?: string | null
  alumno_nombre_completo?: string | null
  nombre_completo?: string | null
} | null): string {
  if (!alumno) return 'Sin nombre'
  const compuesto =
    alumno.alumno_nombre_completo ||
    alumno.nombre_completo ||
    `${alumno.alumno_nombre || ''} ${alumno.alumno_app || ''} ${alumno.alumno_apm || ''}`.trim()
  return compuesto || 'Sin nombre'
}

export async function fetchAlumnoByRef(alumnoRef: string | number) {
  const db = createDbServiciosAdmin()
  const refNum = Number(String(alumnoRef).replace(/\D/g, ''))
  const ref = Number.isFinite(refNum) && refNum > 0 ? refNum : alumnoRef

  const { data, error } = await db
    .from('alumno')
    .select('*')
    .eq('alumno_ref', ref)
    .order('alumno_ciclo_escolar', { ascending: false })
    .limit(1)

  if (error) return { data: null as Record<string, unknown> | null, error: error.message || String(error) }
  const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | null
  return { data: row ?? null, error: null as string | null }
}

export async function fetchAlumnoByIdAndRef(
  alumnoId: number,
  alumnoRef: string | number
) {
  const db = createDbServiciosAdmin()
  const { data, error } = await db
    .from('alumno')
    .select('*')
    .eq('alumno_id', alumnoId)
    .eq('alumno_ref', Number(alumnoRef))
    .limit(1)
    .maybeSingle()

  if (error && (error as { code?: string }).code !== 'PGRST116') {
    return { data: null as Record<string, unknown> | null, error: error.message || String(error) }
  }
  return { data: (data as Record<string, unknown> | null) ?? null, error: null as string | null }
}
