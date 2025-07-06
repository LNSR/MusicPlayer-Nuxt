import { ref } from 'vue'

export type User = {
  id: number
  name: string | null
  email: string
  role: 'SUPERADMIN' | 'ADMIN' | 'VISITOR'
}

export function useUserManagement() {
  const users = ref<User[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)
  const roleOptions = ref<{ value: string; label: string }[]>([])

  const createForm = ref({
    name: '',
    email: '',
    password: '',
    role: 'VISITOR' as User['role']
  })
  const createError = ref<string | null>(null)
  const createLoading = ref(false)

  async function fetchUsers() {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch('/api/admin/users/users')
      users.value = data || []
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch users'
    } finally {
      loading.value = false
    }
  }

  async function fetchRoleOptions() {
    try {
      const data = await $fetch<string[]>('/api/admin/users/roles')
      roleOptions.value = (data || [])
        .filter(role => role !== 'SUPERADMIN')
        .map(role => ({ value: role, label: role }))
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch role options'
    }
  }

  async function createUser() {
    createError.value = null
    createLoading.value = true
    try {
      await $fetch('/api/admin/users/users', {
        method: 'POST',
        body: { ...createForm.value }
      })
      createForm.value = { name: '', email: '', password: '', role: 'VISITOR' }
      await fetchUsers()
    } catch (err: any) {
      createError.value = err?.data?.statusMessage || err?.message || 'Failed to create user'
    } finally {
      createLoading.value = false
    }
  }

  async function changeRole(userId: number, newRole: User['role']) {
    try {
      await $fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: { role: newRole }
      })
      await fetchUsers()
    } catch (err) {
      alert('Failed to update role')
    }
  }

  async function deleteUser(userId: number) {
    try {
      await $fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
      users.value = users.value.filter(u => u.id !== userId)
    } catch (err) {
      alert('Failed to delete user')
    }
  }

  return {
    users,
    loading,
    error,
    fetchUsers,
    fetchRoleOptions,
    roleOptions,
    createForm,
    createError,
    createLoading,
    createUser,
    changeRole,
    deleteUser
  }
}