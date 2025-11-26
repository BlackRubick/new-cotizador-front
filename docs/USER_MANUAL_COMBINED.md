

# Manual de Usuario - new-cotizador-front

Última actualización: 18 de noviembre de 2025

Este manual está escrito paso a paso para que cualquier usuario (vendedor, administrativo) aprenda a usar la aplicación sin conocimientos técnicos.

Contenido rápido
- 1) Preparación rápida
- 2) Login
- 3) Home (panel)
- 4) Clientes (ver, crear, editar)
- 5) Productos (ver, crear)
# Manual de Usuario - new-cotizador-front

Última actualización: 25 de noviembre de 2025

Este manual describe de forma detallada todas las pantallas y flujos de la aplicación. Está pensado para usuarios finales (vendedores, administrativos) y para formadores. He dejado espacios marcados para que agregues capturas de pantalla en cada sección.

Tabla de contenidos
- **Preparación e instalación (rápido)**
- **Acceso / Login**
- **Navegación general**
- **Clientes**
	- Ver lista
	- Crear cliente
	- Editar cliente
	- Encargados (agregar / editar / eliminar)
- **Productos**
	- Ver catálogo
	- Agregar/Editar producto
- **Cotizaciones**
	- Crear cotización (paso a paso)
	- Editar cotización
	- Generar PDF / Imprimir
- **Exportar / Importar**
- **Roles y permisos**
- **Validaciones y mensajes**
- **Resolución de problemas y FAQ**
- **Guiones de formación y ejercicios prácticos**
- **Anexos: comandos y contacto**

---

**Preparación e instalación (rápido)**

- Requisitos mínimos (usuario final):
	- Navegador moderno: Chrome (recomendado), Edge, Firefox.
	- Conexión a la URL de la aplicación (servidor) o acceso local a la instancia.

- Ejecutar localmente (solo para equipos de desarrollo/QA):

```powershell
npm install
npm run dev
```

- Accede a la URL que muestre Vite (ej. `http://localhost:5173`) o la dirección que te proporcione el administrador interno.

Espacio para captura: Login / Pantalla inicial

![Captura: Login](/docs/screenshots/login.png)

---

**Acceso / Login**

Qué hace el usuario:
- Ingresa su correo electrónico y contraseña.
- Pulsa el botón "Ingresar".

Resultados esperados:
- Acceso OK: redirección al panel principal (`/home` o `/quotes` si el rol es vendedor).
- Fallo: aparecerá un mensaje de error. Si la contraseña es incorrecta se mostrará una alerta modal con el texto "Contraseña incorrecta".

Comportamiento extra implementado:
- Errores de login devueltos por la API (por ejemplo 401) muestran una alerta clara con `alertError`.

Espacio para captura: Login error

![Captura: Login error](/docs/screenshots/login-error.png)

---

**Navegación general**

Elementos principales:
- Cabecera: muestra usuario autenticado, acceso a perfil y cierre de sesión.
- Menú principal: Home, Cotizaciones, Productos, Clientes, Usuarios/Administración (si aplica), About.
- Área de contenido: muestra la pantalla activa.

Consejos:
- Usa el buscador en cada lista para filtrar rápidamente.
- En mobile la navegación aparece en un menú hamburguesa.

Espacio para captura: Menú principal

![Captura: Menú principal](/docs/screenshots/menu-principal.png)

---

**Clientes**

Secciones: ver lista, crear, editar, encargados.

- Ver lista de clientes
	- Navega a "Clientes".
	- La pantalla muestra un listado o tarjetas con la información básica.
	- Usa el buscador para filtrar por nombre, ciudad, equipo o código.

	Espacio para captura: Lista de clientes

	![Captura: Lista de clientes](/docs/screenshots/clientes-lista.png)

