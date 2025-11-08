# Cotizaciones — DTOs y flujo de envío por Email (SMTP)

Este documento explica cómo crear una cotización desde el frontend de este proyecto, qué datos (DTOs) se envían al backend, cómo se genera el PDF y cómo la UI envía ese PDF para que el backend lo envíe por correo (SMTP). Está pensado para desarrolladores que necesiten integrar o depurar el flujo.

## Resumen rápido

- La creación de la cotización se realiza en el frontend (por ejemplo `QuoteBuilder`) y usa `quoteService.createQuote(quoteData)` para persistirla en la API.
- El PDF se genera en el cliente con `pdfService` (HTML -> canvas -> jsPDF) y la UI puede:
  - Descargar / previsualizar el PDF directamente.
  - Adjuntar el PDF y enviarlo al backend para que el servidor lo envíe por email (endpoint `/quotes/:folio/send` o `/quotes/:id/send`).
- En la UI existe un modal (`EmailQuoteModal`) que genera el PDF como Blob y hace POST con `FormData` al endpoint de envío.

---

## 1) DTO: payload esperado al crear una cotización (createQuote)

El frontend construye un objeto `quoteData` con la información mínima necesaria. Campos observados en el código:

- sellerCompany: string (nombre legible o objeto con `id` y `name` en algunas partes)
- sellerCompanyId: string (ej. `ingenieria-clinica`, `conduit-life`, `biosystems-hls`, `escala-biomedica`)
- clientId: string (opcional, id del cliente si se seleccionó uno guardado en BD)
- clientName: string (nombre del hospital / cliente)
- clientContact: string (nombre de la persona de contacto)
- email: string (email del contacto)  <-- requerido para envío por email
- phone: string (teléfono del contacto)
- clientAddress: string (dirección del cliente)
- clientPosition: string (puesto del contacto)
- products o cartItems: array de items, cada item suele tener:
  - id (opcional)
  - code (código del producto)
  - name (nombre/descripcion breve)
  - description (texto largo)
  - brand (marca)
  - quantity (número)
  - basePrice (número)
  - selectedAccessories (opcional, array)
- total: number (suma de cantidades * precio unitario)
- folio: string (folio único — el frontend genera uno con `generateFolio()` antes de guardar)
- terms: object con condiciones (paymentConditions, deliveryTime, warranty, observations)

Ejemplo mínimo JSON enviado a `POST /quotes` (frontend -> `quoteService.createQuote`):

```json
{
  "sellerCompany": "Ingeniería Clínica y Diseño",
  "sellerCompanyId": "ingenieria-clinica",
  "clientId": "12345",
  "clientName": "Hospital General",
  "clientContact": "Dr. Juan Pérez",
  "email": "juan.perez@hospital.com",
  "phone": "+52 961 123 4567",
  "clientAddress": "Av. Principal 123, Ciudad",
  "clientPosition": "Jefe de Mantenimiento",
  "products": [
    { "code": "RT200", "name": "Ventilador V60", "description": "...", "brand": "Philips", "quantity": 1, "basePrice": 120000 }
  ],
  "total": 120000,
  "folio": "ICD0105231203001234",
  "terms": { "paymentConditions": "...", "deliveryTime": "..." }
}
```

Notas:
- `quoteService.createQuote` usa `apiRequest('/quotes', { method: 'POST', body: JSON.stringify(quoteData) })`.
- Si la API falla, el servicio puede tener un fallback para simular una cotización (uso en desarrollo).

---

## 2) Qué campos son obligatorios según validaciones del frontend

En `QuoteBuilder.validateForm()` (o lógica equivalente):
- `sellerCompany` (debe estar seleccionada)
- `email` (requerido y validado por regex)
- `clientName` o `selectedClient` (debe existir alguna información del cliente)
- `clientContact` (requerido si no hay clientName?) — el formulario exige contacto si no hay cliente
- `products` (el carrito debe tener al menos un producto)

---

## 3) Cómo se genera el PDF (cliente)

- Servicio: `src/services/pdfService.js` (se recomienda implementarlo así).
- Flujo:
  1. El frontend prepara `quoteData` (incluyendo `cartItems` / `products` y `folio`) y elige `sellerCompany` (para la plantilla gráfica).
  2. `pdfService.createQuoteHTML(quoteData, sellerCompany, template)` crea un HTML con la plantilla (header, cliente, tabla de productos, resumen).
  3. `pdfService.generateQuotePDFBlob` renderiza el HTML en un contenedor oculto del DOM, espera a las imágenes, usa `html2canvas` para convertir a imagen y `jsPDF` para generar el PDF, y devuelve un `Blob`.
  4. `EmailQuoteModal` usa `generateQuotePDFBlob` para obtener el Blob y lo adjunta a un `FormData` como `pdfBuffer`.

Observaciones:
- `pdfService` adapta el tamaño de fuente y padding para que la tabla de productos entre en una sola página cuando es posible.
- La plantilla se selecciona por `sellerCompany.id` y la imagen de fondo/plantilla se precarga (con fallbacks).

---

## 4) Cómo se envía el PDF al backend (UI -> backend) — endpoints y formatos

En el frontend hay dos vías observadas:

A) `EmailQuoteModal` (UI) — flujo observado en el repo:
- Genera el PDF como Blob.
- Hace una petición fetch directamente a: `/api/quotes/${folio}/send` (nota: utiliza `folio`, no `id` en esa petición). Esta petición es un POST con `FormData` y contiene solo el archivo:
  - `formData.append('pdfBuffer', pdfBlob)`
