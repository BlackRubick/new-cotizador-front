import { get, post, put, del } from '../utils/api'

const STORAGE_KEY = 'app_products'

// Mantener funciones de localStorage como fallback/caché local
function loadProductsFromCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

function saveProductsToCache(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (e) {
    console.error('Error saving to cache:', e)
  }
}

/**
 * Mapea una fila de Excel a un objeto de producto
 * Estructura para la API:
 * - Campos principales: sku, name, description, basePrice, unit, imageUrl
 * - Campos extra en metadata (JSON)
 */
function mapRowToProduct(row) {
  const categoria = row.CATEGORIA || row.categoria || ''
  const marca = row.MARCA || row.marca || ''
  const modelo = row.MODELO || row.modelo || ''
  const descripcion = row['DESCRIPCIÓN'] || row.DESCRIPCION || row.descripcion || ''
  const precioVenta = parseFloat(row['PRECIO VENTA'] || row.precioVenta || 0) || 0
  const unidad = row.UNIDAD || row.unidad || 'PZA'
  
  // Campos principales para la API
  return {
    sku: modelo || `SKU-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    name: descripcion || `${marca} ${modelo}`.trim() || 'Producto sin nombre',
    description: `${marca} ${modelo}`.trim(),
    basePrice: precioVenta,
    unit: unidad,
    imageUrl: null, // Se puede agregar después
    
    // Todos los campos extra en metadata
    metadata: {
      categoria,
      normalizedCategory: normalizeCategory(categoria),
      especialidad: row.ESPECIALIDAD || row.especialidad || '',
      clasificacion: row.CLASIFICACION || row.clasificacion || '',
      para: row.PARA || row.para || '',
      marca,
      modelo,
      descripcion,
      uso: row.USO || row.uso || '',
      unidad,
      proveedor: row.PROVEEDOR || row.proveedor || '',
      uom: row.UOM || row.uom || '',
      priceExw: parseFloat(row['PRICE EXW'] || row.price_exw || row.priceExw || 0) || 0,
      moneda: row.MONEDA || row.moneda || '',
      valorMoneda: parseFloat(row['VALOR MONEDA'] || row.valorMoneda || 0) || 0,
      landenFactor: parseFloat(row['LANDEN FACTOR'] || row.landenFactor || 0) || 0,
      marginFactor: parseFloat(row['MARGIN FACTOR'] || row.marginFactor || 0) || 0,
      compatibilidad: row.COMPATIBILIDAD || row.compatibilidad || '',
      precioVenta
    }
  }
}

/**
 * Mapea un producto de la API al formato usado en el frontend
 */
function mapApiProductToFrontend(apiProduct) {
  const metadata = apiProduct.metadata || {}
  
  return {
    id: apiProduct.sku, // Usar SKU como ID para compatibilidad
    sku: apiProduct.sku,
    categoria: metadata.categoria || '',
    normalizedCategory: metadata.normalizedCategory || normalizeCategory(metadata.categoria || ''),
    especialidad: metadata.especialidad || '',
    clasificacion: metadata.clasificacion || '',
    para: metadata.para || '',
    marca: metadata.marca || '',
    modelo: metadata.modelo || '',
    descripcion: apiProduct.name || metadata.descripcion || '',
    uso: metadata.uso || '',
    unidad: metadata.unidad || apiProduct.unit || '',
    proveedor: metadata.proveedor || '',
    uom: metadata.uom || '',
    priceExw: metadata.priceExw || 0,
    moneda: metadata.moneda || '',
    valorMoneda: metadata.valorMoneda || 0,
    landenFactor: metadata.landenFactor || 0,
    marginFactor: metadata.marginFactor || 0,
    compatibilidad: metadata.compatibilidad || '',
    precioVenta: metadata.precioVenta || apiProduct.basePrice || 0,
    imagen: apiProduct.imageUrl || null,
    raw: metadata
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

/**
 * Crear un producto en la API
 */
export async function createProduct(productData) {
  try {
    // Si recibe datos del frontend (con id, categoria, etc), mapear a formato API
    let apiData
    if (productData.metadata) {
      // Ya está en formato API
      apiData = productData
    } else {
      // Convertir de formato frontend a API
      apiData = mapRowToProduct(productData)
    }
    
    const response = await post('/products', apiData)
    const product = mapApiProductToFrontend(response.data)
    
    // Actualizar caché local
    const cached = loadProductsFromCache()
    cached.unshift(product)
    saveProductsToCache(cached)
    
    return { success: true, data: product }
  } catch (error) {
    console.error('Error creando producto:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Crear múltiples productos en lote (útil para importar Excel)
 */
export async function createProductsBatch(productsData) {
  try {
    // Mapear todos los productos al formato de la API
    const apiProducts = productsData.map(p => {
      if (p.metadata) {
        return p
      } else {
        return mapRowToProduct(p)
      }
    })
    
    const response = await post('/products/batch', { products: apiProducts })
    
    // Recargar la lista de productos
    await listProducts()
    
    return { 
      success: true, 
      data: response.data 
    }
  } catch (error) {
    console.error('Error creando productos en lote:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Actualizar un producto en la API
 */
export async function updateProduct(sku, productData) {
  try {
    // Buscar el ID numérico del producto por SKU
    const products = await listProducts()
    const existing = products.find(p => p.sku === sku || p.id === sku)
    
    if (!existing) {
      return { success: false, error: 'Producto no encontrado' }
    }
    
    // Mapear datos actualizados
    let apiData
    if (productData.metadata) {
      apiData = productData
    } else {
      apiData = mapRowToProduct(productData)
    }
    
    // La API usa ID numérico, no SKU
    const response = await put(`/products/${existing.apiId || existing.id}`, apiData)
    const product = mapApiProductToFrontend(response.data)
    
    // Actualizar caché local
    const cached = loadProductsFromCache()
    const idx = cached.findIndex(x => x.id === sku || x.sku === sku)
    if (idx !== -1) {
      cached[idx] = product
      saveProductsToCache(cached)
    }
    
    return { success: true, data: product }
  } catch (error) {
    console.error('Error actualizando producto:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Eliminar un producto de la API
 */
export async function deleteProduct(sku) {
  try {
    // Buscar el ID numérico del producto por SKU
    const products = await listProducts()
    const existing = products.find(p => p.sku === sku || p.id === sku)
    
    if (!existing) {
      return { success: false, error: 'Producto no encontrado' }
    }
    
    await del(`/products/${existing.apiId || existing.id}`)
    
    // Actualizar caché local
    const cached = loadProductsFromCache()
    const next = cached.filter(x => x.id !== sku && x.sku !== sku)
    saveProductsToCache(next)
    
    return { success: true }
  } catch (error) {
    console.error('Error eliminando producto:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Listar todos los productos desde la API
 */
export async function listProducts() {
  try {
    const response = await get('/products')
    const products = response.data.map(p => ({
      ...mapApiProductToFrontend(p),
      apiId: p.id // Guardar el ID numérico de la API
    }))
    
    // Actualizar caché local
    saveProductsToCache(products)
    
    return products
  } catch (error) {
    console.error('Error listando productos:', error)
    // Si falla la API, usar caché local
    console.warn('Usando productos del caché local')
    return loadProductsFromCache()
  }
}

export default {
  createProduct,
  createProductsBatch,
  updateProduct,
  deleteProduct,
  listProducts,
  mapRowToProduct,
  mapApiProductToFrontend
}
