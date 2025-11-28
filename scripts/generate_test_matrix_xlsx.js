const fs = require('fs')
const path = require('path')
const xlsx = require('xlsx')

const mdPath = path.join(__dirname, '..', 'docs', 'TEST_MATRIX.md')
const outPath = path.join(__dirname, '..', 'docs', 'TEST_MATRIX_EXTENDED.xlsx')

if (!fs.existsSync(mdPath)) {
  console.error('No se encontró', mdPath)
  process.exit(1)
}

const raw = fs.readFileSync(mdPath, 'utf8')
const lines = raw.split(/\r?\n/)

// Find indexes of test case headers starting with T-
const headerRegex = /^T-[A-Za-z0-9-]+\b/ // lines that start with T-
const starts = []
for (let i = 0; i < lines.length; i++) {
  if (headerRegex.test(lines[i])) starts.push(i)
}

const blocks = []
for (let k = 0; k < starts.length; k++) {
  const start = starts[k]
  const end = (k + 1 < starts.length) ? starts[k + 1] : lines.length
  const blockLines = lines.slice(start, end)
  blocks.push(blockLines.join('\n'))
}

function extractField(text, label) {
  const re = new RegExp(label + '\\s*:\\s*([\\s\\S]*?)(?=\\n[A-ZÁÉÍÓÚÑÜ][^\\n]*?:|\\nT-|$)', 'i')
  const m = text.match(re)
  if (!m) return ''
  return m[1].trim().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
}

const rows = []
for (const b of blocks) {
  const headerLine = b.split(/\n/)[0]
  const parts = headerLine.split('|')
  const id = parts[0] ? parts[0].trim() : ''
  const areaPart = parts[1] ? parts[1].trim() : ''
  const area = areaPart.replace(/^(Área|Area)\s*:\s*/i, '').trim()

  const pre = extractField(b, 'Precondici') || extractField(b, 'Precondición')
  const pasos = extractField(b, 'Pasos')
  const datos = extractField(b, 'Datos de prueba') || extractField(b, 'Datos de prueba')
  const resultado = extractField(b, 'Resultado esperado')
  const post = extractField(b, 'Postcondición')
  const prioridad = extractField(b, 'Prioridad') || extractField(b, 'Prioridad / Estado') || extractField(b, 'Prioridad / Estado')
  const notas = extractField(b, 'Notas')

  rows.push({ ID: id, Área: area, 'Precondición': pre, Pasos: pasos, 'Datos de prueba': datos, 'Resultado esperado': resultado, 'Postcondición': post, 'Prioridad / Estado': prioridad, Notas: notas })
}

const ws = xlsx.utils.json_to_sheet(rows)
const wb = xlsx.utils.book_new()
xlsx.utils.book_append_sheet(wb, ws, 'Test Matrix')

xlsx.writeFile(wb, outPath)
console.log('Generado', outPath)
