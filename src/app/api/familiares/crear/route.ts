import { NextRequest, NextResponse } from 'next/server';
import { queryMySQL } from '@/lib/mysql';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      alumno_id,
      tutor_id,
      familiar_nombre,
      familiar_app,
      familiar_apm,
      familiar_tel,
      familiar_cel,
      familiar_email
    } = body;

    if (!alumno_id || !familiar_nombre) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    const fechaHoy = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const { data, error } = await queryMySQL(
      `INSERT INTO alumno_familiar (
        alumno_id,
        tutor_id,
        familiar_nombre,
        familiar_app,
        familiar_apm,
        familiar_tel,
        familiar_cel,
        familiar_email,
        familiar_recibir_email,
        familiar_vive,
        familiar_factura,
        familiar_registro
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        alumno_id,
        tutor_id || 0,
        familiar_nombre,
        familiar_app || '',
        familiar_apm || '',
        familiar_tel || '',
        familiar_cel || '',
        familiar_email || '',
        0,
        1,
        0,
        fechaHoy
      ]
    );

    if (error) {
      return NextResponse.json(
        { success: false, error: error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
