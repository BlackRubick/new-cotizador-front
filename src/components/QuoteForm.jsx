import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import quoteService from '../services/quoteService'
import pdfService from '../services/pdfService'
import clientService from '../services/clientService'
import productService from '../services/productService'
import { Building2, User, Mail, Phone, MapPin, Package, Plus, Trash2, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { alertError } from '../utils/swal'
import { useAuth } from '../contexts/AuthContext'

export default function QuoteForm({ onCreated, initial = null, onUpdated }) {
  const { user } = useAuth()
  const [sellerCompany, setSellerCompany] = useState('')
  const [sellerCompanyId, setSellerCompanyId] = useState('')

  const sellerCompanies = [
    {
      id: 'conduit-life',
      name: 'CONDUIT LIFE',
      fullName: 'Conduit Life S.A. de C.V.',
      address: 'Camino Real a Xochitepec 108 PA, Colonia La Noria Xochimilco, CDMX CP: 16030',
      phone: '+52 961 123 4567',
      email: 'contacto@conduitlife.com',
      website: 'www.conduitlife.com',
      rfc: 'CLI150120328'
    },
    {
      id: 'biosystems-hls',
      name: 'BIOSYSTEMS HLS',
      fullName: 'Biosystems HLS S.A. de C.V.',
      address: 'Camino Real a Xochitepec 108 PA, Colonia La Noria Xochimilco, CDMX CP: 16030',
      rfc: 'BHL130614LQ4'
    },
    {
      id: 'ingenieria-clinica',
      name: 'INGENIERÍA CLÍNICA Y DISEÑO',
      fullName: 'Ingeniería Clínica y Diseño S.A. de C.V.',
      address: 'Viena 68, Colonia Del Carmen, Alcaldía Coyoacán, CP. 04100 CDMX',
      rfc: 'ICD090619J79'
    },
    {
      id: 'escala-biomedica',
      name: 'ESCALA BIOMÉDICA',
      fullName: 'Escala Biomédica S.A. de C.V.',
      address: 'Av. Insurgentes 682 int. 706, Colonia Del Valle Norte, Benito Juárez CP. 03103 CDMX',
      rfc: 'EBI1081216T38'
    }
  ]

  const selectedSeller = sellerCompanies.find(s => s.id === sellerCompanyId) || null
  const [clientName, setClientName] = useState('')
  const [clientContact, setClientContact] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [clients, setClients] = useState([])
  const [selectedClientId, setSelectedClientId] = useState(null)
  const [selectedClientPreview, setSelectedClientPreview] = useState(null)
  const [clientConfirmed, setClientConfirmed] = useState(false)
  const [selectedEncargadoId, setSelectedEncargadoId] = useState(null)
  const [terms, setTerms] = useState('')
  const [products, setProducts] = useState([])
  const [errors, setErrors] = useState({})
  const [availableProducts, setAvailableProducts] = useState([])
  const [selectedProductIdToAdd, setSelectedProductIdToAdd] = useState('')
  const productsSectionRef = useRef(null)

  const total = useMemo(() => {
    return products.reduce((s, p) => s + (Number(p.quantity || 0) * Number(p.basePrice || 0)), 0)
  }, [products])

  function validate() {
    const e = {}
    if (!sellerCompanyId && !sellerCompany) e.sellerCompany = 'Requerido'
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) e.email = 'Email inválido'
    if (!clientName) e.clientName = 'Requerido'
    if (!products || products.length === 0) e.products = 'Agrega al menos un producto'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(ev) {
    ev && ev.preventDefault()
    if (!validate()) return
    const basePayload = {
      clientId: selectedClientId || null,
      sellerCompany,
      sellerCompanyId,
      clientName,
      clientContact,
      email,
      phone,
      clientAddress,
      products,
      total,
      terms
    }

    let res
    if (initial && initial.id) {
      // On update, preserve original creator (do not override seller)
      res = await quoteService.updateQuote(initial.id, basePayload)
      if (res && res.success) {
        onUpdated && onUpdated(res.data)
      } else {
        await alertError('Error actualizando cotización')
      }
    } else {
      const createPayload = {
        ...basePayload,
        seller: user ? (user.name || '') : undefined,
        sellerId: user ? (user.id || undefined) : undefined,
        // capture seller email if available on the auth user
        sellerEmail: user ? (user.email || (user.extra && user.extra.email) || undefined) : undefined
      }
      res = await quoteService.createQuote(createPayload)
      if (res && res.success) {
        // open print window with PDF-ready HTML using the seller template
        try {
          const templateMap = {
            'conduit-life': 'CONDUIT-LIFE.jpeg',
            'biosystems-hls': 'Biosystems-HLS.jpeg',
            'ingenieria-clinica': 'INGENIERIA-CLINICA-DISEÑO.jpeg',
            'escala-biomedica': 'ESCALA-BIOMEDICA.jpeg'
          }
          const tpl = sellerCompanyId ? templateMap[sellerCompanyId] : null
          const templatePath = tpl ? `/plantillas/${tpl}` : null
          // res.data contains created quote with folio
          pdfService.openQuoteInPrintWindow(res.data, selectedSeller || { name: sellerCompany }, { templatePath })
        } catch (e) {
          console.warn('Failed to open quote print window', e)
        }

        setSellerCompany('')
        setSellerCompanyId('')
        setClientName('')
        setClientContact('')
        setEmail('')
        setPhone('')
        setClientAddress('')
        setProducts([])
        setTerms('')
        setErrors({})
        try { sessionStorage.removeItem('quote_draft') } catch (e) {}
        onCreated && onCreated(res.data)
      } else {
        await alertError('Error creando cotización')
      }
    }
  }

  useEffect(() => {
    let mounted = true
    async function loadClients() {
      try {
        const list = await clientService.listClients()
        if (mounted) setClients(list || [])
      } catch (e) {
        console.error('Error loading clients', e)
        if (mounted) setClients([])
      }
    }
    loadClients()
    async function loadProducts() {
      try {
        const p = await productService.listProducts()
        if (mounted) setAvailableProducts(p || [])
      } catch (e) {
        if (mounted) setAvailableProducts([])
      }
    }
    loadProducts()
    return () => { mounted = false }
  }, [])

  // Deduplicate clients by hospital/empresaResponsable to avoid repeated options
  const uniqueClients = useMemo(() => {
    try {
      const map = new Map()
      ;(clients || []).forEach(c => {
        const key = (c.hospital || c.empresaResponsable || c.name || '').toString().trim().toLowerCase() || `id-${c.id}`
        if (!map.has(key)) {
          map.set(key, c)
        }
      })
      return Array.from(map.values())
    } catch (e) {
      console.error('Error deduping clients', e)
      return clients || []
    }
  }, [clients])

  useEffect(() => {
    if (!selectedClientId) {
      setSelectedClientPreview(null)
      setClientConfirmed(false)
      setSelectedEncargadoId(null)
      return
    }
    const c = clients.find(x => x.id === selectedClientId) || null
    setSelectedClientPreview(c)
    setClientConfirmed(false)
    // preselect first encargado if available, but preserve any existing selection restored from draft
    if (c && Array.isArray(c.encargados) && c.encargados.length > 0) {
      try {
        const hasCurrent = selectedEncargadoId != null && c.encargados.some(e => String(e.id) === String(selectedEncargadoId))
        if (!hasCurrent) {
          setSelectedEncargadoId(c.encargados[0].id ?? null)
        }
      } catch (e) {
        setSelectedEncargadoId(c.encargados[0].id ?? null)
      }
    } else {
      setSelectedEncargadoId(null)
    }
  }, [selectedClientId, clients, selectedEncargadoId])

  useEffect(() => {
    if (sellerCompanyId) {
      const s = sellerCompanies.find(x => x.id === sellerCompanyId)
      if (s) setSellerCompany(s.name)
    }
  }, [sellerCompanyId])

  // If logged in user is a vendedor with an assignedCompanyId, force that company
  useEffect(() => {
    try {
      if (user && user.role === 'vendedor' && user.extra && user.extra.assignedCompanyId) {
        const assigned = user.extra.assignedCompanyId
        setSellerCompanyId(assigned)
        const s = sellerCompanies.find(x => x.id === assigned)
        if (s) setSellerCompany(s.name)
      }
    } catch (e) {
      // ignore
    }
  }, [user])

  const navigate = useNavigate()

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('quote_draft')
      const scrollFlag = sessionStorage.getItem('quote_scroll_to_products')
      // only restore draft if we are returning from the Add Products flow
      if (raw && scrollFlag) {
        const draft = JSON.parse(raw)
        if (draft.products) setProducts(draft.products)
        if (draft.clientName) setClientName(draft.clientName)
        if (draft.clientContact) setClientContact(draft.clientContact)
        if (draft.email) setEmail(draft.email)
        if (draft.phone) setPhone(draft.phone)
        if (draft.clientAddress) setClientAddress(draft.clientAddress)
        if (draft.sellerCompanyId) setSellerCompanyId(draft.sellerCompanyId)
        if (draft.sellerCompany) setSellerCompany(draft.sellerCompany)
        // restore selected client/encargado if present
        if (draft.selectedClientId) setSelectedClientId(draft.selectedClientId)
        if (draft.selectedEncargadoId) setSelectedEncargadoId(draft.selectedEncargadoId)
        if (typeof draft.clientConfirmed !== 'undefined') setClientConfirmed(!!draft.clientConfirmed)

        // if we navigated to products and returned, scroll to products section
        try {
          // helper to find nearest scrollable parent
          function findScrollParent(el) {
            let parent = el.parentElement
            while (parent) {
              try {
                const style = window.getComputedStyle(parent)
                const overflowY = style.overflowY
                const isScrollable = (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') && parent.scrollHeight > parent.clientHeight
                if (isScrollable) return parent
              } catch (err) {
                // ignore computed style errors
              }
              parent = parent.parentElement
            }
            return null
          }

          const doScrollAttempt = () => {
            try {
              if (document && document.activeElement && typeof document.activeElement.blur === 'function') {
                try { document.activeElement.blur() } catch (e) {}
              }
              const rect = productsSectionRef.current.getBoundingClientRect()
              const headerOffset = 80 // tweak if you have a fixed header

              const scrollParent = findScrollParent(productsSectionRef.current)
              const candidates = []
              if (scrollParent) candidates.push(scrollParent)
              if (document.scrollingElement) candidates.push(document.scrollingElement)
              const main = document.querySelector('main')
              if (main) candidates.push(main)
              const root = document.getElementById('root')
              if (root) candidates.push(root)
              const app = document.querySelector('.app') || document.querySelector('.app-content')
              if (app) candidates.push(app)

              // de-duplicate candidates
              const uniq = Array.from(new Set(candidates))

              uniq.forEach(c => {
                try {
                  if (c === document.scrollingElement || c === document.documentElement) {
                    const target = window.scrollY + rect.top - headerOffset
                    window.scrollTo({ top: target, behavior: 'smooth' })
                  } else if (c === window) {
                    const target = window.scrollY + rect.top - headerOffset
                    window.scrollTo({ top: target, behavior: 'smooth' })
                  } else {
                    const parentRect = c.getBoundingClientRect()
                    const target = c.scrollTop + (rect.top - parentRect.top) - headerOffset
                    c.scrollTo({ top: target, behavior: 'smooth' })
                  }
                } catch (err) {
                  // ignore per-candidate errors
                }
              })

              // focus the first focusable element in the products section to avoid leftover scroll positions
              try {
                const focusable = productsSectionRef.current.querySelector('input, select, textarea, button')
                if (focusable && typeof focusable.focus === 'function') {
                  focusable.focus()
                }
              } catch (err) {}
            } catch (e) {
              try { productsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }) } catch (err) { productsSectionRef.current.scrollIntoView() }
            }
          }

          // Try several times because the layout may still be rendering after navigation
          setTimeout(doScrollAttempt, 120)
          setTimeout(doScrollAttempt, 420)
          setTimeout(doScrollAttempt, 900)

          sessionStorage.removeItem('quote_scroll_to_products')
        } catch (e) {
          // ignore
        }
      } else {
        // Not returning from Add Products flow — clear any saved draft so the form resets
        try {
          sessionStorage.removeItem('quote_draft')
          sessionStorage.removeItem('quote_scroll_to_products')
        } catch (err) {}
      }
    } catch (e) {
      console.warn('No draft found or invalid draft', e)
    }
  }, [])

  // If `initial` prop is provided (edit mode), load it into state
  useEffect(() => {
    if (!initial) return
    try {
      setSellerCompany(initial.sellerCompany || '')
      setSellerCompanyId(initial.sellerCompanyId || '')
      setClientName(initial.clientName || '')
      setClientContact(initial.clientContact || '')
      setEmail(initial.email || '')
      setPhone(initial.phone || '')
      setClientAddress(initial.clientAddress || '')
      setProducts(initial.products || [])
      setTerms(initial.terms || '')
      setSelectedClientId(initial.clientId || null)
    } catch (e) {
      console.warn('Failed to load initial quote into form', e)
    }
  }, [initial])

  function handleConfirmClient() {
    if (!selectedClientPreview) return
    setClientName(selectedClientPreview.hospital || selectedClientPreview.empresaResponsable || selectedClientPreview.name || '')
    // if multiple encargados, use the selectedEncargadoId to pick the encargado
    const encargadosList = Array.isArray(selectedClientPreview.encargados) ? selectedClientPreview.encargados : []
    let chosen = encargadosList.length > 0 ? encargadosList[0] : null
    if (encargadosList.length > 1 && selectedEncargadoId != null) {
      const found = encargadosList.find(e => e.id === selectedEncargadoId)
      if (found) chosen = found
    }
    setClientContact(chosen ? (chosen.nombre || '') : '')
    setEmail(chosen ? (chosen.email || selectedClientPreview.email || '') : (selectedClientPreview.email || ''))
    setPhone(chosen ? (chosen.telefono || selectedClientPreview.phone || '') : (selectedClientPreview.phone || ''))
    setClientAddress(selectedClientPreview.direccion || selectedClientPreview.street || '')
    setClientConfirmed(true)
  }

  function handleEditClient() {
    if (!selectedClientId) return
    navigate(`/clients/${selectedClientId}/edit`)
  }

  function addProduct() {
    if (selectedProductIdToAdd) {
      const p = availableProducts.find(x => x.id === selectedProductIdToAdd)
      if (p) {
        const rawPrice = Number(p.precioVenta || p.priceExw || 0)
        const priceRounded = parseFloat(rawPrice.toFixed(2))
        setProducts(prev => {
          const draftProducts = Array.isArray(prev) ? [...prev] : []
          const idx = draftProducts.findIndex(it => String(it.code) === String(p.id))
          if (idx >= 0) {
            const existing = draftProducts[idx]
            draftProducts[idx] = { ...existing, quantity: Number(existing.quantity || 0) + 1, basePrice: priceRounded }
          } else {
            draftProducts.push({ id: Date.now(), code: p.id, name: p.descripcion || `${p.marca || ''} ${p.modelo || ''}`.trim(), quantity: 1, basePrice: priceRounded })
          }
          return draftProducts
        })
        setSelectedProductIdToAdd('')
        return
      }
    }
    setProducts(prev => [...prev, { id: Date.now(), code: '', name: '', quantity: 1, basePrice: 0 }])
  }

  function updateProduct(idx, changes) {
    setProducts(prev => prev.map((p, i) => i === idx ? { ...p, ...changes } : p))
  }

  function removeProduct(idx) {
    setProducts(prev => prev.filter((_, i) => i !== idx))
  }

  function clearForm() {
    setSellerCompany('')
    setSellerCompanyId('')
    setClientName('')
    setClientContact('')
    setEmail('')
    setPhone('')
    setClientAddress('')
    setProducts([])
    setTerms('')
    setErrors({})
    try { sessionStorage.removeItem('quote_draft') } catch (e) {}
  }


  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-med-primary to-med-primary-500 px-6 py-5">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <FileText size={28} />
          Nueva Cotización
        </h3>
        <p className="text-blue-100 text-sm mt-1">Complete los datos para generar una cotización</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Sección Empresa Vendedora */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
          <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Building2 size={20} className="text-blue-600" />
            Empresa Vendedora
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Seleccionar empresa</label>
              <select 
                value={sellerCompanyId || ''} 
                onChange={e => setSellerCompanyId(e.target.value || '')} 
                disabled={user && user.role === 'vendedor' && user.extra && user.extra.assignedCompanyId}
                className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 bg-white focus:border-blue-500 focus:outline-none transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <option value="">-- Selecciona la empresa vendedora --</option>
                {sellerCompanies.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {user && user.role === 'vendedor' && user.extra && user.extra.assignedCompanyId ? (
                <p className="text-sm text-slate-500 mt-2">Empresa asignada: {selectedSeller ? selectedSeller.name : user.extra.assignedCompanyId}</p>
              ) : null}
              {errors.sellerCompany && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.sellerCompany}
                </p>
              )}
            </div>

            {selectedSeller && (
              <div className="bg-white rounded-lg p-4 border-2 border-blue-100">
                <div className="font-bold text-slate-800 mb-2">{selectedSeller.fullName || selectedSeller.name}</div>
                <div className="text-sm text-slate-600 space-y-1">
                  <p className="flex items-start gap-2">
                    <MapPin size={14} className="mt-0.5 text-blue-600 flex-shrink-0" />
                    <span>{selectedSeller.address}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Building2 size={14} className="text-blue-600" />
                    RFC: {selectedSeller.rfc}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sección Cliente */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
          <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <User size={20} className="text-blue-600" />
            Información del Cliente
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Cliente existente</label>
              <select 
                value={selectedClientId || ''} 
                onChange={e => setSelectedClientId(e.target.value || null)} 
                className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 bg-white focus:border-blue-500 focus:outline-none transition-colors"
              >
                <option value="">-- Selecciona un cliente existente --</option>
                {uniqueClients.map(c => (
                  <option key={c.id} value={c.id}>{c.hospital || c.empresaResponsable || c.name}</option>
                ))}
              </select>
            </div>

            {selectedClientPreview && (
              <div className="bg-white rounded-lg p-4 border-2 border-emerald-100">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    {/* Mostrar: Hospital (principal), Dependencia (si aplica), luego la empresa propietaria */}
                    <div className="font-bold text-slate-800">{selectedClientPreview.hospital || selectedClientPreview.empresaResponsable || selectedClientPreview.name}</div>
                    {selectedClientPreview.dependencia ? (
                      <div className="text-sm text-slate-600 mt-1">Dependencia: {selectedClientPreview.dependencia}</div>
                    ) : null}
                    <div className="text-sm text-slate-600 mt-1">Empresa: {selectedClientPreview.empresaResponsable || selectedClientPreview.name}</div>
                    <div className="text-sm text-slate-600 mt-1">
                      {Array.isArray(selectedClientPreview.encargados) && selectedClientPreview.encargados.length > 1 ? (
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Seleccionar encargado</label>
                          <select
                            value={selectedEncargadoId || ''}
                            onChange={e => setSelectedEncargadoId(e.target.value ? Number(e.target.value) : null)}
                            className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 bg-white"
                          >
                            <option value="">-- Selecciona encargado --</option>
                            {selectedClientPreview.encargados.map(enc => (
                              <option key={enc.id || enc.nombre} value={enc.id || ''}>
                                {enc.nombre}{enc.cargo ? ` — ${enc.cargo}` : ''}{enc.telefono ? ` — ${enc.telefono}` : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div>
                          Encargado: {selectedClientPreview.encargados && selectedClientPreview.encargados[0] ? selectedClientPreview.encargados[0].nombre : '-'}
                        </div>
                      )}
                    </div>
                  </div>
                  {clientConfirmed ? (
                    <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium flex items-center gap-1">
                      <CheckCircle size={14} /> Confirmado
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium flex items-center gap-1">
                      <AlertCircle size={14} /> Pendiente
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={handleConfirmClient} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                    Confirmar
                  </button>
                  <button type="button" onClick={handleEditClient} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors">
                    Editar
                  </button>
                  <button type="button" onClick={() => { setSelectedClientId(null); setSelectedClientPreview(null); setClientConfirmed(false) }} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors">
                    Limpiar
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <User size={16} className="text-blue-600" />
                  Contacto
                </label>
                <input 
                  value={clientContact} 
                  onChange={e => setClientContact(e.target.value)} 
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors" 
                  placeholder="Nombre del contacto" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Mail size={16} className="text-blue-600" />
                  Email
                </label>
                <input 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors" 
                  placeholder="contacto@cliente.com" 
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Phone size={16} className="text-blue-600" />
                  Teléfono
                </label>
                <input 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors" 
                  placeholder="+52 ..." 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <MapPin size={16} className="text-blue-600" />
                  Dirección
                </label>
                <input 
                  value={clientAddress} 
                  onChange={e => setClientAddress(e.target.value)} 
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors" 
                  placeholder="Dirección del cliente" 
                />
              </div>
            </div>
          </div>
        </div>

  {/* Sección Productos - MEJORADA */}
  <div ref={productsSectionRef} className="bg-slate-50 rounded-xl p-5 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Package size={20} className="text-blue-600" />
              <h4 className="font-bold text-slate-700">Productos y Servicios</h4>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                {products.length} {products.length === 1 ? 'producto' : 'productos'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                const draft = {
                  sellerCompany,
                  sellerCompanyId,
                    clientName,
                    clientContact,
                    email,
                    phone,
                    clientAddress,
                    products,
                    // persist selected client and encargado so returning from products preserves selection
                    selectedClientId,
                    selectedEncargadoId,
                    clientConfirmed
                }
                try {
                  sessionStorage.setItem('quote_draft', JSON.stringify(draft))
                  // flag so when returning to the form we scroll to the products section
                  sessionStorage.setItem('quote_scroll_to_products', '1')
                } catch (e) {
                  console.warn('Failed to save draft', e)
                }
                navigate('/products')
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={18} /> Agregar Productos
            </button>
          </div>

          {errors.products && (
            <p className="text-red-500 text-sm mb-3 flex items-center gap-1 bg-red-50 p-3 rounded-lg">
              <AlertCircle size={14} /> {errors.products}
            </p>
          )}

          {products.length > 0 ? (
            <div className="bg-white rounded-lg border-2 border-slate-200 overflow-hidden">
              {/* Encabezado de la tabla */}
              <div className="bg-gradient-to-r from-slate-700 to-slate-600 text-white">
                <div className="grid grid-cols-12 gap-4 px-5 py-4 font-bold text-sm">
                  <div className="col-span-6">PRODUCTO / DESCRIPCIÓN</div>
                  <div className="col-span-2 text-center">CANTIDAD</div>
                  <div className="col-span-2 text-center">PRECIO UNIT.</div>
                  <div className="col-span-2 text-center">SUBTOTAL</div>
                </div>
              </div>

              {/* Filas de productos */}
              <div className="divide-y divide-slate-200">
                {products.map((p, idx) => {
                  const subtotal = (Number(p.quantity || 0) * Number(p.basePrice || 0))
                  return (
                    <div key={p.id} className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-slate-50 transition-colors">
                      <div className="col-span-6">
                        <div className="text-sm font-semibold text-slate-800">
                          {p.name || p.descripcion || 'Sin nombre'}
                        </div>
                        {p.code && (
                          <div className="text-xs text-slate-500 mt-1">
                            Código: {p.code}
                          </div>
                        )}
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-center focus:border-blue-500 focus:outline-none transition-colors"
                          value={p.quantity}
                          min="1"
                          onChange={e => updateProduct(idx, { quantity: Number(e.target.value) })}
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-center focus:border-blue-500 focus:outline-none transition-colors"
                          value={p.basePrice}
                          min="0"
                          step="0.01"
                          onChange={e => updateProduct(idx, { basePrice: Number(e.target.value) })}
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-between">
                        <div className="text-sm font-bold text-slate-800">
                          ${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeProduct(idx)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors ml-2"
                          title="Eliminar producto"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Total */}
              <div className="bg-slate-100 border-t-2 border-slate-300">
                <div className="grid grid-cols-12 gap-4 px-5 py-4">
                  <div className="col-span-10 text-right">
                    <span className="text-lg font-bold text-slate-700">TOTAL:</span>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xl font-black text-blue-600 text-center">
                      ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border-2 border-dashed border-slate-300 p-12 text-center">
              <Package size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">No hay productos agregados</p>
              <p className="text-slate-400 text-sm mt-2">
                Haz clic en "Agregar Productos" para comenzar
              </p>
            </div>
          )}
        </div>

        {/* Términos y Total */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Términos / Observaciones</label>
              <textarea 
                value={terms} 
                onChange={e => setTerms(e.target.value)} 
                className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors resize-none" 
                placeholder="Condiciones de pago, entrega, garantías..."
                rows="3"
              />
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center bg-white rounded-xl p-6 border-2 border-blue-200 w-full">
                <div className="text-sm font-semibold text-slate-500 mb-2">Total Estimado</div>
                <div className="text-4xl font-black text-blue-600">${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
                <div className="text-xs text-slate-500 mt-2">MXN</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-slate-50 px-6 py-4 border-t-2 border-slate-200 flex justify-end gap-3">
        <button 
          type="button" 
          onClick={clearForm} 
          className="px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
        >
          Limpiar
        </button>
        <button 
          type="submit" 
    className="px-6 py-3 bg-gradient-to-r from-med-primary to-med-primary-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105"
        >
          {initial ? 'Actualizar Cotización' : 'Crear Cotización'}
        </button>
      </div>
    </form>
  )
}