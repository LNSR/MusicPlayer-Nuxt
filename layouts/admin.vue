<template>
  <div class="drawer lg:drawer-open">
    <input id="admin-drawer" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content flex flex-col">
      <!-- Admin Header -->
      <div class="navbar bg-base-200 shadow-sm">
        <div class="navbar-start">
          <label for="admin-drawer" class="btn btn-square btn-ghost lg:hidden">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </label>
          <h1 class="text-xl font-bold ml-2">Admin Dashboard</h1>
        </div>
        <div class="navbar-end">
          <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
              <div class="w-10 rounded-full">
                <img src="https://picsum.photos/40/40" alt="Admin Avatar" />
              </div>
            </div>
            <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
              <li><a>Profile</a></li>
              <li><a>Settings</a></li>
              <li><a @onclick="handleLogout()">Logout</a></li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <main class="flex-1 p-4 sm:p-6 bg-base-100">
        <slot />
      </main>
    </div>

    <!-- Sidebar -->
    <div class="drawer-side">
      <label for="admin-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
      <aside class="w-80 min-h-full bg-base-200">
        <div class="p-4">
          <div class="flex items-center gap-2 mb-8">
            <div class="avatar">
              <div class="w-8 rounded">
                <img src="https://picsum.photos/32/32" alt="Logo" />
              </div>
            </div>
            <span class="text-lg font-bold">MusicPlatform</span>
          </div>

          <!-- Navigation Menu -->
          <ul class="menu menu-vertical w-full">
            <li class="menu-title">Dashboard</li>
            <li><NuxtLink to="/admin" class="flex items-center gap-3">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
              </svg>
              Dashboard
            </NuxtLink></li>

            <li class="menu-title mt-4">Content Management</li>
            <li><NuxtLink to="/admin/users" class="flex items-center gap-3">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"></path>
              </svg>
              Users
            </NuxtLink></li>
            <li><NuxtLink to="/admin/music" class="flex items-center gap-3">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
              </svg>
              Music
            </NuxtLink></li>
            <li><NuxtLink to="/admin/playlists" class="flex items-center gap-3">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
              Playlists
            </NuxtLink></li>

            <li class="menu-title mt-4">Analytics</li>
            <li><NuxtLink to="/admin/analytics" class="flex items-center gap-3">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z"></path>
              </svg>
              Analytics
            </NuxtLink></li>

            <li class="menu-title mt-4">Settings</li>
            <li><NuxtLink to="/admin/settings" class="flex items-center gap-3">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Settings
            </NuxtLink></li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/localAuth'

async function handleLogout() {
  const { logout } = useAuth()
  await logout()
  window.location.href = '/'
}
</script>