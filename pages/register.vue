<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-base-200">
    <div class="card w-full max-w-sm bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title justify-center mb-4">Register for MusicPlatform</h2>
        <form class="flex flex-col gap-4" @submit.prevent="handleRegister">
          <input
            v-model="name"
            type="text"
            placeholder="Name (optional)"
            class="input input-bordered w-full"
            autocomplete="name"
          >
          <input
            v-model="email"
            type="email"
            placeholder="Email"
            class="input input-bordered w-full"
            required
            autocomplete="username"
          >
          <input
            v-model="password"
            type="password"
            placeholder="Password"
            class="input input-bordered w-full"
            required
            autocomplete="new-password"
          >
          <button class="btn btn-primary w-full" type="submit" :disabled="loading">
            <span v-if="loading" class="loading loading-spinner"/>
            <span v-else>Register</span>
          </button>
        </form>
        <div v-if="success" class="text-success mt-2 text-center">Registration successful! Redirecting...</div>
        <div v-if="error" class="text-error mt-2 text-center">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)
const router = useRouter()

async function handleRegister() {
  loading.value = true
  error.value = null
  success.value = false
  try {
    await $fetch('/api/register', {
      method: 'POST',
      body: { email: email.value, password: password.value, name: name.value }
    })
    success.value = true
    setTimeout(() => {
      router.push('/auth/login')
    }, 1200)
  } catch (e: any) {
    error.value = e?.data?.message || 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>