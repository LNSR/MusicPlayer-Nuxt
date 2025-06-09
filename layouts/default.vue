<script setup lang="ts">
import { useAuth } from '~/composables/localAuth'
import type { PrismaUser } from '~/lib/prisma'

const { data: userData } = await useFetch<{ user: PrismaUser | null }>('/api/auth/user', { credentials: 'include' })
const { setUser } = useAuth()

// Hydrate composable state on setup (works SSR and client)
if (userData.value?.user) {
  setUser(userData.value.user)
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <DefaultHeader />
    <main class="flex-1 p-4 sm:p-8">
      <slot />
    </main>
    <DefaultFooter />
  </div>
</template>