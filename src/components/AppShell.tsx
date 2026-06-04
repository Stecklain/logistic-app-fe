import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { authService } from '../services/auth'
import styles from './AppShell.module.css'

const navItems = [
  { to: '/', label: 'Resumen' },
  { to: '/pedidos', label: 'Pedidos' },
  { to: '/rutas', label: 'Rutas' },
  { to: '/tracking', label: 'Tracking público' },
]

export default function AppShell() {
  const navigate = useNavigate()

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.eyebrow}>Logística</p>
          <h1 className={styles.title}>Panel operativo</h1>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className={styles.logoutBtn}
          onClick={handleLogout}
          data-testid="logout-button"
        >
          Cerrar sesión
        </button>
      </aside>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}
