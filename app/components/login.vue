<template>
  <!-- Overlay -->
  <div class="modal-overlay" role="dialog" aria-modal="true"
    aria-labelledby="login-title">
    <div class="modal-background" @click.self="onOverlayClick"></div>

    <!-- Modal panel -->
    <div class="modal-panel">
      <!-- Close button -->
      <button type="button" class="modal-close-btn"
        @click="closeModal" aria-label="Close login dialog">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd" />
        </svg>
      </button>

      <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
        <h2 id="login-title" class="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Login</h2>

        <input ref="usernameRef" v-model="username" type="text" placeholder="Username" autocomplete="username"
          class="border rounded px-3 py-2 bg-white text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
          required />

        <input v-model="password" type="password" placeholder="Password" autocomplete="current-password"
          class="border rounded px-3 py-2 bg-white text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
          required />

        <button type="submit" class="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 disabled:opacity-60"
          :disabled="auth.loading.value">
          <span v-if="loading">Logging in...</span>
          <span v-else>Login</span>
        </button>

        <p v-if="success" class="text-green-600 dark:text-green-400 text-sm mt-2">{{ success }}</p>
        <p v-if="error" class="text-red-600 dark:text-red-400 text-sm mt-2">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthSession } from '@/composables/useAuthSession';
import { useModalBehavior } from '~/composables/ui/useModalBehavior';

const emit = defineEmits(['close']);

const showModal = ref(true);
const username = ref('');
const password = ref('');
const usernameRef = ref<HTMLInputElement | null>(null);
const auth = useAuthSession();
const localError = ref<string | null>(null);

const error = computed(() => auth.error.value || localError.value);
const success = computed(() => auth.success.value);
const loading = computed(() => auth.loading.value);

const closeModal = () => emit('close');

const { onOverlayClick } = useModalBehavior({
  showModal,
  closeModal,
  success,
  loading,
  autofocusRef: usernameRef,
});

function onSubmit() {
  localError.value = null;
  if (!username.value || !password.value) {
    localError.value = 'Please enter both username and password.';
    return;
  }
  void auth.login(username.value, password.value);
}
</script>