- Crear cliente (paso a paso)
	1. Click en "Nuevo Cliente".
	2. Rellena los campos obligatorios (marcados con *). Campos habituales:
		 - Empresa responsable / Hospital
		 - Dependencia
		 - Estado / Ciudad / Código Postal
		 - Dirección
		 - Equipo / Marca / Modelo / Número de Serie (si aplica)
		 - Encargados: puedes agregar al menos un encargado con nombre, teléfono y email.
	3. Pulsa "Guardar".
	4. Verás una alerta de éxito (`alertSuccess`) cuando el guardado se complete.

	Espacio para captura: Formulario crear cliente (vacío)

	![Captura: Crear cliente](/docs/screenshots/cliente-crear.png)

- Editar cliente
	1. En la lista, pulsa "Editar" junto al cliente.
	2. Modifica los campos y pulsa "Guardar".
	3. Si existen validaciones fallidas, la aplicación mostrará alertas (modal) y mensajes inline junto a los campos.

- Encargados (agregar / editar / eliminar)
	- En el bloque "Encargados" podrás:
		- Agregar: completar nombre, cargo, teléfono (10 dígitos), email. Pulsa "Agregar Encargado".
		- Editar: editar en la lista previa al guardado o usar el formulario de edición.
		- Eliminar: al eliminar un encargado (confirmación) la app **persiste inmediatamente** los cambios en el servidor (PUT al cliente).

	Notas técnicas y de uso:
	- Validaciones: los nombres no admiten números ni caracteres raros; el teléfono acepta solo 10 dígitos. Si hay errores la app mostrará alertas (modal) con los mensajes y errores inline.
	- Al eliminar o agregar encargados se muestra un modal de confirmación y luego una alerta de éxito o error según la respuesta del servidor.

	Espacio para captura: Encargados - añadir

	![Captura: Encargados](/docs/screenshots/encargados.png)

---

**Productos**

- Ver catálogo
	- Navega a "Productos" para ver todos los productos disponibles con precio, código y (si existe) imagen.

	Espacio para captura: Catálogo de productos

	![Captura: Productos lista](/docs/screenshots/productos-lista.png)

- Agregar/Editar producto
	1. Pulsar "Agregar producto".
	2. Completar: código, descripción, precio unitario, stock (si aplica) y subir imagen.
	3. Guardar.

	Notas:
	- Precio: acepta decimales. La UI formatea a moneda.
	- Imagen: preferir formatos optimizados (AVIF, WEBP o JPG).

	Espacio para captura: Formulario producto

	![Captura: Producto crear](/docs/screenshots/producto-crear.png)

---

**Cotizaciones**

La funcionalidad central: construir una cotización y generar PDF.

- Crear cotización — paso a paso
	1. Ir a "Cotizaciones" -> "Nueva Cotización".
	2. Seleccionar empresa vendedora (si aplica) y cliente. Si seleccionas un cliente existente, puedes "Confirmar" para precargar encargado, email y teléfono.
	3. Añadir productos: usar el buscador para seleccionar productos o "Agregar Productos" para abrir el catálogo. También puedes crear líneas manuales.
	4. Ajustar cantidad y precio unitario (si es necesario). La línea mostrará el subtotal.
	5. Repetir hasta tener todas las líneas. El panel muestra el `Total Estimado` en tiempo real.
	6. Añadir términos/observaciones.
	7. Pulsar "Crear Cotización". Si hay errores de validación (p. ej. email inválido, campo requerido), se mostrará una alerta con los errores detallados y mensajes junto a los campos.

	Espacio para captura: Crear cotización (llenando campos)

	![Captura: Crear cotización](/docs/screenshots/cotizacion-crear.png)

- Detalle y PDF
	- Después de crear la cotización, la app intentará abrir una ventana de impresión con la plantilla. También puedes descargar el PDF desde la vista de detalle.
	- El PDF se genera con la plantilla correspondiente a la empresa vendedora (si aplica) y contiene folio, líneas, totales y condiciones.

	Espacio para captura: Vista detalle cotización / PDF

	![Captura: Cotización detalle](/docs/screenshots/cotizacion-detalle.png)

---

**Exportar / Importar**

- Importar clientes en lote (Excel)
	- En "Clientes" hay una opción para importar un archivo `.xlsx` o `.xls`.
	- Formato: la primera fila debe contener cabeceras; el importador mapeará columnas a campos de cliente.
	- Tras importar se muestra un resumen con éxitos/errores.

