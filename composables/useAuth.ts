import { ref, onMounted } from 'vue'

export function useAuth() {
  const user = ref<{ id: number; name: string; email: string; role: string } | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)

  async function fetchUser() {
    const { data } = await useFetch<{ user?: { id: number; name: string; email: string; role: string } }>('/api/auth/me')
    user.value = data.value?.user ?? null
  }

  onMounted(fetchUser)

  async function login(identifier: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await useFetch('/api/auth/login', {
        method: 'POST',
        body: { email: identifier, password }
      })
      if (fetchError.value) throw fetchError.value
      if (data.value && 'user' in data.value) {
        user.value = (data.value as { user: { id: number; name: string; email: string; role: string } }).user
      } else {
        user.value = null
      }

      await fetchUser()
      return true
    } catch (e: unknown) {
      type ErrorWithMessage = { data?: { message?: string } }
      if (typeof e === 'object' && e !== null && 'data' in e && typeof (e as ErrorWithMessage).data?.message === 'string') {
        error.value = (e as ErrorWithMessage).data!.message!
      } else {
        error.value = 'Login failed'
      }
      return false
    } finally {
      loading.value = false
    }
  }

  async function register(name: string, email: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await useFetch('/api/auth/register', {
        method: 'POST',
        body: { name, email, password }
      })
      if (fetchError.value) throw fetchError.value
      if (data.value && 'user' in data.value) {
        const registeredUser = (data.value as { user: { id: number; name: string; email: string; role?: string } }).user
        user.value = registeredUser
          ? { ...registeredUser, role: registeredUser.role ?? 'user' }
          : null
      } else {
        user.value = null
      }
      return true
    } catch (e: unknown) {
      type ErrorWithMessage = { data?: { message?: string } }
      if (typeof e === 'object' && e !== null && 'data' in e && typeof (e as ErrorWithMessage).data?.message === 'string') {
        error.value = (e as ErrorWithMessage).data!.message!
      } else {
        error.value = 'Register failed'
      }
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await useFetch('/api/auth/logout', { method: 'POST' })
    user.value = null
  }

  return { user, error, loading, login, register, logout }
}