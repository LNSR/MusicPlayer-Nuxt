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
    if (!confirm('Are you sure you want to delete this user?')) return
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
    createForm,
    createError,
    createLoading,
    createUser,
    changeRole,
    deleteUser
  }
}