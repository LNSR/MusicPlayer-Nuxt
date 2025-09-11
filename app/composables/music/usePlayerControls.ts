import { useMusicFlow as useMusicFlowComposable } from 'vue-music-flow'
import type { PlayerTrack, MusicFlowComponent } from '#shared/types/music'


export const usePlayerControls = () => {
  // Try to use the MusicFlow composable, but fall back to component ref approach
  let composableMethods: any = {}

  try {
    composableMethods = useMusicFlowComposable()
  } catch (error) {
    console.warn('useMusicFlow composable not available, using component ref approach:', error)
  }

  const {
    onPlaySingleTrack,
    onPlayAsPlaylist,
    togglePlayback,
    onPlayPreviousTrack,
    onPlayNextTrack,
    onClose: onClosePlayer,
    isPlaying,
    returnTrack: currentTrack,
    playlist,
    isTrackPlaying: isTrackPlayingFn
  } = composableMethods

  // Reference to the MusicFlow component (fallback approach)
  const musicFlowRef = ref<MusicFlowComponent | null>(null)

  // Current playlist state (for fallback)
  const currentPlaylist = ref<PlayerTrack[]>([])
  const currentTrackIndex = ref<number>(-1)
  const isPlayingFallback = ref(false)

  // Set the MusicFlow component reference
  const setMusicFlowRef = (ref: Ref<MusicFlowComponent | null>) => {
    musicFlowRef.value = ref.value
  }

  // Play a single track
  const playTrack = (track: PlayerTrack) => {
    if (!track) {
      console.warn('No track provided to playTrack')
      return
    }

    console.log('Playing track:', track.title)

    // Convert our track format to MusicFlow format with numeric ID
    const musicFlowTrack: PlayerTrack = {
      id: typeof track.id === 'string' ? parseInt(track.id, 10) : track.id,
      audio: track.audio,
      title: track.title,
      artist: track.artist,
      album: track.album,
      artwork: track.artwork,
      original: track.original
    }

    // Try composable first, then component ref
    if (onPlaySingleTrack) {
      onPlaySingleTrack(musicFlowTrack)
    } else if (musicFlowRef.value?.onPlaySingleTrack) {
      musicFlowRef.value.onPlaySingleTrack(musicFlowTrack)
    } else if (musicFlowRef.value?.playTrack) {
      musicFlowRef.value.playTrack(musicFlowTrack)
    } else {
      console.warn('No method available to play track')
    }

    // Update fallback state
    currentPlaylist.value = [musicFlowTrack]
    currentTrackIndex.value = 0
    isPlayingFallback.value = true
  }

  // Play multiple tracks as playlist
  const playPlaylist = (tracks: PlayerTrack[], startIndex = 0) => {
    if (!tracks || tracks.length === 0) {
      console.warn('No tracks provided to playPlaylist')
      return
    }

    console.log('Playing playlist with', tracks.length, 'tracks')

    // Convert tracks to MusicFlow format with numeric IDs
    const musicFlowTracks: PlayerTrack[] = tracks.map(track => ({
      id: typeof track.id === 'string' ? parseInt(track.id, 10) : track.id,
      audio: track.audio,
      title: track.title,
      artist: track.artist,
      album: track.album,
      artwork: track.artwork,
      original: track.original
    }))

    const startTrack = musicFlowTracks[startIndex] || musicFlowTracks[0]

    // Try composable first, then component ref
    if (onPlayAsPlaylist) {
      onPlayAsPlaylist(musicFlowTracks, startTrack)
    } else if (musicFlowRef.value?.onPlayAsPlaylist) {
      musicFlowRef.value.onPlayAsPlaylist(musicFlowTracks, startTrack)
    } else if (musicFlowRef.value?.playPlaylist) {
      musicFlowRef.value.playPlaylist(musicFlowTracks)
    } else {
      console.warn('No method available to play playlist')
    }

    // Update fallback state
    currentPlaylist.value = musicFlowTracks
    currentTrackIndex.value = Math.min(startIndex, tracks.length - 1)
    isPlayingFallback.value = true
  }

  // Get current track
  const getCurrentTrack = (): PlayerTrack | null => {
    return currentTrack?.value || currentPlaylist.value[currentTrackIndex.value] || null
  }

  // Check if a track is currently playing
  const isTrackPlaying = (trackId: string | number): boolean => {
    if (isTrackPlayingFn) {
      const numericId = typeof trackId === 'string' ? parseInt(trackId, 10) : trackId
      return isTrackPlayingFn(numericId)
    }

    // Fallback to our local state
    const current = getCurrentTrack()
    if (!current) return false

    const numericId = typeof trackId === 'string' ? parseInt(trackId, 10) : trackId
    return current.id === numericId && (isPlaying?.value ?? isPlayingFallback.value)
  }

  // Toggle playback
  const togglePlaybackFn = () => {
    if (togglePlayback) {
      togglePlayback()
    } else if (musicFlowRef.value?.togglePlayback) {
      musicFlowRef.value.togglePlayback()
    } else {
      console.warn('No togglePlayback method available')
    }
  }

  // Play next track
  const playNext = () => {
    if (onPlayNextTrack) {
      onPlayNextTrack()
    } else if (musicFlowRef.value?.onPlayNextTrack) {
      musicFlowRef.value.onPlayNextTrack()
    } else {
      console.warn('No playNext method available')
    }
  }

  // Play previous track
  const playPrevious = () => {
    if (onPlayPreviousTrack) {
      onPlayPreviousTrack()
    } else if (musicFlowRef.value?.onPlayPreviousTrack) {
      musicFlowRef.value.onPlayPreviousTrack()
    } else {
      console.warn('No playPrevious method available')
    }
  }

  // Stop/close player
  const stopPlayer = () => {
    if (onClosePlayer) {
      onClosePlayer()
    } else if (musicFlowRef.value?.onClosePlayer) {
      musicFlowRef.value.onClosePlayer()
    } else {
      console.warn('No stopPlayer method available')
    }

    // Update fallback state
    isPlayingFallback.value = false
    currentTrackIndex.value = -1
  }

  return {
    // State
    musicFlowRef: readonly(musicFlowRef),
    currentPlaylist: readonly(playlist || currentPlaylist),
    isPlaying: readonly(isPlaying || isPlayingFallback),
    currentTrack: readonly(currentTrack || currentPlaylist),

    // Methods
    setMusicFlowRef,
    playTrack,
    playPlaylist,
    togglePlayback: togglePlaybackFn,
    playNext,
    playPrevious,
    stopPlayer,
    getCurrentTrack,
    isTrackPlaying
  }
}