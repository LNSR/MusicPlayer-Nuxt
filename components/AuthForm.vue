<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuth } from '~/composables/useAuth'

const props = defineProps<{ mode?: 'login' | 'register' }>()
const mode = ref<'login' | 'register'>(props.mode || 'login')
const identifier = ref('')
const password = ref('')
const name = ref('')
const email = ref('')
const { login, register, error, loading } = useAuth()
const success = ref(false)

async function onSubmit() {
  if (mode.value === 'login') {
    const result = await login(identifier.value, password.value)
    if (result) {
      success.value = true
      await navigateTo('/', { external: true })
    }
  } else {
    const result = await register(name.value, email.value, password.value)
    if (result) {
      mode.value = 'login'
      identifier.value = email.value
      password.value = ''
      name.value = ''
      email.value = ''
      success.value = false
    }
  }
}

watch(() => props.mode, (val) => {
  if (val) mode.value = val
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-base-200">
    <div class="card w-full max-w-sm shadow-xl bg-base-100">
      <div class="card-body">
        <h2 class="card-title justify-center mb-4">
          {{ mode === 'login' ? 'Login' : 'Register' }}
        </h2>
        <form v-if="!success || mode === 'register'" class="flex flex-col gap-4" @submit.prevent="onSubmit">
          <template v-if="mode === 'register'">
            <label class="input input-primary flex items-center gap-2">
              <span class="label">Name</span>
              <input v-model="name" type="text" placeholder="Your Name" class="grow" required></input>
            </label>
            <label class="input input-primary flex items-center gap-2">
              <span class="label">Email</span>
              <input v-model="email" type="email" placeholder="email@example.com" class="grow" required></input>
            </label>
            <label class="input input-primary flex items-center gap-2">
              <span class="label">Password</span>
              <input v-model="password" type="password" placeholder="••••••••" class="grow" required></input>
            </label>
          </template>
          <template v-else>
            <label class="input input-primary">
              <span class="label">Email atau Username</span>
              <input v-model="identifier" type="text" placeholder="email@example.com atau username" class="grow" required>
            </label>
            <label class="input input-primary">
              <span class="label">Password</span>
              <input v-model="password" type="password" placeholder="yourpass" class="grow" required>
            </label>
          </template>
          <button type="submit" class="btn btn-primary mt-2" :disabled="loading">
            {{ mode === 'login' ? 'Login' : 'Register' }}
          </button>
        </form>
        <div v-if="error" class="alert alert-error mt-2">{{ error }}</div>
        <div v-if="success && mode === 'login'" class="alert alert-success mt-2">
          Login successful!
        </div>
        <div class="mt-4 text-center">
          <button
            type="button"
            class="link link-primary"
            @click="mode = mode === 'login' ? 'register' : 'login'"
          >
            {{ mode === 'login' ? "Don't have an account? Register" : "Already have an account? Login" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>