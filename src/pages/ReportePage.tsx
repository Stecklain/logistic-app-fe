import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { getPedidoReporte } from '../services/pedidos'
import { ESTADO_COLORS, ESTADO_LABELS } from '../utils/pedidoEstado'
import styles from './ReportePage.module.css'

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

const CURRENT_YEAR = new Date().getFullYear()
const ANIOS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2, CURRENT_YEAR - 3]
const LOCALIDAD_PAGE_SIZE = 10

export default function ReportePage() {
  const [anio, setAnio] = useState<number | ''>('')
  const [mes, setMes] = useState<number | ''>('')
  const [localidadPage, setLocalidadPage] = useState(1)

  const filters = {
    anio: anio || undefined,
    mes: mes || undefined,
  }

  const reporteQuery = useQuery({
    queryKey: ['pedidos-reporte', filters],
    queryFn: () => getPedidoReporte(filters),
  })

  const porLocalidadYMes = reporteQuery.data?.porLocalidadYMes ?? []
  const localidadTotalPages = Math.max(1, Math.ceil(porLocalidadYMes.length / LOCALIDAD_PAGE_SIZE))
  const localidadPageSafe = Math.min(localidadPage, localidadTotalPages)
  const porLocalidadYMesPage = porLocalidadYMes.slice(
    (localidadPageSafe - 1) * LOCALIDAD_PAGE_SIZE,
    localidadPageSafe * LOCALIDAD_PAGE_SIZE
  )

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Analítica</p>
          <h2>Reporte de pedidos</h2>
        </div>

        <button type="button" className={styles.printBtn} onClick={() => window.print()}>
          Imprimir / Guardar como PDF
        </button>
      </header>

      <div className={`${styles.panel} ${styles.filtersPanel}`}>
        <label className={styles.filterField}>
          <span>Año</span>
          <select
            value={anio}
            onChange={(e) => {
              setAnio(e.target.value ? Number(e.target.value) : '')
              setLocalidadPage(1)
            }}
          >
            <option value="">Todos</option>
            {ANIOS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.filterField}>
          <span>Mes</span>
          <select
            value={mes}
            onChange={(e) => {
              setMes(e.target.value ? Number(e.target.value) : '')
              setLocalidadPage(1)
            }}
          >
            <option value="">Todos</option>
            {MESES.map((nombre, index) => (
              <option key={nombre} value={index + 1}>
                {nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      {reporteQuery.isLoading ? <p>Cargando reporte…</p> : null}
      {reporteQuery.error ? <p>No fue posible cargar el reporte.</p> : null}

      {reporteQuery.data ? (
        <>
          <div className={styles.panel}>
            <h3>Pedidos por estado</h3>
            <div className={styles.statsRow}>
              {reporteQuery.data.porEstado.map((item) => (
                <div
                  key={item.estado}
                  className={styles.statTile}
                  style={{
                    background: ESTADO_COLORS[item.estado].bg,
                    color: ESTADO_COLORS[item.estado].fg,
                  }}
                >
                  <span>{ESTADO_LABELS[item.estado]}</span>
                  <strong>{item.total}</strong>
                </div>
              ))}
              {reporteQuery.data.porEstado.length === 0 ? (
                <p>No hay pedidos en el período seleccionado.</p>
              ) : null}
            </div>
          </div>

          <div className={styles.panel}>
            <h3>Pedidos por localidad y mes</h3>
            <table>
              <thead>
                <tr>
                  <th>Localidad</th>
                  <th>Mes</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {porLocalidadYMesPage.map((row) => (
                  <tr key={`${row.localidad}-${row.mes}`}>
                    <td>{row.localidad}</td>
                    <td>{row.mes}</td>
                    <td>{row.total}</td>
                  </tr>
                ))}
                {porLocalidadYMes.length === 0 ? (
                  <tr>
                    <td colSpan={3} className={styles.emptyState}>
                      No hay datos para el período seleccionado.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>

            {porLocalidadYMes.length > 0 ? (
              <div className={styles.pagination}>
                <button
                  type="button"
                  className={styles.pageBtn}
                  disabled={localidadPageSafe <= 1}
                  onClick={() => setLocalidadPage((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </button>
                <span>
                  Página {localidadPageSafe} de {localidadTotalPages} ·{' '}
                  {porLocalidadYMes.length} filas
                </span>
                <button
                  type="button"
                  className={styles.pageBtn}
                  disabled={localidadPageSafe >= localidadTotalPages}
                  onClick={() => setLocalidadPage((p) => Math.min(localidadTotalPages, p + 1))}
                >
                  Siguiente
                </button>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </section>
  )
}
