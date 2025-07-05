
export function useAuth() {
  const loading = useState('auth-loading', () => false)
  const error = useState<string | null>('auth-error', () => null)
  const user = useState<{ name?: string } | null>(
    'auth-user',
    () => null
  )

  async function login(email: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const res = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email, password },
        credentials: 'include'
      })
      user.value = res as typeof user.value
      return true
    } catch (e: any) {
      error.value = e?.data?.message || 'Login failed'
      user.value = null
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    error.value = null
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      user.value = null
      await navigateTo('/')
      return true
    } catch (e: any) {
      error.value = e?.data?.message || 'Logout failed'
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchUser() {
    loading.value = true
    try {
      const res = await $fetch('/api/session/user', { credentials: 'include' })
      user.value = res as typeof user.value
    } catch {
      user.value = null
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    error,
    login,
    logout,
    fetchUser
  }
}