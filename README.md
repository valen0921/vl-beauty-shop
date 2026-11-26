# V&L Beauty Shop

Proyecto de Ingeniería de Software: sistema web para gestionar productos, inventario, ventas/facturación,
proveedores y reportes de la tienda V&L Beauty Shop.

Hecho con React + Vite en el frontend, un backend propio en Node/Express, y PostgreSQL como base de datos

## Cómo correrlo

### 1. Base de datos

Necesitas tener PostgreSQL instalado. Con pgAdmin (o psql):

```sql
CREATE USER vlbeauty WITH PASSWORD 'vlbeauty123';
CREATE DATABASE vlbeauty OWNER vlbeauty;
```

Luego, conectado a la base `vlbeauty`, corre el archivo `schema.sql` para crear las tablas.

Si te sale error de permisos al guardar datos, corre esto también:

```sql
GRANT USAGE, CREATE ON SCHEMA public TO vlbeauty;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vlbeauty;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO vlbeauty;
```

### 2. Backend

```bash
cd server
npm install
npm start
```

Queda corriendo en `http://localhost:4000`. Por defecto se conecta a la base `vlbeauty` con el usuario
`vlbeauty` (los datos de conexión están al inicio de `server/index.js`, por si cambias el usuario o la
contraseña de tu Postgres).

### 3. Frontend

```bash
npm install
npm run dev
```

Con el backend ya corriendo, la app carga y guarda los datos directo en la base de datos. Si por algún
motivo el backend no está prendido, la app igual abre con datos de ejemplo (pero no se guarda nada hasta
que vuelvas a prender el backend).

## Estructura del proyecto

```
src/
├── components/     # un componente por carpeta (su .jsx y su .css)
│   ├── ui/           # botones, tarjetas, tablas, etc. reutilizables
│   ├── layout/        # navbar y encabezados
│   ├── products/      # pantalla de Productos
│   ├── inventory/      # pantalla de Inventario
│   ├── stock/          # pantalla de Stock automático
│   ├── sales/           # pantalla de Ventas
│   └── reports/          # pantalla de Reportes
├── pages/           # una página por pantalla
├── store/           # el estado de toda la app
│   ├── logic.js       # reglas de negocio (ventas, compras, stock, productos...)
│   ├── selectors.js    # cálculos para reportes y estadísticas, con datos reales
│   └── StoreProvider.jsx  # conecta el estado con el backend (GET/POST /api/estado)
└── utils/            # formato de moneda, generación de PDF/Excel, etc.
server/
├── index.js         # la API (Express) conectada a PostgreSQL
└── package.json
schema.sql            # el esquema de la base de datos
```

El alias `@` apunta a `src/`, por eso los imports se ven como `@/components/...`.

## Rutas

| Ruta | Pantalla |
|---|---|
| `/productos` | Gestión de productos |
| `/inventario` | Consulta y control de inventario |
| `/stock-automatico` | Actualización automática de stock |
| `/ventas` | Registro de ventas y facturación |
| `/reportes` | Generación de reportes |

## Cómo funciona el guardado

Al abrir la app, pide todo el estado al backend (`GET /api/estado`). Cada vez que haces algo (una venta,
un producto nuevo, una compra, un ajuste de stock...) se manda todo el estado de nuevo al backend
(`POST /api/estado`), que lo guarda en PostgreSQL. Si algo falla a mitad de camino, no se guarda nada a
medias — se revierte todo el cambio.

Los números que se ven en Ventas y Reportes (total del día, ticket promedio, productos más vendidos, etc.)
se calculan al vuelo a partir de lo que ya está registrado, no hay cifras inventadas mezcladas.