<template>
  <div class="p-6 text-gray-900 dark:text-white">
    <header class="mb-6">
      <h1 class="text-2xl font-bold">User Management</h1>
      <p class="text-sm text-gray-600 dark:text-gray-400">Manage users in the system.</p>
    </header>

    <div class="mb-4">
      <button @click="openCreateModal" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Create User
      </button>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-4 py-3 text-left">ID</th>
            <th class="px-4 py-3 text-left">Username</th>
            <th class="px-4 py-3 text-left">Name</th>
            <th class="px-4 py-3 text-left">Role</th>
            <th class="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="border-t border-gray-200 dark:border-gray-700">
            <td class="px-4 py-3">{{ user.id }}</td>
            <td class="px-4 py-3">{{ user.username }}</td>
            <td class="px-4 py-3">{{ user.name }}</td>
            <td class="px-4 py-3">{{ user.role }}</td>
            <td class="px-4 py-3 space-x-2">
              <button @click="openEditModal(user)" class="text-blue-600 hover:underline">Edit</button>
              <button @click="deleteUser(user.id)" class="text-red-600 hover:underline">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4 flex justify-between">
      <button @click="prevPage" :disabled="page <= 1"
        class="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50">
        Previous
      </button>
      <span>Page {{ page }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="page >= totalPages"
        class="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50">
        Next
      </button>
    </div>

    <!-- Modal for Create/Edit -->
    <div v-if="showModal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title"
      @keydown.esc="onWindowKeydown">
      <div class="modal-background" @click.self="onOverlayClick"></div>
      <div class="modal-panel">
        <h2 id="modal-title" class="text-xl font-bold mb-4">{{ isEditing ? 'Edit User' : 'Create User' }}</h2>
        <!-- Close button -->
        <button type="button" class="modal-close-btn" @click="closeModal" aria-label="Close modal">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd" />
          </svg>
        </button>
        <form @submit.prevent="submitUser">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Username</label>
            <input ref="usernameRef" v-model="form.username" type="text" required
              class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600" autocomplete="username" />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Name</label>
            <input v-model="form.name" type="text" required
              class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600" autocomplete="name" />
          </div>
          <div class="mb-4">
            <label v-if="!isEditing" class="block text-sm font-medium mb-1">Password</label>
            <label v-else class="block text-sm font-medium mb-1">Password (leave blank to keep unchanged)</label>
            <input v-model="form.password" type="password" :required="!isEditing"
              class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              autocomplete="current-password" />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Role</label>
            <select v-model="form.role" required
              class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600">
              <option value="" disabled>Select role</option>
              <option v-for="role in roles" :value="role">{{ role }}</option>
            </select>
          </div>
          <div class="flex justify-end space-x-2">
            <button type="button" @click="closeModal"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded">Cancel</button>
            <button type="submit" :disabled="loading"
              class="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
              <span v-if="loading">Saving...</span>
              <span v-else>{{ isEditing ? 'Update' : 'Create' }}</span>
            </button>
          </div>
        </form>
        <p v-if="success" class="text-green-600 dark:text-green-400 text-sm mt-2">{{ success }}</p>
        <p v-if="error" class="text-red-600 dark:text-red-400 text-sm mt-2">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useUsersCRUD } from '~/composables/admin/useUsersCRUD'
import { useModalBehavior } from '~/composables/ui/useModalBehavior'
import { Role as roles } from '#shared/types/form'
definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const usernameRef = ref<HTMLInputElement | null>(null)

const {
  users,
  page,
  totalPages,
  showModal,
  isEditing,
  loading,
  success,
  error,
  form,
  fetchUsers,
  openCreateModal,
  openEditModal,
  closeModal,
  submitUser,
  deleteUser,
  prevPage,
  nextPage
} = useUsersCRUD()

const { onOverlayClick } = useModalBehavior({
  showModal,
  closeModal,
  success,
  loading,
  autofocusRef: usernameRef,
})

function onWindowKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (loading.value) return;
    closeModal();
  }
}

onMounted(() => {
  fetchUsers()
  window.addEventListener('keydown', onWindowKeydown);
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onWindowKeydown);
})
</script>
