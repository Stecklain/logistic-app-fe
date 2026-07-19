import { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'
import { authService } from '../services/auth'

export default function AdminRoute({ children }: { children: ReactElement }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  if (authService.getRole() !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}
