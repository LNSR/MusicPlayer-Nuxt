<script setup lang="ts">
import { ref, provide } from 'vue'
import { useAuth } from '~/composables/localAuth'
import LoginForm from '~/components/LoginForm.vue'
import RegisterForm from '~/components/RegisterForm.vue'

const { user, logout, loading } = useAuth()
const showAuthModal = ref(false)
const tab = ref<'login' | 'register'>('login')

function switchToLoginTab() {
  tab.value = 'login'
}
provide('switchToLoginTab', switchToLoginTab)

function openAuthModal(type: 'login' | 'register') {
  tab.value = type
  showAuthModal.value = true
}
async function handleLogout() {
  await logout()
}
</script>

<template>
  <div class="navbar bg-base-200">
    <div class="navbar-start">
      <a class="btn btn-ghost text-xl">MusicPlatform</a>
    </div>
    <div class="navbar-center">
      <input type="text" placeholder="Search music..." class="input input-bordered w-full max-w-xs" />
    </div>
    <div class="navbar-end">
      <button v-if="!user" class="btn btn-ghost" @click="openAuthModal('login')">Masuk</button>
      <button v-if="!user" class="btn btn-primary ml-2" @click="openAuthModal('register')">Daftar</button>
      <button
        v-if="user"
        :disabled="loading"
        class="btn btn-secondary"
        @click="handleLogout"
      >
        <span v-if="loading" class="loading loading-spinner loading-xs mr-2" />
        Logout
      </button>
    </div>
  </div>

  <!-- Auth Modal -->
  <dialog v-if="showAuthModal" class="modal modal-middle" open>
    <div class="modal-box">
      <div class="tabs tabs-box mb-4">
        <button class="tab" :class="{ 'tab-active': tab === 'login' }" @click="tab = 'login'">Masuk</button>
        <button class="tab" :class="{ 'tab-active': tab === 'register' }" @click="tab = 'register'">Daftar</button>
      </div>
      <LoginForm v-if="tab === 'login'" />
      <RegisterForm v-else />
      <form method="dialog" class="modal-action mt-4">
        <button class="btn" @click="showAuthModal = false">Tutup</button>
      </form>
    </div>
  </dialog>
</template>