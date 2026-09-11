# SDD Design System

Base de React + TypeScript creada con la plantilla oficial `react-ts` de Vite.
Punto de partida para continuar el laboratorio del curso de SDD.

## Iniciar el proyecto

Abre una terminal dentro de esta carpeta y ejecuta:

```sh
npm install
npm run dev
```

Si las dependencias ya están instaladas, basta con `npm run dev`.
Abre la dirección local que indique Vite. Para detenerlo, pulsa Ctrl+C.

## Comandos

- `npm run dev`: inicia el servidor de desarrollo.
- `npm run build`: comprueba TypeScript y genera la aplicación en `dist/`.
- `npm run lint`: revisa el código con Oxlint, incluido en esta plantilla de Vite.
- `npm run preview`: permite visualizar la compilación después de `npm run build`.
- `npm run storybook`: inicia Storybook en modo desarrollo en el puerto 6006.
- `npm run build-storybook`: genera la versión estática de Storybook en `storybook-static/`.
- `npm run test`: ejecuta las pruebas una sola vez y termina; durante la configuración inicial también admite una suite vacía.

## Estructura

- `src/`: código React, estilos y recursos de la plantilla.
- `src/main.tsx`: punto de entrada de React.
- `src/App.tsx`: componente principal con la demostración inicial de Vite.
- `public/`: archivos estáticos.
- `index.html`: documento HTML de entrada.
- `package.json`: dependencias y comandos.
- `package-lock.json`: versiones exactas instaladas.
- `tsconfig.json`: referencia las configuraciones de TypeScript de la app y de Vite.
- `tsconfig.app.json`: configuración para `src/`.
- `tsconfig.node.json`: configuración para `vite.config.ts`.
- `vite.config.ts`: configuración de Vite y del plugin React.
- `.storybook/`: configuración mínima de Storybook y carga de los estilos globales.
- `vitest.config.ts`: configuración de Vitest con el entorno DOM de pruebas.
- `src/test/setup.ts`: limpieza compartida después de cada prueba de componentes.

## Continuar el curso

Este proyecto corresponde a la base previa al primer ejercicio.
El siguiente paso del curso es crear `specs/select/spec.md` y revisar la especificación.
Las specs, el componente Select, Storybook, tests y CI se incorporarán conforme avances.

Referencia de la plantilla: https://vite.dev/guide/
