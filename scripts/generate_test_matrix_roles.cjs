const fs = require('fs')
const path = require('path')
const xlsx = require('xlsx')

const mdPath = path.join(__dirname, '..', 'docs', 'TEST_MATRIX.md')
const outPath = path.join(__dirname, '..', 'docs', 'TEST_MATRIX_ROLES.xlsx')

if (!fs.existsSync(mdPath)) {
  console.error('No se encontró', mdPath)
  process.exit(1)
}

const raw = fs.readFileSync(mdPath, 'utf8')
const lines = raw.split(/\r?\n/)

// Find indexes of test case headers starting with T-
const headerRegex = /^T-[A-Za-z0-9-]+\b/
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

function getHeaderInfo(headerLine) {
  const parts = headerLine.split('|')
  const id = parts[0] ? parts[0].trim() : ''
  const areaPart = parts[1] ? parts[1].trim() : ''
  const area = areaPart.replace(/^(Área|Area)\s*:\s*/i, '').trim()
  return { id, area }
}

// Determine role relevance with simple keyword heuristics
// More precise role assignment using explicit keyword -> roles mapping.
function assignRolesForBlock(blockText) {
  const lower = blockText.toLowerCase()

  const mapping = [
    { keywords: ['login', 'iniciar sesión', 'iniciar sesion', 'cerrar sesión', 'logout'], roles: ['jefe','administrador','vendedor'] },
    { keywords: ['navegación','navegacion','menú','menu','ruta','rutas','volver a cotizaciones','volver'], roles: ['jefe','administrador','vendedor'] },
    { keywords: ['clientes','cliente'], roles: ['vendedor','administrador','jefe'] },
    { keywords: ['nueva cotización','nueva cotizacion','crear cotización','crear cotizacion','crear cotizacion','cotización','cotizacion','cotizaciones'], roles: ['vendedor'] },
    { keywords: ['aprobar','aprobación','aprobacion','aprobado'], roles: ['jefe'] },
    { keywords: ['usuario','usuarios','admin','administrador'], roles: ['administrador'] },
    { keywords: ['configur','smtp','plantilla','configuración','configuracion'], roles: ['administrador'] },
    { keywords: ['reporte','report','dashboard','reportes'], roles: ['jefe','administrador'] },
    { keywords: ['enviar por correo','correo','email','enviar por correo electronico'], roles: ['vendedor'] },
    { keywords: ['whatsapp','wa.me','whatsapp web'], roles: ['vendedor'] },
    { keywords: ['productos','producto'], roles: ['vendedor','administrador'] },
    { keywords: ['exportar','export','csv','xlsx'], roles: ['administrador','jefe'] },
    { keywords: ['pdf','visualizar pdf','generar pdf','descargar pdf'], roles: ['vendedor','jefe','administrador'] },
    { keywords: ['validación','validacion','validar'], roles: ['vendedor','administrador'] },
    { keywords: ['xss','sanitiz','<script>'], roles: ['administrador'] },
    { keywords: ['carga','masiva','performance','rendimiento'], roles: ['administrador','jefe'] },
    { keywords: ['encargad','encargados'], roles: ['vendedor','administrador'] },
    { keywords: ['imprimir','print'], roles: ['vendedor','jefe','administrador'] },
    { keywords: ['buscar','buscador','filtrar','filtro'], roles: ['vendedor','administrador','jefe'] }
  ]

  const rolesFound = new Set()
  for (const m of mapping) {
    for (const kw of m.keywords) {
      if (lower.includes(kw)) {
        m.roles.forEach(r => rolesFound.add(r))
        break
      }
    }
  }

  // Fallback: if nothing matched, assign to 'administrador' (superset) to avoid losing tests.
  if (rolesFound.size === 0) {
    rolesFound.add('administrador')
  }

  return Array.from(rolesFound)
}

const roles = ['jefe', 'administrador', 'vendedor']
const sheets = {}
for (const r of roles) sheets[r] = []

for (const b of blocks) {
  const header = b.split('\n')[0]
  const { id, area } = getHeaderInfo(header)
  const pre = extractField(b, 'Precondici') || extractField(b, 'Precondición')
  const pasos = extractField(b, 'Pasos')
  const datos = extractField(b, 'Datos de prueba')
  const resultado = extractField(b, 'Resultado esperado')
  const post = extractField(b, 'Postcondición')
  const prioridad = extractField(b, 'Prioridad') || extractField(b, 'Prioridad / Estado')

  const assignedRoles = assignRolesForBlock(b)
  for (const r of assignedRoles) {
    let roleNote = ''
    if (r === 'jefe' && /aprobar|aprobaci/i.test(b)) roleNote = 'Permiso para aprobar cotizaciones y ver reportes.'
    if (r === 'administrador' && /usuario|usuarios|admin|configur/i.test(b)) roleNote = 'Permiso para gestionar usuarios y configuración.'
    if (r === 'vendedor' && /crear cotizaci|vendedor|enviar por correo|whatsapp/i.test(b)) roleNote = 'Flujos de ventas: crear cotizaciones, enviar por correo y WhatsApp.'

    sheets[r].push({ ID: id, Área: area, 'Precondición': pre, Pasos: pasos, 'Datos de prueba': datos, 'Resultado esperado': resultado, 'Postcondición': post, 'Prioridad / Estado': prioridad, 'Nota rol': roleNote })
  }
}

const wb = xlsx.utils.book_new()
for (const r of roles) {
  const ws = xlsx.utils.json_to_sheet(sheets[r])
  xlsx.utils.book_append_sheet(wb, ws, r.charAt(0).toUpperCase() + r.slice(1))
}

xlsx.writeFile(wb, outPath)
console.log('Generado', outPath)
