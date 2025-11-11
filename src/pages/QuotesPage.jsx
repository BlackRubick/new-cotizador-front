import React, { useEffect, useState } from 'react'
import MainTemplate from '../templates/MainTemplate'
import quoteService from '../services/quoteService'
import QuoteCard from '../components/QuoteCard'
import { useNavigate, useLocation } from 'react-router-dom'
import { Search, X, RefreshCw } from 'lucide-react'

export default function QuotesPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [quotes, setQuotes] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  // Función para cargar cotizaciones
  const loadQuotes = async () => {
    setLoading(true)
    const list = await quoteService.listQuotes()
    setQuotes(list || [])
    setLoading(false)
  }

  // Cargar al montar
  useEffect(() => {
    loadQuotes()
  }, [])

  // Recargar cada vez que se navega a esta ruta (incluyendo con botón atrás)
  useEffect(() => {
    loadQuotes()
  }, [location.pathname, location.key])

  return (
    <MainTemplate>
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Cotizaciones</h1>
            <p className="mt-1 text-sm text-gray-600">Aquí puedes generar y consultar cotizaciones.</p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={loadQuotes}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg shadow transition-colors disabled:opacity-50 text-sm sm:text-base"
              title="Refrescar lista"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refrescar</span>
            </button>
            <button
              onClick={() => navigate('/quotes/new')}
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg shadow hover:shadow-lg transition-shadow text-sm sm:text-base whitespace-nowrap"
            >
              Crear cotización
            </button>
          </div>
        </div>

        {/* Barra de búsqueda mejorada */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-blue-100 shadow-sm">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-5 flex items-center pointer-events-none">
                <Search className="text-blue-500" size={20} />
              </div>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar cotización..."
                className="w-full pl-10 sm:pl-14 pr-12 sm:pr-14 py-3 sm:py-4 text-sm sm:text-base border-2 border-blue-200 rounded-lg sm:rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all bg-white font-medium placeholder:text-gray-400"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors shadow-sm"
                  title="Limpiar búsqueda"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            
            {query && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="text-gray-600">Buscando:</span>
                <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full font-semibold">
                  "{query}"
                </span>
              </div>
            )}
          </div>
        </div>

        { (quotes || []).filter(Boolean).length === 0 ? (
          <div className="p-8 bg-white rounded-xl border border-gray-200 text-center text-gray-600">
            No hay cotizaciones aún. Pulsa "Crear cotización" para crear una.
          </div>
        ) : (
          (() => {
            const qlc = (quotes || []).filter(q => {
              if (!query || String(query).trim() === '') return true
              const s = String(query).toLowerCase()
              const fields = [q.clientName, q.sellerCompany, q.folio, q.seller, q.sellerEmail]
              return fields.some(f => f && String(f).toLowerCase().includes(s))
            })
            return (
              <div>
                {qlc.length === 0 ? (
                  <div className="p-6 bg-white rounded-xl border border-gray-200 text-center text-gray-600">
                    No se encontraron cotizaciones que coincidan con "{query}".
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {qlc.map(q => (
                      <QuoteCard key={q.id || q.folio} quote={q} />
                    ))}
                  </div>
                )}
              </div>
            )
          })()
        )}
      </div>
    </MainTemplate>
  )
}