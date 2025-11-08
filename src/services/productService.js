const STORAGE_KEY = 'app_products'

function loadProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

function saveProducts(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

function mapRowToProduct(row) {
  // expects normalized keys
  return {
    id: row.id || `P-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    categoria: row.CATEGORIA || row.categoria || '',
    normalizedCategory: normalizeCategory(row.CATEGORIA || row.categoria || ''),
    especialidad: row.ESPECIALIDAD || row.especialidad || '',
    clasificacion: row.CLASIFICACION || row.clasificacion || '',
    para: row.PARA || row.para || '',
    marca: row.MARCA || row.marca || '',
    modelo: row.MODELO || row.modelo || '',
    descripcion: row['DESCRIPCIÓN'] || row.DESCRIPCION || row.descripcion || '',
    uso: row.USO || row.uso || '',
    unidad: row.UNIDAD || row.unidad || '',
    proveedor: row.PROVEEDOR || row.proveedor || '',
    uom: row.UOM || row.uom || '',
  priceExw: parseFloat(row['PRICE EXW'] || row.price_exw || row.priceExw || 0) || 0,
  moneda: row.MONEDA || row.moneda || '',
  valorMoneda: parseFloat(row['VALOR MONEDA'] || row.valorMoneda || 0) || 0,
  landenFactor: parseFloat(row['LANDEN FACTOR'] || row.landenFactor || 0) || 0,
  marginFactor: parseFloat(row['MARGIN FACTOR'] || row.marginFactor || 0) || 0,
    compatibilidad: row.COMPATIBILIDAD || row.compatibilidad || '',
    precioVenta: parseFloat(row['PRECIO VENTA'] || row.precioVenta || 0) || 0,
    raw: row
  }
}

// Normalize incoming category strings into one of the canonical categories
function normalizeCategory(raw) {
  if (!raw) return ''
  const s = String(raw).toLowerCase()
  if (s.includes('refac') || s.includes('refacción') || s.includes('refacciones') || s.includes('refaccion')) return 'Refacciones'
  if (s.includes('acces') || s.includes('accesorio') || s.includes('accesorios')) return 'Accesorios'
  if (s.includes('consum') || s.includes('consumible') || s.includes('consumibles')) return 'Consumibles'
  if (s.includes('equipo') || s.includes('equipos') || s.includes('instrumental')) return 'Equipo'
  // fallback: return capitalized first word
  const first = String(raw).split(/\s+/)[0] || raw
  return String(first).charAt(0).toUpperCase() + String(first).slice(1)
}

export { normalizeCategory }

export async function createProduct(p) {
  const all = loadProducts()
  const prod = { ...p, id: p.id || `P-${Date.now()}` }
  all.unshift(prod)
  saveProducts(all)
  return { success: true, data: prod }
}

export async function updateProduct(id, p) {
  const all = loadProducts()
  const idx = all.findIndex(x => x.id === id)
  if (idx === -1) return { success: false, error: 'not_found' }
  all[idx] = { ...p, id }
  saveProducts(all)
  return { success: true, data: all[idx] }
}

export async function deleteProduct(id) {
  const all = loadProducts()
  const next = all.filter(x => x.id !== id)
  saveProducts(next)
  return { success: true }
}

export function listProducts() {
  const all = loadProducts()
  // ensure normalizedCategory exists for legacy products
  let changed = false
  const next = all.map(p => {
    if (!p.normalizedCategory) {
      const norm = normalizeCategory(p.categoria || (p.raw && p.raw.CATEGORIA) || '')
      changed = true
      return { ...p, normalizedCategory: norm }
    }
    return p
  })
  if (changed) saveProducts(next)
  return next
}

export default {
  createProduct,
  updateProduct,
  deleteProduct,
  listProducts,
  mapRowToProduct
}
