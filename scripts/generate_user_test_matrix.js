import xlsx from 'xlsx'
import fs from 'fs'

const rows = [
  ['ID','Área','Acción (pasos para el usuario)','Resultado esperado','Prioridad'],
  ['U-01','Login','Abrir `/` -> Escribir email y contraseña -> Pulsar "Iniciar sesión"','Entrarás al panel principal (`/home`) y verás tu nombre/usuario en la cabecera','Alta'],
  ['U-02','Login','Intentar iniciar sesión con contraseña errónea','Se mostrará un mensaje de error y permanecerás en la pantalla de login','Alta'],
  ['U-03','Navegación','Desde el menú, hacer click en "Clientes"','Se abrirá la lista de clientes con botones para "Nuevo cliente" y acciones por cliente','Alta'],
  ['U-04','Clientes - Nuevo','Ir a "Clientes" -> "Nuevo cliente" -> Rellenar nombre, RUT/CIF, email y teléfono -> Pulsar "Guardar"','Verás un mensaje de éxito y el nuevo cliente aparece en la lista','Alta'],
  ['U-05','Clientes - Editar','En la lista de clientes, seleccionar un cliente -> "Editar" -> Cambiar teléfono/dirección -> Guardar','El cliente se actualiza y verás el cambio en la lista; mensaje de confirmación','Alta'],
  ['U-06','Productos - Ver catálogo','Ir a "Productos" desde el menú','Se mostrará el listado de productos con imágenes, precios y botón para agregar/editar','Media'],
  ['U-07','Productos - Añadir producto','"Productos" -> "Nuevo producto" -> Completar nombre, precio y (opcional) imagen -> Guardar','Producto agregado y visible en la lista con su imagen (si la subiste)','Media'],
  ['U-08','Cotizaciones - Crear','"Cotizaciones" -> "Nueva cotización" -> Seleccionar cliente -> Agregar productos, cantidades y descuentos -> Guardar','Cotización guardada con subtotal y total calculados; mensaje de éxito','Alta'],
  ['U-09','Cotizaciones - Revisar cálculos','En nueva cotización, cambiar cantidades y descuentos y revisar subtotal/total','Los números se actualizan al instante y el total coincide con (subtotal - descuentos + impuestos)','Alta'],
  ['U-10','Cotizaciones - Ver detalle','En "Cotizaciones", abrir una cotización existente','Vista detallada con productos, precios, totales y opción de descargar PDF','Alta'],
  ['U-11','Cotizaciones - Generar PDF','En la vista de cotización, pulsar "Generar PDF" o "Descargar"','Se descargará o abrirá el PDF con la cotización','Alta'],
  ['U-12','Exportar listados','En la lista de cotizaciones pulsar "Exportar" -> seleccionar formato (XLSX/CSV)','Se descargará un archivo con las cotizaciones visibles en la tabla','Media'],
  ['U-13','Búsquedas y filtros','En las listas usar el buscador o filtros por fecha/estado','La lista se filtra correctamente mostrando sólo los resultados esperados','Media'],
  ['U-14','Roles y accesos (usuario)','Intentar acceder a una sección que no aparece en tu menú (ej: Admin)','La opción no está disponible o verás un mensaje que indica que no tienes permiso','Media'],
  ['U-15','UI responsiva (móvil)','Abrir la app en móvil o cambiar a tamaño móvil','La aplicación adapta el diseño y los formularios son legibles','Baja'],
  ['U-16','Guardado/confirmaciones','Al guardar un formulario (cliente, producto o cotización) debe aparecer confirmación','Confirmación clara (ej: "Cliente guardado correctamente")','Alta']
]

const ws = xlsx.utils.aoa_to_sheet(rows)
const wb = xlsx.utils.book_new()
xlsx.utils.book_append_sheet(wb, ws, 'MatrizUsuarios')

const outPath = './docs/TEST_MATRIX_USER.xlsx'
if (!fs.existsSync('./docs')) fs.mkdirSync('./docs')
xlsx.writeFile(wb, outPath)
console.log('Generado', outPath)
