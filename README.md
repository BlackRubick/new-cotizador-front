# New Cotizador Front

Proyecto inicial con Vite + React + Tailwind CSS y estructura basada en Atomic Design.

Estructura relevante:
- src/atoms - componentes más pequeños (botones, inputs, iconos)
- src/components/atoms - (moved) componentes más pequeños. Se ha adaptado la estructura para usar `src/components/atoms`.
- src/molecules - combinaciones de atoms
- src/organisms - secciones completas (header, footer)
- src/templates - plantillas de página
- src/pages - páginas finales

Scripts:
- npm run dev — inicia el servidor de desarrollo
- npm run build — construye para producción
- npm run preview — sirve la build localmente

Instalación:
1. Instalar dependencias:

```bash
npm install
```

2. Iniciar desarrollo:

```bash
npm run dev
```

Rutas incluidas (ejemplo):
- / → Home
- /about → About

Notas:
- El proyecto incluye configuración mínima de Tailwind y PostCSS.
- Si quieres añadimos ESLint/Prettier y CI.
