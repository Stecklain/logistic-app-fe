import { useMutation } from '@tanstack/react-query'
import { FormEvent, useState } from 'react'
import { changeOwnPassword } from '../services/users'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const mutation = useMutation({
    mutationFn: () => changeOwnPassword(currentPassword, newPassword),
    onSuccess: () => {
      setCurrentPassword('')
      setNewPassword('')
    },
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    mutation.mutate()
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Cuenta</p>
        <h2>Mi perfil</h2>
      </header>

      <form onSubmit={handleSubmit} className={styles.panel}>
        <h3>Cambiar contraseña</h3>

        <label className={styles.field}>
          <span>Contraseña actual</span>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span>Nueva contraseña</span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>

        {mutation.error ? (
          <p className={styles.error}>
            {mutation.error instanceof Error
              ? mutation.error.message
              : 'No fue posible cambiar la contraseña'}
          </p>
        ) : null}

        {mutation.isSuccess ? (
          <p className={styles.success}>Contraseña actualizada correctamente.</p>
        ) : null}

        <button type="submit" className={styles.primaryBtn} disabled={mutation.isPending}>
          {mutation.isPending ? 'Guardando…' : 'Actualizar contraseña'}
        </button>
      </form>
    </section>
  )
}
