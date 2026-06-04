import { Link } from 'react-router-dom'
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
  {
    title: 'Tracking público',
    description: 'Consulta pública por código sin exponer datos sensibles.',
    to: '/tracking',
  },
]

export default function DashboardPage() {
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
    </section>
  )
}
