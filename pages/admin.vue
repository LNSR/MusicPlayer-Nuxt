<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

// Apply middleware to protect this page
definePageMeta({
  middleware: 'admin'
})

type User = { 
  id: number
  name: string
  email: string
  role: string
  createdAt: string
}

const users = ref<User[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const deletingId = ref<number | null>(null)
const editingUser = ref<User | null>(null)
const newName = ref('')
const newEmail = ref('')
const newPassword = ref('')
const creating = ref(false)
const updating = ref(false)

// Get current user from auth
const { user: currentUser } = useAuth()
const isSuperAdmin = computed(() => currentUser.value?.role === 'SUPERADMIN')

async function fetchUsers() {
  loading.value = true
  error.value = null
  const { data, error: fetchError } = await useFetch('/api/admin/users')
  if (fetchError.value) {
    error.value = fetchError.value.data?.message || 'Failed to fetch users'
    users.value = []
  } else {
    users.value = data.value?.users || []
  }
  loading.value = false
}

async function createUser() {
  creating.value = true
  error.value = null
  const { data, error: fetchError } = await useFetch('/api/admin/users', {
    method: 'POST',
    body: { name: newName.value, email: newEmail.value, password: newPassword.value }
  })
  if (fetchError.value) {
    error.value = fetchError.value.data?.message || 'Failed to create user'
  } else if (data.value?.user) {
    users.value.push(data.value.user)
    newName.value = ''
    newEmail.value = ''
    newPassword.value = ''
  }
  creating.value = false
}

async function updateUser() {
  if (!editingUser.value) return
  updating.value = true
  error.value = null
  const { data, error: fetchError } = await useFetch(`/api/admin/users/${editingUser.value.id}`, {
    method: 'PUT',
    body: { 
      name: editingUser.value.name, 
      email: editingUser.value.email,
      role: editingUser.value.role
    }
  })
  if (fetchError.value) {
    error.value = fetchError.value.data?.message || 'Failed to update user'
  } else if (data.value?.user) {
    const index = users.value.findIndex(u => u.id === editingUser.value!.id)
    if (index !== -1) {
      users.value[index] = data.value.user
    }
    editingUser.value = null
  }
  updating.value = false
}

async function deleteUser(id: number) {
  if (!confirm('Are you sure you want to delete this user?')) return
  deletingId.value = id
  const { error: fetchError } = await useFetch(`/api/admin/users/${id}`, { method: 'DELETE' })
  if (fetchError.value) {
    error.value = fetchError.value.data?.message || 'Failed to delete user'
  } else {
    users.value = users.value.filter(u => u.id !== id)
  }
  deletingId.value = null
}

function startEdit(user: User) {
  editingUser.value = { ...user }
}

function cancelEdit() {
  editingUser.value = null
}

onMounted(fetchUsers)
</script>

<template>
  <div class="container mx-auto py-8">
    <h1 class="text-3xl font-bold mb-6">Admin Dashboard</h1>
    
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title mb-4">User Management</h2>
        
        <!-- Create User Form -->
        <form class="flex flex-col sm:flex-row gap-2 mb-6" @submit.prevent="createUser">
          <input v-model="newName" type="text" placeholder="Name" class="input input-primary w-full sm:w-auto" required />
          <input v-model="newEmail" type="email" placeholder="Email" class="input input-primary w-full sm:w-auto" required />
          <input v-model="newPassword" type="password" placeholder="Password" class="input input-primary w-full sm:w-auto" required minlength="8" />
          <button type="submit" class="btn btn-primary" :disabled="creating">
            <span v-if="creating" class="loading loading-spinner loading-xs" />
            <span v-else>Add User</span>
          </button>
        </form>

        <div v-if="loading" class="flex justify-center my-8">
          <span class="loading loading-spinner loading-lg text-primary" />
        </div>
        
        <div v-else>
          <div v-if="error" class="alert alert-error mb-4">{{ error }}</div>
          
          <div class="overflow-x-auto">
            <table class="table table-zebra w-full">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id">
                  <td>{{ user.id }}</td>
                  <td>{{ user.name }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span class="badge" :class="{
                      'badge-error': user.role === 'SUPERADMIN',
                      'badge-warning': user.role === 'ADMIN',
                      'badge-neutral': user.role === 'USER'
                    }">
                      {{ user.role }}
                    </span>
                  </td>
                  <td>{{ new Date(user.createdAt).toLocaleDateString() }}</td>
                  <td>
                    <div class="flex gap-2">
                      <button class="btn btn-sm btn-outline" @click="startEdit(user)">
                        Edit
                      </button>
                      <button
                        class="btn btn-sm btn-error"
                        :disabled="deletingId === user.id"
                        @click="deleteUser(user.id)"
                      >
                        <span v-if="deletingId === user.id" class="loading loading-spinner loading-xs" />
                        <span v-else>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div v-if="users.length === 0" class="alert alert-info mt-4">
            No users found.
          </div>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <dialog :class="{ 'modal modal-open': editingUser }" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Edit User</h3>
        
        <form v-if="editingUser" class="flex flex-col gap-4" @submit.prevent="updateUser">
          <label class="input input-primary">
            <span class="label">Name</span>
            <input v-model="editingUser.name" type="text" placeholder="Name" class="grow" required />
          </label>
          
          <label class="input input-primary">
            <span class="label">Email</span>
            <input v-model="editingUser.email" type="email" placeholder="Email" class="grow" required />
          </label>
          
          <label v-if="isSuperAdmin" class="form-control">
            <span class="label">Role</span>
            <select v-model="editingUser.role" class="select select-primary">
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
              <option value="SUPERADMIN">SUPERADMIN</option>
            </select>
          </label>
          
          <div class="modal-action">
            <button type="submit" class="btn btn-primary" :disabled="updating">
              <span v-if="updating" class="loading loading-spinner loading-xs" />
              <span v-else>Update</span>
            </button>
            <button type="button" class="btn btn-outline" @click="cancelEdit">Cancel</button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="cancelEdit">close</button>
      </form>
    </dialog>
  </div>
</template>