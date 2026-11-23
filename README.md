# V&L Beauty Shop · Vite + React

Las 5 pantallas del diseño de Figma convertidas a React, CSS y Vite.

## Cómo correrlo

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # versión de producción en /dist
```

## Estructura

```
src/
├── assets/                  # logo, banner e imágenes de productos (cámbialos por los de Figma)
│   └── products/            # miniaturas por código de producto + index.js
├── components/
│   ├── ui/                  # piezas reutilizables: Button, Badge, Card, StatCard, Tabs,
│   │                        # DataTable, FormField, FilterSelect, Toggle, Callout, etc.
│   ├── layout/              # Navbar (menú entre pantallas), PageHeader, Footer, Layout
│   ├── products/            # pantalla Gestión de productos
│   ├── inventory/           # pantalla Consulta y control de inventario
│   ├── stock/               # pantalla Actualización automática de stock
│   ├── sales/               # pantalla Registro de ventas y facturación
│   └── reports/             # pantalla Generación de reportes
├── data/                    # datos de ejemplo de cada pantalla (reemplázalos por tu API)
├── pages/                   # una página por pantalla
├── styles/                  # variables de color/tipografía, estilos globales y rejillas
└── utils/                   # formato de moneda y estado de stock
```

Cada componente vive en su propia carpeta con su `.jsx` y su `.css`.
El alias `@` apunta a `src/`, por eso los imports son `@/components/...`.

## Rutas

| Ruta                 | Pantalla                                |
|----------------------|-----------------------------------------|
| `/productos`         | Gestión de productos                    |
| `/inventario`        | Consulta y control de inventario        |
| `/stock-automatico`  | Actualización automática de stock       |
| `/ventas`            | Registro de ventas y facturación        |
| `/reportes`          | Generación de reportes                  |

El menú de navegación está en `components/layout/Navbar`; para añadir o renombrar
una pantalla edita `src/data/navigation.js` y la ruta en `src/App.jsx`.

## Colores y tipografías

Todo está en `src/styles/variables.css` (rosa `--pink`, superficies, bordes, etc.).
Fuentes: Cormorant Garamond (títulos) e Inter (texto), cargadas desde Google Fonts en `index.html`.

## Funcionalidad de los botones

Toda la app comparte un estado central (`src/store/`) que se guarda en `localStorage`:

- `store/logic.js` – reglas de negocio puras (ventas, stock, compras, ajustes, productos, proveedores…). Cada función
  recibe el estado y devuelve `{ ok, state }` o `{ ok:false, error }`. **Es el punto donde conectar tu API.**
- `store/selectors.js` – cifras derivadas (estadísticas, reportes, alertas).
- `store/StoreProvider.jsx` – expone las acciones a los componentes (`useStore()`).
- `components/ui/Feedback` – avisos (`toast`) y confirmaciones (`confirm`) vía `useUI()`.
- `utils/files.js` y `utils/documents.js` – CSV, impresión/PDF, factura, cierre de caja y reportes.

Las cifras "de toda la tienda" (128 productos, 1.842 unidades, $5.780.250…) son la base de ejemplo; cada acción
suma o resta sobre ellas. El menú de la tienda (arriba a la derecha) trae «Restablecer datos de ejemplo».
