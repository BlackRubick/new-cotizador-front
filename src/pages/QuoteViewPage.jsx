import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import MainTemplate from '../templates/MainTemplate'
import quoteService from '../services/quoteService'
import pdfService from '../services/pdfService'
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
  Download,
  Eye,
  Send,
  MessageCircle
} from 'lucide-react'
// Product images hidden in Quotes view per user request
import { confirmDialog, alertError } from '../utils/swal'
import Swal from 'sweetalert2'

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

  async function handleSendEmail() {
    if (!quote) return
    
    // Validar que el cliente tenga email
    if (!quote.email) {
      await Swal.fire({
        icon: 'warning',
        title: 'Email no disponible',
        text: 'Este cliente no tiene un correo electrónico registrado.',
        confirmButtonColor: '#0284c7'
      })
      return
    }
    
    // Confirmar envío
    const confirmed = await confirmDialog(
      `¿Enviar cotización a ${quote.email}?`
    )
    
    if (!confirmed) return
    
    try {
      // Mostrar loading - Generando PDF
      Swal.fire({
        title: 'Generando PDF...',
        html: `Preparando cotización con plantilla de ${quote.sellerCompany || 'empresa'}`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        }
      })
      
      // Generar PDF con las plantillas (igual que "Visualizar PDF")
      const pdfBlob = await generatePDFWithTemplate()
      
      if (!pdfBlob) {
        throw new Error('No se pudo generar el PDF')
      }
      
      // Actualizar loading - Enviando
      Swal.update({
        title: 'Enviando...',
        html: `Enviando cotización a <strong>${quote.email}</strong>`
      })
      
      // Preparar mensaje automático
      const clientName = quote.clientName || 'Estimado cliente'
      const message = `Estimado/a ${clientName},\n\nAdjunto encontrará la cotización ${quote.folio || quote.id}.\n\nGracias por su confianza.\n\nSaludos cordiales,\n${quote.seller || 'Equipo de Ventas'}`
      
      // Crear FormData con el PDF generado
      const formData = new FormData()
      formData.append('to', quote.email)
      formData.append('subject', `Cotización ${quote.folio || quote.id} - ${quote.sellerCompany || 'Cotización'}`)
      formData.append('message', message)
      formData.append('pdf', pdfBlob, `cotizacion-${quote.folio || quote.id}.pdf`)
      
      // Enviar email con PDF adjunto
      const result = await quoteService.sendQuoteWithPDF(quote.id, formData)
      
      if (result.success) {
        await Swal.fire({
          icon: 'success',
          title: '¡Correo Enviado!',
          html: `La cotización fue enviada exitosamente a:<br><strong>${quote.email}</strong>`,
          confirmButtonColor: '#0284c7'
        })
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Error al Enviar',
          text: result.error || 'No se pudo enviar el correo. Por favor verifica la configuración SMTP.',
          confirmButtonColor: '#0284c7'
        })
      }
    } catch (error) {
      console.error('Error sending email:', error)
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Ocurrió un error al enviar el correo. Por favor verifica tu conexión.',
        confirmButtonColor: '#0284c7'
      })
    }
  }

  async function handleSendWhatsApp() {
    if (!quote) return
    
    // Validar que el cliente tenga teléfono
    if (!quote.phone) {
      await Swal.fire({
        icon: 'warning',
        title: 'Teléfono no disponible',
        text: 'Este cliente no tiene un número de teléfono registrado.',
        confirmButtonColor: '#0284c7'
      })
      return
    }
    
    try {
      // Mostrar loading - Generando PDF
      Swal.fire({
        title: 'Generando PDF...',
        html: `Preparando cotización para WhatsApp`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        }
      })
      
      // Generar PDF con las plantillas
      const pdfBlob = await generatePDFWithTemplate()
      
      if (!pdfBlob) {
        throw new Error('No se pudo generar el PDF')
      }
      
      // Descargar el PDF automáticamente
      const url = window.URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cotizacion-${quote.folio || quote.id}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      // Cerrar el loading
      Swal.close()
      
      // Preparar mensaje para WhatsApp
      const clientName = quote.clientName || 'Estimado cliente'
      const message = `Hola ${clientName}, adjunto encontrarás la cotización ${quote.folio || quote.id}. Gracias por tu confianza. Saludos, ${quote.seller || 'Equipo de Ventas'}`
      
      // Limpiar el número de teléfono (quitar espacios, guiones, etc.)
      const cleanPhone = quote.phone.replace(/[^\d]/g, '')
      
      // Agregar código de país si no lo tiene (asumiendo México +52)
      let phoneNumber = cleanPhone
      if (!cleanPhone.startsWith('52') && cleanPhone.length === 10) {
        phoneNumber = '52' + cleanPhone
      }
      
      // Codificar el mensaje para URL
      const encodedMessage = encodeURIComponent(message)
      
      // Abrir WhatsApp Web con el mensaje
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
      
      // Mostrar instrucciones
      await Swal.fire({
        icon: 'success',
        title: 'PDF Descargado',
        html: `
          <div style="text-align: left;">
            <p style="margin-bottom: 10px;">✅ El PDF se ha descargado correctamente.</p>
            <p style="margin-bottom: 10px;">📱 Se abrirá WhatsApp Web en unos segundos.</p>
            <p style="margin-bottom: 10px;"><strong>Instrucciones:</strong></p>
            <ol style="margin-left: 20px;">
              <li>WhatsApp se abrirá con el mensaje pre-escrito</li>
              <li>Haz clic en el ícono de clip 📎 para adjuntar</li>
              <li>Selecciona el PDF descargado</li>
              <li>Envía el mensaje</li>
            </ol>
          </div>
        `,
        confirmButtonText: 'Abrir WhatsApp',
        confirmButtonColor: '#25D366',
        showCancelButton: true,
        cancelButtonText: 'Cerrar'
      }).then((result) => {
        if (result.isConfirmed) {
          // Abrir WhatsApp en una nueva pestaña
          window.open(whatsappUrl, '_blank')
        }
      })
      
    } catch (error) {
      console.error('Error preparing WhatsApp:', error)
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Ocurrió un error al preparar el envío por WhatsApp.',
        confirmButtonColor: '#0284c7'
      })
    }
  }
  
  // Función auxiliar para generar PDF con plantilla usando ventana temporal
  async function generatePDFWithTemplate() {
    return new Promise((resolve, reject) => {
      try {
        // Obtener datos de la empresa y plantilla
        const companyData = {
          'CONDUIT LIFE': {
            template: 'CONDUIT-LIFE.jpeg',
            name: 'CONDUIT LIFE',
            fullName: 'CONDUIT LIFE',
            address: 'Calle Principal #123, Col. Centro, Ciudad, Estado, C.P. 12345',
            rfc: 'CLF123456ABC'
          },
          'BIOSYSTEMS HLS': {
            template: 'Biosystems-HLS.jpeg',
            name: 'BIOSYSTEMS HLS',
            fullName: 'BIOSYSTEMS HLS',
            address: 'Av. Tecnológico #456, Col. Industrial, Ciudad, Estado, C.P. 54321',
            rfc: 'BHS789012DEF'
          },
          'INGENIERÍA CLÍNICA Y DISEÑO': {
            template: 'INGENIERIA-CLINICA-DISEÑO.jpeg',
            name: 'INGENIERÍA CLÍNICA Y DISEÑO',
            fullName: 'INGENIERÍA CLÍNICA Y DISEÑO S.A. DE C.V.',
            address: 'Boulevard Innovación #789, Col. Empresarial, Ciudad, Estado, C.P. 67890',
            rfc: 'ICD345678GHI'
          },
          'ESCALA BIOMÉDICA': {
            template: 'ESCALA-BIOMEDICA.jpeg',
            name: 'ESCALA BIOMÉDICA',
            fullName: 'ESCALA BIOMÉDICA',
            address: 'Calle Salud #321, Col. Médica, Ciudad, Estado, C.P. 09876',
            rfc: 'EBM901234JKL'
          }
        }
        
        const companyName = (quote.sellerCompany || '').toUpperCase()
        const company = companyData[companyName]
        
        const sellerCompany = company ? {
          name: company.name,
          fullName: company.fullName,
          address: company.address,
          rfc: company.rfc
        } : {
          name: quote.sellerCompany || 'Empresa Vendedora',
          fullName: quote.sellerCompany || 'Empresa Vendedora',
          address: '',
          rfc: ''
        }
        
        const templatePath = company ? `/plantillas/${company.template}` : ''
        
        // Generar HTML con plantilla (igual que Visualizar PDF)
        const htmlContent = generateQuotePDFHTML(quote, sellerCompany, templatePath)
        
        // Abrir ventana temporal oculta
        const win = window.open('', '_blank', 'width=800,height=900')
        
        if (!win) {
          reject(new Error('No se pudo abrir ventana temporal. Verifica que los pop-ups estén permitidos.'))
          return
        }
        
        win.document.open()
        win.document.write(htmlContent)
        win.document.close()
        
        // Esperar a que cargue completamente
        win.addEventListener('load', async () => {
          try {
            // Esperar un poco más para que las imágenes de fondo carguen
            await new Promise(resolve => setTimeout(resolve, 1500))
            
            // Capturar con html2canvas desde la ventana
            const canvas = await window.html2canvas(win.document.body, {
              scale: 2,
              useCORS: true,
              allowTaint: false,
              backgroundColor: '#ffffff',
              logging: false,
              width: win.document.body.scrollWidth,
              height: win.document.body.scrollHeight
            })
            
            // Crear PDF con jsPDF
            const imgData = canvas.toDataURL('image/png')
            const pdf = new window.jspdf.jsPDF({
              orientation: 'portrait',
              unit: 'mm',
              format: 'a4'
            })
            
            const imgWidth = 210 // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width
            
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
            
            // Cerrar ventana temporal
            win.close()
            
            // Retornar como Blob
            resolve(pdf.output('blob'))
            
          } catch (error) {
            win.close()
            reject(error)
          }
        })
        
        // Timeout de seguridad
        setTimeout(() => {
          if (win && !win.closed) {
            win.close()
          }
          reject(new Error('Timeout al generar PDF'))
        }, 10000)
        
      } catch (error) {
        console.error('Error generating PDF:', error)
        reject(error)
      }
    })
  }
  
  // Función para generar el HTML del PDF
  function generateQuotePDFHTML(quoteData, sellerCompany, templatePath) {
    const subtotal = Number(quoteData.total || 0)
    const iva = subtotal * 0.16
    const totalConIva = subtotal + iva
    
    const items = (quoteData.products || quoteData.cartItems || []).map(it => `
      <tr>
        <td style="padding:8px;border:1px solid #ddd;background:rgba(255,255,255,0.9)">${it.code || it.productId || 'S/C'}</td>
        <td style="padding:8px;border:1px solid #ddd;background:rgba(255,255,255,0.9)">${it.name || it.description || ''}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right;background:rgba(255,255,255,0.9)">${it.quantity || it.qty || 0}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right;background:rgba(255,255,255,0.9)">$${Number(it.basePrice || it.unitPrice || 0).toLocaleString('es-MX', {minimumFractionDigits: 2})}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right;background:rgba(255,255,255,0.9)">$${(Number(it.quantity || it.qty || 0) * Number(it.basePrice || it.unitPrice || 0)).toLocaleString('es-MX', {minimumFractionDigits: 2})}</td>
      </tr>
    `).join('\n')

    return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, Helvetica, sans-serif; color: #111; position: relative; }
          .page {
            position: relative;
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: white;
            overflow: hidden;
            ${templatePath ? `
              background-image: url('${templatePath}');
              background-size: 100% 100%;
              background-position: left top;
              background-repeat: no-repeat;
            ` : ''}
          }
          .content {
            position: relative;
            z-index: 10;
            padding: 50mm 15mm 15mm 15mm;
          }
          .header {
            background: rgba(255, 255, 255, 0.98);
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 25px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .company-info h2 {
            color: #1e40af;
            margin-bottom: 10px;
            font-size: 18px;
          }
          .quote-info {
            display: flex;
            justify-content: space-between;
            background: rgba(255, 255, 255, 0.98);
            padding: 18px 20px;
            border-radius: 10px;
            margin-bottom: 25px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
            background: rgba(255, 255, 255, 0.98);
            border-radius: 10px;
          }
          th {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 14px 12px;
            text-align: left;
            font-weight: bold;
            font-size: 12px;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 11px;
          }
          .total-section {
            margin-top: 20px;
            display: flex;
            justify-content: flex-end;
          }
          .total-box {
            background: rgba(255, 255, 255, 0.98);
            padding: 12px 18px;
            border-radius: 8px;
            min-width: 280px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 12px;
          }
          .total-row.final {
            border-top: 2px solid #1e40af;
            margin-top: 6px;
            padding-top: 8px;
            font-size: 16px;
            font-weight: bold;
            color: #1e40af;
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="content">
            <div class="header">
              <div class="company-info">
                <h2>${sellerCompany.fullName || sellerCompany.name || 'Empresa Vendedora'}</h2>
                <div>${sellerCompany.address || ''}</div>
                <div>RFC: ${sellerCompany.rfc || ''}</div>
              </div>
            </div>

            <div class="quote-info">
              <div>
                <div><strong>Folio:</strong> ${quoteData.folio || ''}</div>
                <div><strong>Vendedor:</strong> ${quoteData.seller || ''}</div>
              </div>
              <div style="text-align:right">
                <div><strong>Fecha:</strong> ${new Date(quoteData.createdAt || Date.now()).toLocaleDateString('es-MX')}</div>
                <div><strong>Cliente:</strong> ${quoteData.clientName || ''}</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th style="text-align:right">Cantidad</th>
                  <th style="text-align:right">Precio Unit.</th>
                  <th style="text-align:right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${items}
              </tbody>
            </table>

            <div class="total-section">
              <div class="total-box">
                <div class="total-row">
                  <span>Subtotal:</span>
                  <span>$${subtotal.toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
                </div>
                <div class="total-row">
                  <span>IVA (16%):</span>
                  <span>$${iva.toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
                </div>
                <div class="total-row final">
                  <span>TOTAL:</span>
                  <span>$${totalConIva.toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
                </div>
              </div>
            </div>

            <div style="margin-top:20px;background:rgba(255,255,255,0.98);padding:12px 18px;border-radius:8px;">
              <strong style="color:#1e40af;">Observaciones:</strong>
              <div>${quoteData.terms || 'Ninguna'}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
    `
  }

  function handleViewPDF() {
    if (!quote) return
    
    // Mapeo de empresas a plantillas y datos completos
    const companyData = {
      'CONDUIT LIFE': {
        template: 'CONDUIT-LIFE.jpeg',
        name: 'CONDUIT LIFE',
        fullName: 'CONDUIT LIFE',
        address: 'Calle Principal #123, Col. Centro, Ciudad, Estado, C.P. 12345',
        rfc: 'CLF123456ABC'
      },
      'BIOSYSTEMS HLS': {
        template: 'Biosystems-HLS.jpeg',
        name: 'BIOSYSTEMS HLS',
        fullName: 'BIOSYSTEMS HLS',
        address: 'Av. Tecnológico #456, Col. Industrial, Ciudad, Estado, C.P. 54321',
        rfc: 'BHS789012DEF'
      },
      'INGENIERÍA CLÍNICA Y DISEÑO': {
        template: 'INGENIERIA-CLINICA-DISEÑO.jpeg',
        name: 'INGENIERÍA CLÍNICA Y DISEÑO',
        fullName: 'INGENIERÍA CLÍNICA Y DISEÑO S.A. DE C.V.',
        address: 'Boulevard Innovación #789, Col. Empresarial, Ciudad, Estado, C.P. 67890',
        rfc: 'ICD345678GHI'
      },
      'ESCALA BIOMÉDICA': {
        template: 'ESCALA-BIOMEDICA.jpeg',
        name: 'ESCALA BIOMÉDICA',
        fullName: 'ESCALA BIOMÉDICA',
        address: 'Calle Salud #321, Col. Médica, Ciudad, Estado, C.P. 09876',
        rfc: 'EBM901234JKL'
      }
    }
    
    // Obtener la empresa según el nombre
    const companyName = (quote.sellerCompany || '').toUpperCase()
    const company = companyData[companyName]
    
    // Preparar datos de la empresa vendedora
    const sellerCompany = company ? {
      name: company.name,
      fullName: company.fullName,
      address: company.address,
      rfc: company.rfc
    } : {
      name: quote.sellerCompany || 'Empresa Vendedora',
      fullName: quote.sellerCompany || 'Empresa Vendedora',
      address: '',
      rfc: ''
    }
    
    // Preparar templatePath
    const templatePath = company ? `/plantillas/${company.template}` : null
    
    // Abrir el PDF en una nueva ventana con la plantilla
    pdfService.openQuoteInPrintWindow(quote, sellerCompany, { templatePath })
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
                  {/* Visualizar PDF */}
                  <button 
                    onClick={handleViewPDF}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg transition-all transform hover:scale-105"
                  >
                    <Eye size={18} />
                    Visualizar PDF
                  </button>

                  {/* Enviar por Correo */}
                  <button 
                    onClick={handleSendEmail}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all transform hover:scale-105"
                  >
                    <Mail size={18} />
                    Enviar por Correo
                  </button>

                  {/* Enviar por WhatsApp */}
                  <button 
                    onClick={handleSendWhatsApp}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all transform hover:scale-105"
                  >
                    <MessageCircle size={18} />
                    Enviar por WhatsApp
                  </button>

                  {/* Separador */}
                  <div className="border-t border-gray-200 pt-3">
                    <button 
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-xl font-medium hover:shadow-lg transition-all transform hover:scale-105"
                    >
                      <Download size={18} />
                      Descargar PDF
                    </button>
                  </div>

                  {/* Cambiar Estado */}
                  <div className="pt-3 border-t border-gray-200">
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