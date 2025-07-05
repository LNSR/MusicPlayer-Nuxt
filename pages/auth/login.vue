<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-base-200">
    <div class="card w-full max-w-sm bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title justify-center mb-4">Login to MusicPlatform</h2>
        <form class="flex flex-col gap-4" @submit.prevent="handleLogin">
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
            autocomplete="current-password"
          >
          <button class="btn btn-primary w-full" type="submit" :disabled="loading">
            <span v-if="loading" class="loading loading-spinner"/>
            <span v-else>Login</span>
          </button>
        </form>
        <div v-if="success" class="text-success mt-2 text-center">Login successful! Redirecting...</div>
        <div v-if="error" class="text-error mt-2 text-center">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '~/composables/useAuth'

const email = ref('')
const password = ref('')
const success = ref(false)

const { login, loading, error } = useAuth()

async function handleLogin() {
  success.value = false
  const isSuccess = await login(email.value, password.value)
  if (isSuccess) {
    success.value = true
    setTimeout(() => {
      window.location.href = '/'
    }, 1000) 
  }
}
</script>