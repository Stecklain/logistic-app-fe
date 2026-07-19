import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FormEvent, useEffect, useState } from 'react'
import RouteMap from '../components/RouteMap'
import { getPedidosPendientesPorFecha } from '../services/pedidos'
import { generateRuta, getRutaById, listRutas } from '../services/rutas'
import styles from './RoutesPage.module.css'

const ORIGEN_POR_DEFECTO = 'Boulogne Sur Mer, Buenos Aires'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function parseIsoDateLocal(iso: string) {
  const [anio, mes, dia] = iso.split('-').map(Number)
  return new Date(anio, (mes || 1) - 1, dia || 1)
}

function toIsoLocal(date: Date) {
  const anio = date.getFullYear()
  const mes = String(date.getMonth() + 1).padStart(2, '0')
  const dia = String(date.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

function getWeekRange(offset: number) {
  const hoy = new Date()
  const indiceLunes = (hoy.getDay() + 6) % 7 // 0 = lunes ... 6 = domingo
  const lunes = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - indiceLunes + offset * 7)
  const domingo = new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + 6)
  return { desde: toIsoLocal(lunes), hasta: toIsoLocal(domingo) }
}

function formatFechaCorta(iso: string) {
  return parseIsoDateLocal(iso).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
  })
}

function formatRangoSemana(desde: string, hasta: string) {
  const opciones: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  const inicio = parseIsoDateLocal(desde).toLocaleDateString('es-AR', opciones)
  const fin = parseIsoDateLocal(hasta).toLocaleDateString('es-AR', opciones)
  return `${inicio} – ${fin}`
}

export default function RoutesPage() {
  const queryClient = useQueryClient()
  const [fecha, setFecha] = useState(todayIso())
  const [origenTexto, setOrigenTexto] = useState(ORIGEN_POR_DEFECTO)
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const [semanaOffset, setSemanaOffset] = useState(0)

  const semana = getWeekRange(semanaOffset)

  const pendientesQuery = useQuery({
    queryKey: ['pedidos-pendientes-por-fecha', semana.desde, semana.hasta],
    queryFn: () => getPedidosPendientesPorFecha(semana),
  })

  const rutasQuery = useQuery({
    queryKey: ['rutas', fecha],
    queryFn: () => listRutas(fecha),
  })

  useEffect(() => {
    if (rutasQuery.data?.length) {
      setSelectedRouteId((current) => current || rutasQuery.data[0].id)
    } else {
      setSelectedRouteId(null)
    }
  }, [rutasQuery.data])

  const detailQuery = useQuery({
    queryKey: ['ruta', selectedRouteId],
    queryFn: () => getRutaById(selectedRouteId!),
    enabled: !!selectedRouteId,
  })

  const generateMutation = useMutation({
    mutationFn: () => generateRuta({ fecha, origenTexto }),
    onSuccess: (rutas) => {
      setSelectedRouteId(rutas[0]?.id ?? null)
      void queryClient.invalidateQueries({ queryKey: ['rutas'] })
      void queryClient.invalidateQueries({ queryKey: ['ruta'] })
    },
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    generateMutation.mutate()
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Planificación diaria</p>
          <h2>Rutas óptimas</h2>
        </div>
      </header>

      <div className={styles.pendientesPanel}>
        <div className={styles.pendientesHeader}>
          <p className={styles.pendientesLabel}>Días con pedidos pendientes</p>
          <div className={styles.semanaNav}>
            <button
              type="button"
              data-testid="semana-anterior"
              className={styles.semanaNavBtn}
              onClick={() => setSemanaOffset((offset) => offset - 1)}
            >
              ‹ Semana anterior
            </button>
            <span className={styles.semanaLabel}>{formatRangoSemana(semana.desde, semana.hasta)}</span>
            <button
              type="button"
              data-testid="semana-siguiente"
              className={styles.semanaNavBtn}
              onClick={() => setSemanaOffset((offset) => offset + 1)}
            >
              Semana siguiente ›
            </button>
            {semanaOffset !== 0 ? (
              <button
                type="button"
                className={styles.semanaHoyBtn}
                onClick={() => setSemanaOffset(0)}
              >
                Hoy
              </button>
            ) : null}
          </div>
        </div>

        {pendientesQuery.data?.length ? (
          <div className={styles.pendientesRow}>
            {pendientesQuery.data.map((item) => (
              <button
                key={item.fecha}
                type="button"
                data-testid="pendientes-chip"
                className={
                  fecha === item.fecha
                    ? `${styles.pendienteChip} ${styles.pendienteChipActive}`
                    : styles.pendienteChip
                }
                onClick={() => setFecha(item.fecha)}
              >
                <span>{formatFechaCorta(item.fecha)}</span>
                <strong>{item.total}</strong>
              </button>
            ))}
          </div>
        ) : (
          <p className={styles.pendientesVacio}>Sin pedidos pendientes esta semana.</p>
        )}
      </div>

      <div className={styles.layout}>
        <div className={styles.panel}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <label className={styles.field}>
              <span>Fecha</span>
              <input
                data-testid="ruta-fecha"
                type="date"
                value={fecha}
                onChange={(event) => setFecha(event.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span>Origen del día</span>
              <input
                data-testid="ruta-origen"
                value={origenTexto}
                onChange={(event) => setOrigenTexto(event.target.value)}
                placeholder={ORIGEN_POR_DEFECTO}
              />
            </label>

            {generateMutation.error ? (
              <p className={styles.error}>
                {generateMutation.error instanceof Error
                  ? generateMutation.error.message
                  : 'No fue posible generar la ruta'}
              </p>
            ) : null}

            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={generateMutation.isPending}
              data-testid="generate-route"
            >
              {generateMutation.isPending ? 'Calculando…' : 'Generar rutas del día'}
            </button>
          </form>

          <div className={styles.routeList}>
            {(rutasQuery.data || []).map((ruta) => (
              <button
                key={ruta.id}
                type="button"
                data-testid="route-list-item"
                className={selectedRouteId === ruta.id ? `${styles.routeItem} ${styles.routeItemActive}` : styles.routeItem}
                onClick={() => setSelectedRouteId(ruta.id)}
              >
                <strong>Zona: {ruta.zona || 'Sin agrupar'}</strong>
                <span>{ruta.rutaPedidos.length} paradas</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.panel}>
          {detailQuery.data ? (
            <>
              <RouteMap ruta={detailQuery.data} />
              <div className={styles.stopList}>
                {detailQuery.data.rutaPedidos.map((stop) => (
                  <article key={stop.id} className={styles.stopCard} data-testid="route-stop">
                    <div>
                      <strong>#{stop.ordenVisita}</strong>
                      <p>{stop.pedido.direccionDestino}</p>
                      <small>{stop.pedido.localidad}</small>
                    </div>
                    <div className={styles.metrics}>
                      <span>{stop.distanciaMetros} m</span>
                      <span>{stop.duracionSegundos} s</span>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <p>Generá o seleccioná una ruta para ver el detalle.</p>
          )}
        </div>
      </div>
    </section>
  )
}
