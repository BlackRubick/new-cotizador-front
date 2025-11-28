
# Matriz de Pruebas de Usuario - new-cotizador-front (Versión extendida)

Fecha: 26 de noviembre de 2025

Propósito
- Esta matriz está orientada a testers funcionales y usuarios finales que deben validar la plataforma paso a paso. Incluye precondiciones, datos de prueba sugeridos, pasos detallados, resultado esperado y notas para cada caso. Está pensada para correr manualmente y como documento guía para pruebas exploratorias.

Convenciones
- Prioridad: Alta / Media / Baja
- Estado: Manual / Automatizable (indica si es sencillo automatizarlo)
- Resultado esperado: lo que el usuario debe ver o comprobar al finalizar la acción
- Entorno: indicar si es `Dev` (local), `Staging` o `Prod`.

Requisitos Previos
- Tener el repositorio levantado o el acceso a la URL de prueba. Local: ejecutar `npm install` y `npm run dev`.
- Contar con credenciales de prueba (usuario con rol vendedor y usuario admin).
- Contar con datos de ejemplo: al menos 3 clientes y 5 productos para hacer flujos de cotización.

Formato de cada caso
- ID: identificador único (ej: T-Auth-01)
- Área: módulo o pantalla.
- Precondición: qué debe existir antes de ejecutar el caso.
- Pasos: lista numerada que el tester debe seguir.
- Datos de prueba: valores a ingresar (cuando aplique).
- Resultado esperado: validación clara y medible.
- Postcondición: qué queda en el sistema luego de ejecutar el caso.
- Prioridad / Estado

------------------------------------------------------------

## Sección A - Autenticación

T-Auth-01 | Área: Login básica
Precondición: La app está accesible y existe un usuario de prueba (email: `test@demo.com`, pwd: `Test1234`).
Pasos:
	1. Abrir la URL de la app (por ejemplo `http://localhost:5173/`).
	2. Escribir `test@demo.com` en el campo email y `Test1234` en contraseña.
	3. Pulsar "Iniciar sesión".
Datos de prueba: email `test@demo.com`, pwd `Test1234`.
Resultado esperado: El sistema autentica y redirige al dashboard o `/home`. En la cabecera aparece el nombre del usuario o su correo y el menú principal.
Postcondición: Sesión iniciada; token almacenado en sesión (localStorage/sessionStorage según implementación).
Prioridad / Estado: Alta / Manual

T-Auth-02 | Área: Login - contraseña inválida
Precondición: La app está accesible.
Pasos:
	1. Abrir la pantalla de login.
	2. Introducir email válido `test@demo.com` y contraseña errónea `wrongpass1`.
	3. Pulsar "Iniciar sesión".
Resultado esperado: Mostrar una alerta modal con mensaje claro (ej: "Credenciales inválidas"). No redirigir. Campo de contraseña debe limpiarse o enfocarse.
Prioridad / Estado: Alta / Manual

T-Auth-03 | Área: Login - email inválido
Precondición: App accesible.
Pasos:
	1. Escribir `noexiste@demo.com` y `Test1234`.
	2. Pulsar "Iniciar sesión".
Resultado esperado: Mensaje que indique que el usuario no existe o credenciales inválidas.
Prioridad / Estado: Media / Manual

T-Auth-04 | Área: Logout
Precondición: Usuario autenticado.
Pasos:
	1. Pulsar en el menú de usuario -> "Cerrar sesión".
Resultado esperado: Redirige a la pantalla de login y se borran la sesión/localStorage relacionados.
Prioridad / Estado: Alta / Manual

------------------------------------------------------------

## Sección B - Navegación y UX básica

T-Nav-01 | Área: Menú principal y rutas
Precondición: Usuario autenticado.
Pasos:
	1. Desde la cabecera, navegar a: `Clientes`, `Productos`, `Cotizaciones`, `Usuarios` (según permisos).
	2. Verificar que cada pantalla carga y muestra datos (o mensaje de "sin datos").
