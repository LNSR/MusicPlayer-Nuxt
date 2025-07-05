<script setup lang="ts">
import { ref, onMounted, onActivated } from 'vue'
import { useUserManagement } from '@/composables/admin/useUserManagement'
import UserOverlayOperation from '@/components/admin/userOverlayOperation.vue'

definePageMeta({
    layout: 'admin',
    middleware: 'admin'
})

const { users, loading, error, fetchUsers, changeRole, deleteUser, createForm, createError, createLoading, createUser } = useUserManagement()

onMounted(fetchUsers)
onActivated(fetchUsers)

const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const userToDelete = ref<{ id: string, name?: string } | undefined>(undefined)

function openCreateModal() {
    showCreateModal.value = true
}
function openDeleteModal(user: { id: string, name?: string }) {
    userToDelete.value = user
    showDeleteModal.value = true
}
function closeCreateModal() {
    showCreateModal.value = false
}
function closeDeleteModal() {
    showDeleteModal.value = false
    userToDelete.value = undefined
}
async function handleCreateUser() {
    await createUser()
    if (!createError.value) closeCreateModal()
}
async function handleDeleteUser() {
    if (userToDelete.value) {
        await deleteUser(userToDelete.value.id)
        closeDeleteModal()
    }
}
</script>

<template>
    <section class="max-w-4xl mx-auto p-6">
        <h1 class="text-2xl font-bold mb-6">Users Management</h1>
        <button class="btn btn-primary mb-4" @click="openCreateModal">Create User</button>

        <UserOverlayOperation
          :model-value="showCreateModal"
          mode="create"
          :form="createForm"
          :error="createError"
          :loading="createLoading"
          @update:model-value="showCreateModal = $event"
          @create="handleCreateUser"
        />
        <UserOverlayOperation
          :model-value="showDeleteModal"
          mode="delete"
          :user="userToDelete"
          @update:model-value="showDeleteModal = $event"
          @delete="handleDeleteUser"
        />

        <div v-if="loading" class="flex justify-center items-center h-32">
            <span class="loading loading-spinner loading-lg text-primary" />
        </div>
        <div v-else>
            <div v-if="error" class="alert alert-error mb-4">{{ error }}</div>
            <div v-else>
                <div class="overflow-x-auto rounded-lg shadow">
                    <table class="table w-full">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th class="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="user in users" :key="user.id">
                                <td>{{ user.name || '-' }}</td>
                                <td>{{ user.email }}</td>
                                <td>
                                    <select
                                        v-model="user.role"
                                        class="select select-bordered select-sm"
                                        :disabled="user.role === 'SUPERADMIN'"
                                        @change="changeRole(user.id, user.role)"
                                    >
                                        <option value="SUPERADMIN">SUPERADMIN</option>
                                        <option value="ADMIN">ADMIN</option>
                                        <option value="VISITOR">VISITOR</option>
                                    </select>
                                </td>
                                <td class="text-center">
                                    <button
                                        class="btn btn-error btn-xs rounded"
                                        :disabled="user.role === 'SUPERADMIN'"
                                        @click="openDeleteModal(user)"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                            <tr v-if="!loading && users.length === 0">
                                <td colspan="4" class="text-center text-base-content/60">No users found.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>
</template>