# Proyecto: Sistema de Entrega de Niños - Guía de Desarrollo

## Contexto del Proyecto

Este sistema permite a las maestras registrar la entrega de niños a sus tutores/padres al finalizar el día escolar. Es un sistema de control y seguridad para el Instituto Winston Churchill.

### Relación con SSIW

Este proyecto es **complementario** al sistema SSIW (Sistema de Salida Instituto Winston):
- **SSIW**: Los padres registran días en que pasarán a pie por sus hijos
- **Este proyecto**: Las maestras registran cuando efectivamente entregan al niño

Ambos proyectos comparten:
- La misma base de datos **MySQL** para la tabla `alumno`
- La misma cuenta de **InsForge** para tablas relacionadas
- Arquitectura similar (Next.js + Vercel)

## Stack Tecnológico

- **Frontend/Backend**: Next.js 16.x (App Router)
- **Styling**: CSS Modules / Tailwind CSS
- **Base de datos**: 
  - **MySQL** (hosting externo) - Tabla `alumno`
  - **InsForge PostgreSQL** - Tablas nuevas para entregas
- **Deployment**: Vercel
- **ORM/Client**: 
  - `@insforge/sdk` para InsForge
  - `mysql2/promise` para MySQL

## Configuración de InsForge

### Credenciales del Proyecto SSIW (reutilizables)

```env
# InsForge Configuration
NEXT_PUBLIC_INSFORGE_URL=https://xkeq76zc.us-east.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=ik_ead876e3b0d3842e8f5abcdabdeeeaaa
INSFORGE_PROJECT_ID=eaff450a-6684-4ede-8934-846eb8e46019

# MySQL Configuration (Tabla alumno compartida)
MYSQL_HOST=www.winston93.edu.mx
MYSQL_USER=winston_richard
MYSQL_PASSWORD=101605
MYSQL_DATABASE=winston_general
MYSQL_PORT=3306
```

### Conexión PostgreSQL Directa

```
postgresql://postgres:e72879870b2d241477c59a52e2a6a0b3@xkeq76zc.us-east.database.insforge.app:5432/insforge?sslmode=require
```

## Configuración del CLI de InsForge

### 1. Inicializar el proyecto con InsForge

```bash
# En el directorio raíz del nuevo proyecto
npx @insforge/cli link --project-id eaff450a-6684-4ede-8934-846eb8e46019
```

Esto creará `.insforge/project.json`:
```json
{
  "projectId": "eaff450a-6684-4ede-8934-846eb8e46019"
}
```

### 2. Verificar conexión

```bash
npx @insforge/cli current
```

Deberías ver:
```
✓ Connected to InsForge project: eaff450a-6684-4ede-8934-846eb8e46019
```

### 3. Comandos útiles

```bash
# Ver todas las tablas
npx @insforge/cli db query
# Luego: \dt

# Crear tabla nueva
npx @insforge/cli db query
# Luego pega el CREATE TABLE

# Ver datos
npx @insforge/cli db query
# SELECT * FROM nombre_tabla LIMIT 10;
```

## Estructura de Base de Datos Propuesta

### Tabla: `entrega_alumnos` (InsForge PostgreSQL)

