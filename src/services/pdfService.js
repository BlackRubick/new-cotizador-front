// pdfService.js - Fixed template background rendering

export function createQuoteHTML(quoteData = {}, sellerCompany = {}, template = {}) {
  const items = (quoteData.products || quoteData.cartItems || []).map(it => `
    <tr>
      <td>${it.code || ''}</td>
      <td>${it.name || ''}</td>
      <td>${it.brand || ''}</td>
      <td style="text-align:right">${it.quantity || 0}</td>
      <td style="text-align:right">${(it.basePrice || 0).toFixed(2)}</td>
    </tr>
  `).join('\n')

  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body{ font-family: Arial, Helvetica, sans-serif; font-size: 12px; color:#111 }
        table{ width:100%; border-collapse: collapse }
        td, th{ padding:6px; border: 1px solid #eee }
      </style>
    </head>
    <body>
      <header>
        <h2>${sellerCompany.name || 'Empresa Vendedora'}</h2>
        <p>Folio: ${quoteData.folio || ''}</p>
        <p>Cliente: ${quoteData.clientName || ''}</p>
      </header>

      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Descripción</th>
            <th>Marca</th>
            <th style="text-align:right">Cant.</th>
            <th style="text-align:right">Precio</th>
          </tr>
        </thead>
        <tbody>
          ${items}
        </tbody>
      </table>

      <div style="margin-top:12px; text-align:right">
        <strong>Total: ${Number(quoteData.total || 0).toFixed(2)}</strong>
      </div>

      <footer style="margin-top:24px; font-size:11px; color:#666">
        <div>Condiciones: ${quoteData.terms || ''}</div>
      </footer>
    </body>
  </html>
  `
}

export async function generateQuotePDFBlob(quoteData = {}, sellerCompany = {}, template = {}) {
  const html = createQuoteHTML(quoteData, sellerCompany, template)

  try {
    if (typeof window !== 'undefined' && window.jspdf && window.html2canvas) {
      console.log('[pdfService] html2canvas/jsPDF path is available but not implemented in placeholder')
    }
  } catch (e) {
    console.warn('[pdfService] generateQuotePDFBlob error checking libs', e)
  }

  const blob = new Blob([html], { type: 'application/pdf' })
  return blob
}

export function openQuoteInPrintWindow(quoteData = {}, sellerCompany = {}, template = {}) {
  try {
    const templatePath = template && template.templatePath ? template.templatePath : ''
    
    // Calcular subtotal, IVA y total
    const subtotal = Number(quoteData.total || 0)
    const iva = subtotal * 0.16
    const totalConIva = subtotal + iva
    
    const items = (quoteData.products || quoteData.cartItems || []).map(it => `
      <tr>
        <td style="padding:8px;border:1px solid #ddd;background:rgba(255,255,255,0.9)">${it.code || ''}</td>
        <td style="padding:8px;border:1px solid #ddd;background:rgba(255,255,255,0.9)">${it.name || ''}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right;background:rgba(255,255,255,0.9)">${it.quantity || 0}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right;background:rgba(255,255,255,0.9)">$${Number(it.basePrice || 0).toLocaleString('es-MX', {minimumFractionDigits: 2})}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right;background:rgba(255,255,255,0.9)">$${(Number(it.quantity || 0) * Number(it.basePrice || 0)).toLocaleString('es-MX', {minimumFractionDigits: 2})}</td>
      </tr>
    `).join('\n')

    const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Cotización - ${quoteData.folio || ''}</title>
        <style>
          @page { 
            size: A4 portrait; 
            margin: 0;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          html, body { 
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
          }
          
          body { 
            font-family: Arial, Helvetica, sans-serif; 
            color: #111;
            position: relative;
          }
          
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
            border: 1px solid rgba(30, 64, 175, 0.1);
          }
          
          .company-info h2 {
            color: #1e40af;
            margin-bottom: 10px;
            font-size: 18px;
            font-weight: bold;
          }
          
          .company-info div {
            color: #374151;
            font-size: 12px;
            line-height: 1.8;
          }
          
          .quote-info {
            display: flex;
            justify-content: space-between;
            background: rgba(255, 255, 255, 0.98);
            padding: 18px 20px;
            border-radius: 10px;
            margin-bottom: 25px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border: 1px solid rgba(30, 64, 175, 0.1);
          }
          
          .quote-info strong {
            color: #1e40af;
            font-size: 13px;
          }
          
          .quote-info div {
            font-size: 12px;
            color: #374151;
            line-height: 1.8;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
            background: rgba(255, 255, 255, 0.98);
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border: 1px solid rgba(30, 64, 175, 0.1);
          }
          
          th {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 14px 12px;
            text-align: left;
            font-weight: bold;
            font-size: 12px;
            letter-spacing: 0.3px;
          }
          
          th.right, td.right {
            text-align: right;
          }
          
          td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 11px;
            color: #374151;
          }
          
          tbody tr:hover {
            background: rgba(59, 130, 246, 0.03);
          }
          
          tbody tr:last-child td {
            border-bottom: none;
          }
          
          .total-section {
            margin-top: 25px;
            display: flex;
            justify-content: flex-end;
          }
          
          .total-box {
            background: rgba(255, 255, 255, 0.98);
            padding: 20px 25px;
            border-radius: 10px;
            min-width: 320px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border: 1px solid rgba(30, 64, 175, 0.1);
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            font-size: 13px;
            color: #374151;
          }
          
          .total-row.subtotal {
            border-bottom: 1px solid #e5e7eb;
          }
          
          .total-row.iva {
            padding: 10px 0;
            color: #6b7280;
          }
          
          .total-row.final {
            border-top: 3px solid #1e40af;
            margin-top: 10px;
            padding-top: 15px;
            font-size: 20px;
            font-weight: bold;
            color: #1e40af;
          }
          
          footer {
            margin-top: 30px;
            background: rgba(255, 255, 255, 0.98);
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border: 1px solid rgba(30, 64, 175, 0.1);
          }
          
          footer strong {
            color: #1e40af;
            display: block;
            margin-bottom: 10px;
            font-size: 13px;
          }
          
          footer div {
            color: #374151;
            font-size: 11px;
            line-height: 1.8;
          }
          
          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            
            .page {
              margin: 0;
              box-shadow: none;
            }
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
                <div style="margin-bottom:8px"><strong>Folio:</strong> ${quoteData.folio || ''}</div>
                <div><strong>Vendedor:</strong> ${quoteData.seller || ''}</div>
              </div>
              <div style="text-align:right">
                <div style="margin-bottom:8px"><strong>Fecha:</strong> ${new Date(quoteData.createdAt || Date.now()).toLocaleDateString('es-MX')}</div>
                <div><strong>Cliente:</strong> ${quoteData.clientName || ''}</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th class="right">Cantidad</th>
                  <th class="right">Precio Unit.</th>
                  <th class="right">Subtotal</th>
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
                  <span>${subtotal.toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
                </div>
                <div class="total-row">
                  <span>IVA (16%):</span>
                  <span>${iva.toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
                </div>
                <div class="total-row final">
                  <span>TOTAL:</span>
                  <span>${totalConIva.toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
                </div>
              </div>
            </div>

            <footer>
              <strong>Observaciones:</strong>
              <div>${quoteData.terms || 'Ninguna'}</div>
            </footer>
          </div>
        </div>
        
        <script>
          (function(){
            function doPrint(){
              try{ 
                window.print(); 
              }catch(e){ 
                console.warn('print failed', e) 
              }
            }
            
            // Wait for images to load before printing
            if (document.readyState === 'complete') {
              setTimeout(doPrint, 1000);
            } else {
              window.addEventListener('load', function(){ 
                setTimeout(doPrint, 1000);
              });
            }
          })();
        </script>
      </body>
    </html>
    `

    const win = window.open('', '_blank', 'width=800,height=900')
    if (!win) {
      console.warn('[pdfService] Unable to open print window (popup blocked)')
      alert('Por favor, permite las ventanas emergentes para imprimir la cotización')
      return
    }
    win.document.open()
    win.document.write(html)
    win.document.close()
  } catch (e) {
    console.error('[pdfService] openQuoteInPrintWindow error', e)
  }
}

export default {
  createQuoteHTML,
  generateQuotePDFBlob,
  openQuoteInPrintWindow
}