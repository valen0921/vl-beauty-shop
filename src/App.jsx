import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from '@/components/layout/Layout/Layout'
import ProductsPage from '@/pages/ProductsPage'
import InventoryPage from '@/pages/InventoryPage'
import AutoStockPage from '@/pages/AutoStockPage'
import SalesPage from '@/pages/SalesPage'
import ReportsPage from '@/pages/ReportsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/productos" replace />} />
        <Route path="productos" element={<ProductsPage />} />
        <Route path="inventario" element={<InventoryPage />} />
        <Route path="stock-automatico" element={<AutoStockPage />} />
        <Route path="ventas" element={<SalesPage />} />
        <Route path="reportes" element={<ReportsPage />} />
        <Route path="*" element={<Navigate to="/productos" replace />} />
      </Route>
    </Routes>
  )
}