```sql
CREATE TABLE public.entrega_alumnos (
  id BIGSERIAL PRIMARY KEY,
  alumno_ref VARCHAR(50) NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  hora_entrega TIME NOT NULL DEFAULT CURRENT_TIME,
  entregado_a VARCHAR(255) NOT NULL, -- Nombre de quien recoge
  parentesco VARCHAR(100), -- Padre, Madre, Abuelo, etc.
  identificacion VARCHAR(50), -- Número de identificación
  maestra_ref VARCHAR(50) NOT NULL, -- Referencia de la maestra que entrega
  maestra_nombre VARCHAR(255) NOT NULL,
  observaciones TEXT,
  foto_entrega VARCHAR(500), -- URL de foto de InsForge Storage (opcional)
  firma_digital TEXT, -- Firma en base64 (opcional)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_entrega_alumnos_alumno_ref ON entrega_alumnos(alumno_ref);
CREATE INDEX idx_entrega_alumnos_fecha ON entrega_alumnos(fecha);
CREATE INDEX idx_entrega_alumnos_maestra ON entrega_alumnos(maestra_ref);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_entrega_alumnos_updated_at
  BEFORE UPDATE ON entrega_alumnos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Tabla opcional: `maestras` (InsForge PostgreSQL)

```sql
CREATE TABLE public.maestras (
  id BIGSERIAL PRIMARY KEY,
  maestra_ref VARCHAR(50) UNIQUE NOT NULL,
  nombre_completo VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  grado_asignado VARCHAR(50), -- "1A", "2B", etc.
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_maestras_ref ON maestras(maestra_ref);
CREATE INDEX idx_maestras_email ON maestras(email);
```

### RLS Policies (Row Level Security)

```sql
-- Políticas para entrega_alumnos
CREATE POLICY "Allow public select" 
  ON entrega_alumnos 
  FOR SELECT 
  TO anon, authenticated, public
  USING (true);

CREATE POLICY "Allow public insert" 
  ON entrega_alumnos 
  FOR INSERT 
  TO anon, authenticated, public
  WITH CHECK (true);

CREATE POLICY "Allow public update" 
  ON entrega_alumnos 
  FOR UPDATE 
  TO anon, authenticated, public
  USING (true)
  WITH CHECK (true);

-- Permisos en tabla y secuencias
GRANT ALL ON entrega_alumnos TO anon, authenticated, public;
GRANT USAGE, SELECT ON SEQUENCE entrega_alumnos_id_seq TO anon, authenticated, public;
GRANT USAGE ON SCHEMA public TO anon, authenticated, public;

-- Repetir para tabla maestras
GRANT ALL ON maestras TO anon, authenticated, public;
GRANT USAGE, SELECT ON SEQUENCE maestras_id_seq TO anon, authenticated, public;
```

## Configuración del Proyecto Next.js

### 1. Instalar dependencias

```bash
npm install @insforge/sdk mysql2
```

### 2. Archivo `src/lib/insforge.ts`

```typescript
import { createClient } from '@insforge/sdk';

const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_URL!;
const insforgeAnonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!;

export const insforge = createClient({
  baseUrl: insforgeUrl,
  anonKey: insforgeAnonKey
});
```

### 3. Archivo `src/lib/mysql.ts`

```typescript
import mysql from 'mysql2/promise';

export async function queryMySQL(sql: string, params?: any[]) {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'www.winston93.edu.mx',
      user: process.env.MYSQL_USER || 'winston_richard',
      password: process.env.MYSQL_PASSWORD || '101605',
      database: process.env.MYSQL_DATABASE || 'winston_general',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
    });

    const [rows] = await connection.execute(sql, params);
    return { data: rows, error: null };
  } catch (error: any) {
    console.error('MySQL Error:', error);
    return { data: null, error: error.message };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
```

### 4. Archivo `.env.local`

```env
# InsForge Configuration
NEXT_PUBLIC_INSFORGE_URL=https://xkeq76zc.us-east.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=ik_ead876e3b0d3842e8f5abcdabdeeeaaa
INSFORGE_PROJECT_ID=eaff450a-6684-4ede-8934-846eb8e46019

# MySQL Configuration
MYSQL_HOST=www.winston93.edu.mx
MYSQL_USER=winston_richard
MYSQL_PASSWORD=101605
MYSQL_DATABASE=winston_general
MYSQL_PORT=3306

# Next.js
NEXT_PUBLIC_SITE_URL=https://tu-proyecto.vercel.app
```

## Ejemplos de API Routes

### POST `/api/entregas/registrar`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';
import { queryMySQL } from '@/lib/mysql';

export async function POST(request: NextRequest) {
  try {
    const { 
      alumno_ref, 
      entregado_a, 
      parentesco,
      identificacion,
      maestra_ref,
      maestra_nombre,
      observaciones 
    } = await request.json();

    // Validar que el alumno existe
    const { data: alumno } = await queryMySQL(
      'SELECT * FROM alumno WHERE alumno_ref = ?',
      [alumno_ref]
    );

    if (!alumno || alumno.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Alumno no encontrado' },
        { status: 404 }
      );
    }

    // Registrar entrega
    const { data, error } = await insforge.database
      .from('entrega_alumnos')
      .insert({
        alumno_ref,
        entregado_a,
        parentesco,
        identificacion,
        maestra_ref,
        maestra_nombre,
        observaciones
      })
      .select();

    if (error) {
      console.error('Error al registrar entrega:', error);
      return NextResponse.json(
        { success: false, error: 'Error al registrar entrega' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

### GET `/api/entregas/hoy`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';

export async function GET(request: NextRequest) {
  try {
    const hoy = new Date().toISOString().split('T')[0];

    const { data, error } = await insforge.database
      .from('entrega_alumnos')
      .select('*')
      .eq('fecha', hoy)
      .order('hora_entrega', { ascending: false });

    if (error) {
      console.error('Error:', error);
      return NextResponse.json(
        { success: false, error: 'Error al obtener entregas' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

### GET `/api/entregas/alumno/[alumnoRef]`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';
import { queryMySQL } from '@/lib/mysql';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ alumnoRef: string }> }
) {
  try {
    const { alumnoRef } = await params;

    // Obtener datos del alumno desde MySQL
    const { data: alumno } = await queryMySQL(
      'SELECT * FROM alumno WHERE alumno_ref = ?',
      [alumnoRef]
    );

    if (!alumno || alumno.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Alumno no encontrado' },
        { status: 404 }
      );
    }

    // Obtener historial de entregas desde InsForge
    const { data: entregas, error } = await insforge.database
      .from('entrega_alumnos')
      .select('*')
      .eq('alumno_ref', alumnoRef)
      .order('fecha', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Error:', error);
      return NextResponse.json(
        { success: false, error: 'Error al obtener historial' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      alumno: alumno[0],
      entregas: entregas || []
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

## Flujo de Trabajo Recomendado

### Para la Maestra:

1. **Login** con email/contraseña (tabla `maestras`)
2. **Vista principal**: Lista de alumnos de su grado
3. **Seleccionar alumno**: 
   - Escanear código QR (opcional)
   - Buscar por nombre
   - Buscar por número de lista
4. **Formulario de entrega**:
   - Nombre de quien recoge (autocompletado con tutores registrados)
   - Parentesco
   - Identificación
   - Observaciones (opcional)
   - Foto (opcional, usando InsForge Storage)
   - Firma digital (opcional)
5. **Confirmar entrega**: Guarda en `entrega_alumnos`
6. **Historial del día**: Ver todas las entregas realizadas

### Para Administración:

1. **Dashboard**: 
   - Total de entregas del día
   - Alumnos pendientes de entregar
   - Historial por fecha
2. **Reportes**:
   - Entregas por maestra
   - Entregas por grado
   - Alumnos recogidos fuera de horario
   - Personas no autorizadas (cruza con tutores registrados)

## Deployment en Vercel

### 1. Configurar variables de entorno

En Vercel → Tu Proyecto → Settings → Environment Variables:

```
NEXT_PUBLIC_INSFORGE_URL=https://xkeq76zc.us-east.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=ik_ead876e3b0d3842e8f5abcdabdeeeaaa
INSFORGE_PROJECT_ID=eaff450a-6684-4ede-8934-846eb8e46019

MYSQL_HOST=www.winston93.edu.mx
MYSQL_USER=winston_richard
MYSQL_PASSWORD=101605
MYSQL_DATABASE=winston_general
MYSQL_PORT=3306

NEXT_PUBLIC_SITE_URL=https://entregas.vercel.app
```

### 2. Deploy

```bash
# Conectar con Vercel
vercel

# O push a GitHub (si está conectado)
git push origin main
```

## Integración con SSIW (Opcional)

Puedes crear un endpoint que verifique si un alumno tiene registro de salida a pie para el día actual:

```typescript
// GET /api/entregas/verificar-salida-pie/[alumnoRef]
import { insforge } from '@/lib/insforge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ alumnoRef: string }> }
) {
  const { alumnoRef } = await params;
  const hoy = new Date().toISOString().split('T')[0];
  const diaSemana = new Date().toLocaleDateString('es-MX', { weekday: 'long' }).toLowerCase();

  // Verificar si tiene registro permanente para hoy
  const { data: permanente } = await insforge.database
    .from('registro_salida_pie')
    .select('*')
    .eq('alumno_ref', alumnoRef)
    .eq('tipo_registro', 'permanente')
    .eq('activo', true)
    .single();

  const tieneSalidaPie = permanente?.dias_semana?.includes(diaSemana);

  // Verificar si tiene registro eventual para hoy
  const { data: eventual } = await insforge.database
    .from('registro_salida_pie')
    .select('*')
    .eq('alumno_ref', alumnoRef)
    .eq('tipo_registro', 'eventual')
    .eq('activo', true)
    .contains('fechas_especificas', [hoy]);

  return NextResponse.json({
    success: true,
    salida_pie: tieneSalidaPie || (eventual && eventual.length > 0),
    tipo: permanente ? 'permanente' : eventual ? 'eventual' : null
  });
}
```

## Troubleshooting Común

### Error: `permission denied for sequence`

```sql
GRANT USAGE, SELECT ON SEQUENCE entrega_alumnos_id_seq TO anon, authenticated, public;
```

### Error: `Property 'from' does not exist`

Usar: `insforge.database.from('tabla')` NO `insforge.from('tabla')`

### Error: Conexión MySQL timeout

Verificar que las credenciales sean correctas y que el servidor MySQL permita conexiones desde Vercel.

## Recursos

- **SSIW (proyecto relacionado)**: Lee `INSFORGE.md` en el repo de SSIW
- **InsForge Docs**: https://docs.insforge.dev
- **InsForge Dashboard**: https://insforge.dev
- **Proyecto ID**: `eaff450a-6684-4ede-8934-846eb8e46019`

## Comandos Rápidos

```bash
# Ver proyecto actual
npx @insforge/cli current

# Crear tabla entrega_alumnos
npx @insforge/cli db query
# Pegar el CREATE TABLE de arriba

# Ver registros de hoy
npx @insforge/cli db query
# SELECT * FROM entrega_alumnos WHERE fecha = CURRENT_DATE;

# Contar entregas del mes
npx @insforge/cli db query
# SELECT COUNT(*) FROM entrega_alumnos WHERE fecha >= DATE_TRUNC('month', CURRENT_DATE);
```

---

**Última actualización**: 19 de marzo de 2026  
**Proyecto relacionado**: SSIW (Sistema de Salida Instituto Winston)  
**Framework**: Next.js 16+ (App Router)  
**Deployment**: Vercel  
**Gemelo malvado**: Listo para construir 🔥