- Exportar (CSV/XLSX)
	- En las listas (Clientes, Cotizaciones, Productos) existe un botón de exportación donde puedes elegir formato.

Espacio para captura: Import / Export

![Captura: Import Export](/docs/screenshots/import-export.png)

---

**Roles y permisos**

- Roles comunes: `admin`, `vendedor`, `viewer` (ejemplos). Según tu rol, verás u ocultarás acciones (ej. vendedores no pueden editar algunos campos del equipo).
- Si falta alguna opción en tu menú (p. ej. Admin), contacta al administrador para revisar permisos.

---

**Validaciones y mensajes (comportamiento de la UI)**

- Validaciones comunes que la app aplica y muestran alertas:
	- Campos obligatorios: mostrados inline y en alerta modal si intentas guardar.
	- Email: validación de formato básico; alerta si inválido.
	- Teléfono: solo dígitos, exactamente 10 caracteres (si se proporciona). Se filtra automáticamente al escribir.
	- Nombres (cliente/encargado): no permiten números; se filtran caracteres inválidos al escribir.
	- Login: errores de credenciales muestran alerta modal "Contraseña incorrecta" si aplica.

Nota sobre alertas: la aplicación usa SweetAlert para mostrar alertas modales (`alertError`, `alertSuccess`) y también muestra mensajes inline junto a los campos.

---

**Resolución de problemas y FAQ**

- La app se queda «Guardando...» y no responde
	- Abrir DevTools → Network y comprobar si la petición `PUT /clients/:id` o `POST /clients` fue enviada y su respuesta.
	- Si la petición devuelve 4xx/5xx, copia la respuesta y compártela con el equipo de soporte.
	- Si no hay petición, revisa que tu conexión esté activa y que no haya JavaScript que bloquee la UI.

- Errores al eliminar encargados
	- El sistema persiste eliminaciones inmediatamente. Si tras eliminar vuelves a ver el encargado al recargar, probablemente la actualización falló en el servidor: revisa la petición PUT en Network y la respuesta. Si la respuesta muestra error de validación (p. ej. fechas con formato no ISO), ajusta el campo problemático o informa al equipo de backend.

- Fechas con formato inválido en inputs tipo `date`
	- Evita valores no-ISO (ej. `OCTUBRE-2023`) en campos `date`. Usa formato `YYYY-MM-DD`.

Preguntas frecuentes (rápidas)
- P: ¿Cómo restablezco mi contraseña?  
	R: Contacta al administrador; actualmente la app no tiene flujo de recuperación automática visible.
- P: ¿Puedo exportar solo un rango de fechas?  
	R: Sí, usa los filtros de la pantalla de Cotizaciones antes de exportar.

---

**Guiones de formación y ejercicios prácticos (recomendado para coachs)**

- Ejercicio 1 — Flujo completo (30–45 min)
	1. Iniciar sesión con credenciales de demo.
	2. Crear un cliente nuevo con al menos un encargado.
	3. Crear dos productos.
	4. Generar una cotización para el cliente con varios productos y generar el PDF.
	5. Editar la cotización y aplicar un descuento.

- Ejercicio 2 — Edición de encargados (10–15 min)
	1. Abrir un cliente con encargados.
	2. Agregar un encargado con teléfono no válido (ej. menos de 10 dígitos) y ver la validación.
	3. Agregar un encargado válido y eliminar uno. Confirmar que la eliminación persiste.

---

**Anexos: comandos y contactos**

- Comandos para desarrollo (PowerShell):

```powershell
npm ci
npm run dev
npm run build
```

- Contacto y soporte:
	- Responsable de producto: [nombre@empresa.example]
	- Equipo de TI: [soporte@empresa.example]

---

Este manual está preparado para que añadas capturas en la carpeta `docs/screenshots/` y después generar un PDF a partir del Markdown si lo necesitas. Si quieres, puedo:

- Añadir plantillas de slides con las capturas y texto resumido para formación.  
- Generar una versión imprimible (PDF) desde este Markdown.

