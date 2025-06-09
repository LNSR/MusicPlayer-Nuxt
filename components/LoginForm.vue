<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuth } from '~/composables/localAuth'

const { login, loading, error } = useAuth()
const success = ref(false)
const identifier = ref('')
const password = ref('')

// Watch loading and error to set success
watch([loading, error], ([isLoading, err]) => {
  if (!isLoading && !err && identifier.value && password.value) {
    success.value = true
    setTimeout(() => {
      success.value = false
    }, 2000)
  }
})

async function onLogin() {
  success.value = false
  await login(identifier.value, password.value)
}
</script>

<template>
  <form class="card card-bordered max-w-sm mx-auto mt-10 p-6 bg-base-100" @submit.prevent="onLogin">
    <h2 class="card-title mb-4">Login</h2>
    <div class="mb-2">
      <input v-model="identifier" type="text" placeholder="Username atau Email" class="input input-bordered w-full" required />
    </div>
    <div class="mb-4">
      <input v-model="password" type="password" placeholder="Password" class="input input-bordered w-full" required />
    </div>
    <button class="btn btn-primary w-full" :disabled="loading">
      <span v-if="loading" class="loading loading-spinner loading-xs mr-2" />
      Login
    </button>
    <div v-if="error" class="alert alert-error mt-4">{{ error }}</div>
    <div v-if="success" class="alert alert-success mt-4">Berhasil masuk</div>
  </form>
</template>