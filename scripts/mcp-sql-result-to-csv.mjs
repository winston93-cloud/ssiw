#!/usr/bin/env node
/**
 * Convierte la salida textual de run-raw-sql del MCP InsForge a CSV UTF-8.
 * Uso: node scripts/mcp-sql-result-to-csv.mjs <entrada.txt> <salida.csv>
 */
import fs from 'fs';
import path from 'path';

function parseMcpPayload(raw) {
  const i = raw.indexOf('{');
  if (i === -1) throw new Error('No se encontró JSON en el archivo');
  const j = raw.lastIndexOf('}');
  return JSON.parse(raw.slice(i, j + 1));
}

function extractRows(parsed) {
  const rows = parsed.rows;
  if (!rows?.length) return [];
  if (typeof rows[0]?.blob === 'string') return JSON.parse(rows[0].blob);
  if (Array.isArray(rows[0]?.data)) return rows[0].data;
  return rows;
}

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

const [, , inPath, outPath] = process.argv;
if (!inPath || !outPath) {
  console.error('Uso: node scripts/mcp-sql-result-to-csv.mjs <entrada.txt> <salida.csv>');
  process.exit(1);
}

const raw = fs.readFileSync(inPath, 'utf8');
const parsed = parseMcpPayload(raw);
const rows = extractRows(parsed);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, toCsv(rows), 'utf8');
console.error(`OK: ${rows.length} filas → ${outPath}`);
