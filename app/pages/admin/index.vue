<template>
    <div class="p-6 text-gray-900 dark:text-white">
        <header class="mb-6">
            <h1 class="text-2xl font-bold">Admin Dashboard</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400">Overview and quick actions for administrators.</p>
        </header>
    </div>
</template>

<script setup lang="ts">

definePageMeta({
    layout: 'admin',
    middleware: ['admin']
});

</script>

<!-- Tailwind is used for styling via global CSS -->