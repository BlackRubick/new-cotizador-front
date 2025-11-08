import React, { useEffect, useState } from 'react'
import productService, { normalizeCategory } from '../services/productService'
import { Upload, FileText, Search, X, Trash2, Package, Wrench, Shirt, Droplet, Laptop, ShoppingCart } from 'lucide-react'
import ProductImage from './ProductImage'
import { useNavigate } from 'react-router-dom'
import { confirmDialog, toastSuccess, toastError, alertInfo, alertSuccess } from '../utils/swal'

export default function ProductManager() {
  const [products, setProducts] = useState([])
  const [importing, setImporting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)

  const categories = [
    { name: 'Todos', icon: Package, gradient: 'from-med-primary to-med-primary-500' },
    { name: 'Refacciones', icon: Wrench, gradient: 'from-purple-500 to-pink-500' },
    { name: 'Accesorios', icon: Shirt, gradient: 'from-orange-500 to-red-500' },
    { name: 'Consumibles', icon: Droplet, gradient: 'from-green-500 to-emerald-500' },
    { name: 'Equipo', icon: Laptop, gradient: 'from-indigo-500 to-purple-500' }
  ]

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const list = productService.listProducts()
    setProducts(list)

    // try to auto-discover images for products that don't have `imagen` set
    let mounted = true
    async function discoverImages() {
      try {
        const candidatesExt = ['png','jpg','jpeg','webp','avif']
        for (const p of list) {
          if (!mounted) break
          if (p.imagen) continue
          // Only use the product model to discover images (per user's request)
          const modelVal = (p.modelo || p.modelo === 0) ? String(p.modelo).trim() : ''
          if (!modelVal) continue
          // If model already contains an extension, try it as-is first
          const cleanRaw = modelVal
          const clean = modelVal.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-\.]/g, '')
          const cleanLower = clean.toLowerCase()
          let found = null
          // try candidate patterns: exact model (maybe with extension), then normalized lower-case with extensions
          // 1) if modelVal already looks like a filename (contains dot), try `/images/${modelVal}`
          if (cleanRaw.includes('.')) {
            const candidate = `/images/${cleanRaw}`
            // eslint-disable-next-line no-await-in-loop
            const ok = await new Promise(r => {
              const img = new Image()
              img.onload = () => r(true)
              img.onerror = () => r(false)
              img.src = candidate
            })
            if (ok) found = candidate
          }
          if (!found) {
            for (const ext of candidatesExt) {
              const candidate = `/images/${cleanLower}.${ext}`
            // test load
              // eslint-disable-next-line no-await-in-loop
              const ok = await new Promise(r => {
                const img = new Image()
                img.onload = () => r(true)
                img.onerror = () => r(false)
                img.src = candidate
              })
              if (ok) { found = candidate; break }
            }
          }
          if (found) {
            try {
              await productService.updateProduct(p.id, { ...p, imagen: found })
            } catch (e) {
              // ignore update errors
            }
          }
        }
        if (mounted) setProducts(productService.listProducts())
      } catch (e) {
        // ignore
      }
    }
    discoverImages()
    return () => { mounted = false }
  }, [])

  const draftActive = typeof window !== 'undefined' && !!sessionStorage.getItem('quote_draft')
  const navigate = useNavigate()

  const [draftCount, setDraftCount] = useState(() => {
    try {
      const raw = sessionStorage.getItem('quote_draft')
      if (!raw) return 0
      const d = JSON.parse(raw)
      return (d && Array.isArray(d.products)) ? d.products.length : 0
    } catch (e) {
      return 0
    }
  })

  async function addProductToDraft(p) {
    try {
      const raw = sessionStorage.getItem('quote_draft')
      if (!raw) {
        await alertInfo('No hay una cotización activa. Abre el formulario de cotización primero.')
        return
      }
      const draft = JSON.parse(raw)
      const rawPrice = Number(p.precioVenta || p.priceExw || 0)
      const priceRounded = parseFloat(Number(rawPrice || 0).toFixed(2))
      draft.products = draft.products || []
      // if the product (by code) already exists in the draft, increment quantity instead of duplicating
      const existingIndex = draft.products.findIndex(item => String(item.code) === String(p.id))
      if (existingIndex >= 0) {
        // update existing item
        const existing = draft.products[existingIndex]
        const newQty = (Number(existing.quantity || 0) + 1)
        draft.products[existingIndex] = {
          ...existing,
          quantity: newQty,
          // keep basePrice but update if price changed
          basePrice: priceRounded
        }
      } else {
        const newItem = {
          id: Date.now(),
          code: p.id,
          name: p.descripcion || `${p.marca || ''} ${p.modelo || ''}`.trim(),
          quantity: 1,
          basePrice: priceRounded
        }
        draft.products.push(newItem)
      }
      sessionStorage.setItem('quote_draft', JSON.stringify(draft))
      setDraftCount(draft.products.length)
      toastSuccess('Producto agregado a la cotización')
    } catch (e) {
      console.error('Error agregando al draft', e)
      toastError('No fue posible agregar el producto a la cotización')
    }
  }

  async function handleImportExcel(file) {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['xlsx','xls'].includes(ext)) {
      await alertInfo('El archivo debe ser .xlsx o .xls')
      return
    }

    setImporting(true)
    try {
      const { read, utils } = await import('xlsx')
      const data = await file.arrayBuffer()
      const workbook = read(data)
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows = utils.sheet_to_json(sheet, { header: 1 })
      if (!rows || rows.length === 0) {
        await alertInfo('No hay filas en el archivo')
        setImporting(false)
        return
      }

      const header = rows[0].map(h => String(h || '').trim())
      const mapped = []
      for (let i = 1; i < rows.length; i++) {
        const r = rows[i]
        if (!r) continue
        const obj = {}
        for (let c = 0; c < header.length; c++) {
          const key = header[c] ? header[c].toString().trim().toUpperCase() : `COL${c}`
          obj[key] = r[c]
        }
        const product = productService.mapRowToProduct(obj)
        mapped.push(product)
      }

      if (mapped.length === 0) {
        await alertInfo('No se encontraron filas válidas para importar')
        setImporting(false)
        return
      }

      if (!(await confirmDialog(`¿Importar ${mapped.length} productos?`))) {
        setImporting(false)
        return
      }

      let success = 0
      let fails = 0
      for (const p of mapped) {
        const res = await productService.createProduct(p)
        if (res.success) success++
        else fails++
        await new Promise(r=>setTimeout(r,100))
      }

      await alertSuccess(`Importación finalizada. Éxitos: ${success}  Errores: ${fails}`)
      setProducts(productService.listProducts())
    } catch (error) {
      await alertInfo('Error al procesar el archivo: ' + error.message)
    } finally {
      setImporting(false)
    }
  }

  async function handleDelete(id) {
    if (!(await confirmDialog('Eliminar producto?'))) return
    productService.deleteProduct(id)
    setProducts(productService.listProducts())
  }

  const filtered = products.filter(p => {
    if (!searchQuery) return true
    return (p.descripcion || p.modelo || p.marca || p.proveedor || p.categoria || '').toString().toLowerCase().includes(searchQuery.toLowerCase())
  })

  const displayed = filtered.filter(p => {
    if (!selectedCategory || selectedCategory === 'Todos') return true
    const norm = p.normalizedCategory || normalizeCategory(p.categoria || (p.raw && p.raw.CATEGORIA) || '')
    return norm === selectedCategory
  })

  // Deduplicate displayed products by id to avoid React key collisions and duplicated UI
  const dedupedDisplayed = (() => {
    try {
      const seen = new Map()
      const duplicates = []
      for (const p of displayed) {
        if (seen.has(p.id)) {
          duplicates.push(p.id)
        } else {
          seen.set(p.id, p)
        }
      }
      if (duplicates.length > 0) {
        console.warn('[ProductManager] Duplicate product ids detected and will be deduplicated in UI:', Array.from(new Set(duplicates)))
      }
      return Array.from(seen.values())
    } catch (e) {
      return displayed
    }
  })()

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-med-primary">Productos</h2>
        </div>
        <div className="flex items-center gap-3">
          <label className={`relative flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm cursor-pointer transition-all ${importing ? 'bg-med-bg-100 text-med-slate-500' : 'bg-med-primary text-white hover:bg-med-primary-500 hover:shadow'}`}>
            <input type="file" accept=".xlsx,.xls" onChange={e=>handleImportExcel(e.target.files?.[0])} className="hidden" disabled={importing} />
            <Upload size={18} />
            <span>{importing ? 'Importando...' : 'Importar Excel'}</span>
          </label>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-med-slate-500" size={20} />
          </div>
          <input className="w-full pl-12 pr-12 py-4 border-2 border-med-bg-100 rounded-xl focus:border-med-primary-500 focus:outline-none transition-all shadow-sm text-med-slate-700" placeholder="Buscar productos por descripción, marca, modelo..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} />
          {searchQuery && (<button onClick={()=>setSearchQuery('')} className="absolute right-4 top-4 text-med-slate-500 hover:text-med-slate-700 transition-colors"><X size={20} /></button>)}
        </div>
      </div>

      {!selectedCategory ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map(cat => {
            const count = products.filter(p => {
              const norm = p.normalizedCategory || normalizeCategory(p.categoria || (p.raw && p.raw.CATEGORIA) || '')
              return cat.name === 'Todos' ? true : norm === cat.name
            }).length
            const Icon = cat.icon
            return (
              <div 
                key={cat.name} 
                onClick={() => setSelectedCategory(cat.name)} 
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden border-2 border-med-bg-100 hover:border-transparent hover:shadow-lg transition-all duration-200"
              >
                <div className={`relative h-40 bg-med-accent flex items-center justify-center overflow-hidden`}>
                  <div className="relative z-10 text-center">
                    <Icon size={48} className="mx-auto mb-3 text-med-primary" strokeWidth={1.5} />
                    <div className="text-med-slate-700">
                      <div className="text-3xl font-semibold mb-1">{count}</div>
                      <div className="text-sm font-medium text-med-slate-500">{count === 1 ? 'producto' : 'productos'}</div>
                    </div>
                  </div>
                </div>
                <div className="p-5 bg-white">
                  <h3 className="text-xl font-bold text-med-slate-700 mb-3 text-center transition-colors">{cat.name}</h3>
                  <button className={`w-full px-4 py-3 bg-med-primary text-white rounded-xl font-semibold hover:bg-med-primary-500 transition-all duration-200`}>
                    Ver {cat.name === 'Todos' ? 'todos' : 'productos'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border">
            <div>
              <button onClick={() => setSelectedCategory(null)} className="text-sm font-medium text-med-primary hover:text-med-primary-500 flex items-center gap-1 mb-2 transition-colors">
                ← Volver a categorías
              </button>
              <h3 className="text-2xl font-bold text-gray-800">{selectedCategory}</h3>
              <p className="text-sm text-gray-600 mt-1">{displayed.length} {displayed.length === 1 ? 'producto encontrado' : 'productos encontrados'}</p>
            </div>
            <button onClick={() => setSelectedCategory('Todos')} className="px-4 py-2 bg-med-primary text-white rounded-lg font-medium hover:bg-med-primary-500 transition-all">
              Ver todos
            </button>
          </div>

          <div>
            {displayed.length === 0 ? (
              <div className="p-12 bg-white rounded-2xl border-2 border-dashed border-gray-300 text-center">
                <Package size={64} className="mx-auto text-med-slate-300 mb-4" />
                <p className="text-med-slate-500 text-lg">No hay productos para esta búsqueda/categoría.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {dedupedDisplayed.map((p, idx) => (
                  <div key={`${p.id}-${idx}`} className="bg-white rounded-xl border hover:shadow-lg transition-shadow overflow-hidden group">
                    <div className="relative h-48 bg-med-accent flex items-center justify-center overflow-hidden">
                      {p.imagen || p.modelo ? (
                        <ProductImage src={p.imagen} model={p.modelo} alt={p.descripcion} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-gray-400">
                          <FileText size={64} strokeWidth={1} />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <button 
                          onClick={()=>handleDelete(p.id)} 
                          className="bg-white/90 backdrop-blur-sm p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-med-danger hover:bg-red-50"
                          title="Eliminar producto"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="mb-2">
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-med-bg-100 text-med-primary rounded-full">
                          {p.categoria}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg mb-1 line-clamp-2">{p.descripcion}</h3>
                      <div className="text-sm text-med-slate-500 space-y-1 mb-3">
                        <p><span className="font-medium">Marca:</span> {p.marca}</p>
                        <p><span className="font-medium">Modelo:</span> {p.modelo}</p>
                        <p><span className="font-medium">Proveedor:</span> {p.proveedor}</p>
                      </div>
                      <div className="pt-3 border-t">
                        <div className="flex items-center justify-between">
                          <p className="text-2xl font-bold text-med-primary">${Number(p.precioVenta || 0).toFixed(2)}</p>
                          {draftActive && (
                            <button onClick={() => addProductToDraft(p)} className="ml-4 px-3 py-2 bg-med-primary text-white rounded-lg font-semibold shadow-md hover:bg-med-primary-500 transition-colors flex items-center gap-2" title="Agregar a la cotización" aria-label="Agregar a la cotización">
                              <ShoppingCart size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {draftCount > 0 && (
        <div className="fixed right-6 bottom-6 z-50">
          <button onClick={() => navigate('/quotes/new')} className="flex items-center gap-3 bg-med-primary text-white px-4 py-3 rounded-full shadow-xl hover:bg-med-primary-500 transition-colors" aria-label="Volver a la cotización">
            <ShoppingCart size={20} />
            <span className="font-semibold">Volver a cotización</span>
            <span className="ml-2 inline-block bg-white text-med-primary rounded-full px-2 py-0.5 text-sm font-medium">{draftCount}</span>
          </button>
        </div>
      )}
    </div>
  )
}