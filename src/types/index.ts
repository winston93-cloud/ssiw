export interface Alumno {
  alumno_id: number;
  alumno_ref: string;
  alumno_app: string | null;
  alumno_apm: string | null;
  alumno_nombre: string | null;
  alumno_nivel: number | null;
  alumno_grado: number | null;
  alumno_grupo: number | null;
  alumno_nombre_completo: string | null;
}

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

export interface RegistroSalidaInput {
  alumno_ref: string;
  fecha: string;
  nombre_tutor: string;
  email_tutor: string;
  telefono_tutor: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
