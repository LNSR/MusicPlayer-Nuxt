<template>
  <div class="p-6 text-gray-900 dark:text-white">
    <h1 class="text-2xl font-bold mb-4">Welcome to MusicPlatform</h1>
    <p class="mb-4">Discover and enjoy your favorite music tracks.</p>

    <!-- Scan Music Button -->
    <div class="mb-6">
      <UButton :loading="isLoading" :disabled="isLoading" @click="scanMusicDirectory(1, 50)" class="mb-4">
        {{ isLoading ? 'Scanning...' : 'Scan Music Library' }}
      </UButton>

      <div v-if="error" class="text-red-500 mb-4">
        Error: {{ error }}
      </div>

      <div v-if="musicFiles.length > 0" class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Found {{ musicFiles.length }} music files
      </div>
    </div>

    <!-- Search Bar -->
    <div v-if="musicFiles.length > 0" class="mb-6">
      <UInput v-model="searchQuery" placeholder="Search tracks, artists, or albums..." class="max-w-md"
        icon="i-heroicons-magnifying-glass" />
    </div>

    <ClientOnly>
      <!-- Music Player Section -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Now Playing</h2>
        <MusicFlow ref="musicFlowRef" :options="{
          autoplay: true,
          waveColor: '#e7e7e7',
          progressColor: '#ffb86a',
          height: 3,
          barWidth: 0,
          barHeight: 0,
          barRadius: 0,
          normalize: false
        }" />
      </div>
    </ClientOnly>

    <!-- Music Tracks Grid -->
    <div v-if="filteredTracks.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="track in filteredTracks" :key="track.id" role="button"
        class="relative bg-white dark:bg-gray-800 border border-base-200 rounded-lg shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden group flex flex-col sm:flex-row sm:h-32 md:h-40 lg:h-48 items-stretch"
        :class="{
          'ring-2 ring-blue-500 shadow-lg bg-blue-50 dark:bg-blue-900/20': isTrackPlaying(track.id),
          'hover:shadow-xl hover:ring-1 hover:ring-gray-300 dark:hover:ring-gray-600': !isTrackPlaying(track.id)
        }" @click="playTrack(track)">

        <!-- Playing indicator -->
        <div v-if="isTrackPlaying(track.id)"
          class="absolute top-2 right-2 z-10 bg-green-500 text-white rounded-full p-1.5 shadow-lg animate-pulse ring-2 ring-green-300">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clip-rule="evenodd" />
          </svg>
        </div>

        <!-- Now Playing Badge -->
        <div v-if="isTrackPlaying(track.id)"
          class="absolute top-2 left-2 z-10 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg">
          NOW PLAYING
        </div>
        <!-- Artwork section -->
        <div class="relative flex-none min-w-0 w-32 sm:w-40 md:w-48 lg:w-56 mx-auto mb-4 sm:mb-0">
          <img :src="track.artwork" :alt="track.title"
            class="w-full h-full object-cover rounded-l-lg sm:rounded-l-lg sm:rounded-r-none" u
            @error="handleImageError" />
        </div>

        <!-- Track Metadata Info section -->
        <div
          class="flex-1 p-4 flex flex-col justify-between min-w-0 overflow-hidden bg-base-300 rounded-r-lg">
          <div class="metadata">
            <h3 class="font-semibold text-lg mb-1 text-gray-900 dark:text-white truncate" :title="track.title">{{
              track.title }}</h3>
            <p class="text-gray-600 dark:text-gray-300 mb-1 truncate" :title="track.artist">{{ track.artist }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-2 truncate" :title="track.album">{{ track.album }}
            </p>
          </div>

          <!-- File Info (separated with border-top) -->
          <div
            class="file-info border-t border-base-200 pt-2 text-xs text-gray-500 dark:text-gray-400">
            <div class="flex justify-between items-center">
              <span>{{ formatDuration(track.duration) }}</span>
              <span>{{ formatFileSize(track.fileSize) }}</span>
            </div>
            <div class="mt-1 truncate">{{ track.fileName }}</div>
          </div>

        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!isLoading && musicFiles.length === 0" class="text-center py-12">
      <div class="text-gray-500 dark:text-gray-400">
        <p class="text-lg mb-2">No music files found</p>
        <p class="text-sm">Click "Scan Music Library" to scan your music folder</p>
      </div>
    </div>

    <!-- No Search Results -->
    <div v-else-if="searchQuery && filteredTracks.length === 0" class="text-center py-12">
      <div class="text-gray-500 dark:text-gray-400">
        <p class="text-lg mb-2">No tracks found</p>
        <p class="text-sm">Try a different search term</p>
      </div>
    </div>

    <!-- Infinite Scroll Sentinel -->
    <div ref="sentinel" class="flex justify-center items-center py-8" role="status"
      :aria-live="isLoadingMore ? 'polite' : 'off'">
      <div v-if="isLoadingMore" class="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin w-5 h-5" aria-hidden="true" />
        <span>Loading more tracks...</span>
      </div>
      <div v-else-if="!hasMorePages && musicFiles.length > 0" class="text-center text-gray-500 dark:text-gray-400 py-4">
        <p class="text-sm">You've reached the end of your music library</p>
        <p class="text-xs mt-1">No more tracks to load</p>
      </div>
      <div v-else-if="infiniteScrollError" class="text-center text-red-500 py-4" role="alert">
        <p class="text-sm">{{ infiniteScrollError }}</p>
        <UButton @click="retryLoadMore" variant="outline" size="sm" class="mt-2" aria-label="Retry loading more tracks">
          Try Again
        </UButton>
      </div>
      <div v-else class="h-1" aria-hidden="true"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMusicScanner } from '~/composables/music/useMusicScanner'
