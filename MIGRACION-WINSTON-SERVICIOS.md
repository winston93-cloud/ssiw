# Migración InsForge: winston-ssiw → Winston Servicios

Fecha: 2026-09-17  
App: `/home/mario/Proyectos/ssiw` (repo `winston93-cloud/ssiw`, prod `https://ssiw.vercel.app`)  
`servicios_admin` solo hace SSO handoff a SSIW; **no** contiene el código de entrega a pie.

## Origen / destino

| | Proyecto InsForge | App key |
|--|--|--|
| Antes | winston-ssiw | `xkeq76zc` |
| Ahora | Winston Servicios | `g4ta4bfg` |

## Tablas migradas (conteos al corte)

| Tabla | Filas | Notas |
|--|--:|--|
| `registro_salida_pie` | 135 | IDs preservados (max 259); seq ajustada |
| `entregas_alumnos` | 1168 | IDs preservados (max 1197); seq ajustada |

No migrado (no lo usa SSIW en código): `sat_formas_pago`, `sat_metodos_pago`, `becario_bitacora` (0), buckets vacíos.

## Cutover app

1. Local `.env.local` y `.env.example` apuntan a `g4ta4bfg`.
2. **Vercel:** hecho 2026-09-17 (`scripts/setup-winston-vercel-env.mjs`) — envs production/preview/development + redeploy prod.
3. Smoke en `ssiw.vercel.app`:
   - login entrega / listado del día
   - registro salida a pie (papá)
   - registrar / deshacer entrega
4. Solo entonces eliminar el proyecto InsForge **winston-ssiw**.

## RLS

En Winston, `registro_salida_pie` tiene políticas abiertas equivalentes a las de winston-ssiw (anon/authenticated). `entregas_alumnos` sigue sin RLS (igual que origen).
