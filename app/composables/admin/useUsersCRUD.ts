import { type UserForm, Role } from '#shared/types/form'
export function useUsersCRUD() {
  
  const users = ref<UserForm[]>([])
  const page = ref(1)
  const perPage = 20
  const total = ref(0)
  const totalPages = computed(() => Math.ceil(total.value / perPage))

  const showModal = ref(false)
  const isEditing = ref(false)
  const editingUser = ref<UserForm | null>(null)
  const loading = ref(false)
  const success = ref<string | null>(null)
  const error = ref<string | null>(null)

  const form = ref<{
    username: string
    name: string
    password: string
    role: Role
  }>({
    username: '',
    name: '',
    password: '',
    role: Role.USER
  })

  async function fetchUsers() {
    try {
      const response = await $fetch<{ data: UserForm[]; meta: { total: number } }>(`/api/admin/users/all?page=${page.value}&perPage=${perPage}`, {
        method: 'GET',
      })
      users.value = response.data
      total.value = response.meta.total
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  function openCreateModal() {
    isEditing.value = false
    editingUser.value = null
    form.value = { username: '', name: '', password: '', role: Role.USER }
    success.value = null
    error.value = null
    showModal.value = true
  }

  function openEditModal(user: UserForm) {
    isEditing.value = true
    editingUser.value = user
    form.value = { username: user.username, name: user.name, password: '', role: user.role as Role }
    success.value = null
    error.value = null
    showModal.value = true
  }

  function closeModal() {
    showModal.value = false
    success.value = null
    error.value = null
  }

  async function submitUser() {
    loading.value = true
    success.value = null
    error.value = null
    try {
      if (isEditing.value && editingUser.value) {
        await $fetch(`/api/admin/users/${editingUser.value.id}`, {
          method: 'PUT',
          body: { username: form.value.username, role: form.value.role, name: form.value.name, password: form.value.password || undefined }
        })
        success.value = 'User updated successfully'
      } else {
        await $fetch('/api/admin/users/create', {
          method: 'POST',
          body: form.value
        })
        success.value = 'User created successfully'
      }
      await fetchUsers()
      // closeModal() will be called by the composable on success
    } catch (err) {
      error.value = 'Failed to save user'
      console.error('Failed to save user:', err)
    } finally {
      loading.value = false
    }
  }

  async function deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await $fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
        await fetchUsers()
      } catch (error) {
        console.error('Failed to delete user:', error)
      }
    }
  }

  function prevPage() {
    if (page.value > 1) {
      page.value--
      fetchUsers()
    }
  }

  function nextPage() {
    if (page.value < totalPages.value) {
      page.value++
      fetchUsers()
    }
  }

  return {
    users,
    page,
    perPage,
    total,
    totalPages,
    showModal,
    isEditing,
    editingUser,
    loading,
    success,
    error,
    form,
    fetchUsers,
    openCreateModal,
    openEditModal,
    closeModal,
    submitUser,
    deleteUser,
    prevPage,
    nextPage
  }
}
