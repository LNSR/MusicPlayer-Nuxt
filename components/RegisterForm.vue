<template>
  <form class="card card-bordered max-w-sm mx-auto mt-10 p-6 bg-base-100" @submit.prevent="onRegister">
    <h2 class="card-title mb-4">Register</h2>
    <div class="mb-2">
      <input v-model="name" type="text" placeholder="Name" class="input input-bordered w-full" required />
    </div>
    <div class="mb-2">
      <input v-model="email" type="email" placeholder="Email" class="input input-bordered w-full" required />
    </div>
    <div class="mb-4">
      <input v-model="password" type="password" placeholder="Password" class="input input-bordered w-full" required minlength="8" />
    </div>
    <button class="btn btn-primary w-full" :disabled="loading">
      <span v-if="loading" class="loading loading-spinner loading-xs mr-2" />
      Register
    </button>
    <div v-if="error" class="alert alert-error mt-4">{{ error }}</div>
    <div v-if="success" class="alert alert-success mt-4">Registrasi Berhasil!. Silahkan login</div>
  </form>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'

const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

const switchToLogin = inject<() => void>('switchToLoginTab')

async function onRegister() {
  loading.value = true
  error.value = null
  success.value = false
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.value, email: email.value, password: password.value })
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.message || 'Registrasi gagal')
    }
    success.value = true
    name.value = ''
    email.value = ''
    password.value = ''
    if (switchToLogin) {
      setTimeout(() => {
        switchToLogin()
      }, 1000)
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      error.value = err.message || 'Registrasi gagal'
    }
  } finally {
    loading.value = false
  }
}
</script>