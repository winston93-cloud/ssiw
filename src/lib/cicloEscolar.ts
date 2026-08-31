import { createDbServiciosAdmin } from '@/lib/insforge'

let cicloCache: { value: number; at: number } | null = null

/** Ciclo escolar vigente (activos en Winston Servicios), con override opcional por env. */
export async function fetchCicloEscolarActual(): Promise<number> {
  const env = process.env.SSIW_CICLO_ESCOLAR?.trim()
  if (env && Number.isFinite(Number(env))) return Number(env)

  if (cicloCache && Date.now() - cicloCache.at < 60_000) return cicloCache.value

  const db = createDbServiciosAdmin()
  const { data } = await db
    .from('alumno')
    .select('alumno_ciclo_escolar')
    .eq('alumno_status', 1)
    .order('alumno_ciclo_escolar', { ascending: false })
    .limit(1)
    .maybeSingle()

  const value = Number(data?.alumno_ciclo_escolar) || 0
  cicloCache = { value, at: Date.now() }
  return value
}
