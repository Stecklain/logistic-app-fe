import * as Select from '@radix-ui/react-select'
import type { UserRole } from '../types/domain'
import { ROLE_COLORS, ROLE_LABELS } from '../utils/userRole'
import styles from './StatusSelect.module.css'

const ROLES: UserRole[] = ['logistica', 'admin']

interface RoleSelectProps {
  value: UserRole
  onChange: (role: UserRole) => void
  disabled?: boolean
}

export default function RoleSelect({ value, onChange, disabled }: RoleSelectProps) {
  const colors = ROLE_COLORS[value]

  return (
    <Select.Root
      value={value}
      onValueChange={(next) => onChange(next as UserRole)}
      disabled={disabled}
    >
      <Select.Trigger
        className={styles.trigger}
        style={{ background: colors.bg, color: colors.fg }}
      >
        <Select.Value>{ROLE_LABELS[value]}</Select.Value>
        <Select.Icon className={styles.icon}>▾</Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className={styles.content} position="popper" sideOffset={6}>
          <Select.Viewport>
            {ROLES.map((role) => (
              <Select.Item key={role} value={role} className={styles.item}>
                <Select.ItemText>{ROLE_LABELS[role]}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
