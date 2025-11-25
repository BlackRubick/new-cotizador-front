import xlsx from 'xlsx'
import fs from 'fs'

// Matriz de pruebas: filas con [ID, Área, Caso de prueba, Pasos, Datos, Resultado esperado, Prioridad, Tipo]
const rows = [
  ['ID','Área','Caso de prueba','Pasos','Datos','Resultado esperado','Prioridad','Tipo'],
  ['AUTH-01','Autenticación','Login válido','Abrir / -> Ingresar credenciales -> Click login','user: test@ejemplo.com; pwd: correcto','Redirección a /home; token guardado; UI visible','Critical','Functional/E2E'],
  ['AUTH-02','Autenticación','Login inválido','Ingresar credenciales incorrectas','email erróneo / pwd errónea','Mostrar mensaje de error; no redirección','High','Functional'],
  ['AUTH-03','Autenticación','Sesión expirada','Simular token expirado y navegar a /quotes','token expirado','Redirección a /; mensaje indicando re-login','High','Security/Functional'],
  ['NAV-01','Navegación','Rutas protegidas','Deslogueado -> acceder a /quotes','-','Redirección a / (login)','Critical','Security'],
  ['NAV-02','Navegación','Permisos insuficientes','Usuario con rol limitado intenta /admin','usuario sin permiso admin_panel','Acceso denegado (403/redirección)','High','Functional'],
  ['CLIENT-01','Clientes','Crear cliente (happy path)','/clients/new -> rellenar formulario -> Guardar','Nombre, RUT, email, teléfono','Cliente creado; listado actualizado; mensaje éxito','Critical','Functional/E2E'],
  ['CLIENT-02','Clientes','Validaciones de formulario','Enviar formulario con campos inválidos','email=abc, nombre vacío','Validaciones mostradas; no enviar petición','High','UI/Functional'],
  ['CLIENT-03','Clientes','Editar cliente','/clients -> editar cliente -> modificar -> Guardar','Cambiar dirección/telefono','Datos actualizados; mensaje de éxito','High','Functional'],
  ['PRODUCT-01','Productos','Listado de productos','Acceder a /products','-','Productos listados; imágenes cargan','Medium','UI/Integration'],
  ['PRODUCT-02','Productos','Subir imagen','Crear/editar producto con imagen','archivo imagen JPG/AVIF','Imagen subida y preview correcto','Medium','Functional/UI'],
  ['QUOTE-01','Cotizaciones','Crear cotización con items múltiples','/quotes/new -> agregar productos -> guardar','3 productos con cantidades y descuentos','Cotización creada; total calculado correctamente','Critical','Functional/E2E'],
  ['QUOTE-02','Cotizaciones','Validar cálculos','Usar distintos descuentos y taxes','Descuentos 0-100%','Totales e impuestos calculados correctamente; no negativos','Critical','Functional'],
  ['QUOTE-03','Cotizaciones','Generar PDF','Desde QuoteViewPage -> botón PDF','Cotización completa','PDF generado/descargado; datos coinciden','High','Integration'],
  ['QUOTE-04','Cotizaciones','Exportar listados (XLSX)','En /quotes exportar listado','-','Archivo XLSX descargado con columnas correctas','Medium','Integration'],
  ['USERS-01','Admin','Crear usuario con roles','/admin -> nuevo usuario -> asignar rol','email, rol(s)','Usuario creado; inicia sesión con permisos','High','Functional'],
  ['UI-01','UI/Responsive','Diseño responsivo','Cambiar tamaño ventana (mobile/tablet/desktop)','-','Layout adapta correctamente','High','UI'],
  ['SEC-01','Seguridad','XSS/inputs peligrosos','Insertar script en campos de texto','<script>alert(1)</script>','Input sanitizado; no ejecuta scripts','Critical','Security'],
  ['SEC-02','Seguridad','CSRF/CORS','Intentar peticiones desde origen no autorizado','-','API rechaza/ CORS correcto (validar backend)','High','Security'],
  ['INT-01','Integración API','Errores del API manejados','Simular 500 en backend al listar clientes','-','Mostrar mensaje de error; UI no rompe','High','Integration'],
  ['PERF-01','Performance','Tiempo de carga','Medir tiempo hasta primer render','-','Tiempo aceptable (depende del entorno)','Medium','Performance'],
  ['A11Y-01','Accesibilidad','Navegación por teclado y contraste','Usar teclado para todo el flujo','-','Controles accesibles; labels ARIA presentes','High','Accessibility']
]

const ws = xlsx.utils.aoa_to_sheet(rows)
const wb = xlsx.utils.book_new()
xlsx.utils.book_append_sheet(wb, ws, 'MatrizPruebas')

const outPath = './docs/TEST_MATRIX.xlsx'

// asegurar que la carpeta docs existe
if (!fs.existsSync('./docs')) {
  fs.mkdirSync('./docs')
}

xlsx.writeFile(wb, outPath)
console.log('Generado', outPath)
