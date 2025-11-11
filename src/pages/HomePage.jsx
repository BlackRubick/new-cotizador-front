import React, { useMemo, useState, useEffect } from 'react'
import MainTemplate from '../templates/MainTemplate'
import quoteService from '../services/quoteService'
import { 
  Search, 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Activity,
  Award,
  Package,
  Building2,
  Users,
  ArrowLeft,
  Trophy,
  Star,
  ShoppingBag
} from 'lucide-react'

export default function HomePage() {
  const [expandedSection, setExpandedSection] = useState(null)
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadQuotes() {
      try {
        setLoading(true)
        const data = await quoteService.listQuotes()
        setQuotes(data || [])
      } catch (error) {
        console.error('Error loading quotes:', error)
        setQuotes([])
      } finally {
        setLoading(false)
      }
    }
    loadQuotes()
  }, [])

  // Scroll to top whenever the expanded section changes
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.scrollTo) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (e) {
      // ignore in non-browser environments
    }
  }, [expandedSection])

  const stats = useMemo(() => {
    const total = quotes.length
    const confirmadas = quotes.filter(q => (q.status || '').toString().toLowerCase() === 'approved').length
    const pendientes = quotes.filter(q => (q.status || '').toString().toLowerCase() === 'pending').length
    const canceladas = quotes.filter(q => (q.status || '').toString().toLowerCase() === 'canceled').length
    const valorTotal = quotes.reduce((s, q) => s + (Number(q.total) || 0), 0)
    return { total, confirmadas, pendientes, canceladas, valorTotal }
  }, [quotes])

  // Analytics data
  const analytics = useMemo(() => {
    // Mejores vendedores
    const sellerMap = {}
    quotes.forEach(q => {
      const seller = q.seller || 'Sin asignar'
      if (!sellerMap[seller]) {
        sellerMap[seller] = { name: seller, total: 0, count: 0 }
      }
      sellerMap[seller].total += Number(q.total || 0)
      sellerMap[seller].count += 1
    })
    const topSellers = Object.values(sellerMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

    // Productos más vendidos
    const productMap = {}
    quotes.forEach(q => {
      (q.products || []).forEach(p => {
        const key = p.name || 'Sin nombre'
        if (!productMap[key]) {
          productMap[key] = { name: key, quantity: 0, revenue: 0 }
        }
        productMap[key].quantity += Number(p.quantity || 0)
        productMap[key].revenue += Number(p.quantity || 0) * Number(p.basePrice || 0)
      })
    })
    const topProducts = Object.values(productMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)

    // Hospitales principales
    const hospitalMap = {}
    quotes.forEach(q => {
      const hospital = q.clientName || q.razonSocial || 'Sin nombre'
      if (!hospitalMap[hospital]) {
        hospitalMap[hospital] = { name: hospital, total: 0, count: 0 }
      }
      hospitalMap[hospital].total += Number(q.total || 0)
      hospitalMap[hospital].count += 1
    })
    const topHospitals = Object.values(hospitalMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

    // Empresas vendedoras
    const companyMap = {}
    quotes.forEach(q => {
      const company = q.sellerCompany || 'Sin empresa'
      if (!companyMap[company]) {
        companyMap[company] = { name: company, total: 0, count: 0 }
      }
      companyMap[company].total += Number(q.total || 0)
      companyMap[company].count += 1
    })
    const topCompanies = Object.values(companyMap)
      .sort((a, b) => b.total - a.total)

    return { topSellers, topProducts, topHospitals, topCompanies }
  }, [quotes])

  const statCards = [
    {
      title: 'Total Cotizaciones',
      value: stats.total,
      icon: ClipboardList,
      gradient: 'from-med-primary to-med-primary-500',
      bgColor: 'from-med-bg to-med-bg-100',
      iconBg: 'bg-med-bg-100',
      iconColor: 'text-med-primary',
      trend: '+12%'
    },
    {
      title: 'Confirmadas',
      value: stats.confirmadas,
      icon: CheckCircle,
      gradient: 'from-med-success to-med-success',
      bgColor: 'from-med-bg to-med-bg-100',
      iconBg: 'bg-med-bg-100',
      iconColor: 'text-med-success',
      trend: '+8%'
    },
    {
      title: 'Pendientes',
      value: stats.pendientes,
      icon: Clock,
      gradient: 'from-med-warn to-med-warn',
      bgColor: 'from-med-bg to-med-bg-100',
      iconBg: 'bg-med-bg-100',
      iconColor: 'text-med-warn',
      trend: '-3%'
    },
    {
      title: 'Valor Total',
      value: `$${stats.valorTotal.toLocaleString('es-MX')}`,
      icon: DollarSign,
      gradient: 'from-med-primary to-med-primary-500',
      bgColor: 'from-med-bg to-med-bg-100',
      iconBg: 'bg-med-bg-100',
      iconColor: 'text-med-primary',
      trend: '+15%'
    }
  ]

  const analyticsCards = [
    {
      id: 'sellers',
      title: 'Mejores Vendedores',
      icon: Award,
      gradient: 'from-med-primary to-med-primary-500',
      data: analytics.topSellers
    },
    {
      id: 'products',
      title: 'Productos Más Vendidos',
      icon: Package,
      gradient: 'from-med-success to-med-success',
      data: analytics.topProducts
    },
    {
      id: 'hospitals',
      title: 'Principales Clientes',
      icon: Building2,
      gradient: 'from-med-danger to-med-danger',
      data: analytics.topHospitals
    },
    {
      id: 'companies',
      title: 'Empresas Vendedoras',
      icon: Users,
      gradient: 'from-med-warn to-med-warn',
      data: analytics.topCompanies
    }
  ]

  function handleCardClick(cardId) {
    setExpandedSection(expandedSection === cardId ? null : cardId)
  }

  const getMedalColor = (index) => {
    if (index === 0) return 'from-yellow-400 to-yellow-600'
    if (index === 1) return 'from-gray-300 to-gray-500'
    if (index === 2) return 'from-amber-600 to-amber-800'
    return 'from-blue-400 to-blue-600'
  }

  return (
    <MainTemplate>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-3 sm:p-4 md:p-6">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="relative z-10">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4 mb-3">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl sm:rounded-2xl shadow-lg">
                <Activity className="text-white" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-gray-600 mt-1 text-xs sm:text-sm truncate">
                  {loading ? 'Cargando datos...' : `Análisis de ${stats.total} cotizaciones`}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <div className="h-1 w-12 sm:w-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full"></div>
              <div className="h-1 w-12 sm:w-16 bg-gradient-to-r from-cyan-600 to-blue-400 rounded-full"></div>
              <div className="h-1 w-12 sm:w-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"></div>
            </div>
          </div>

          {/* Expanded Section View */}
          {expandedSection && (
            <div className="mb-6 sm:mb-8 animate-slideIn">
              <button
                onClick={() => setExpandedSection(null)}
                className="flex items-center gap-2 mb-4 px-3 sm:px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all text-gray-700 font-medium text-sm sm:text-base"
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">Volver al Dashboard</span>
                <span className="sm:hidden">Volver</span>
              </button>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                {/* Expanded Header */}
                <div className={`bg-gradient-to-r ${analyticsCards.find(c => c.id === expandedSection)?.gradient} p-4 sm:p-6 text-white`}>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 bg-white/20 rounded-xl sm:rounded-2xl backdrop-blur-sm">
                      {React.createElement(analyticsCards.find(c => c.id === expandedSection)?.icon, { size: 24 })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">{analyticsCards.find(c => c.id === expandedSection)?.title}</h2>
                      <p className="text-white/80 mt-1 text-xs sm:text-sm">Análisis detallado</p>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                <div className="p-4 sm:p-6">
                  {expandedSection === 'sellers' && (
                    <div className="space-y-3 sm:space-y-4">
                      {analytics.topSellers.map((seller, index) => (
                        <div key={index} className="group bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-cyan-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border-2 border-gray-200 hover:border-blue-300 transition-all">
                          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                            <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br ${getMedalColor(index)} rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                              {index < 3 ? (
                                <Trophy className="text-white" size={20} />
                              ) : (
                                <span className="text-white font-black text-base sm:text-lg md:text-xl">#{index + 1}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-800 text-sm sm:text-base md:text-lg truncate">{seller.name}</h3>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-xs sm:text-sm">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <ClipboardList size={12} className="text-gray-500 flex-shrink-0" />
                                  <span className="text-gray-600">{seller.count} cotizaciones</span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <DollarSign size={12} className="text-emerald-600 flex-shrink-0" />
                                  <span className="font-semibold text-emerald-600">${seller.total.toLocaleString('es-MX')}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-xs text-gray-500 mb-1">Promedio</div>
                              <div className="text-sm sm:text-base md:text-lg font-bold text-blue-600">
                                ${(seller.total / seller.count).toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {expandedSection === 'products' && (
                    <div className="space-y-3 sm:space-y-4">
                      {analytics.topProducts.map((product, index) => (
                        <div key={index} className="group bg-gradient-to-r from-gray-50 to-gray-100 hover:from-emerald-50 hover:to-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border-2 border-gray-200 hover:border-emerald-300 transition-all">
                          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                            <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br ${getMedalColor(index)} rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                              {index < 3 ? (
                                <Star className="text-white" size={20} />
                              ) : (
                                <span className="text-white font-black text-base sm:text-lg md:text-xl">#{index + 1}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-800 text-sm sm:text-base md:text-lg truncate">{product.name}</h3>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-xs sm:text-sm">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <ShoppingBag size={12} className="text-gray-500 flex-shrink-0" />
                                  <span className="text-gray-600">{product.quantity} unidades</span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <DollarSign size={12} className="text-emerald-600 flex-shrink-0" />
                                  <span className="font-semibold text-emerald-600">${product.revenue.toLocaleString('es-MX')}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {expandedSection === 'hospitals' && (
                    <div className="space-y-3 sm:space-y-4">
                      {analytics.topHospitals.map((hospital, index) => (
                        <div key={index} className="group bg-gradient-to-r from-gray-50 to-gray-100 hover:from-purple-50 hover:to-pink-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border-2 border-gray-200 hover:border-purple-300 transition-all">
                          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                            <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br ${getMedalColor(index)} rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                              {index < 3 ? (
                                <Building2 className="text-white" size={20} />
                              ) : (
                                <span className="text-white font-black text-base sm:text-lg md:text-xl">#{index + 1}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-800 text-sm sm:text-base md:text-lg truncate">{hospital.name}</h3>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-xs sm:text-sm">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <ClipboardList size={12} className="text-gray-500 flex-shrink-0" />
                                  <span className="text-gray-600">{hospital.count} cotizaciones</span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <DollarSign size={12} className="text-purple-600 flex-shrink-0" />
                                  <span className="font-semibold text-purple-600">${hospital.total.toLocaleString('es-MX')}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-xs text-gray-500 mb-1">Promedio</div>
                              <div className="text-sm sm:text-base md:text-lg font-bold text-purple-600">
                                ${(hospital.total / hospital.count).toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {expandedSection === 'companies' && (
                    <div className="space-y-3 sm:space-y-4">
                      {analytics.topCompanies.map((company, index) => (
                        <div key={index} className="group bg-gradient-to-r from-gray-50 to-gray-100 hover:from-amber-50 hover:to-orange-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border-2 border-gray-200 hover:border-amber-300 transition-all">
                          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                            <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br ${getMedalColor(index)} rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                              {index < 3 ? (
                                <Users className="text-white" size={20} />
                              ) : (
                                <span className="text-white font-black text-base sm:text-lg md:text-xl">#{index + 1}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-800 text-sm sm:text-base md:text-lg truncate">{company.name}</h3>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-xs sm:text-sm">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <ClipboardList size={12} className="text-gray-500 flex-shrink-0" />
                                  <span className="text-gray-600">{company.count} cotizaciones</span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <DollarSign size={12} className="text-amber-600 flex-shrink-0" />
                                  <span className="font-semibold text-amber-600">${company.total.toLocaleString('es-MX')}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-xs text-gray-500 mb-1">Promedio</div>
                              <div className="text-sm sm:text-base md:text-lg font-bold text-amber-600">
                                ${(company.total / company.count).toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
                <p className="text-gray-600 font-medium">Cargando datos del dashboard...</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && quotes.length === 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center">
              <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
                <ClipboardList size={48} className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No hay cotizaciones aún</h3>
              <p className="text-gray-600 mb-6">Comienza creando tu primera cotización para ver las estadísticas aquí</p>
              <button 
                onClick={() => window.location.href = '/quotes/new'}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Crear Primera Cotización
              </button>
            </div>
          )}

          {/* Normal Dashboard View */}
          {!expandedSection && !loading && quotes.length > 0 && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                {statCards.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <div
                      key={index}
                      className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                      
                      <div className="relative p-4 sm:p-5 md:p-6">
                        <div className="flex items-start justify-between mb-3 sm:mb-4">
                          <div className={`p-2.5 sm:p-3 md:p-4 ${stat.iconBg} rounded-lg sm:rounded-xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                            <Icon className={stat.iconColor} size={20} />
                          </div>
                          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg">
                            <TrendingUp size={10} />
                            <span className="hidden sm:inline">{stat.trend}</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">
                            {stat.title}
                          </p>
                          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 truncate">
                            {stat.value}
                          </p>
                        </div>

                        <div className="mt-3 sm:mt-4 h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full`}
                            style={{ width: '75%' }}
                          ></div>
                        </div>
                      </div>

                      <div className={`absolute -bottom-6 -right-6 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>
                    </div>
                  )
                })}
              </div>

              {/* Analytics Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                {analyticsCards.map((card) => {
                  const Icon = card.icon
                  return (
                    <div
                      key={card.id}
                      onClick={() => handleCardClick(card.id)}
                      className="group cursor-pointer bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border-2 border-white/20 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                    >
                      <div className={`bg-gradient-to-r ${card.gradient} p-4 sm:p-5 md:p-6 text-white`}>
                        <div className="flex items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                            <div className="p-2 sm:p-2.5 md:p-3 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform flex-shrink-0">
                              <Icon size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base sm:text-lg md:text-xl font-bold truncate">{card.title}</h3>
                              <p className="text-xs sm:text-sm text-white/80 mt-0.5 sm:mt-1">Click para detalles</p>
                            </div>
                          </div>
                          <div className="text-2xl sm:text-3xl font-black opacity-50 flex-shrink-0">
                            {card.data.length}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 sm:p-5 md:p-6">
                        <div className="space-y-2 sm:space-y-3">
                          {card.data.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-lg gap-2">
                              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                <div className={`w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br ${getMedalColor(index)} rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0`}>
                                  {index + 1}
                                </div>
                                <span className="font-medium text-gray-800 truncate text-xs sm:text-sm">{item.name}</span>
                              </div>
                              <div className="font-bold text-gray-700 text-xs sm:text-sm flex-shrink-0">
                                {card.id === 'products' 
                                  ? `${item.quantity} uds.`
                                  : `$${item.total.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`
                                }
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {card.data.length > 3 && (
                          <div className="mt-3 sm:mt-4 text-center">
                            <span className="text-xs sm:text-sm text-blue-600 font-semibold">
                              +{card.data.length - 3} más
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        <style>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-slideIn {
            animation: slideIn 0.3s ease-out;
          }
        `}</style>
      </div>
    </MainTemplate>
  )
}