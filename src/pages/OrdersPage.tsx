import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FormEvent, useState } from 'react'
import {
  createPedido,
  deletePedido,
  listPedidos,
  updatePedido,
  updatePedidoEstado,
} from '../services/pedidos'
import type { Pedido, PedidoEstado } from '../types/domain'
import styles from './OrdersPage.module.css'

const INITIAL_FORM = {
  direccionDestino: '',
  localidad: '',
  fechaEntrega: '',
}

export default function OrdersPage() {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState({
    estado: '' as PedidoEstado | '',
    localidad: '',
    codigoTracking: '',
  })
  const [form, setForm] = useState(INITIAL_FORM)
  const [editing, setEditing] = useState<Pedido | null>(null)

  const pedidosQuery = useQuery({
    queryKey: ['pedidos', filters],
    queryFn: () => listPedidos(filters),
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        return updatePedido(editing.id, form)
      }

      return createPedido(form)
    },
    onSuccess: () => {
      setForm(INITIAL_FORM)
      setEditing(null)
      void queryClient.invalidateQueries({ queryKey: ['pedidos'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deletePedido,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pedidos'] })
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: PedidoEstado }) =>
      updatePedidoEstado(id, estado),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pedidos'] })
    },
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    saveMutation.mutate()
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Módulo operativo</p>
          <h2>Gestión de pedidos</h2>
        </div>
      </header>

      <div className={styles.layout}>
        <form onSubmit={handleSubmit} className={styles.panel}>
          <h3>{editing ? 'Editar pedido' : 'Nuevo pedido'}</h3>

          <label className={styles.field}>
            <span>Dirección</span>
            <input
              data-testid="pedido-direccion"
              value={form.direccionDestino}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, direccionDestino: event.target.value }))
              }
              required
            />
          </label>

          <label className={styles.field}>
            <span>Localidad</span>
            <input
              data-testid="pedido-localidad"
              value={form.localidad}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, localidad: event.target.value }))
              }
              required
            />
          </label>

          <label className={styles.field}>
            <span>Fecha de entrega</span>
            <input
              data-testid="pedido-fecha"
              type="date"
              value={form.fechaEntrega}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, fechaEntrega: event.target.value }))
              }
              required
            />
          </label>

          {saveMutation.error ? (
            <p className={styles.error}>
              {saveMutation.error instanceof Error
                ? saveMutation.error.message
                : 'No fue posible guardar el pedido'}
            </p>
          ) : null}

          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={saveMutation.isPending}
              data-testid="pedido-submit"
            >
              {saveMutation.isPending
                ? 'Guardando…'
                : editing
                  ? 'Guardar cambios'
                  : 'Crear pedido'}
            </button>
            {editing ? (
              <button
                type="button"
                className={styles.ghostBtn}
                onClick={() => {
                  setEditing(null)
                  setForm(INITIAL_FORM)
                }}
              >
                Cancelar edición
              </button>
            ) : null}
          </div>
        </form>

        <div className={styles.panel}>
          <div className={styles.filters}>
            <input
              data-testid="filter-tracking"
              placeholder="Buscar tracking"
              value={filters.codigoTracking}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, codigoTracking: event.target.value }))
              }
            />
            <input
              data-testid="filter-localidad"
              placeholder="Filtrar localidad"
              value={filters.localidad}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, localidad: event.target.value }))
              }
            />
            <select
              data-testid="filter-estado"
              value={filters.estado}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  estado: event.target.value as PedidoEstado | '',
                }))
              }
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_ruta">En ruta</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div className={styles.list}>
            {pedidosQuery.isLoading ? <p>Cargando pedidos…</p> : null}
            {pedidosQuery.error ? (
              <p className={styles.error}>
                {pedidosQuery.error instanceof Error
                  ? pedidosQuery.error.message
                  : 'No fue posible cargar pedidos'}
              </p>
            ) : null}

            {pedidosQuery.data?.items.map((pedido) => (
              <article key={pedido.id} className={styles.orderCard} data-testid="pedido-card">
                <div>
                  <p className={styles.tracking}>{pedido.codigoTracking}</p>
                  <h4>{pedido.direccionDestino}</h4>
                  <p>
                    {pedido.localidad} · {pedido.fechaEntrega}
                  </p>
                  <span className={styles.badge}>{pedido.estado}</span>
                </div>

                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.ghostBtn}
                    onClick={() => {
                      setEditing(pedido)
                      setForm({
                        direccionDestino: pedido.direccionDestino,
                        localidad: pedido.localidad,
                        fechaEntrega: pedido.fechaEntrega,
                      })
                    }}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    className={styles.ghostBtn}
                    onClick={() =>
                      statusMutation.mutate({
                        id: pedido.id,
                        estado: pedido.estado === 'entregado' ? 'pendiente' : 'entregado',
                      })
                    }
                  >
                    {pedido.estado === 'entregado' ? 'Reabrir' : 'Marcar entregado'}
                  </button>

                  <button
                    type="button"
                    className={styles.dangerBtn}
                    onClick={() => deleteMutation.mutate(pedido.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
