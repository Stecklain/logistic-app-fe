import { useMutation } from '@tanstack/react-query'
import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTrackingByCode } from '../services/tracking'
import styles from './PublicTrackingPage.module.css'

export default function PublicTrackingPage() {
  const [codigo, setCodigo] = useState('')

  const trackingMutation = useMutation({
    mutationFn: () => getTrackingByCode(codigo),
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    trackingMutation.mutate()
  }

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Consulta pública</p>
        <h1>Seguimiento del pedido</h1>
        <p>Ingresá tu código de tracking para consultar el estado actual del envío.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            data-testid="tracking-code-input"
            value={codigo}
            onChange={(event) => setCodigo(event.target.value)}
            placeholder="TRK-XXXXXX"
          />
          <button
            type="submit"
            className={styles.primaryBtn}
            disabled={trackingMutation.isPending}
            data-testid="tracking-submit"
          >
            {trackingMutation.isPending ? 'Consultando…' : 'Consultar'}
          </button>
        </form>

        {trackingMutation.error ? (
          <p className={styles.error}>
            {trackingMutation.error instanceof Error
              ? trackingMutation.error.message
              : 'No fue posible consultar el pedido'}
          </p>
        ) : null}

        {trackingMutation.data ? (
          <article className={styles.result} data-testid="tracking-result">
            <strong>{trackingMutation.data.codigoTracking}</strong>
            <h2>{trackingMutation.data.estado}</h2>
            <p>Fecha estimada / asignada: {trackingMutation.data.fechaEntrega}</p>
          </article>
        ) : null}

        <Link to="/login" className={styles.backLink}>
          Volver al acceso interno
        </Link>
      </div>
    </section>
  )
}
