import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FormEvent, useEffect, useState } from 'react'
import RouteMap from '../components/RouteMap'
import { generateRuta, getRutaById, listRutas } from '../services/rutas'
import styles from './RoutesPage.module.css'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export default function RoutesPage() {
  const queryClient = useQueryClient()
  const [fecha, setFecha] = useState(todayIso())
  const [origenTexto, setOrigenTexto] = useState('Depósito central')
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)

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
    onSuccess: (ruta) => {
      setSelectedRouteId(ruta.id)
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
                placeholder="Depósito central"
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
              {generateMutation.isPending ? 'Calculando…' : 'Generar ruta del día'}
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
                <strong>{ruta.fecha}</strong>
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