Resultado esperado: Cada ruta carga sin errores JS y muestra el contenido esperado. No hay stacks ni errores en consola.
Prioridad / Estado: Alta / Manual

T-Nav-02 | Área: Breadcrumbs y botones de acción
Precondición: Estar en `Cotizaciones` -> ver listado.
Pasos:
	1. Abrir una cotización y usar el botón "Volver a Cotizaciones".
	2. Abrir un cliente y luego pulsar "Editar".
Resultado esperado: Navegación fluida y estado esperado (formularios con datos cargados). Botones habilitados.
Prioridad / Estado: Media / Manual

------------------------------------------------------------

## Sección C - Clientes

T-Clients-01 | Área: Crear cliente (flujo completo)
Precondición: Usuario autenticado, en `Clientes`.
Pasos:
	1. Pulsar "Nuevo cliente".
	2. Rellenar: Nombre `Laboratorio ABC`, RFC `LAB123456T1`, Email `cliente1@example.com`, Teléfono `5512345678`, Dirección `Calle Falsa 123`.
	3. Guardar.
Datos de prueba: ver arriba.
Resultado esperado: Mensaje de éxito; el cliente aparece en la lista con los datos; al abrirlo muestra la ficha completa.
Postcondición: Cliente creado en la base de datos de prueba.
Prioridad / Estado: Alta / Manual

T-Clients-02 | Área: Validación - nombre con números
Precondición: Formulario de nuevo cliente abierto.
Pasos:
	1. En el campo nombre ingresar `Cliente123`.
	2. Intentar guardar.
Resultado esperado: Validación en frontend que impide guardar y muestra mensaje: "El nombre no puede contener números" (o validación equivalente). Campo marcado en rojo.
Prioridad / Estado: Alta / Manual

T-Clients-03 | Área: Validación - teléfono
Precondición: Formulario abierto.
Pasos:
	1. Introducir `55-1234-ABCD` en teléfono.
	2. Intentar guardar.
Resultado esperado: El sistema sanitiza o muestra error indicando que sólo se permiten números y 10 dígitos.
Prioridad / Estado: Alta / Manual

T-Clients-04 | Área: Editar cliente
Precondición: Cliente existente.
Pasos:
	1. Abrir el cliente `Laboratorio ABC`.
	2. Cambiar la dirección a `Av. Reforma 200`.
	3. Guardar.
Resultado esperado: Actualización visible en ficha y lista; mensaje de éxito.
Prioridad / Estado: Alta / Manual

T-Clients-05 | Área: Eliminar cliente (confirmación)
Precondición: Cliente sin cotizaciones asociadas (o usar uno de prueba).
Pasos:
	1. En la lista, pulsar "Eliminar" en cliente de prueba.
	2. Confirmar en el modal.
Resultado esperado: Cliente eliminado y ya no aparece; mensaje de éxito.
Notas: Si existen cotizaciones vinculadas, la app puede bloquear la eliminación o pedir re-asignación.
Prioridad / Estado: Media / Manual

T-Clients-06 | Área: Encargados (subentidad)
Precondición: Cliente abierto.
Pasos:
	1. Añadir un encargado: Nombre `María Pérez`, Email `maria@cliente.com`, Tel `5511122233`.
	2. Guardar y verificar que aparece en la lista de encargados.
	3. Eliminar el encargado y confirmar persistencia.
Resultado esperado: Encargado creado y eliminado correctamente; si hay error se muestra modal con detalle.
Prioridad / Estado: Media / Manual

------------------------------------------------------------

## Sección D - Productos

T-Prod-01 | Área: Listado de productos
Precondición: Usuario autenticado.
Pasos:
	1. Ir a `Productos`.
	2. Revisar que se muestran nombre, código, precio y stock (si aplica).
Resultado esperado: Listado correcto, mini-imágenes (si están) y opciones para editar/duplicar/eliminar.
Prioridad / Estado: Media / Manual

