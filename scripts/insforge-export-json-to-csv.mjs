#!/usr/bin/env node
/**
 * Convierte la salida de `insforge db export --format json` en un CSV por tabla.
 * Uso: node scripts/insforge-export-json-to-csv.mjs <export.json> <directorio_salida>
 */
import fs from 'fs';
import path from 'path';

function cell(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') {
    const s = JSON.stringify(v);
    return `"${s.replace(/"/g, '""')}"`;
  }
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows) {
  if (!rows.length) return '';
  const keys = Object.keys(rows[0]);
  const lines = [keys.join(',')];
  for (const row of rows) {
    lines.push(keys.map((k) => cell(row[k])).join(','));
  }
  return lines.join('\n');
}

const [, , inPath, outDir] = process.argv;
if (!inPath || !outDir) {
  console.error(
    'Uso: node scripts/insforge-export-json-to-csv.mjs <export.json> <directorio_salida>'
  );
  process.exit(1);
}

const raw = fs.readFileSync(inPath, 'utf8');
const doc = JSON.parse(raw);
const tables = doc?.data?.tables;
if (!tables || typeof tables !== 'object') {
  console.error('JSON inválido: falta data.tables');
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

for (const [name, t] of Object.entries(tables)) {
  const rows = t?.rows;
  if (!Array.isArray(rows)) continue;
  const csv = toCsv(rows);
  const out = path.join(outDir, `${name}.csv`);
  fs.writeFileSync(out, csv, 'utf8');
  console.error(`OK: ${rows.length} filas → ${out}`);
}
