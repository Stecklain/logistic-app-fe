import { ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AdminRoute from './components/AdminRoute'
import AppShell from './components/AppShell'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import OrderFormPage from './pages/OrderFormPage'
import OrdersListPage from './pages/OrdersListPage'
import PrivacyPage from './pages/PrivacyPage'
import ProfilePage from './pages/ProfilePage'
import PublicTrackingPage from './pages/PublicTrackingPage'
import ReportePage from './pages/ReportePage'
import RoutesPage from './pages/RoutesPage'
import UsersPage from './pages/UsersPage'
import { authService } from './services/auth'

function PrivateRoute({ children }: { children: ReactElement }) {
  return authService.isAuthenticated() ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/tracking" element={<PublicTrackingPage />} />
      <Route path="/privacidad" element={<PrivacyPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AppShell />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="pedidos" element={<OrdersListPage />} />
        <Route path="pedidos/nuevo" element={<OrderFormPage />} />
        <Route path="pedidos/:id/editar" element={<OrderFormPage />} />
        <Route path="rutas" element={<RoutesPage />} />
        <Route
          path="reporte"
          element={
            <AdminRoute>
              <ReportePage />
            </AdminRoute>
          }
        />
        <Route path="perfil" element={<ProfilePage />} />
        <Route
          path="usuarios"
          element={
            <AdminRoute>
              <UsersPage />
            </AdminRoute>
          }
        />
      </Route>
      <Route
        path="*"
        element={<Navigate to={authService.isAuthenticated() ? '/' : '/login'} replace />}
      />
    </Routes>
  )
}
