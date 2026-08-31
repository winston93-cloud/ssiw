export const DIAS_SEMANA_PIE = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
] as const;

export type DiaSemanaPie = (typeof DIAS_SEMANA_PIE)[number]['value'];

export function normalizarDiaSemana(dia: string): DiaSemanaPie | null {
  const d = dia
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (DIAS_SEMANA_PIE.some((x) => x.value === d)) return d as DiaSemanaPie;
  return null;
}

export function diasSemanaNormalizados(dias: string[] | null | undefined): DiaSemanaPie[] {
  if (!dias?.length) return [];
  const out: DiaSemanaPie[] = [];
  for (const d of dias) {
    const n = normalizarDiaSemana(d);
    if (n && !out.includes(n)) out.push(n);
  }
  return out;
}
