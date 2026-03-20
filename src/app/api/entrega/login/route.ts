import { NextRequest, NextResponse } from 'next/server';
import { verificarPIN } from '@/lib/auth-maestras';

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json();

    if (!pin) {
      return NextResponse.json(
        { success: false, error: 'PIN requerido' },
        { status: 400 }
      );
    }

    const resultado = verificarPIN(pin);

    if (resultado.valido) {
      return NextResponse.json({
        success: true,
        maestra: resultado.maestra
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'PIN incorrecto' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { success: false, error: 'Error del servidor' },
      { status: 500 }
    );
  }
}
