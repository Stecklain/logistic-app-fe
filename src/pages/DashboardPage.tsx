import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import MonthlyStatusTrendChart, {
  MonthlyStatusTrendPoint,
} from '../components/MonthlyStatusTrendChart'
import { authService } from '../services/auth'
import { getPedidoReporte } from '../services/pedidos'
import type { PedidoReporte } from '../types/domain'
import styles from './DashboardPage.module.css'

const cards = [
  {
    title: 'Pedidos',
    description: 'Alta, edición, eliminación, filtros y seguimiento interno.',
    to: '/pedidos',
  },
  {
    title: 'Rutas del día',
    description: 'Generación persistida de recorridos con origen manual y mapa operativo.',
    to: '/rutas',
  },
]

function buildTrendData(porEstadoYMes: PedidoReporte['porEstadoYMes']): MonthlyStatusTrendPoint[] {
  const byMonth = new Map<string, { entregados: number; cancelados: number }>()

  for (const row of porEstadoYMes) {
    const entry = byMonth.get(row.mes) ?? { entregados: 0, cancelados: 0 }
    if (row.estado === 'entregado') entry.entregados = row.total
    if (row.estado === 'cancelado') entry.cancelados = row.total
    byMonth.set(row.mes, entry)
  }

  const ultimosMeses = Array.from(byMonth.keys()).sort().slice(-6)
  return ultimosMeses.map((mes) => ({ mes, ...byMonth.get(mes)! }))
}

export default function DashboardPage() {
  const isAdmin = authService.getRole() === 'admin'

  const reporteQuery = useQuery({
    queryKey: ['pedidos-reporte', {}],
    queryFn: () => getPedidoReporte(),
    enabled: isAdmin,
  })

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>Operación diaria</p>
        <h2>Panel de logística inteligente</h2>
        <p>
          La base actual ya permite autenticar, gestionar pedidos, generar rutas y
          validar el estado público del envío.
        </p>
      </div>

      <div className={styles.grid}>
        {cards.map((card) => (
          <article key={card.title} className={styles.card}>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
            <Link to={card.to} className={styles.link}>
              Ir al módulo
            </Link>
          </article>
        ))}
      </div>

      {isAdmin ? (
        <div className={styles.chartCard}>
          <h3>Entregados vs cancelados por mes</h3>
          {reporteQuery.isLoading ? <p>Cargando…</p> : null}
          {reporteQuery.data ? (
            <MonthlyStatusTrendChart data={buildTrendData(reporteQuery.data.porEstadoYMes)} />
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
