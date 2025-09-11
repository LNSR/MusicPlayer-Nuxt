<template>
  <div class="min-h-screen flex bg-gray-100 dark:bg-gray-900">
    <aside class="w-64 bg-white dark:bg-gray-800 border-r">
      <div class="flex items-center space-x-3 p-4">
        <div class="h-8 w-8 bg-blue-600 text-white rounded flex items-center justify-center font-bold">A</div>
        <div>
          <div class="text-sm font-semibold">Admin</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Panel</div>
        </div>
      </div>
      <nav class="p-4">
        <ul class="space-y-2">
          <li>
            <NuxtLink to="/admin" class="block py-2 px-3 rounded hover:bg-gray-50 dark:hover:bg-gray-700">Overview
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/admin/users" class="block py-2 px-3 rounded hover:bg-gray-50 dark:hover:bg-gray-700">Users
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </aside>

    <div class="flex-1 flex flex-col">
      <main class="p-6">
        <slot />
      </main>
      <footer
        class="w-full bg-white dark:bg-gray-800 border-t p-4 text-sm text-gray-500 dark:text-gray-400 flex justify-center items-center fixed bottom-0">
        <div class="text-center">© {{ new Date().getFullYear() }} MusicPlatform — Admin</div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">

</script>