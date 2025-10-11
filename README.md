# Tectrum Landing Page

Este repositorio ahora utiliza [Astro](https://astro.build/) para construir y publicar la landing page minimalista y responsive de Tectrum, consultora de transformación digital para pymes.

## Requisitos previos

- [Node.js](https://nodejs.org/) 18 o superior
- npm (incluido con Node.js)

## Ejecutar el proyecto en local

```bash
npm install
npm run dev
```

Abrí `http://localhost:4321` en tu navegador para navegar la landing con recarga en vivo.

## Generar la versión estática

```bash
npm run build
```

El sitio listo para publicar quedará en la carpeta `dist/`. Podés previsualizar el resultado con:

```bash
npm run preview
```

## Despliegue

El output es totalmente estático, por lo que podés subir el contenido de `dist/` a cualquier hosting estático como GitHub Pages, Netlify, Vercel u otro proveedor de tu preferencia.

### GitHub Pages

1. Ejecutá `npm run build`.
2. Copiá los archivos de `dist/` a una rama `gh-pages` o configurá GitHub Actions para desplegar automáticamente.
3. Activá GitHub Pages desde la configuración del repositorio apuntando a dicha rama o a `dist/` dentro de la rama principal.

### Netlify / Vercel

- **Netlify**: configurá el comando de build como `npm run build` y el directorio de publicación como `dist`.
- **Vercel**: seleccioná Astro como framework, usá `npm run build` y fijá `dist` como directorio de salida.

## Estructura de carpetas

```
.
├── astro.config.mjs       # Configuración principal de Astro
├── package.json           # Dependencias y scripts
├── src/
│   ├── pages/
│   │   └── index.astro    # Página principal con las secciones de la landing
│   ├── scripts/
│   │   └── interactions.js# Scroll suave y animaciones al hacer scroll
│   └── styles/
│       └── global.css     # Estilos globales inspirados en Apple/Tesla
└── public/                # Archivos estáticos (actualmente vacío)
```

## Contacto

Para consultas, escribí a [consultas@tectrum.ar](mailto:consultas@tectrum.ar).
