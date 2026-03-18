export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function verificarAlumno(alumnoRef: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`/api/registro-salida/verificar/${alumnoRef}`);
    return await response.json();
  } catch (error) {
    return { success: false, error: 'Error al conectar con el servidor' };
  }
}

export async function crearRegistro(data: {
  alumno_ref: string;
  fecha: string;
  nombre_tutor: string;
  email_tutor: string;
  telefono_tutor: string;
}): Promise<ApiResponse> {
  try {
    const response = await fetch(`/api/registro-salida/crear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: 'Error al conectar con el servidor' };
  }
}

export async function confirmarRegistro(token: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`/api/registro-salida/confirmar/${token}`);
    return await response.json();
  } catch (error) {
    return { success: false, error: 'Error al conectar con el servidor' };
  }
}

export async function obtenerFechasDisponibles(
  alumnoRef: string,
  mes: number,
  anio: number
): Promise<ApiResponse<string[]>> {
  try {
    const response = await fetch(
      `/api/registro-salida/fechas-disponibles/${alumnoRef}?mes=${mes}&anio=${anio}`
    );
    return await response.json();
  } catch (error) {
    return { success: false, error: 'Error al conectar con el servidor', data: [] };
  }
}
