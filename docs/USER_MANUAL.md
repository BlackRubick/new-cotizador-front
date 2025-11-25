
# Manual de Usuario - new-cotizador-front

Última actualización: 18 de noviembre de 2025

Este manual está escrito paso a paso para que cualquier usuario (vendedor, administrativo) aprenda a usar la aplicación sin conocimientos técnicos.

Contenido rápido
- 1) Preparación rápida
- 2) Login
- 3) Home (panel)
- 4) Clientes (ver, crear, editar)
- 5) Productos (ver, crear)
- 6) Cotizaciones (crear, revisar, PDF)
- 7) Exportar listados
- 8) Ejercicios prácticos para formación
- 9) Preguntas frecuentes y resolución de problemas

1) Preparación rápida

Requisitos mínimos (usuario final)
- Un navegador moderno (Chrome, Firefox, Edge)
- URL de la aplicación o ejecutar localmente con los comandos del equipo de TI

Comandos (si ejecutas localmente)

```bash
npm install
npm run dev
```

Abre la URL que muestre Vite (por ejemplo: http://localhost:5173) o la URL que te pase tu administrador.

2) Login

Qué hacer
1. Abre la página principal (`/`).
2. Introduce tu email y contraseña en los campos correspondientes.
3. Pulsa "Iniciar sesión".

Qué esperar
- Si las credenciales son correctas, verás el panel principal (Home) y tu nombre/usuario en la cabecera.
- Si las credenciales son incorrectas, aparecerá un mensaje de error; vuelve a intentar.

Tips
- Si olvidaste la contraseña, solicita al administrador que la restablezca (la app no muestra un flujo de recuperación por defecto).

3) Home (panel)

Propósito
- Resumen rápido de actividad. Desde aquí navegas a Clientes, Productos, Cotizaciones y Administración (si tienes permisos).

Qué verificar
- Tu nombre/usuario en la cabecera.
- Menú lateral o superior con las secciones: Home, Cotizaciones, Productos, Clientes, Admin, About.

4) Clientes (ver, crear, editar)

Ver lista de clientes
1. En el menú, haz click en "Clientes".
2. La pantalla muestra una tabla/lista con clientes.

Crear un cliente (paso a paso)
1. Click en "Nuevo cliente".
2. Completa los campos obligatorios: Nombre, RUT/CIF, Email, Teléfono.
3. Revisa los datos y pulsa "Guardar".
4. Verás un mensaje de éxito y el cliente aparecerá en la lista.

Editar un cliente
1. En la lista, busca el cliente (puedes usar el buscador si hay muchos).
2. Pulsa el botón "Editar" (o icono lápiz) junto al cliente.
3. Modifica los campos necesarios y guarda.
4. Verifica que los cambios aparecen en la lista.

Consejos
- Usa el buscador para encontrar clientes por nombre o RUT.
- Comprueba el formato del email antes de guardar.

5) Productos (ver, crear)

Ver catálogo
1. En el menú, selecciona "Productos".
2. Verás tarjetas o una tabla con productos, precios e imagen.

Agregar un producto
1. Click en "Nuevo producto".
2. Introduce Nombre, Precio y (opcional) Foto.
3. Pulsa "Guardar".
4. El producto se añade al catálogo y será seleccionable al crear cotizaciones.

Notas sobre imágenes
- Formatos comunes: JPG, PNG, AVIF. Si la imagen no sube, intenta reducir su tamaño.

6) Cotizaciones (crear, revisar, PDF)

Crear una cotización (paso a paso)
1. En el menú, abre "Cotizaciones" y pulsa "Nueva cotización".
2. Selecciona el cliente (puedes buscar por nombre o RUT).
3. Añade productos: busca un producto y pulsa "Agregar" o escribe manualmente precio y descripción si la app lo permite.
4. Ajusta cantidades, aplica descuentos si corresponde y verifica impuestos.
5. Observa el cálculo en pantalla: Subtotal, Descuento, Impuestos, Total.
6. Si todo está correcto, pulsa "Guardar".
7. Tras guardar, la cotización aparecerá en la lista y podrás abrirla para ver detalle.

