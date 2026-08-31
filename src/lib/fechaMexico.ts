const TZ_MEXICO = 'America/Mexico_City';

/** Fecha YYYY-MM-DD en zona horaria de México (no UTC). */
export function fechaHoyMexico(date = new Date()): string {
  return date.toLocaleDateString('en-CA', { timeZone: TZ_MEXICO });
}
