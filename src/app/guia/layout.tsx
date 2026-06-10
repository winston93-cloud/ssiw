import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guía SSIW — Cómo usar el portal',
  description:
    'Tutorial paso a paso para registrar salida a pie en el Sistema de Servicios Integrales Winston del Instituto Winston Churchill.',
  openGraph: {
    title: 'Guía SSIW — Portal Winston Churchill',
    description: 'Aprende a usar el portal de salida a pie en pocos pasos.',
    url: 'https://ssiw.vercel.app/guia',
  },
};

export default function GuiaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
