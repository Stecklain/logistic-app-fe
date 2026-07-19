import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FormEvent, useState } from 'react'
import {
  adminSetPassword,
  createUser,
  listUsers,
  updateUserEmail,
  updateUserRoleActive,
} from '../services/users'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import ConfirmDialog from '../components/ConfirmDialog'
import RoleSelect from '../components/RoleSelect'
import type { UserRole } from '../types/domain'
import { ROLE_COLORS, ROLE_LABELS } from '../utils/userRole'
import styles from './UsersPage.module.css'

const MIN_SEARCH_CHARS = 3
const PAGE_SIZE = 10

function toSearchFilter(raw: string) {
  return raw.length === 0 || raw.length >= MIN_SEARCH_CHARS ? raw : undefined
}

export default function UsersPage() {
  const queryClient = useQueryClient()

  const [emailInput, setEmailInput] = useState('')
  const [role, setRole] = useState<UserRole | ''>('')
  const [active, setActive] = useState<'' | 'true' | 'false'>('')
  const [page, setPage] = useState(1)

  const debouncedEmail = useDebouncedValue(emailInput, 350)

  const filters = {
    email: toSearchFilter(debouncedEmail),
    role,
    active: active === '' ? ('' as const) : active === 'true',
    page,
    pageSize: PAGE_SIZE,
  }

  const usersQuery = useQuery({
    queryKey: ['users', filters],
    queryFn: () => listUsers(filters),
  })

  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'logistica' as UserRole })
  const [editingEmailId, setEditingEmailId] = useState<string | null>(null)
  const [emailDraft, setEmailDraft] = useState('')
  const [resettingPasswordId, setResettingPasswordId] = useState<string | null>(null)
  const [passwordDraft, setPasswordDraft] = useState('')

  const invalidateUsers = () => queryClient.invalidateQueries({ queryKey: ['users'] })
  const totalPages = usersQuery.data?.totalPages ?? 1

  const createMutation = useMutation({
    mutationFn: () => createUser(newUser),
    onSuccess: () => {
      setNewUser({ email: '', password: '', role: 'logistica' })
      void invalidateUsers()
    },
  })

  const emailMutation = useMutation({
    mutationFn: (id: string) => updateUserEmail(id, emailDraft),
    onSuccess: () => {
      setEditingEmailId(null)
      void invalidateUsers()
    },
  })

  const passwordMutation = useMutation({
    mutationFn: (id: string) => adminSetPassword(id, passwordDraft),
    onSuccess: () => {
      setResettingPasswordId(null)
      setPasswordDraft('')
      void invalidateUsers()
    },
  })

  const roleActiveMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { role?: UserRole; active?: boolean } }) =>
      updateUserRoleActive(id, payload),
    onSuccess: () => void invalidateUsers(),
  })

  const handleCreate = (event: FormEvent) => {
    event.preventDefault()
    createMutation.mutate()
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Administración</p>
        <h2>Usuarios</h2>
      </header>

      <form onSubmit={handleCreate} className={styles.panel}>
        <h3>Nuevo usuario</h3>
        <div className={styles.newUserForm}>
          <label className={styles.field}>
            <span>Email</span>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </label>

          <label className={styles.field}>
            <span>Contraseña</span>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
              minLength={6}
              required
            />
          </label>

          <label className={styles.field}>
            <span>Rol</span>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser((prev) => ({ ...prev, role: e.target.value as UserRole }))}
            >
              <option value="logistica">Logística</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <button type="submit" className={styles.primaryBtn} disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creando…' : 'Crear usuario'}
          </button>
        </div>

        {createMutation.error ? (
          <p className={styles.error}>
            {createMutation.error instanceof Error
              ? createMutation.error.message
              : 'No fue posible crear el usuario'}
          </p>
        ) : null}
      </form>

      <div className={styles.panel}>
        <div className={styles.filters}>
          <input
            placeholder="Buscar email (mín. 3 caracteres)"
            value={emailInput}
            onChange={(e) => {
              setEmailInput(e.target.value)
              setPage(1)
            }}
          />
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value as UserRole | '')
              setPage(1)
            }}
          >
            <option value="">Todos los roles</option>
            <option value="logistica">Logística</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={active}
            onChange={(e) => {
              setActive(e.target.value as '' | 'true' | 'false')
              setPage(1)
            }}
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
          {usersQuery.isFetching ? <span className={styles.spinner}>Buscando…</span> : null}
        </div>

        <div className={styles.list}>
          {usersQuery.isLoading ? <p>Cargando usuarios…</p> : null}

          {!usersQuery.isLoading && usersQuery.data?.items.length === 0 ? (
            <p className={styles.emptyState}>No se encontraron usuarios con estos filtros.</p>
          ) : null}

          {usersQuery.data?.items.map((user) => (
            <article key={user.id} className={styles.userCard}>
              <div>
                <h4>{user.email}</h4>
                <span
                  className={styles.badge}
                  style={{
                    background: ROLE_COLORS[user.role].bg,
                    color: ROLE_COLORS[user.role].fg,
                  }}
                >
                  {ROLE_LABELS[user.role]}
                </span>
                <span className={`${styles.badge} ${user.active ? '' : styles.badgeInactive}`}>
                  {user.active ? 'activo' : 'inactivo'}
                </span>

                {editingEmailId === user.id ? (
                  <div className={styles.inlineEdit}>
                    <input
                      type="email"
                      value={emailDraft}
                      onChange={(e) => setEmailDraft(e.target.value)}
                    />
                    <button
                      type="button"
                      className={styles.primaryBtn}
                      onClick={() => emailMutation.mutate(user.id)}
                      disabled={emailMutation.isPending}
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      className={styles.ghostBtn}
                      onClick={() => setEditingEmailId(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                ) : null}

                {resettingPasswordId === user.id ? (
                  <div className={styles.inlineEdit}>
                    <input
                      type="password"
                      placeholder="Nueva contraseña"
                      value={passwordDraft}
                      onChange={(e) => setPasswordDraft(e.target.value)}
                      minLength={6}
                    />
                    <button
                      type="button"
                      className={styles.primaryBtn}
                      onClick={() => passwordMutation.mutate(user.id)}
                      disabled={passwordMutation.isPending}
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      className={styles.ghostBtn}
                      onClick={() => setResettingPasswordId(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                ) : null}
              </div>

              <div className={styles.actions}>
                <RoleSelect
                  value={user.role}
                  disabled={roleActiveMutation.isPending}
                  onChange={(role) =>
                    roleActiveMutation.mutate({
                      id: user.id,
                      payload: { role },
                    })
                  }
                />

                <button
                  type="button"
                  className={styles.ghostBtn}
                  onClick={() => {
                    setEditingEmailId(user.id)
                    setEmailDraft(user.email)
                    setResettingPasswordId(null)
                  }}
                >
                  Editar email
                </button>

                <button
                  type="button"
                  className={styles.ghostBtn}
                  onClick={() => {
                    setResettingPasswordId(user.id)
                    setPasswordDraft('')
                    setEditingEmailId(null)
                  }}
                >
                  Resetear password
                </button>

                {user.active ? (
                  <ConfirmDialog
                    trigger={
                      <button type="button" className={styles.dangerBtn}>
                        Desactivar
                      </button>
                    }
                    title="Desactivar usuario"
                    description={`¿Seguro que querés desactivar a ${user.email}? No va a poder iniciar sesión hasta que lo reactives.`}
                    confirmLabel="Desactivar"
                    onConfirm={() =>
                      roleActiveMutation.mutate({
                        id: user.id,
                        payload: { active: false },
                      })
                    }
                  />
                ) : (
                  <button
                    type="button"
                    className={styles.ghostBtn}
                    onClick={() =>
                      roleActiveMutation.mutate({
                        id: user.id,
                        payload: { active: true },
                      })
                    }
                  >
                    Activar
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>

        {usersQuery.data && usersQuery.data.items.length > 0 ? (
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
              Página {usersQuery.data.page} de {totalPages} · {usersQuery.data.total} usuarios
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
        ) : null}
      </div>
    </section>
  )
}
