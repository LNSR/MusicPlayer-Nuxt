<script setup lang="ts">

</script>
<template>
  <section class="flex flex-col items-center justify-center min-h-[70vh] text-center">
    <!-- Hero Section -->
    <div class="max-w-2xl">
      <h1 class="text-5xl font-extrabold mb-4 text-primary">Welcome to MusicPlatform</h1>
      <p class="text-lg mb-6 text-base-content/70">
        Upload, share, and discover music from creators around the world.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <NuxtLink to="/explore" class="btn btn-primary btn-lg">Explore Music</NuxtLink>
        <NuxtLink to="/upload" class="btn btn-outline btn-lg">Upload Your Track</NuxtLink>
      </div>
    </div>

    <!-- Trending Section -->
    <div class="w-full max-w-4xl mt-16">
      <h2 class="text-2xl font-bold mb-6 text-left">🔥 Trending Tracks</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="n in 3" :key="n" class="card bg-base-100 shadow-md">
          <figure class="px-4 pt-4">
            <img src="https://placehold.co/200x200?text=Album+Art" alt="Album Art" class="rounded-xl" />
          </figure>
          <div class="card-body items-center text-center">
            <h3 class="card-title">Track Title {{ n }}</h3>
            <p class="text-base-content/60">Artist Name</p>
            <div class="card-actions mt-2">
              <button class="btn btn-sm btn-primary">Play</button>
              <button class="btn btn-sm btn-outline">Add to Library</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Call to Action -->
    <div class="mt-20">
      <div class="alert alert-info shadow-lg">
        <span>Sign up to create playlists and follow your favorite artists!</span>
        <NuxtLink to="/signup" class="btn btn-info ml-4">Get Started</NuxtLink>
      </div>
    </div>
  </section>
</template>