- El backend debe recibir ese `multipart/form-data` y: adjuntar el PDF al email y enviar por SMTP al cliente.

Ejemplo (lo que el modal efectúa):

POST /api/quotes/ICD0105231203001234/send
Content-Type: multipart/form-data; boundary=----

Form data:
- pdfBuffer: (binary PDF)

B) `quoteService.sendQuoteByEmail(quoteId, emailData)` — método JS
- Usa `apiRequest('/quotes/${quoteId}/send', { method: 'POST', body: JSON.stringify(emailData) })`.
- Aquí `emailData` es JSON (no FormData) y puede incluir campos como:
  - to (email de destino)
  - subject
  - message / body
  - cc, bcc (opcional)
  - attachments (si el servidor soporta referenciar adjuntos por id)

El backend puede implementar uno o ambos endpoints; en este repositorio hay evidencia de que el modal usa el endpoint que recibe `FormData` con `pdfBuffer`.

---

## 5) Qué espera el backend (recomendación para la implementación del servidor SMTP)

Para un endpoint que reciba `POST /quotes/:folio/send` con `FormData` (como hace `EmailQuoteModal`):

- Recibir `pdfBuffer` como archivo multipart.
- El servidor debe identificar la cotización por `folio` (o por un `quoteId` si la ruta es por id), recuperar datos adicionales (email del cliente, asunto, cuerpo del email) desde la BD o usar valores por defecto.
- Construir el email (from: sellerCompany email, to: client email, subject: algo como `Cotización ${folio}`) y adjuntar el PDF recibido.
- Enviar vía SMTP usando credenciales seguras (variables de entorno):
  - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE (boolean)
- Registrar el resultado del envío (fecha, estado, messageId) y devolver JSON { success: true, data: { sent: true, sentAt: ... } }.

Ejemplo mínimo de respuesta esperada por el frontend:

{ "success": true, "data": { "sent": true, "sentAt": "2025-11-04T12:00:00.000Z" } }

---

## 6) Ejemplos prácticos

1) Payload para crear cotización (frontend -> backend):

```json
{
  "sellerCompany": "Ingeniería Clínica y Diseño",
  "sellerCompanyId": "ingenieria-clinica",
  "clientId": "12345",
  "clientName": "Hospital General",
  "clientContact": "Dr. Juan Pérez",
  "email": "juan.perez@hospital.com",
  "phone": "+529611234567",
  "clientAddress": "Av. Principal 123",
  "products": [
    { "code": "RT200", "name": "Ventilador V60", "description": "Ventilador...", "brand": "Philips", "quantity": 1, "basePrice": 120000 }
  ],
  "total": 120000,
  "folio": "ICD0105231203001234",
  "terms": { "paymentConditions": "100% Anticipado", "deliveryTime": "15 días hábiles" }
}
```

2) Envío por Email desde `EmailQuoteModal` (lo que hace la app):
- Se genera `pdfBlob` en el cliente y se hace POST multipart al endpoint:

FormData:
- pdfBuffer => Blob (application/pdf)

Fetch (simplificado):

fetch(`/api/quotes/${folio}/send`, { method: 'POST', body: formData })

3) Alternativa: `quoteService.sendQuoteByEmail(quoteId, emailData)` envía JSON:

```json
{
  "to": "juan.perez@hospital.com",
  "subject": "Cotización ICD0105231203001234",
  "message": "Adjunto encontrará la cotización..."
}
```

---

## 7) Recomendaciones / notas de integración

- Consistencia endpoint `folio` vs `id`: en el código hay dos usos distintos: `EmailQuoteModal` usa `folio` en la URL (`/api/quotes/${folio}/send`) y `quoteService.sendQuoteByEmail` usa `quoteId` con `apiRequest('/quotes/${quoteId}/send')`. Recomiendo unificar (ideal: usar `id` para acciones internas y `folio` solo como etiqueta humana).
- Autenticación: `apiRequest` añade Authorization desde `localStorage.token`. Asegúrate el endpoint acepte el token o permita el post de `FormData` con autenticación.
- CORS y tamaños: cuando subes PDFs vía FormData, comprueba límites de tamaño y CORS en el backend.
- Validaciones: el frontend valida email con regex, pero el backend debe volver a validar `email` y el archivo PDF.
- SMTP: usa variables de entorno seguras. Para desarrollo puedes usar servicios de staging como Mailtrap.

---

## 8) Troubleshooting (errores comunes)

- Error `No se pudo generar el PDF.`: revisar consola del navegador, puede ser error al precargar la imagen de la plantilla o CORS en las imágenes de plantilla.
- Error al `fetch` multipart: comprobar que el endpoint existe (ruta con `/api/quotes/:folio/send`) y que el servidor acepte `multipart/form-data` y no espere JSON.
- Token 401: `apiRequest` redirige a `/login` si el token no es válido. Asegúrate de enviar el token para endpoints que usan `apiRequest`.
- Attachment grande: comprueba límites de tamaño en servidor (Nginx, Express body-parser, multipart limits).

---

> Nota: este documento es una guía de implementación en frontend. Cuando integres con backend, coordina con el equipo de servidores para acordar rutas, autenticación y límites de tamaño.
