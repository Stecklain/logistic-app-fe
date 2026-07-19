import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FormEvent, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import LocationPicker from '../components/LocationPicker'
import { createPedido, getPedido, updatePedido } from '../services/pedidos'
import styles from './OrderFormPage.module.css'

interface FormState {
  direccionDestino: string
  localidad: string
  fechaEntrega: string
  lat: number | null
  lng: number | null
}

const INITIAL_FORM: FormState = {
  direccionDestino: '',
  localidad: '',
  fechaEntrega: '',
  lat: null,
  lng: null,
}

export default function OrderFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState(INITIAL_FORM)

  const pedidoQuery = useQuery({
    queryKey: ['pedido', id],
    queryFn: () => getPedido(id!),
    enabled: !!id,
  })

  useEffect(() => {
    if (pedidoQuery.data) {
      setForm({
        direccionDestino: pedidoQuery.data.direccionDestino,
        localidad: pedidoQuery.data.localidad,
        fechaEntrega: pedidoQuery.data.fechaEntrega,
        lat: pedidoQuery.data.lat,
        lng: pedidoQuery.data.lng,
      })
    }
  }, [pedidoQuery.data])

  useEffect(() => {
    if (pedidoQuery.data?.estado === 'entregado') {
      navigate('/pedidos', { replace: true })
    }
  }, [pedidoQuery.data, navigate])

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (id) {
        return updatePedido(id, form)
      }
      return createPedido(form)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      navigate('/pedidos')
    },
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    saveMutation.mutate()
  }

  if (pedidoQuery.data?.estado === 'entregado') {
    return null
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Módulo operativo</p>
        <h2>{id ? 'Editar pedido' : 'Nuevo pedido'}</h2>
      </header>

      <form onSubmit={handleSubmit} className={styles.panel}>
        <div className={styles.formLayout}>
          <LocationPicker
            key={id ?? 'new'}
            value={form.lat != null && form.lng != null ? { lat: form.lat, lng: form.lng } : null}
            onChange={(coords, address) =>
              setForm((prev) => ({ ...prev, ...coords, ...(address ?? {}) }))
            }
          />

          <div className={styles.fields}>
            <label className={styles.field}>
              <span>Dirección</span>
              <input
                data-testid="pedido-direccion"
                value={form.direccionDestino}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, direccionDestino: e.target.value }))
                }
                required
              />
            </label>

            <label className={styles.field}>
              <span>Localidad</span>
              <input
                data-testid="pedido-localidad"
                value={form.localidad}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, localidad: e.target.value }))
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
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, fechaEntrega: e.target.value }))
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
                {saveMutation.isPending ? 'Guardando…' : id ? 'Guardar cambios' : 'Crear pedido'}
              </button>
              <button
                type="button"
                className={styles.ghostBtn}
                onClick={() => navigate('/pedidos')}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </form>
    </section>
  )
}
