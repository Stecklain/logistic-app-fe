import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmDialog from '../components/ConfirmDialog'
import StatusSelect from '../components/StatusSelect'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { deletePedido, listPedidos, updatePedidoEstado } from '../services/pedidos'
import type { PedidoEstado } from '../types/domain'
import { ESTADO_LABELS } from '../utils/pedidoEstado'
import styles from './OrdersListPage.module.css'

const MIN_SEARCH_CHARS = 3

function toSearchFilter(raw: string) {
  return raw.length === 0 || raw.length >= MIN_SEARCH_CHARS ? raw : undefined
}

export default function OrdersListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [estado, setEstado] = useState<PedidoEstado | ''>('')
  const [trackingInput, setTrackingInput] = useState('')
  const [localidadInput, setLocalidadInput] = useState('')
  const [page, setPage] = useState(1)

  const debouncedTracking = useDebouncedValue(trackingInput, 350)
  const debouncedLocalidad = useDebouncedValue(localidadInput, 350)

  const filters = {
    estado,
    codigoTracking: toSearchFilter(debouncedTracking),
    localidad: toSearchFilter(debouncedLocalidad),
    page,
    pageSize: 10,
  }

  const pedidosQuery = useQuery({
    queryKey: ['pedidos', filters],
    queryFn: () => listPedidos(filters),
  })

  const deleteMutation = useMutation({
    mutationFn: deletePedido,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pedidos'] })
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, estado: nuevoEstado }: { id: string; estado: PedidoEstado }) =>
      updatePedidoEstado(id, nuevoEstado),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pedidos'] })
    },
  })

  const updateFilter = (setter: (value: string) => void) => (value: string) => {
    setter(value)
    setPage(1)
  }

  const totalPages = pedidosQuery.data?.totalPages ?? 1

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Módulo operativo</p>
          <h2>Gestión de pedidos</h2>
        </div>

        <div className={styles.headerActions}>
          <a
            href="/tracking"
            target="_blank"
            rel="noreferrer"
            className={styles.ghostBtn}
          >
            Tracking público
          </a>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => navigate('/pedidos/nuevo')}
          >
            Nuevo pedido
          </button>
        </div>
      </header>

      <div className={styles.panel}>
        <div className={styles.filters}>
          <input
            data-testid="filter-tracking"
            placeholder="Buscar tracking (mín. 3 caracteres)"
            value={trackingInput}
            onChange={(e) => updateFilter(setTrackingInput)(e.target.value)}
          />
          <input
            data-testid="filter-localidad"
            placeholder="Filtrar localidad (mín. 3 caracteres)"
            value={localidadInput}
            onChange={(e) => updateFilter(setLocalidadInput)(e.target.value)}
          />
          <select
            data-testid="filter-estado"
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value as PedidoEstado | '')
              setPage(1)
            }}
          >
            <option value="">Todos los estados</option>
            {Object.entries(ESTADO_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {pedidosQuery.isFetching ? (
            <span className={styles.spinner} data-testid="pedidos-loading">
              Buscando…
            </span>
          ) : null}
        </div>

        {pedidosQuery.error ? (
          <p className={styles.error}>
            {pedidosQuery.error instanceof Error
              ? pedidosQuery.error.message
              : 'No fue posible cargar pedidos'}
          </p>
        ) : null}

        {statusMutation.error ? (
          <p className={styles.error}>
            {statusMutation.error instanceof Error
              ? statusMutation.error.message
              : 'No fue posible actualizar el estado'}
          </p>
        ) : null}

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tracking</th>
                <th>Dirección</th>
                <th>Localidad</th>
                <th>Fecha entrega</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosQuery.data?.items.map((pedido) => (
                <tr key={pedido.id} data-testid="pedido-card">
                  <td className={styles.tracking}>{pedido.codigoTracking}</td>
                  <td>{pedido.direccionDestino}</td>
                  <td>{pedido.localidad}</td>
                  <td>{pedido.fechaEntrega}</td>
                  <td>
                    <StatusSelect
                      value={pedido.estado}
                      disabled={statusMutation.isPending}
                      onChange={(nuevoEstado) =>
                        statusMutation.mutate({ id: pedido.id, estado: nuevoEstado })
                      }
                    />
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.ghostBtn}
                        disabled={pedido.estado === 'entregado'}
                        title={
                          pedido.estado === 'entregado'
                            ? 'Un pedido entregado no se puede editar'
                            : undefined
                        }
                        onClick={() => navigate(`/pedidos/${pedido.id}/editar`)}
                      >
                        Editar
                      </button>

                      <ConfirmDialog
                        trigger={
                          <button type="button" className={styles.dangerBtn}>
                            Eliminar
                          </button>
                        }
                        title="Eliminar pedido"
                        description={`¿Seguro que querés eliminar el pedido ${pedido.codigoTracking}? Esta acción no se puede deshacer.`}
                        confirmLabel="Eliminar"
                        onConfirm={() => deleteMutation.mutate(pedido.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}

              {!pedidosQuery.isLoading && pedidosQuery.data?.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    No se encontraron pedidos con estos filtros.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.ghostBtn}
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </button>
          <span>
            Página {pedidosQuery.data?.page ?? page} de {totalPages} ·{' '}
            {pedidosQuery.data?.total ?? 0} pedidos
          </span>
          <button
            type="button"
            className={styles.ghostBtn}
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Siguiente
          </button>
        </div>
      </div>
    </section>
  )
}
