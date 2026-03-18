export type NivelEducativo = 'Maternal' | 'Kinder' | 'Primaria' | 'Secundaria';

export const getNivelEducativo = (nivel: number | null): NivelEducativo => {
  switch (nivel) {
    case 1:
      return 'Maternal';
    case 2:
      return 'Kinder';
    case 3:
      return 'Primaria';
    case 4:
      return 'Secundaria';
    default:
      return 'Primaria';
  }
};

export const formatearFecha = (fecha: Date | string): string => {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return date.toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getNombreCompleto = (
  nombre: string | null,
  app: string | null,
  apm: string | null
): string => {
  return [nombre, app, apm].filter(Boolean).join(' ');
};

export const validarTelefono = (telefono: string): boolean => {
  const regex = /^\d{10}$/;
  return regex.test(telefono);
};

export const validarEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};
