<template>
  <div class="drawer lg:drawer-open">
    <!-- Drawer toggle input -->
    <input id="main-drawer" v-model="sidebarOpen" type="checkbox" class="drawer-toggle" />
    
    <!-- Drawer content (main content area) -->
    <div class="drawer-content flex flex-col min-h-screen">
      <!-- Header -->
      <div class="navbar bg-base-100 shadow-lg">
        <div class="navbar-start">
          <label for="main-drawer" class="btn btn-square btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </label>
          <NuxtLink to="/" class="btn btn-ghost text-xl">MusicPlatform</NuxtLink>
        </div>
        
        <div class="navbar-end">
          <div class="flex items-center gap-2">
            <template v-if="!loading && user">
              <div class="dropdown dropdown-end">
                <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
                  <div class="w-10 rounded-full">
                    <div class="bg-neutral text-neutral-content rounded-full w-10 h-10 flex items-center justify-center">
                      {{ (user.name ?? '').charAt(0).toUpperCase() }}
                    </div>
                  </div>
                </div>
                <ul tabindex="0" class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                  <li class="menu-title">
                    <span>{{ user.name }}</span>
                  </li>
                  <li><a>Profile</a></li>
                  <li><a>Settings</a></li>
                  <li><a @click="onLogout">Logout</a></li>
                </ul>
              </div>
            </template>
            <template v-else>
              <NuxtLink to="/auth/login" class="btn btn-ghost btn-sm">Login</NuxtLink>
              <NuxtLink to="/register" class="btn btn-primary btn-sm">Register</NuxtLink>
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
          <p>© 2025 MusicPlatform. All rights reserved.</p>
        </div>
      </footer>
    </div>
    
    <!-- Drawer side (sidebar) -->
    <div class="drawer-side">
      <label for="main-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
      <aside class="min-h-full w-64 bg-base-200 text-base-content">
        <!-- Sidebar header -->
        <div class="p-4 border-b border-base-300">
          <h2 class="text-lg font-semibold">Navigation</h2>
        </div>
        
        <!-- Sidebar menu -->
        <ul class="menu p-4 space-y-2">
          <li>
            <NuxtLink to="/" class="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
              </svg>
              Home
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/explore" class="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Explore
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/upload" class="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/library" class="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Library
            </NuxtLink>
          </li>
        </ul>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '~/composables/useAuth'

const { user, loading, logout, fetchUser } = useAuth()

await useAsyncData('user', async () => {
  await fetchUser()
  return user.value
})

async function onLogout() {
  await logout()
}

// Sidebar state
const sidebarOpen = ref(false)
</script>