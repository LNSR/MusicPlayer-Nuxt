<template>
  <div class="drawer lg:drawer-open">
    <!-- Drawer toggle input -->
    <input id="admin-drawer" v-model="sidebarOpen" type="checkbox" class="drawer-toggle" />

    <!-- Drawer content (main content area) -->
    <div class="drawer-content flex flex-col min-h-screen">
      <!-- Header -->
      <div class="navbar bg-base-100 shadow-lg">
        <div class="navbar-start">
          <label for="admin-drawer" class="btn btn-square btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </label>
          <NuxtLink to="/" class="btn btn-ghost text-xl">MusicPlatform Admin</NuxtLink>
        </div>
        <div class="navbar-end">
          <div class="flex items-center gap-2">
            <template v-if="!loading && user">
              <div class="dropdown dropdown-end">
                <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
                  <div class="w-10 rounded-full">
                    <div
                      class="bg-neutral text-neutral-content rounded-full w-10 h-10 flex items-center justify-center">
                      {{ (user.name ?? '').charAt(0).toUpperCase() }}
                    </div>
                  </div>
                </div>
                <ul tabindex="0"
                  class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                  <li class="menu-title">
                    <span>{{ user.name }}</span>
                  </li>
                  <li><a>Profile</a></li>
                  <li><a>Settings</a></li>
                  <li><a @click="onLogout">Logout</a></li>
                </ul>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <main class="flex-1 p-6">
        <slot />
      </main>

      <!-- Footer -->
      <footer class="footer footer-center p-6 bg-base-200 text-base-content">
        <div>
          <p>© 2025 MusicPlatform Admin. All rights reserved.</p>
        </div>
      </footer>
    </div>

    <!-- Drawer side (sidebar) -->
    <div class="drawer-side">
      <label for="admin-drawer" aria-label="close sidebar" class="drawer-overlay" />
      <aside class="min-h-full w-64 bg-base-200 text-base-content">
        <!-- Sidebar header -->
        <div class="p-4 border-b border-base-300">
          <h2 class="text-lg font-semibold">Admin Panel</h2>
        </div>
        <!-- Sidebar menu -->
        <ul class="menu p-4 space-y-2">
          <li>
            <NuxtLink to="/admin" class="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
              </svg>
              Dashboard
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/admin/users" class="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 3.13a4 4 0 010 7.75M8 3.13a4 4 0 000 7.75" />
              </svg>
              Manage Users
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/admin/music" class="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 19V6h13M9 6l-2 2m0 0L5 6m2 2V6" />
              </svg>
              Manage Music
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/" class="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Site
            </NuxtLink>
          </li>
        </ul>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { user, loading, logout, fetchUser } = useAuth()

await useAsyncData('user', async () => {
  await fetchUser()
  return user.value
})

const onLogout = async () => {
  await logout()
}

const sidebarOpen = ref(false)
</script>