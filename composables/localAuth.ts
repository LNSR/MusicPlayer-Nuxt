import type { PrismaUser } from '~/lib/prisma'

const user = ref<PrismaUser | null>(null)
const loading = ref(false)
const error = ref(<string | null>(null))

export function useAuth() {
    function setUser(u: PrismaUser | null) {
        user.value = u
    }

    async function fetchUser() {
        loading.value = true;
        error.value = null;

        try {
            const response = await fetch('/api/auth/user');
            if (!response.ok) {
                throw new Error('Gagal mendapatkan data pengguna');
            }
            const data = await response.json();
            user.value = data.user ?? null;
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Terjadi kesalahan';
        } finally {
            loading.value = false;
        }
    }
    async function login(isUserOrEmail: string, password: string) {
        loading.value = true;
        error.value = null;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ identifier: isUserOrEmail, password }),
            });

            if (!response.ok) {
                throw new Error('Gagal masuk');
            }

            await fetchUser();
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Terjadi kesalahan';
        } finally {
            loading.value = false;
        }
    }

    async function logout() {
        loading.value = true;
        error.value = null;

        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Gagal keluar');
            }

            user.value = null;
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Terjadi kesalahan';
        } finally {
            loading.value = false;
        }
    }

    return { user, setUser, loading, error, fetchUser, login, logout };
}