T-Prod-02 | Área: Crear producto
Precondición: En `Productos`.
Pasos:
	1. Pulsar "Nuevo producto".
	2. Introducir: Nombre `Medidor X`, Código `MX-001`, Precio `1500.00`.
	3. Guardar.
Resultado esperado: Producto aparece en la lista con precio formateado y código.
Prioridad / Estado: Media / Manual

T-Prod-03 | Área: Validación - precio negativo
Precondición: Formulario producto abierto.
Pasos:
	1. Poner precio `-100`.
	2. Intentar guardar.
Resultado esperado: Validación que impide valor negativo; mensaje de error.
Prioridad / Estado: Alta / Manual

T-Prod-04 | Área: Editar producto
Precondición: Producto existente.
Pasos:
	1. Seleccionar producto `Medidor X` -> Editar.
	2. Cambiar precio a `1450.50` y guardar.
Resultado esperado: Precio actualizado y mostrado correctamente.
Prioridad / Estado: Media / Manual

T-Prod-05 | Área: Eliminar producto
Precondición: Producto sin cotizaciones asociadas (usar producto de prueba)
Pasos:
	1. Pulsar "Eliminar" -> confirmar.
Resultado esperado: Producto eliminado o mensaje que explique por qué no puede eliminarse.
Prioridad / Estado: Baja / Manual

------------------------------------------------------------

## Sección E - Cotizaciones (Flujos críticos)

T-Quote-01 | Área: Crear cotización básica
Precondición: Cliente y 2 productos existentes.
Pasos:
	1. Ir a `Cotizaciones` -> "Nueva cotización".
	2. Seleccionar cliente `Laboratorio ABC`.
	3. Agregar producto `Medidor X` con cantidad `2`.
	4. Agregar producto `Consumible Y` con cantidad `5`.
	5. Verificar subtotal y total. Guardar.
Datos de prueba: cantidades y descuentos vacíos.
Resultado esperado: Cotización creada; subtotal/IVA/total muestran valores correctos; cotización aparece en la lista.
Postcondición: Cotización persistida con ID/folio.
Prioridad / Estado: Alta / Manual

T-Quote-02 | Área: Validación - nombre cliente sin números (en creación de cotización)
Precondición: Formulario de cotización abierto.
Pasos:
	1. En el campo de contacto o nombre del cliente intentar ingresar `Cliente123`.
	2. Intentar guardar.
Resultado esperado: Validación frontend bloquea nombres con números; mensaje visible.
Prioridad / Estado: Alta / Manual

T-Quote-03 | Área: Validación - teléfono en cotización
Precondición: Formulario abierto.
Pasos:
	1. Introducir teléfono `55123ABCD`.
	2. Intentar guardar.
Resultado esperado: Campo sanitizado o error que exige 10 dígitos numéricos.
Prioridad / Estado: Alta / Manual

T-Quote-04 | Área: Cálculo con descuento por línea
Precondición: Producto con precio `1000`.
Pasos:
	1. Agregar producto con cantidad `3` y descuento por unidad `100`.
	2. Verificar subtotal y total.
Resultado esperado: Subtotal = (1000-100)*3 = 2700; IVA 16% calculado; total correcto.
Prioridad / Estado: Alta / Manual

T-Quote-05 | Área: Guardado como borrador y edición posterior
Precondición: Cotización creada en modo borrador.
Pasos:
	1. Crear cotización y guardarla sin aprobar.
	2. Reabrir la cotización y modificar cantidades.
	3. Guardar y verificar cambios.
Resultado esperado: Cambios persistidos; historial simple (si aplica) o versión actualizada visible.
Prioridad / Estado: Media / Manual

T-Quote-06 | Área: Cambiar estado (Aprobar / Cancelar)
Precondición: Cotización en estado `Pendiente`.
Pasos:
	1. Abrir cotización -> seleccionar `Aprobar` y confirmar.
	2. Verificar etiqueta estado y que no se permite editar (según reglas).
