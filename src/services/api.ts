const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function verificarAlumno(alumnoRef: string) {
  const response = await fetch(`${API_URL}/api/registro-salida/verificar/${alumnoRef}`);
  return response.json();
}

export async function crearRegistro(data: any) {
  const response = await fetch(`${API_URL}/api/registro-salida/registro`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function confirmarRegistro(token: string) {
  const response = await fetch(`${API_URL}/api/registro-salida/confirmar/${token}`);
  return response.json();
}

export async function obtenerFechasDisponibles(alumnoRef: string, mes: number, anio: number) {
  const response = await fetch(
    `${API_URL}/api/registro-salida/fechas/${alumnoRef}?mes=${mes}&anio=${anio}`
  );
  return response.json();
}
