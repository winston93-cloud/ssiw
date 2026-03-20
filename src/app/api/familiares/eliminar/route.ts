import { NextRequest, NextResponse } from 'next/server';
import { queryMySQL } from '@/lib/mysql';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const familiar_id = searchParams.get('familiar_id');

    if (!familiar_id) {
      return NextResponse.json(
        { success: false, error: 'Falta familiar_id' },
        { status: 400 }
      );
    }

    const { data } = await queryMySQL(
      'DELETE FROM alumno_familiar WHERE familiar_id = ?',
      [familiar_id]
    );

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error al eliminar familiar:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
