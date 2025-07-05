<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})
</script>

<template>
  <section class="flex flex-col items-center justify-center min-h-[70vh] text-center">
    <div class="max-w-2xl w-full">
      <h1 class="text-4xl font-bold mb-4 text-primary">Admin Dashboard</h1>
      <p class="mb-8 text-base-content/70">
        Manage users, tracks, and platform settings.
      </p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <NuxtLink to="/admin/users" class="card bg-base-100 shadow-md hover:shadow-lg transition">
          <div class="card-body items-center text-center">
            <h2 class="card-title">Users</h2>
            <p>View and manage platform users.</p>
          </div>
        </NuxtLink>
        <NuxtLink to="/admin/tracks" class="card bg-base-100 shadow-md hover:shadow-lg transition">
          <div class="card-body items-center text-center">
            <h2 class="card-title">Tracks</h2>
            <p>Review and moderate uploaded tracks.</p>
          </div>
        </NuxtLink>
        <NuxtLink to="/admin/settings" class="card bg-base-100 shadow-md hover:shadow-lg transition">
          <div class="card-body items-center text-center">
            <h2 class="card-title">Settings</h2>
            <p>Platform configuration and settings.</p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>