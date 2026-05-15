import { useNavigate } from 'react-router-dom'
import { authService } from '../services/auth'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  const navigate = useNavigate()

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.brand}>Logística Inteligente</span>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Cerrar sesión
        </button>
      </header>
      <main className={styles.main}>
        <h2>Bienvenido al panel</h2>
        <p>Próximamente: gestión de pedidos y rutas.</p>
      </main>
    </div>
  )
}
