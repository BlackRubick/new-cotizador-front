import React from 'react'
import { 
  DollarSign, 
  Calendar, 
  User, 
  Layers, 
  Trash2, 
  Edit3, 
  Eye,
  FileText,
  TrendingUp,
  Clock
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import quoteService from '../services/quoteService'
import { confirmDialog, alertError } from '../utils/swal'

export default function QuoteCard({ quote }) {
  const {
    id,
    clientName,
    razonSocial,
    status = 'pendiente',
    total = 0,
    createdAt,
    seller,
    folio,
    products = []
  } = quote || {}

  const formattedTotal = Number(total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })
  const totalWithIVA = (Number(total || 0) * 1.16).toLocaleString('es-MX', { minimumFractionDigits: 2 })
  const navigate = useNavigate()

  const getStatusStyle = (status) => {
    const statusLower = (status || '').toLowerCase()
    if (statusLower.includes('confirm') || statusLower.includes('aprob') || statusLower.includes('acept')) {
      return {
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500'
      }
    }
    if (statusLower.includes('rechaz') || statusLower.includes('cancel')) {
      return {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
        dot: 'bg-red-500'
      }
    }
    return {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      border: 'border-amber-200',
      dot: 'bg-amber-500'
    }
  }

  const statusStyle = getStatusStyle(status)

  async function handleDelete() {
    if (!(await confirmDialog('¿Eliminar esta cotización? Esta acción no se puede deshacer.'))) return
    const res = await quoteService.deleteQuote(id)
    if (res && res.success) {
      window.location.href = '/quotes'
    } else {
      await alertError('Error al eliminar cotización')
    }
  }

  return (
    <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-white/20 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 overflow-hidden">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 px-6 py-4 border-b-2 border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FileText size={24} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-blue-100 shadow-sm">
                <span className="text-xs font-bold text-blue-600">{products.length || 0}</span>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-1">
                <h3 className="font-bold text-gray-800 text-lg leading-tight truncate">
                  {clientName || razonSocial || `Cotización #${id}`}
                </h3>
              </div>
              
              {razonSocial && clientName && razonSocial !== clientName && (
                <p className="text-sm text-gray-600 truncate">{razonSocial}</p>
              )}
              
              {folio && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-mono font-bold">
                    #{folio}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
            <span className={`w-2 h-2 rounded-full ${statusStyle.dot} animate-pulse`}></span>
            <span className="text-xs font-semibold uppercase">{status}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <User className="text-blue-600" size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Vendedor</div>
              <div className="font-medium text-gray-800 text-sm truncate">{seller || 'Sin asignar'}</div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Calendar className="text-blue-600" size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Fecha</div>
              <div className="font-medium text-gray-800 text-sm">
                {createdAt ? new Date(createdAt).toLocaleDateString('es-MX', { 
                  day: '2-digit', 
                  month: 'short', 
                  year: 'numeric' 
                }) : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Total Section */}
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-5 mb-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full -ml-10 -mb-10"></div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <DollarSign className="text-white" size={20} />
                </div>
                <span className="text-sm font-semibold text-white/90">Total de la Cotización</span>
              </div>
              <TrendingUp className="text-white/60" size={20} />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">${formattedTotal}</span>
                <span className="text-sm text-white/70 font-medium">MXN</span>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-white/20">
                <span className="text-xs text-white/80">Con IVA (16%)</span>
                <span className="text-sm font-bold text-white">${totalWithIVA}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate(`/quotes/${id}`)} 
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg transition-all transform hover:scale-105"
          >
            <Eye size={16} />
            <span className="text-sm">Ver Detalles</span>
          </button>
          
          <button 
            onClick={() => navigate('/quotes/new', { state: { initial: quote } })} 
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-all transform hover:scale-105"
            title="Editar cotización"
          >
            <Edit3 size={16} />
          </button>
          
          <button
            onClick={handleDelete}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-medium hover:shadow-lg transition-all transform hover:scale-105"
            title="Eliminar cotización"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Footer subtle */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Layers size={12} />
            <span>{products.length || 0} {products.length === 1 ? 'producto' : 'productos'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={12} />
            <span>ID: {id}</span>
          </div>
        </div>
      </div>
    </div>
  )
}