import * as Select from '@radix-ui/react-select'
import type { PedidoEstado } from '../types/domain'
import { ESTADO_COLORS, ESTADO_LABELS, ESTADO_TRANSICIONES } from '../utils/pedidoEstado'
import styles from './StatusSelect.module.css'

interface StatusSelectProps {
  value: PedidoEstado
  onChange: (estado: PedidoEstado) => void
  disabled?: boolean
}

export default function StatusSelect({ value, onChange, disabled }: StatusSelectProps) {
  const opciones = [value, ...ESTADO_TRANSICIONES[value]]
  const colors = ESTADO_COLORS[value]
  const isLocked = disabled || ESTADO_TRANSICIONES[value].length === 0

  return (
    <Select.Root
      value={value}
      onValueChange={(next) => onChange(next as PedidoEstado)}
      disabled={isLocked}
    >
      <Select.Trigger
        className={styles.trigger}
        style={{ background: colors.bg, color: colors.fg }}
        data-testid="estado-select"
      >
        <Select.Value>{ESTADO_LABELS[value]}</Select.Value>
        {!isLocked ? (
          <Select.Icon className={styles.icon}>▾</Select.Icon>
        ) : null}
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className={styles.content} position="popper" sideOffset={6}>
          <Select.Viewport>
            {opciones.map((estado) => (
              <Select.Item
                key={estado}
                value={estado}
                className={styles.item}
                data-testid={`estado-option-${estado}`}
              >
                <Select.ItemText>{ESTADO_LABELS[estado]}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
