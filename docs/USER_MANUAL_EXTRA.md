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

### Eliminar o desactivar usuario
1. Admin → Usuarios → `Eliminar` → confirmar.
2. Si no es posible eliminar, usa `Desactivar` (si existe) para bloquear el acceso sin borrar datos.

### Restablecer contraseña
1. Admin → Usuarios → `Restablecer contraseña` o `Enviar email de activación`.
2. El usuario recibirá instrucciones por correo.

Espacio para captura: `/docs/screenshots/usuario-crear.png`

---

## Notas finales y recomendaciones

- Preferencia UX recomendada: mostrar **modales** para errores críticos y confirmaciones, y usar **toasts** para notificar éxitos no intrusivos. Mantener validación inline en formularios para correcciones rápidas.
- Si quieres que incorpore estas reglas en todo el código (reemplazar llamadas a `alertSuccess`/`alertError` por un wrapper uniforme y usar `toast` para éxitos) puedo automatizar un refactor parcial.

---

Si quieres, ahora:
- Puedo copiar estas secciones dentro de `USER_MANUAL.md` (si prefieres que las inserte en el mismo archivo),
- O generar un PDF combinando `USER_MANUAL.md` + `USER_MANUAL_EXTRA.md` en un solo documento imprimible,
- O crear plantillas de capturas en `docs/screenshots/` con imágenes de ejemplo.

Dime cuál acción prefieres y la realizo a continuación.