Resultado esperado: Estado cambia a `Aprobada`; etiqueta y filtros reflejan el cambio.
Prioridad / Estado: Alta / Manual

T-Quote-07 | Área: Eliminar cotización (confirmación)
Precondición: Cotización en estado borrador o según reglas permitidas.
Pasos:
	1. Pulsar "Eliminar" -> confirmar.
Resultado esperado: Cotización eliminada; mensaje de éxito. Si no se permite, mensaje apropiado.
Prioridad / Estado: Media / Manual

T-Quote-08 | Área: Visualizar PDF (plantilla correcta por seller)
Precondición: Cotización con `sellerCompanyId` = `conduit-life` **o** `sellerCompany` = `CONDUIT LIFE`.
Pasos:
	1. Abrir la cotización.
	2. Pulsar "Visualizar PDF".
Resultado esperado: Se abre/descarga PDF con la plantilla de `CONDUIT LIFE`. En el encabezado del PDF se muestra `fullName`, `address` y `rfc` correspondientes.
Notas: Probar con cada vendedor (`conduit-life`, `biosystems-hls`, `ingenieria-clinica`, `escala-biomedica`).
Prioridad / Estado: Alta / Manual

T-Quote-09 | Área: Generar PDF vía html2canvas/jsPDF (si está instalado)
Precondición: html2canvas y jsPDF cargados en entorno.
Pasos:
	1. En la vista de cotización pulsar "Visualizar PDF".
	2. Esperar a que el proceso termine.
Resultado esperado: Se genera un Blob PDF; el archivo es descargable y tiene contenido idéntico al HTML mostrado.
Prioridad / Estado: Media / Manual

T-Quote-10 | Área: Enviar por email con PDF adjunto
Precondición: Cotización con email del cliente registrado.
Pasos:
	1. Pulsar "Enviar por Correo".
	2. Confirmar envío.
Resultado esperado: Back-end recibe `FormData` con `pdf`; recibes confirmación de envío. En el servidor verificar que el adjunto llega.
Prioridad / Estado: Alta / Manual

T-Quote-11 | Área: Enviar por WhatsApp (descarga + instrucciones)
Precondición: Cotización con teléfono válido.
Pasos:
	1. Pulsar "Enviar por WhatsApp".
	2. Confirmar abrir WhatsApp y seguir instrucciones para adjuntar PDF.
Resultado esperado: PDF descarga automática; se abre modal con instrucciones; link a `wa.me` correcto con número internacionalizado (+52 si aplica).
Prioridad / Estado: Media / Manual

T-Quote-12 | Área: Búsqueda por folio / cliente
Precondición: Existen varias cotizaciones.
Pasos:
	1. En la lista de cotizaciones usar el buscador para escribir un folio o nombre de cliente.
Resultado esperado: La lista se filtra correctamente mostrando coincidencias; paginación se actualiza.
Prioridad / Estado: Media / Manual

T-Quote-13 | Área: Exportar cotizaciones
Precondición: Al menos una cotización en la vista.
Pasos:
	1. Pulsar "Exportar" -> elegir `CSV` o `XLSX`.
Resultado esperado: Archivo descargado con columnas esperadas (folio, cliente, total, estado, fecha).
Prioridad / Estado: Media / Manual

T-Quote-14 | Área: Manejo de caracteres especiales y acentos
Precondición: Cotización con productos/cliente que tengan acentos y caracteres especiales.
Pasos:
	1. Crear cotización con `cliente: Clínica Óptima` y producto `Equipo RT-204 Ácido`.
	2. Generar PDF y revisar contenidos.
Resultado esperado: Texto correctamente mostrado en UI y PDF (sin caracteres raros o pérdida de encoding).
Prioridad / Estado: Media / Manual

T-Quote-15 | Área: Manejo de productos sin stock (si aplica)
Precondición: Producto con stock `0`.
Pasos:
	1. Intentar agregar ese producto a una cotización.