Ver detalle y PDF
1. En la lista de cotizaciones, pulsa sobre una cotización para ver su detalle.
2. En la vista detalle, pulsa "Generar PDF" o "Descargar".
3. Se descargará un PDF con la información de la cotización tal como la ves en pantalla.

Consejos sobre cálculos
- Revisa siempre las cantidades y descuentos antes de guardar. Si detectas un error, edita la cotización si el sistema lo permite.

7) Exportar listados

Exportar cotizaciones
1. Ve a "Cotizaciones".
2. Busca el botón "Exportar" en la UI (arriba o en opciones de la tabla).
3. Selecciona el formato (XLSX o CSV).
4. El archivo se descargará y podrás abrirlo en Excel o Google Sheets.

Exportar clientes/productos
- Procede de forma similar desde la lista correspondiente si la app ofrece exportación.

8) Ejercicios prácticos para formación (guion de 30-45 minutos)

Objetivo: Que un usuario aprenda el flujo completo: crear cliente + crear cotización + generar PDF.

Duración estimada: 30–45 minutos

Material de ejemplo: crea (o pide al administrador) los siguientes datos de prueba:
- Clientes: "ACME S.A." (RUT: 12345678-9), "Distribuciones XYZ" (RUT: 87654321-0)
- Productos: "Producto A" (precio 1000), "Producto B" (precio 2500), "Producto C" (precio 150)

Guion paso a paso
1. Login en la app con credenciales de demo.
2. Ir a "Clientes" y crear el cliente "ACME S.A.".
3. Ir a "Productos" y verificar que "Producto A" y "Producto B" existen (si no, crearlos).
4. Ir a "Cotizaciones" -> "Nueva cotización".
5. Seleccionar "ACME S.A.", agregar 2x "Producto A" y 1x "Producto B", aplicar 10% descuento al segundo producto (si es posible).
6. Revisar subtotal/total y guardar la cotización.
7. Abrir la cotización guardada y generar el PDF.
8. Comprobar que los datos del PDF coinciden con la pantalla.

Ejercicio 2 (10 minutos) — Búsqueda y filtros
1. En "Cotizaciones", usar el buscador para localizar la cotización creada.
2. Filtrar por rango de fechas para ver sólo cotizaciones de la última semana.

9) Preguntas frecuentes y resolución de problemas

P: La app no arranca en mi localhost
R: Asegúrate de ejecutar `npm install` y luego `npm run dev`. Revisa la consola de Vite por errores.

P: No puedo iniciar sesión
R: Verifica que introdujiste el email correcto. Si estás seguro, contacta al administrador para confirmar tus credenciales.

P: El PDF no descarga o sale vacío
R: Revisa en la vista detalle si aparecen los datos. Si la vista está vacía, el problema es de guardado; si la vista está bien pero el PDF no, revisa la consola del navegador y reporta el error.

P: No veo la opción "Admin"
R: Probablemente tu usuario no tiene el permiso `admin_panel`. Pide al administrador que revise tus roles.

Contacto y soporte
- Para dudas de uso: contactar con el responsable de producto o administrador interno.
- Para bugs técnicos: adjuntar capturas de pantalla, pasos para reproducir y logs de la consola del navegador.

Anexo: Referencia rápida de acciones
- Crear cliente: Clientes -> Nuevo cliente -> Guardar
- Crear producto: Productos -> Nuevo producto -> Guardar
- Crear cotización: Cotizaciones -> Nueva cotización -> Seleccionar cliente -> Agregar productos -> Guardar
- Generar PDF: Cotizaciones -> Abrir cotización -> Generar PDF

¿Quieres que añada capturas de pantalla a este manual o un PDF imprimible con el guion de formación? Puedo generarlo si me confirmas y me indicas qué pantallas quieres incluir.


