import type { MusicTrack, MusicScanResult } from '#shared/types/music'

export const useMusicScanner = () => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const musicFiles = ref<MusicTrack[]>([])
  const currentPage = ref(1)
  const totalPages = ref(0)
  const totalFiles = ref(0)
  const hasMorePages = computed(() => currentPage.value < totalPages.value)

  const scanMusicDirectory = async (page = 1, limit = 50): Promise<MusicScanResult | null> => {
    try {
      isLoading.value = true
      error.value = null

      const response = await $fetch<MusicScanResult>(`/api/music?page=${page}&limit=${limit}`)

      if (response.success) {
        // If this is the first page, replace the files, otherwise append
        if (page === 1) {
          musicFiles.value = response.files
        } else {
          musicFiles.value.push(...response.files)
        }

        // Update pagination info
        currentPage.value = response.page
        totalPages.value = response.totalPages
        totalFiles.value = response.total

        return response
      } else {
        throw new Error('Failed to scan music directory')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred'
      error.value = message
      console.error('Error scanning music directory:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const loadNextPage = async (limit = 50): Promise<MusicScanResult | null> => {
    if (!hasMorePages.value) return null
    return await scanMusicDirectory(currentPage.value + 1, limit)
  }

  const loadAllPages = async (limit = 50): Promise<void> => {
    // Load first page
    await scanMusicDirectory(1, limit)

    // Load remaining pages
    while (hasMorePages.value) {
      await loadNextPage(limit)
    }
  }

  const getTrackById = (id: string): MusicTrack | undefined => {
    return musicFiles.value.find(track => track.id === id)
  }

  const getTracksByArtist = (artist: string): MusicTrack[] => {
    return musicFiles.value.filter(track =>
      track.artist.toLowerCase().includes(artist.toLowerCase())
    )
  }

  const getTracksByAlbum = (album: string): MusicTrack[] => {
    return musicFiles.value.filter(track =>
      track.album.toLowerCase().includes(album.toLowerCase())
    )
  }

  const searchTracks = (query: string): MusicTrack[] => {
    const lowercaseQuery = query.toLowerCase()
    return musicFiles.value.filter(track =>
      track.title.toLowerCase().includes(lowercaseQuery) ||
      track.artist.toLowerCase().includes(lowercaseQuery) ||
      track.album.toLowerCase().includes(lowercaseQuery) ||
      track.fileName.toLowerCase().includes(lowercaseQuery)
    )
  }

  const formatDuration = (seconds: number): string => {
    if (!seconds || seconds === 0) return '0:00'

    const totalSeconds = Math.floor(seconds)
    const minutes = Math.floor(totalSeconds / 60)
    const remainingSeconds = totalSeconds % 60
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return {
    // State
    isLoading: readonly(isLoading),
    error: readonly(error),
    musicFiles: readonly(musicFiles),
    currentPage: readonly(currentPage),
    totalPages: readonly(totalPages),
    totalFiles: readonly(totalFiles),
    hasMorePages: readonly(hasMorePages),

    // Methods
    scanMusicDirectory,
    loadNextPage,
    loadAllPages,
    getTrackById,
    getTracksByArtist,
    getTracksByAlbum,
    searchTracks,
    formatDuration,
    formatFileSize
  }
}