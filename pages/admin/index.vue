<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

// Sample data - replace with actual API calls
const stats = ref([
  { title: 'Total Users', value: '1,234', desc: '↗︎ 400 (22%)', color: 'stat-primary' },
  { title: 'Total Songs', value: '5,678', desc: '↗︎ 90 (14%)', color: 'stat-secondary' },
  { title: 'Total Playlists', value: '890', desc: '↘︎ 90 (14%)', color: 'stat-accent' },
  { title: 'Active Users', value: '456', desc: '↗︎ 201 (22%)', color: 'stat-success' }
])

const recentUsers = ref([
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'USER', joinedAt: '2025-01-15' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'USER', joinedAt: '2025-01-14' },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'ADMIN', joinedAt: '2025-01-13' }
])

const recentActivities = ref([
  { action: 'User registered', user: 'Alice Brown', time: '2 minutes ago' },
  { action: 'Song uploaded', user: 'Charlie Davis', time: '5 minutes ago' },
  { action: 'Playlist created', user: 'David Lee', time: '10 minutes ago' },
  { action: 'Admin login', user: 'Eve Adams', time: '15 minutes ago' }
])
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold">Dashboard</h1>
        <p class="text-base-content/70 mt-1">Welcome back! Here's what's happening with your music platform.</p>
      </div>
      <button class="btn btn-primary">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        Add New Content
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="stats stats-vertical lg:stats-horizontal shadow w-full">
      <div v-for="stat in stats" :key="stat.title" class="stat">
        <div class="stat-title">{{ stat.title }}</div>
        <div class="stat-value text-primary">{{ stat.value }}</div>
        <div class="stat-desc">{{ stat.desc }}</div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Users -->
      <div class="lg:col-span-2">
        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <div class="flex justify-between items-center mb-4">
              <h2 class="card-title">Recent Users</h2>
              <NuxtLink to="/admin/users" class="link link-primary">View All</NuxtLink>
            </div>
            <div class="overflow-x-auto">
              <table class="table table-zebra">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in recentUsers" :key="user.id">
                    <td>
                      <div class="flex items-center gap-3">
                        <div class="avatar">
                          <div class="w-8 h-8 rounded-full">
                            <img :src="`https://picsum.photos/32/32?random=${user.id}`" :alt="user.name" />
                          </div>
                        </div>
                        <span class="font-medium">{{ user.name }}</span>
                      </div>
                    </td>
                    <td>{{ user.email }}</td>
                    <td>
                      <span class="badge" :class="user.role === 'ADMIN' ? 'badge-primary' : 'badge-neutral'">
                        {{ user.role }}
                      </span>
                    </td>
                    <td>{{ user.joinedAt }}</td>
                    <td>
                      <div class="dropdown dropdown-end">
                        <div tabindex="0" role="button" class="btn btn-ghost btn-xs">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01"></path>
                          </svg>
                        </div>
                        <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-32 p-2 shadow">
                          <li><a>View</a></li>
                          <li><a>Edit</a></li>
                          <li><a class="text-error">Delete</a></li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="lg:col-span-1">
        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <h2 class="card-title mb-4">Recent Activity</h2>
            <div class="space-y-4">
              <div v-for="activity in recentActivities" :key="activity.action" class="flex items-start gap-3">
                <div class="avatar placeholder">
                  <div class="w-8 h-8 rounded-full bg-neutral text-neutral-content">
                    <span class="text-xs">{{ activity.user[0] }}</span>
                  </div>
                </div>
                <div class="flex-1">
                  <p class="text-sm">
                    <span class="font-medium">{{ activity.user }}</span>
                    {{ activity.action.toLowerCase() }}
                  </p>
                  <p class="text-xs text-base-content/50">{{ activity.time }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card bg-base-100 shadow mt-6">
          <div class="card-body">
            <h2 class="card-title mb-4">Quick Actions</h2>
            <div class="space-y-2">
              <button class="btn btn-outline btn-block justify-start">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add New User
              </button>
              <button class="btn btn-outline btn-block justify-start">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                </svg>
                Upload Music
              </button>
              <button class="btn btn-outline btn-block justify-start">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z"></path>
                </svg>
                View Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section (Placeholder) -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card bg-base-100 shadow">
        <div class="card-body">
          <h2 class="card-title">User Growth</h2>
          <div class="h-64 flex items-center justify-center bg-base-200 rounded">
            <p class="text-base-content/50">Chart placeholder - integrate with your preferred chart library</p>
          </div>
        </div>
      </div>
      <div class="card bg-base-100 shadow">
        <div class="card-body">
          <h2 class="card-title">Music Uploads</h2>
          <div class="h-64 flex items-center justify-center bg-base-200 rounded">
            <p class="text-base-content/50">Chart placeholder - integrate with your preferred chart library</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>