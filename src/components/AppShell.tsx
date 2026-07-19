import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { authService } from '../services/auth'
import styles from './AppShell.module.css'

const baseNavItems = [
  { to: '/', label: 'Resumen' },
  { to: '/pedidos', label: 'Pedidos' },
  { to: '/rutas', label: 'Rutas' },
  { to: '/perfil', label: 'Perfil' },
]

const adminNavItems = [
  { to: '/reporte', label: 'Reporte' },
  { to: '/usuarios', label: 'Usuarios' },
]

export default function AppShell() {
  const navigate = useNavigate()
  const isAdmin = authService.getRole() === 'admin'
  const navItems = isAdmin ? [...baseNavItems, ...adminNavItems] : baseNavItems

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

        <div>
          <Link to="/privacidad" className={styles.footerLink}>
            Aviso de privacidad
          </Link>
          <button
            type="button"
            className={styles.logoutBtn}
            onClick={handleLogout}
            data-testid="logout-button"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}
