import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/logo-app.png'
import { authService } from '../services/auth'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { token } = await authService.login(email, password)
      authService.saveSession(token)
      navigate('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <img src={logo} alt="Logística Inteligente" className={styles.logo} />
        <div>
          <p className={styles.eyebrow}>Acceso de operador</p>
          <h1>Entregas con trazabilidad y ruteo optimizado</h1>
          <p>
            Iniciá sesión para administrar pedidos, generar rutas del día y actualizar
            estados en tiempo real.
          </p>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Iniciar sesión</h2>
          <p>Usá tus credenciales para entrar al panel.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <label className={styles.field}>
            <span>Email</span>
            <input
              data-testid="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@empresa.com"
              autoComplete="email"
              required
            />
          </label>

          <label className={styles.field}>
            <span>Contraseña</span>
            <div className={styles.passwordWrap}>
              <input
                data-testid="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </label>

          {error ? <p className={styles.error} data-testid="login-error">{error}</p> : null}

          <button
            type="submit"
            className={styles.submit}
            disabled={loading}
            data-testid="login-submit"
          >
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <Link to="/tracking" className={styles.secondaryLink}>
          Ir al tracking público
        </Link>
      </section>
    </div>
  )
}
