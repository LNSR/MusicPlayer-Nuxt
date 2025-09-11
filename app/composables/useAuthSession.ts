import type { User, Role } from '@prisma/client';

interface AuthState {
  authenticated: boolean;
  user: Pick<User, 'id' | 'username' | 'role'> | null; 
  error: string | null;
  success: string | null;
}

export const useAuthSession = () => {
  const authState = useState<AuthState>('auth-state', () => ({
    authenticated: false,
    user: null,
    error: null,
    success: null,
  }));

  const { refresh, pending } = useAsyncData('auth-session', async () => {
    try {
      const response = await $fetch<{ authenticated: boolean; user: { id: number; username: string; role: Role } | null }>('/api/auth/me');
      console.log('Auth session API response:', response);
      authState.value = {
        ...authState.value,
        authenticated: response.authenticated,
        user: response.user,
        error: null,
        success: null,
      };
    } catch (err) {
      console.log('Auth session API error:', err);
      authState.value = {
        ...authState.value,
        authenticated: false,
        user: null,
        error: null,
        success: null,
      };
    }
  }, { server: false });

  const login = async (username: string, password: string) => {
    console.log('Attempting login for user:', username);
    authState.value.error = null;
    authState.value.success = null;
    try {
      await $fetch('/api/auth/auth', { method: 'POST', body: { username, password } });
      console.log('Login API call successful, refreshing session');
      await refresh();
      authState.value.success = 'Login successful!';
      console.log('Login completed successfully');
    } catch (e) {
      console.log('Login failed:', e);
      authState.value.error = e instanceof Error ? e.message : String(e);
      throw e;
    }
  };

  const logout = async () => {
    console.log('Attempting logout');
    try {
      await $fetch('/api/auth/logout', { method: 'POST' });
      console.log('Logout API call successful');
    } catch (e) {
      console.log('Logout API call failed:', e);
      // ignore
    }
    authState.value = {
      authenticated: false,
      user: null,
      error: null,
      success: null,
    };
    console.log('Auth state reset after logout');
  };

  return {
    user: computed(() => authState.value.user),
    authenticated: computed(() => authState.value.authenticated),
    error: computed(() => authState.value.error),
    success: computed(() => authState.value.success),
    loading: pending,
    refresh,
    login,
    logout,
  };
};