¿Deseas que genere el PDF del manual ahora o que deje el archivo tal como está para que insertes tus capturas después? 


````

<!-- End USER_MANUAL.md content -->


---

<!-- Begin USER_MANUAL_EXTRA.md content -->

```markdown
# Manual — Secciones adicionales

Este archivo complementa `USER_MANUAL.md` con instrucciones paso a paso para acciones que pediste: enviar cotizaciones, editar/borrar cotizaciones, editar clientes, administrar máquinas/productos y gestionar usuarios.

---

## Enviar cotizaciones (por email)

1. Abre la cotización desde la lista o el panel de detalle.
2. Haz clic en `Enviar` o `Enviar por email`.
3. En el modal que aparece, confirma o edita el destinatario (se precargan los emails del cliente / encargado).
4. Añade un asunto y mensaje si lo deseas.
5. Pulsa `Enviar`.

- Resultado esperado: un `toast` de éxito (o `alertSuccess`) y registro en el histórico.
- En caso de fallo: la app muestra un `alertError` con la razón (dirección inválida, problema SMTP, etc.).

Espacio para captura: `/docs/screenshots/cotizacion-enviar.png`

---

## Editar cotizaciones

1. En la lista de cotizaciones, pulsa `Editar` en la fila correspondiente, o abre la cotización y pulsa `Editar`.
2. Cambia cantidades, precios, descuentos u observaciones.
3. Pulsa `Guardar`.

- Validaciones: la aplicación valida campos obligatorios (cliente, al menos una línea, cantidades positivas) antes de llamar al servidor.
- Resultado: `toast` de éxito al actualizar, o `alertError` con los mensajes devueltos por la API.

Espacio para captura: `/docs/screenshots/cotizacion-editar.png`

---

## Borrar cotizaciones

1. En la lista o vista detalle, pulsa el icono `Eliminar`.
2. Confirma en el modal de confirmación.
3. La aplicación solicitará al servidor borrar la cotización; si se permite, recibes `alertSuccess`.

- Nota: si la cotización está asociada a facturación u otro estado que impida borrado, la API devolverá un error y la app mostrará `alertError` con el motivo.

Espacio para captura: `/docs/screenshots/cotizacion-borrar.png`

---

## Editar Clientes (detallado)

### Modificar datos básicos
1. Clientes → buscar → `Editar`.
2. Modificar nombre, dirección, teléfono, email, etc.
3. Pulsar `Guardar`.

- Si hay errores de validación, la app muestra mensajes inline y un `alertError` resumen.

### Gestionar encargados
- Agregar: rellena nombre, teléfono (10 dígitos), email → `Agregar Encargado`.
- Editar: editar la fila en la lista de encargados → `Guardar`.
- Eliminar: `Eliminar` → confirmar → la app persiste inmediatamente los cambios (PUT). Si hay error en el servidor, recibirás `alertError` y el cambio no se confirmará.

Espacio para captura: `/docs/screenshots/cliente-encargados.png`

---

## Máquinas / Productos — editar y borrar

### Editar producto
1. Productos → buscar → `Editar`.
2. Cambia nombre, precio, stock, descripción o imagen.
3. `Guardar` → `toast` de éxito o `alertError` si falla.

### Borrar producto
1. Productos → `Eliminar` → confirmar.
2. Si el producto está referenciado en cotizaciones activas, el servidor puede impedir el borrado. En tal caso recibirás `alertError`.

Espacio para captura: `/docs/screenshots/producto-editar.png`

---

## Usuarios y Administración

### Crear usuario
1. Admin → Usuarios → `Nuevo usuario`.
2. Rellena: nombre, email, rol (ej. `admin`, `vendedor`), y opcionalmente contraseña temporal.
3. `Guardar` → `toast` de éxito.

### Editar usuario
1. Admin → Usuarios → `Editar`.
2. Cambiar rol o datos y `Guardar`.
3. Algunos cambios en permisos requieren que el usuario vuelva a iniciar sesión.

### Eliminar  usuario
1. Admin → Usuarios → `Eliminar` → confirmar.


Espacio para captura: `/docs/screenshots/usuario-crear.png`

---

