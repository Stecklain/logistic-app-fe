import { ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import OrdersPage from './pages/OrdersPage'
import PublicTrackingPage from './pages/PublicTrackingPage'
import RoutesPage from './pages/RoutesPage'
import { authService } from './services/auth'

function PrivateRoute({ children }: { children: ReactElement }) {
  return authService.isAuthenticated() ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/tracking" element={<PublicTrackingPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AppShell />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="pedidos" element={<OrdersPage />} />
        <Route path="rutas" element={<RoutesPage />} />
      </Route>
      <Route
        path="*"
        element={<Navigate to={authService.isAuthenticated() ? '/' : '/login'} replace />}
      />
    </Routes>
  )
}
