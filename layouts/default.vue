<template>
  <div class="flex flex-col min-h-screen bg-base-100 text-base-content">
    <!-- Header/Navbar -->
    <header>
      <div class="navbar bg-base-200">
        <div class="navbar-start">
          <NuxtLink to="/" class="btn btn-ghost text-xl">Music Platform</NuxtLink>
        </div>
        <div class="navbar-center hidden sm:flex">
          <ul class="menu menu-horizontal px-1">
            <li><NuxtLink to="/" class="font-medium">Home</NuxtLink></li>
            <li><NuxtLink to="/tracks" class="font-medium">Tracks</NuxtLink></li>
            <li><NuxtLink to="/albums" class="font-medium">Albums</NuxtLink></li>
            <li><NuxtLink to="/artists" class="font-medium">Artists</NuxtLink></li>
            <li><NuxtLink to="/playlists" class="font-medium">Playlists</NuxtLink></li>
            <li><NuxtLink to="/explore" class="font-medium">Explore</NuxtLink></li>
            <li><NuxtLink to="/recommendations" class="font-medium">Recommendations</NuxtLink></li>
          </ul>
        </div>
        <div class="navbar-end gap-2">
          <NuxtLink to="/account" class="btn btn-sm btn-outline">Account</NuxtLink>
          <NuxtLink to="/login" class="btn btn-sm btn-primary">Login</NuxtLink>
          <NuxtLink to="/register" class="btn btn-sm btn-secondary">Register</NuxtLink>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 container mx-auto px-4 py-8">
      <NuxtPage />
    </main>

    <!-- Footer -->
    <footer class="footer footer-center p-4 bg-base-200 text-base-content">
      <aside>
        <p>&copy; 2025 MusicPlatform</p>
      </aside>
    </footer>
  </div>
</template>