import { usePlayerControls } from '~/composables/music/usePlayerControls'

// Music scanner composable
const {
  isLoading,
  error,
  musicFiles,
  scanMusicDirectory,
  loadNextPage,
  hasMorePages,
  searchTracks,
  formatDuration,
  formatFileSize
} = useMusicScanner()

// Player controls composable
const {
  playTrack: playTrackWithControls,
  isTrackPlaying,
  setMusicFlowRef
} = usePlayerControls()

// Local state
const searchQuery = ref('')
const musicFlowRef = ref()

// Infinite scroll state
const isLoadingMore = ref(false)
const infiniteScrollError = ref('')

// Infinite scroll sentinel and observer
const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

// Computed filtered tracks based on search
const filteredTracks = computed(() => {
  if (!searchQuery.value) return musicFiles.value
  return searchTracks(searchQuery.value)
})

// Set MusicFlow reference when component mounts and start observing sentinel for infinite scroll
onMounted(async () => {
  if (musicFlowRef.value) {
    setMusicFlowRef(musicFlowRef)
  }

  // wait for DOM to render sentinel
  await nextTick()

  if (sentinel.value) {
    observer = new IntersectionObserver(async (entries) => {
      const entry = entries[0]
      if (!entry) return

      // Only load next page when not searching and when there are more pages
      if (
        entry.isIntersecting &&
        !isLoading.value &&
        !isLoadingMore.value &&
        hasMorePages.value &&
        !searchQuery.value
      ) {
        isLoadingMore.value = true
        infiniteScrollError.value = ''
        try {
          await loadNextPage(50)
        } catch (err) {
          console.error('Error loading next page via infinite scroll:', err)
          infiniteScrollError.value = 'Failed to load more tracks. Please try again.'
        } finally {
          isLoadingMore.value = false
        }
      }
    }, {
      root: null,
      rootMargin: '300px',
      threshold: 0.1
    })

    observer.observe(sentinel.value)
  }
})

onBeforeUnmount(() => {
  if (observer && sentinel.value) {
    observer.unobserve(sentinel.value)
    observer.disconnect()
    observer = null
  }
})

// Play a track
const playTrack = (track: any) => {
  // Convert our track format to TMusicFlow format with numeric ID
  const playerTrack = {
    id: typeof track.id === 'string' ? parseInt(track.id, 10) : track.id,
    audio: track.audio,
    title: track.title,
    artist: track.artist,
    album: track.album,
    artwork: track.artwork,
    original: track.original
  }

  playTrackWithControls(playerTrack)
}

// Handle image loading errors
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'https://placehold.co/400x400?text=No+Artwork'
}

// Retry loading more tracks
const retryLoadMore = async () => {
  if (isLoadingMore.value || !hasMorePages.value) return

  isLoadingMore.value = true
  infiniteScrollError.value = ''
  try {
    await loadNextPage(50)
  } catch (err) {
    console.error('Error retrying load:', err)
    infiniteScrollError.value = 'Failed to load more tracks. Please try again.'
  } finally {
    isLoadingMore.value = false
  }
}
</script>