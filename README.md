# Sistema de Salida Institucional - Instituto Winston Churchill

Sistema web para registro de salida a pie de alumnos.

## 🚀 Características

- **Login con número de control** del alumno
- **Dashboard personalizado** con información del estudiante
- **Calendario interactivo** para seleccionar fechas disponibles
- **Formulario de registro** para datos del tutor
- **Confirmación por email** con Nodemailer
- **Validación de fechas** (no permite duplicados ni fines de semana)

## 🛠️ Tecnologías

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Base de datos:** Supabase (PostgreSQL)
- **Email:** Nodemailer
- **Deployment:** Vercel

## 📦 Instalación Local

```bash
npm install
```

## 🔐 Variables de Entorno

Crear archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
NEXT_PUBLIC_SITE_URL=https://tu-dominio.vercel.app
```

## 🗄️ Base de Datos

Ejecutar el script SQL en Supabase:

```sql
-- Ver archivo database/schema.sql
```

## 🚀 Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 📧 Configuración de Email

El sistema usa Nodemailer con las credenciales configuradas en `src/lib/email.ts`:

- **Email:** avisos_no-replay@winston93.edu.mx
- **SMTP:** Gmail (smtp.gmail.com:587)

## 🏗️ Estructura del Proyecto

```
ssiw/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── registro-salida/
│   │   │       ├── verificar/[alumnoRef]/route.ts
│   │   │       ├── crear/route.ts
│   │   │       ├── confirmar/[token]/route.ts
│   │   │       └── fechas-disponibles/[alumnoRef]/route.ts
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── confirmar/[token]/page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Alert.tsx
│   │   └── registro/
│   │       ├── FormularioRegistro.tsx
│   │       └── CalendarioSelector.tsx
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── email.ts
│   ├── services/
│   │   └── api.ts
│   └── types/
│       └── index.ts
├── database/
│   └── schema.sql
└── package.json
```

## 🎨 Colores Institucionales

- **Primario:** #003366 (Azul oscuro)
- **Secundario:** #6ca82e (Verde)
- **Acento:** #e63946 (Rojo)

## 📝 Flujo del Sistema

1. **Login:** Usuario ingresa número de control (`alumno_ref`)
2. **Dashboard:** Muestra información del alumno
3. **Seleccionar Fecha:** Calendario con fechas disponibles
4. **Formulario:** Captura datos del tutor
5. **Email:** Se envía correo de confirmación
6. **Confirmación:** Usuario hace clic en link del email
7. **Registro Completo:** Fecha bloqueada en calendario

## 🔒 Seguridad

- Validación de datos en cliente y servidor
- Tokens únicos con expiración de 24 horas
- No permite duplicados de registros confirmados
- Constraint de base de datos para integridad

## 📄 Licencia

© 2025 Instituto Winston Churchill