Resultado esperado: La app advierte que el producto no tiene stock y pregunta si continuar o no (según reglas). No debe permitir cantidades mayores al stock si existe restricción.
Prioridad / Estado: Baja / Manual

------------------------------------------------------------

## Sección F - Usuarios y permisos (Admin)

T-Users-01 | Área: Crear usuario con rol vendedor
Precondición: Acceso admin.
Pasos:
	1. Ir a `Usuarios` -> "Nuevo usuario".
	2. Rellenar email `vendedor2@example.com`, rol `vendedor`, nombre `Vendedor 2`.
	3. Guardar.
Resultado esperado: Usuario creado y listado; vendedor no ve opciones de admin al iniciar sesión.
Prioridad / Estado: Alta / Manual

T-Users-02 | Área: Restringir acceso a Admin
Precondición: Usuario vendedor creado.
Pasos:
	1. Iniciar sesión como `vendedor2@example.com`.
	2. Intentar acceder a `Usuarios` o rutas de administración.
Resultado esperado: Acceso denegado o ruta no visible en el menú.
Prioridad / Estado: Alta / Manual

T-Users-03 | Área: Editar roles
Precondición: Usuario admin.
Pasos:
	1. Editar usuario y cambiar rol de `vendedor` a `admin`.
	2. Verificar que ahora tiene acceso admin.
Resultado esperado: Cambios aplicados y reflejados tras re-login.
Prioridad / Estado: Media / Manual

------------------------------------------------------------

## Sección R - Roles y permisos (casos por rol: `jefe`, `administrador`, `vendedor`)

Nota: La aplicación distingue tres roles principales. Los siguientes casos están diseñados para verificar permisos y flujos esperados por rol. Ajusta los usuarios de prueba según el entorno (ej: `jefe@demo.com`, `admin@demo.com`, `vendedor@demo.com`).

T-Roles-01 | Área: Rol `jefe` - acceso completo a informes y aprobación
Precondición: Usuario `jefe@demo.com` existente.
Pasos:
	1. Iniciar sesión como `jefe@demo.com`.
	2. Navegar a `Cotizaciones` y abrir una cotización pendiente.
	3. Intentar aprobar la cotización.
	4. Ir a `Reportes` o `Dashboard` y generar reporte/filtrar por vendedor.
Resultado esperado: Usuario `jefe` puede aprobar cotizaciones, ver filtros avanzados y acceder a módulos de reporte. No se deberían bloquear acciones administrativas (creación/edición de usuarios) a menos que la política del producto lo restrinja.
Prioridad / Estado: Alta / Manual

T-Roles-02 | Área: Rol `administrador` - gestión de usuarios y configuración
Precondición: Usuario `admin@demo.com` existente.
Pasos:
	1. Iniciar sesión como `admin@demo.com`.
	2. Ir a `Usuarios` -> crear un nuevo usuario con rol `vendedor`.
	3. Cambiar configuraciones globales (si la app lo permite): ejemplo, ajustes SMTP o plantillas.
	4. Revisar logs o sección de auditoría (si existe).
Resultado esperado: `administrador` puede crear/editar/activar/desactivar usuarios, cambiar configuraciones globales y ver auditorías básicas. No debe haber restricciones para acciones administrativas.
Prioridad / Estado: Alta / Manual

T-Roles-03 | Área: Rol `vendedor` - flujos de ventas y restricciones
Precondición: Usuario `vendedor@demo.com` existente.
Pasos:
	1. Iniciar sesión como `vendedor@demo.com`.
	2. Crear una cotización, seleccionar cliente, agregar productos y guardar.
	3. Intentar acceder a `Usuarios` o a módulos de administración.
Resultado esperado: `vendedor` puede crear/editar cotizaciones y ver clientes/productos, pero no puede acceder a `Usuarios` ni a las configuraciones globales ni a los reportes avanzados (si la política los restringe). Al intentar acceder a áreas restringidas mostrará mensaje o la opción no estará en el menú.
Prioridad / Estado: Alta / Manual

