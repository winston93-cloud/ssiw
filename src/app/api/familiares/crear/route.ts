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

    console.log('Crear familiar - Body recibido:', body);

    if (!alumno_id || !familiar_nombre) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 1, 0, CURDATE())`,
      [
        alumno_id,
        tutor_id || 0,
        familiar_nombre,
        familiar_app || '',
        familiar_apm || '',
        familiar_tel || '',
        familiar_cel || '',
        familiar_email || ''
      ]
    );

    if (error) {
      console.error('Error MySQL al crear familiar:', error);
      return NextResponse.json(
        { success: false, error: error },
        { status: 500 }
      );
    }

    console.log('Familiar creado exitosamente:', data);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error al crear familiar:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
