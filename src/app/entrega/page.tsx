'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EntregaHomePage() {
  const router = useRouter();
  const [maestra, setMaestra] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const maestraData = localStorage.getItem('maestra');
    if (!maestraData) {
      router.push('/entrega/login');
    } else {
      setMaestra(JSON.parse(maestraData));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('maestra');
    router.push('/entrega/login');
  };

  if (!mounted || !maestra) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 p-4">
      {/* Header con nombre de maestra */}
      <div className="absolute top-6 right-6">
        <div className="bg-white rounded-2xl shadow-xl p-4 flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-600">Sesión activa</p>
            <p className="text-lg font-bold text-gray-900">{maestra.nombre}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-xl transition-all"
          >
            Salir
          </button>
        </div>
      </div>

      {/* Logo */}
      <div className="w-32 h-32 bg-white rounded-full mb-8 flex items-center justify-center shadow-2xl">
        <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>

      <h1 className="text-5xl font-black text-white mb-4 text-center drop-shadow-lg">
        Instituto Winston Churchill
      </h1>
      <p className="text-2xl font-bold text-white/90 mb-12 text-center drop-shadow">
        Sistema de Control de Entregas
      </p>

      {/* Tarjeta de Entrega a Pie */}
      <div
        onClick={() => router.push('/entrega/dashboard')}
        className="bg-white rounded-3xl shadow-2xl p-12 w-full max-w-2xl cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-3xl"
      >
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full mx-auto mb-6 flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h2 className="text-4xl font-black text-gray-900 mb-4">
            🚸 Entrega a Pie
          </h2>
          
          <p className="text-xl text-gray-600 mb-8">
            Registre la salida a pie de sus hijos
          </p>

          <div className="flex items-center justify-center text-blue-600">
            <span className="text-2xl font-bold">Iniciar Registro</span>
            <svg className="w-8 h-8 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      <footer className="mt-12 text-white/80 text-center">
        <p className="text-lg">© 2026 Instituto Winston Churchill</p>
      </footer>
    </div>
  );
}
