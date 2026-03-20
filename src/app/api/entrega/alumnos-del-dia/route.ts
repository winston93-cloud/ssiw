import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';

export async function GET(request: NextRequest) {
  try {
    const hoy = new Date();
    const fechaHoy = hoy.toISOString().split('T')[0]; // YYYY-MM-DD
    const diaSemana = hoy.toLocaleDateString('es-MX', { weekday: 'long' }).toLowerCase();

    console.log('Fecha hoy:', fechaHoy, 'Día:', diaSemana);

    // 1. Obtener registros PERMANENTES activos que incluyan el día de hoy
    const { data: permanentes, error: errorPerm } = await insforge.database
      .from('registro_salida_pie')
      .select('*, alumno(*)')
      .eq('tipo_registro', 'permanente')
      .eq('activo', true)
      .contains('dias_semana', [diaSemana]);

    if (errorPerm) {
      console.error('Error permanentes:', errorPerm);
    }

    // 2. Obtener registros EVENTUALES activos que incluyan la fecha de hoy
    const { data: eventuales, error: errorEv } = await insforge.database
      .from('registro_salida_pie')
      .select('*, alumno(*)')
      .eq('tipo_registro', 'eventual')
      .eq('activo', true)
      .contains('fechas_especificas', [fechaHoy]);

    if (errorEv) {
      console.error('Error eventuales:', errorEv);
    }

    // 3. Combinar y eliminar duplicados
    const todosRegistros = [...(permanentes || []), ...(eventuales || [])];
    
    // Eliminar duplicados por alumno_ref
    const registrosUnicos = todosRegistros.reduce((acc, curr) => {
      if (!acc.find((r: any) => r.alumno_ref === curr.alumno_ref)) {
        acc.push(curr);
      }
      return acc;
    }, [] as any[]);

    // 4. Obtener entregas ya realizadas hoy
    const { data: entregasHoy } = await insforge.database
      .from('entregas_alumnos')
      .select('alumno_ref')
      .eq('fecha', fechaHoy);

    const entregados = new Set(entregasHoy?.map((e: any) => e.alumno_ref) || []);

    // 5. Marcar los que ya fueron entregados
    const alumnos = registrosUnicos.map((reg: any) => ({
      alumno_ref: reg.alumno_ref,
      nombre_completo: reg.alumno?.nombre_completo || 'Sin nombre',
      grado: reg.alumno?.grado || '?',
      grupo: reg.alumno?.grupo || '?',
      tipo_registro: reg.tipo_registro,
      entregado: entregados.has(reg.alumno_ref)
    }));

    // 6. Ordenar por grado y nombre
    alumnos.sort((a, b) => {
      const gradoA = parseInt(a.grado) || 0;
      const gradoB = parseInt(b.grado) || 0;
      if (gradoA !== gradoB) return gradoA - gradoB;
      return a.nombre_completo.localeCompare(b.nombre_completo);
    });

    return NextResponse.json({
      success: true,
      fecha: fechaHoy,
      dia: diaSemana,
      total: alumnos.length,
      entregados: alumnos.filter(a => a.entregado).length,
      pendientes: alumnos.filter(a => !a.entregado).length,
      alumnos
    });
  } catch (error: any) {
    console.error('Error al obtener entregas del día:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