T-Roles-04 | Área: Separación de responsabilidades entre `jefe` y `administrador`
Precondición: Usuarios `jefe@demo.com` y `admin@demo.com` existentes.
Pasos:
	1. Iniciar sesión como `vendedor@demo.com` y crear cotización A.
	2. Iniciar sesión como `jefe@demo.com` y aprobar cotización A.
	3. Iniciar sesión como `admin@demo.com` y verificar que la cotización aprobada aparece en reportes y logs; editar usuario que creó la cotización.
Resultado esperado: Flujo de creación-aprobación-reportes funciona con separación de roles. `jefe` aprueba, `admin` gestiona usuarios y tiene visibilidad completa en reportes.
Prioridad / Estado: Media / Manual

------------------------------------------------------------

------------------------------------------------------------

## Sección G - Exportes, Reportes y Utilidades

T-Reports-01 | Área: Exportar listados de clientes
Precondición: Al menos 5 clientes en la base.
Pasos:
	1. Ir a `Clientes` -> `Exportar CSV`.
Resultado esperado: CSV descargado con columnas correctas (nombre, email, teléfono, RFC, dirección).
Prioridad / Estado: Media / Manual

T-Reports-02 | Área: Imprimir vista de cotización
Precondición: Cotización abierta.
Pasos:
	1. Pulsar `Visualizar PDF` y usar la función imprimir del navegador.
Resultado esperado: Vista de impresión sin elementos rotos; fondo si aplica visible.
Prioridad / Estado: Baja / Manual

------------------------------------------------------------

## Sección H - Calidad, rendimiento y seguridad

T-QA-01 | Área: Console errors
Precondición: Navegar por la app en modo dev (abrir DevTools).
Pasos:
	1. Ejecutar los flujos principales: listar clientes, abrir cotización, generar PDF.
Resultado esperado: No hay errores críticos en consola (stack traces relacionados con la UI).
Prioridad / Estado: Alta / Manual

T-QA-02 | Área: XSS básico (sanitización)
Precondición: Formulario que acepte texto (observaciones, nombre cliente).
Pasos:
	1. Introducir `<script>alert(1)</script>` en observaciones y guardar cotización.
Resultado esperado: Texto mostrado como texto plano en la UI/PDF (sin ejecutar código). Si hay sanitización server-side, confirmar también.
Prioridad / Estado: Alta / Manual

T-QA-03 | Área: Carga de datos masiva (performance)
Precondición: Base con 500-1000 cotizaciones (staging ideal).
Pasos:
	1. Abrir listado de cotizaciones y probar paginación y filtros.
Resultado esperado: Paginación fluida; tiempos de respuesta aceptables (<2s ideal en staging). UI no bloqueada.
Prioridad / Estado: Baja / Manual

------------------------------------------------------------

## Información adicional y checklist para el tester

- Toma capturas de pantalla cuando encuentres errores y añádeles: URL, pasos para reproducir, usuario y datos de prueba.
- Si un caso falla, intenta reproducirlo en otro navegador y con otro usuario para descartar problemas locales.
- Para pruebas de emailing/WhatsApp revisa los logs del servidor (si tienes acceso) o utiliza cuentas de prueba.
- Si la generación del PDF falla por `popup blocked`, habilita pop-ups para `localhost` o usa la opción de descargar.

## Exportar a Excel / Compartir

Si quieres, puedo generar una versión `.xlsx` con esta matriz (filas por caso y columnas separadas). Dime si la guardo en `docs/TEST_MATRIX_EXTENDED.xlsx`.

---

Fin de la Matriz Extendida. Si quieres que la divida en secciones separadas (por ejemplo: `TEST_MATRIX_QUOTAS.md` para cotizaciones) o que genere el `.xlsx`, indícalo y lo hago ahora.

