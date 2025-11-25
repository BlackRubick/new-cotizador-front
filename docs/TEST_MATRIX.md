# Matriz de Pruebas orientada a Usuarios - new-cotizador-front

Fecha: 18 de noviembre de 2025

Propósito
- Esta matriz está pensada para usuarios finales (vendedores, administrativos) y describe pasos claros y sencillos para aprender a usar el sistema. No incluye detalles técnicos internos (tokens, CORS, etc.).

Convenciones
- Prioridad: Alta / Media / Baja
- Resultado esperado: lo que el usuario debe ver o comprobar al finalizar la acción

Instrucciones generales
- Antes de empezar, abre la aplicación en tu navegador con `npm run dev` (o la URL de producción que te dé tu equipo).
- Si te piden credenciales, usa las proporcionadas por tu administrador.

Tabla de pruebas (orientada al usuario)

ID | Área | Acción (pasos para el usuario) | Resultado esperado | Prioridad
---|------|---------------------------------|-------------------|---------
U-01 | Login | 1) Abrir `/` 2) Escribir email y contraseña 3) Pulsar "Iniciar sesión" | Entrarás al panel principal (`/home`) y verás tu nombre/usuario en la cabecera | Alta
U-02 | Login | Intentar iniciar sesión con contraseña errónea | Se mostrará un mensaje de error (por ejemplo: credenciales inválidas) y permanecerás en la pantalla de login | Alta
U-03 | Navegación | Desde el menú, hacer click en "Clientes" | Se abrirá la lista de clientes con botones para "Nuevo cliente" y acciones por cliente | Alta
U-04 | Clientes - Nuevo | 1) Ir a "Clientes" -> "Nuevo cliente" 2) Rellenar nombre, RUT/CIF, email y teléfono 3) Pulsar "Guardar" | Verás un mensaje de éxito y el nuevo cliente aparece en la lista | Alta
U-05 | Clientes - Editar | 1) En la lista de clientes, seleccionar un cliente y pulsar "Editar" 2) Cambiar teléfono o dirección 3) Guardar | El cliente se actualiza y verás el cambio en la lista; mensaje de confirmación | Alta
U-06 | Productos - Ver catálogo | Ir a "Productos" desde el menú | Se mostrará el listado de productos con imágenes, precios y botón para agregar/editar | Media
U-07 | Productos - Añadir producto | 1) "Productos" -> "Nuevo producto" 2) Completar nombre, precio y (opcional) imagen 3) Guardar | Producto agregado y visible en la lista con su imagen (si la subiste) | Media
U-08 | Cotizaciones - Crear | 1) Ir a "Cotizaciones" -> "Nueva cotización" 2) Seleccionar cliente 3) Agregar productos, cantidades y descuentos 4) Guardar cotización | Verás la cotización guardada con subtotal y total calculados; mensaje de éxito | Alta
U-09 | Cotizaciones - Revisar cálculos | En la pantalla de nueva cotización, cambiar cantidades y descuentos y revisar subtotal/total | Los números se actualizan al instante y el total coincide con (subtotal - descuentos + impuestos) visible | Alta
U-10 | Cotizaciones - Ver detalle | En "Cotizaciones", abrir una cotización existente | Se mostrará la vista detallada con productos, precios, totales y opción de descargar o generar PDF | Alta
U-11 | Cotizaciones - Generar PDF | En la vista de cotización, pulsar "Generar PDF" o "Descargar" | Se descargará o abrirá el PDF con la cotización tal cual la ves en pantalla | Alta
U-12 | Exportar listados | En la lista de cotizaciones pulsar "Exportar" -> seleccionar formato (XLSX/CSV) | Se descargará un archivo con las cotizaciones visibles en la tabla | Media
U-13 | Búsquedas y filtros | En las listas (clientes/productos/cotizaciones) usar el buscador o filtros por fecha/estado | La lista se filtra correctamente mostrando sólo los resultados esperados | Media
U-14 | Roles y accesos (usuario) | Intentar acceder a una sección que no aparece en tu menú (ej: Admin) | La opción no está disponible o al intentar acceder verás un mensaje que indica que no tienes permiso | Media
U-15 | UI responsiva (móvil) | Cambiar a tamaño móvil o abrir desde un móvil | La aplicación adapta el diseño: menús colapsados, botones accesibles y formularios legibles | Baja
U-16 | Guardado automático / confirmaciones | Al guardar un formulario (cliente, producto o cotización) debe aparecer un mensaje de confirmación | Confirmación clara (ej: "Cliente guardado correctamente") | Alta

Sugerencias para la formación de usuarios
- Realiza un taller donde se ejecute la secuencia: Login -> Crear cliente -> Crear cotización -> Generar PDF. Eso enseña el flujo completo.
- Prepara un set de datos de ejemplo (3 clientes, 5 productos) para uso en demos.

Si quieres, genero un Excel con esta tabla para que lo puedas distribuir. ¿Lo guardo como `docs/TEST_MATRIX_USER.xlsx`? (hecho si confirmas)

