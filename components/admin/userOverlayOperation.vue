<template>
  <Teleport to="body">
    <input v-model="modelValue" type="checkbox" class="modal-toggle" style="display:none;" />
    <div class="modal" :class="{ 'modal-open': modelValue }">
      <div class="modal-box">
        <template v-if="mode === 'create'">
          <h3 class="font-bold text-lg mb-4">Create User</h3>
          <form class="flex flex-col gap-4" @submit.prevent="onCreate">
            <input v-model="form.name" class="input input-bordered" type="text" placeholder="Name" />
            <input v-model="form.email" class="input input-bordered" type="email" placeholder="Email" required />
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="input input-bordered w-full pr-10"
                placeholder="Password"
                required
                minlength="6"
              />
              <button
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 btn btn-xs btn-ghost"
                tabindex="-1"
                @click="showPassword = !showPassword"
              >
                <span v-if="showPassword">🙈</span>
                <span v-else>👁️</span>
              </button>
            </div>
            <div class="relative">
              <input
                v-model="confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                class="input input-bordered w-full pr-10"
                placeholder="Confirm Password"
                required
                minlength="6"
              />
              <button
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 btn btn-xs btn-ghost"
                tabindex="-1"
                @click="showPassword = !showPassword"
              >
                <span v-if="showPassword">🙈</span>
                <span v-else>👁️</span>
              </button>
            </div>
            <div v-if="passwordMismatch" class="alert alert-error">Passwords do not match</div>
            <select v-model="form.role" class="select select-bordered">
              <option value="SUPERADMIN">SUPERADMIN</option>
              <option value="ADMIN">ADMIN</option>
              <option value="VISITOR">VISITOR</option>
            </select>
            <div class="flex gap-2 justify-end">
              <button class="btn btn-ghost" type="button" @click="close">Cancel</button>
              <button class="btn btn-primary" type="submit" :disabled="loading || passwordMismatch">
                <span v-if="loading" class="loading loading-spinner loading-xs" />
                Create
              </button>
            </div>
            <div v-if="error" class="alert alert-error">{{ error }}</div>
          </form>
        </template>
        <template v-else-if="mode === 'delete'">
          <h3 class="font-bold text-lg mb-4">Delete User</h3>
          <p>Are you sure you want to delete <span class="font-semibold">{{ user?.name || 'this user' }}</span>?</p>
          <div class="flex gap-2 justify-end mt-6">
            <button class="btn btn-ghost" @click="close">Cancel</button>
            <button class="btn btn-error" @click="onDelete">Delete</button>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { toRefs, ref, computed, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  mode: 'create' | 'delete'
  form?: any
  error?: string
  loading?: boolean
  user?: { id: string, name?: string }
}>()
const emit = defineEmits(['update:model-value', 'create', 'delete'])

const { modelValue, form, error, loading, user, mode } = toRefs(props)

const showPassword = ref(false)
const confirmPassword = ref('')

const passwordMismatch = computed(() => {
  if (mode.value !== 'create') return false
  return form.value?.password !== confirmPassword.value
})

function close() {
  emit('update:model-value', false)
}
function onCreate() {
  if (passwordMismatch.value) return
  emit('create')
}
function onDelete() {
  emit('delete')
}

// Optionally, clear confirmPassword when modal closes or mode changes
watch([modelValue, mode], () => {
  if (!modelValue.value || mode.value !== 'create') {
    confirmPassword.value = ''
  }
})
</script>