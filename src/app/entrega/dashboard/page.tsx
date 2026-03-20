'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Alumno {
  alumno_ref: string;
  nombre_completo: string;
  grado: string;
  grupo: string;
  tipo_registro: string;
  entregado: boolean;
}

interface DatosDelDia {
  fecha: string;
  dia: string;
  total: number;
  entregados: number;
  pendientes: number;
  alumnos: Alumno[];
}

export default function EntregaDashboardPage() {
  const router = useRouter();
  const [maestra, setMaestra] = useState<any>(null);
  const [datos, setDatos] = useState<DatosDelDia | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [registrando, setRegistrando] = useState<string | null>(null);

  useEffect(() => {
    const maestraData = localStorage.getItem('maestra');
    if (!maestraData) {
      router.push('/entrega/login');
    } else {
      setMaestra(JSON.parse(maestraData));
      cargarAlumnos();
    }
  }, [router]);

  const cargarAlumnos = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/entrega/alumnos-del-dia');
      const data = await response.json();
      if (data.success) {
        setDatos(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEntregar = async (alumno_ref: string) => {
    if (!maestra) return;
    
    if (!confirm('¿Confirmar entrega del alumno?')) return;

    setRegistrando(alumno_ref);
    try {
      const response = await fetch('/api/entrega/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alumno_ref,
          maestra_id: maestra.id,
          maestra_nombre: maestra.nombre
        })
      });

      const data = await response.json();
      if (data.success) {
        await cargarAlumnos();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Error al registrar entrega');
    } finally {
      setRegistrando(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('maestra');
    router.push('/entrega/login');
  };

  const alumnosFiltrados = datos?.alumnos.filter(a =>
    a.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.alumno_ref.includes(busqueda) ||
    `${a.grado}${a.grupo}`.toLowerCase().includes(busqueda.toLowerCase())
  ) || [];

  if (loading || !maestra) {
    return (
      <div className="min-h-screen bg-yellow-400 flex items-center justify-center">
        <div className="text-4xl font-bold text-gray-900">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-300">
      {/* Header con alto contraste */}
      <header className="bg-gray-900 text-white shadow-2xl sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-black">ENTREGA A PIE</h1>
              <p className="text-xl font-semibold text-yellow-300">{maestra.nombre}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl text-lg transition-all"
            >
              Salir
            </button>
          </div>

          {/* Barra de búsqueda */}
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="🔍 Buscar por nombre, matrícula o grado..."
            className="w-full px-6 py-4 text-2xl font-semibold text-gray-900 bg-white rounded-2xl border-4 border-yellow-400 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-300 transition-all"
            autoComplete="off"
          />

          {/* Estadísticas */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-blue-600 rounded-xl p-4 text-center">
              <div className="text-4xl font-black">{datos?.total || 0}</div>
              <div className="text-lg font-bold">Total</div>
            </div>
            <div className="bg-green-600 rounded-xl p-4 text-center">
              <div className="text-4xl font-black">{datos?.entregados || 0}</div>
              <div className="text-lg font-bold">Entregados</div>
            </div>
            <div className="bg-orange-600 rounded-xl p-4 text-center">
              <div className="text-4xl font-black">{datos?.pendientes || 0}</div>
              <div className="text-lg font-bold">Pendientes</div>
            </div>
          </div>
        </div>
      </header>

      {/* Lista de alumnos */}
      <main className="p-6">
        {alumnosFiltrados.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-3xl font-bold text-gray-900">
              {busqueda ? 'Sin resultados' : 'No hay entregas pendientes'}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {alumnosFiltrados.map((alumno) => (
              <div
                key={alumno.alumno_ref}
                className={`bg-white rounded-3xl shadow-xl p-6 transition-all ${
                  alumno.entregado ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="bg-blue-600 text-white font-black text-2xl px-4 py-2 rounded-xl">
                        {alumno.grado}{alumno.grupo}
                      </span>
                      <h3 className="text-3xl font-black text-gray-900">
                        {alumno.nombre_completo}
                      </h3>
                    </div>
                    <p className="text-xl font-bold text-gray-600">
                      Matrícula: {alumno.alumno_ref}
                    </p>
                  </div>

                  {alumno.entregado ? (
                    <div className="bg-green-100 text-green-800 font-black text-2xl px-8 py-4 rounded-2xl border-4 border-green-600">
                      ✓ ENTREGADO
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEntregar(alumno.alumno_ref)}
                      disabled={registrando === alumno.alumno_ref}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-black text-2xl px-12 py-6 rounded-2xl shadow-xl transition-all disabled:opacity-50 border-4 border-green-700"
                    >
                      {registrando === alumno.alumno_ref ? 'Registrando...' : 'ENTREGAR'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
