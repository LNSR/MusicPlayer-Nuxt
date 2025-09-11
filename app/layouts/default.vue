<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
    <header
      class="w-full bg-gray-900 dark:bg-gray-800 text-white py-4 px-6 flex items-center justify-between shadow relative">
      <div class="text-xl font-bold">MusicPlatform</div>

      <nav class="space-x-4 flex items-center">
        <NuxtLink to="/" class="hover:underline">Home</NuxtLink>
        <button @click="theme.toggle" class="hover:underline focus:outline-none">
          <span v-if="theme.isHydrated.value === false">...</span>
          <span v-else>{{ theme.preference.value === 'light' ? '☀️' : '🌙' }}</span>
        </button>
        <template v-if="auth.authenticated.value === false">
          <button @click="showLogin = !showLogin" class="hover:underline focus:outline-none">Login</button>
        </template>
        <template v-else>
          <NuxtLink to="/admin" class="hover:underline">Admin</NuxtLink>
          <button @click="auth.logout()" class="hover:underline focus:outline-none">Logout</button>
        </template>
      </nav>

      <div v-if="showLogin" class="fixed inset-0 flex items-center justify-center z-50">
        <div class="text-black rounded shadow-lg p-6 w-80">
          <Login @close="showLogin = false" />
        </div>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer
      class="w-full bg-gray-900 dark:bg-gray-800 text-white py-4 px-6 flex items-center justify-center mt-8 fixed-bottom-0">
      <span class="text-sm">&copy; {{ new Date().getFullYear() }} MusicPlatform. All rights reserved.</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import Login from '@/components/login.vue';
import { useAuthSession } from '~/composables/useAuthSession';
import { useTheme } from '~/composables/ui/useTheme';

const showLogin = ref(false);
const auth = useAuthSession();
const theme = useTheme();
</script>
