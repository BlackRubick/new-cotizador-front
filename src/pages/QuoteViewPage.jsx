import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import MainTemplate from '../templates/MainTemplate'
import quoteService from '../services/quoteService'
import { 
  DollarSign, 
  Calendar, 
  User, 
  Trash2, 
  Edit3, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Package,
  Building2,
  Hash,
  ArrowLeft,
  Download
} from 'lucide-react'
// Product images hidden in Quotes view per user request
import { confirmDialog, alertError } from '../utils/swal'

export default function QuoteViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quote, setQuote] = useState(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      const q = await quoteService.getQuoteById(id)
      if (mounted) setQuote(q)
    }
    load()
    return () => { mounted = false }
  }, [id])

  if (!quote) {
    return (
      <MainTemplate>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full mb-4"></div>
              <div className="h-4 bg-blue-100 rounded w-48"></div>
            </div>
          </div>
        </div>
      </MainTemplate>
    )
  }

  async function handleDelete() {
    if (!(await confirmDialog('¿Eliminar esta cotización? Esta acción no se puede deshacer.'))) return
    const res = await quoteService.deleteQuote(quote.id)
    if (res && res.success) {
      navigate('/quotes')
    } else {
      await alertError('Error al eliminar')
    }
  }

  function handleEdit() {
    navigate('/quotes/new', { state: { initial: quote } })
  }

  async function handleChangeStatus(newStatus) {
    if (!quote) return
    const pretty = newStatus === 'approved' ? 'Aprobada' : newStatus === 'canceled' ? 'Cancelada' : 'Pendiente'
    if (!(await confirmDialog(`Cambiar estado a "${pretty}"?`))) return
    try {
      const res = await quoteService.updateQuote(quote.id, { status: newStatus })
      if (res && res.success) {
        setQuote(res.data)
      } else {
        await alertError('No fue posible actualizar el estado')
      }
    } catch (e) {
      console.error('Error updating status', e)
      await alertError('Error actualizando el estado')
    }
  }

  return (
    <MainTemplate>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6">
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/quotes')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Volver a Cotizaciones
          </button>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-lg">
                <FileText className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Cotización
                </h1>
                <p className="text-gray-600 mt-1 flex items-center gap-3">
                  <span>Folio: {quote.folio || quote.id}</span>
                  <span>· Creada el {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</span>
                  <span>
                    {/* Status badge */}
                    {(() => {
                      const s = quote.status || 'pending'
                      const cls = s === 'approved' ? 'bg-emerald-100 text-emerald-700' : s === 'canceled' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      const label = s === 'approved' ? 'Aprobada' : s === 'canceled' ? 'Cancelada' : 'Pendiente'
                      return (
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${cls}`}>{label}</span>
                      )
                    })()}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handleEdit} 
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 font-medium"
              >
                <Edit3 size={18} />
                Editar
              </button>
              <button 
                onClick={handleDelete} 
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 font-medium"
              >
                <Trash2 size={18} />
                Eliminar
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Client Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="text-blue-600" size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Información del Cliente</h3>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-800 mb-1">
                      {quote.clientName || quote.razonSocial || 'Cliente sin nombre'}
                    </h4>
                    {quote.sellerCompany && (
                      <p className="text-sm text-gray-500">
                        Empresa vendedora: <span className="font-semibold text-gray-700">{quote.sellerCompany}</span>
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quote.clientContact && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-white rounded-lg">
                          <User className="text-blue-600" size={18} />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Contacto</div>
                          <div className="font-medium text-gray-800">{quote.clientContact}</div>
                        </div>
                      </div>
                    )}

                    {quote.email && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-white rounded-lg">
                          <Mail className="text-blue-600" size={18} />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Email</div>
                          <div className="font-medium text-gray-800 break-all">{quote.email}</div>
                        </div>
                      </div>
                    )}

                    {quote.phone && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-white rounded-lg">
                          <Phone className="text-blue-600" size={18} />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Teléfono</div>
                          <div className="font-medium text-gray-800">{quote.phone}</div>
                        </div>
                      </div>
                    )}

                    {quote.clientAddress && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                        <div className="p-2 bg-white rounded-lg">
                          <MapPin className="text-blue-600" size={18} />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Dirección</div>
                          <div className="font-medium text-gray-800">{quote.clientAddress}</div>
                        </div>
                      </div>
                    )}
                    <div className="mt-3">
                      <h5 className="text-sm font-semibold">Vendedor</h5>
                      <div className="text-sm text-slate-700">{quote.seller || '—'}</div>
                      <div className="text-xs text-slate-500">{quote.sellerEmail || ''}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="text-blue-600" size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Productos y Servicios </h3>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    {(quote.products || []).length} {(quote.products || []).length === 1 ? 'producto' : 'productos'}
                  </span>
                </div>
              </div>

              <div className="p-6">
                {(quote.products || []).length > 0 ? (
                  <div className="space-y-3">
                    {(quote.products || []).map((p, i) => {
                      const subtotal = Number(p.quantity || 0) * Number(p.basePrice || 0)
                      return (
                        <div 
                          key={p.id || i} 
                          className="group bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-cyan-50 rounded-xl p-4 border-2 border-gray-200 hover:border-blue-300 transition-all duration-300"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start gap-3">
                                <div className="flex items-center justify-center w-16 h-16 bg-white rounded-lg border border-gray-200 group-hover:border-blue-300 transition-colors overflow-hidden">
                                  {/* Imagen ocultada: se muestra solo el índice para mantener el layout */}
                                  <span className="font-bold text-blue-600">#{i + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-bold text-gray-800 text-base mb-1">
                                    {p.name || 'Producto sin nombre'}
                                  </h5>
                                  {p.code && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <Hash size={12} />
                                      <span>Código: {p.code}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-4 mt-2 text-sm">
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-500">Cantidad:</span>
                                      <span className="font-semibold text-gray-700">{p.quantity}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-500">Precio Unit.:</span>
                                      <span className="font-semibold text-gray-700">${Number(p.basePrice || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Subtotal</div>
                              <div className="text-xl font-black text-blue-600">
                                ${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No hay productos en esta cotización</p>
                  </div>
                )}
              </div>
            </div>

            {/* Terms Card */}
            {quote.terms && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-200 rounded-lg">
                      <FileText className="text-gray-600" size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Términos y Condiciones</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 whitespace-pre-wrap">{quote.terms}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Total Card */}
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-2xl p-6 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <DollarSign size={28} />
                    </div>
                    <h3 className="text-xl font-bold">Total de la Cotización</h3>
                  </div>

                  <div className="mb-6">
                    <div className="text-sm text-blue-100 mb-2">Monto Total</div>
                    <div className="text-5xl font-black mb-2">
                      ${Number(quote.total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-blue-100">MXN (Pesos Mexicanos)</div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-white/20">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-100">Subtotal:</span>
                      <span className="font-bold">${Number(quote.total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-100">IVA (16%):</span>
                      <span className="font-bold">${(Number(quote.total || 0) * 0.16).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="h-px bg-white/20 my-2"></div>
                    <div className="flex items-center justify-between text-lg">
                      <span className="font-semibold">Total con IVA:</span>
                      <span className="font-black">${(Number(quote.total || 0) * 1.16).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Date Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="text-blue-600" size={20} />
                  </div>
                  <h3 className="font-bold text-gray-800">Información de Fecha</h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Fecha de Creación</div>
                    <div className="font-bold text-gray-800">
                      {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString('es-MX', { 
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : '—'}
                    </div>
                  </div>
                  
                  {quote.folio && (
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Folio</div>
                      <div className="font-mono font-bold text-blue-600 text-lg">
                        #{quote.folio}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                <h3 className="font-bold text-gray-800 mb-4">Acciones Rápidas</h3>
                <div className="space-y-3">
                  <button 
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg transition-all transform hover:scale-105"
                  >
                    <Download size={18} />
                    Descargar PDF
                  </button>
                  <button 
                    onClick={() => navigator.clipboard.writeText(window.location.href)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    <FileText size={18} />
                    Copiar Enlace
                  </button>
                    <div className="pt-3">
                      <div className="text-sm font-semibold text-gray-500 mb-2">Cambiar Estado</div>
                      <div className="flex gap-2">
                        <button onClick={() => handleChangeStatus('pending')} className="flex-1 px-3 py-2 bg-amber-100 text-amber-800 rounded-lg font-medium hover:opacity-90">Pendiente</button>
                        <button onClick={() => handleChangeStatus('approved')} className="flex-1 px-3 py-2 bg-emerald-100 text-emerald-800 rounded-lg font-medium hover:opacity-90">Aprobada</button>
                        <button onClick={() => handleChangeStatus('canceled')} className="flex-1 px-3 py-2 bg-rose-100 text-rose-800 rounded-lg font-medium hover:opacity-90">Cancelada</button>
                      </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainTemplate>
  )
}