import React, { useMemo, useState, useEffect } from 'react'
import MainTemplate from '../templates/MainTemplate'
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

  useEffect(() => {
    function load() {
      try {
        const raw = localStorage.getItem('app_quotes')
        setQuotes(raw ? JSON.parse(raw) : [])
      } catch (e) {
        setQuotes([])
      }
    }
    load()
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
    const confirmadas = quotes.filter(q => (q.status || '').toString().toLowerCase().includes('confirm')).length
    const pendientes = quotes.filter(q => (q.status || '').toString().toLowerCase().includes('pendi')).length
    const valorTotal = quotes.reduce((s, q) => s + (Number(q.total) || 0), 0)
    return { total, confirmadas, pendientes, valorTotal }
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

  // Generate sample data (10-12 quotes) and save to localStorage
  function generateSampleData() {
    const sampleSellers = [
      { name: 'Ana López', email: 'ana.lopez@example.com' },
      { name: 'Carlos Ruiz', email: 'carlos.ruiz@example.com' },
      { name: 'María Gómez', email: 'maria.gomez@example.com' },
      { name: 'Luis Fernández', email: 'luis.fernandez@example.com' },
      { name: 'Sofía Martínez', email: 'sofia.martinez@example.com' }
    ]

    const sampleProducts = [
      { code: 'VNT-100', name: 'Ventilador VNT-100', price: 2500 },
      { code: 'MON-200', name: 'Monitor MON-200', price: 1200 },
      { code: 'BOM-50', name: 'Bomba Infusión BOM-50', price: 800 },
      { code: 'ECG-3', name: 'Electrocardiógrafo ECG-3', price: 4500 },
      { code: 'ULS-1', name: 'Ultrasonido ULS-1', price: 9800 }
    ]

    const hospitals = [
      'UMAE Hospital de Gineco Obstetricia N.º 4',
      'Hospital General Central',
      'Clínica Regional Norte',
      'Hospital San José',
      'Centro Médico Santa María'
    ]

    const companies = [
      'CONDUIT LIFE',
      'BIOSYSTEMS HLS',
      'INGENIERÍA CLÍNICA Y DISEÑO',
      'ESCALA BIOMÉDICA'
    ]

    const samples = []
    for (let i = 1; i <= 12; i++) {
      const seller = sampleSellers[i % sampleSellers.length]
      const hospital = hospitals[i % hospitals.length]
      const sellerCompany = companies[i % companies.length]
      const productCount = 1 + (i % 3)
      const products = []
      let total = 0
      for (let j = 0; j < productCount; j++) {
        const p = sampleProducts[(i + j) % sampleProducts.length]
        const qty = 1 + ((i + j) % 5)
        const line = { id: `s-${i}-${j}`, code: p.code, name: p.name, quantity: qty, basePrice: p.price }
        products.push(line)
        total += qty * p.price
      }

      const status = i % 3 === 0 ? 'confirmada' : 'pendiente'

      samples.push({
        id: `sample-${i}`,
        folio: `SAMP${1000 + i}`,
        createdAt: new Date(Date.now() - (i * 86400000)).toISOString(),
        clientName: hospital,
        clientContact: `Contacto ${i}`,
        email: `contacto${i}@${hospital.replace(/\s+/g, '').toLowerCase()}.org`,
        phone: `+52 55 000${1000 + i}`,
        clientAddress: `Calle Falsa ${i}`,
        seller: seller.name,
        sellerEmail: seller.email,
        sellerCompany,
        products,
        total,
        status
      })
    }

    try {
      localStorage.setItem('app_quotes', JSON.stringify(samples))
      setQuotes(samples)
    } catch (e) {
      console.warn('No se pudo guardar datos de prueba', e)
    }
  }

  function clearSampleData() {
    try {
      localStorage.removeItem('app_quotes')
      setQuotes([])
    } catch (e) {
      console.warn('No se pudo borrar datos de prueba', e)
    }
  }

  return (
    <MainTemplate>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="relative z-10">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-lg">
                <Activity className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-gray-600 mt-1">Análisis y métricas de cotizaciones</p>
                <div className="mt-4 flex items-center gap-3">
                  <button onClick={generateSampleData} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Generar datos de prueba</button>
                  <button onClick={clearSampleData} className="px-4 py-2 bg-gray-100 rounded-lg">Borrar datos de prueba</button>
                  <span className="text-sm text-gray-500">(crea 12 cotizaciones de muestra para visualizar)</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full"></div>
              <div className="h-1 w-16 bg-gradient-to-r from-cyan-600 to-blue-400 rounded-full"></div>
              <div className="h-1 w-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"></div>
            </div>
          </div>

          {/* Expanded Section View */}
          {expandedSection && (
            <div className="mb-8 animate-slideIn">
              <button
                onClick={() => setExpandedSection(null)}
                className="flex items-center gap-2 mb-4 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all text-gray-700 font-medium"
              >
                <ArrowLeft size={20} />
                Volver al Dashboard
              </button>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                {/* Expanded Header */}
                <div className={`bg-gradient-to-r ${analyticsCards.find(c => c.id === expandedSection)?.gradient} p-6 text-white`}>
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                      {React.createElement(analyticsCards.find(c => c.id === expandedSection)?.icon, { size: 32 })}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">{analyticsCards.find(c => c.id === expandedSection)?.title}</h2>
                      <p className="text-white/80 mt-1">Análisis detallado</p>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                <div className="p-6">
                  {expandedSection === 'sellers' && (
                    <div className="space-y-4">
                      {analytics.topSellers.map((seller, index) => (
                        <div key={index} className="group bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-cyan-50 rounded-xl p-5 border-2 border-gray-200 hover:border-blue-300 transition-all">
                          <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 bg-gradient-to-br ${getMedalColor(index)} rounded-xl flex items-center justify-center shadow-lg`}>
                              {index < 3 ? (
                                <Trophy className="text-white" size={28} />
                              ) : (
                                <span className="text-white font-black text-xl">#{index + 1}</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-800 text-lg">{seller.name}</h3>
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <ClipboardList size={14} className="text-gray-500" />
                                  <span className="text-gray-600">{seller.count} cotizaciones</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <DollarSign size={14} className="text-emerald-600" />
                                  <span className="font-semibold text-emerald-600">${seller.total.toLocaleString('es-MX')}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500 mb-1">Promedio</div>
                              <div className="text-lg font-bold text-blue-600">
                                ${(seller.total / seller.count).toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {expandedSection === 'products' && (
                    <div className="space-y-4">
                      {analytics.topProducts.map((product, index) => (
                        <div key={index} className="group bg-gradient-to-r from-gray-50 to-gray-100 hover:from-emerald-50 hover:to-green-50 rounded-xl p-5 border-2 border-gray-200 hover:border-emerald-300 transition-all">
                          <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 bg-gradient-to-br ${getMedalColor(index)} rounded-xl flex items-center justify-center shadow-lg`}>
                              {index < 3 ? (
                                <Star className="text-white" size={28} />
                              ) : (
                                <span className="text-white font-black text-xl">#{index + 1}</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-800 text-lg">{product.name}</h3>
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <ShoppingBag size={14} className="text-gray-500" />
                                  <span className="text-gray-600">{product.quantity} unidades vendidas</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <DollarSign size={14} className="text-emerald-600" />
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
                    <div className="space-y-4">
                      {analytics.topHospitals.map((hospital, index) => (
                        <div key={index} className="group bg-gradient-to-r from-gray-50 to-gray-100 hover:from-purple-50 hover:to-pink-50 rounded-xl p-5 border-2 border-gray-200 hover:border-purple-300 transition-all">
                          <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 bg-gradient-to-br ${getMedalColor(index)} rounded-xl flex items-center justify-center shadow-lg`}>
                              {index < 3 ? (
                                <Building2 className="text-white" size={28} />
                              ) : (
                                <span className="text-white font-black text-xl">#{index + 1}</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-800 text-lg">{hospital.name}</h3>
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <ClipboardList size={14} className="text-gray-500" />
                                  <span className="text-gray-600">{hospital.count} cotizaciones</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <DollarSign size={14} className="text-purple-600" />
                                  <span className="font-semibold text-purple-600">${hospital.total.toLocaleString('es-MX')}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500 mb-1">Promedio</div>
                              <div className="text-lg font-bold text-purple-600">
                                ${(hospital.total / hospital.count).toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {expandedSection === 'companies' && (
                    <div className="space-y-4">
                      {analytics.topCompanies.map((company, index) => (
                        <div key={index} className="group bg-gradient-to-r from-gray-50 to-gray-100 hover:from-amber-50 hover:to-orange-50 rounded-xl p-5 border-2 border-gray-200 hover:border-amber-300 transition-all">
                          <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 bg-gradient-to-br ${getMedalColor(index)} rounded-xl flex items-center justify-center shadow-lg`}>
                              {index < 3 ? (
                                <Users className="text-white" size={28} />
                              ) : (
                                <span className="text-white font-black text-xl">#{index + 1}</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-800 text-lg">{company.name}</h3>
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <ClipboardList size={14} className="text-gray-500" />
                                  <span className="text-gray-600">{company.count} cotizaciones</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <DollarSign size={14} className="text-amber-600" />
                                  <span className="font-semibold text-amber-600">${company.total.toLocaleString('es-MX')}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500 mb-1">Promedio</div>
                              <div className="text-lg font-bold text-amber-600">
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

          {/* Normal Dashboard View */}
          {!expandedSection && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <div
                      key={index}
                      className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                      
                      <div className="relative p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-4 ${stat.iconBg} rounded-xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                            <Icon className={stat.iconColor} size={28} />
                          </div>
                          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                            <TrendingUp size={12} />
                            {stat.trend}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-2">
                            {stat.title}
                          </p>
                          <p className="text-3xl font-bold text-gray-800">
                            {stat.value}
                          </p>
                        </div>

                        <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full`}
                            style={{ width: '75%' }}
                          ></div>
                        </div>
                      </div>

                      <div className={`absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>
                    </div>
                  )
                })}
              </div>

              {/* Analytics Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analyticsCards.map((card) => {
                  const Icon = card.icon
                  return (
                    <div
                      key={card.id}
                      onClick={() => handleCardClick(card.id)}
                      className="group cursor-pointer bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-white/20 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                    >
                      <div className={`bg-gradient-to-r ${card.gradient} p-6 text-white`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform">
                              <Icon size={28} />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold">{card.title}</h3>
                              <p className="text-sm text-white/80 mt-1">Click para ver detalles</p>
                            </div>
                          </div>
                          <div className="text-3xl font-black opacity-50">
                            {card.data.length}
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="space-y-3">
                          {card.data.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 bg-gradient-to-br ${getMedalColor(index)} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                                  {index + 1}
                                </div>
                                <span className="font-medium text-gray-800 truncate">{item.name}</span>
                              </div>
                              <div className="font-bold text-gray-700">
                                {card.id === 'products' 
                                  ? `${item.quantity} uds.`
                                  : `$${item.total.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`
                                }
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {card.data.length > 3 && (
                          <div className="mt-4 text-center">
                            <span className="text-sm text-blue-600 font-semibold">
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