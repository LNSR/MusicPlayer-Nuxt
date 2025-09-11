import { type TMusicFlow } from 'vue-music-flow'
/**
 * PlayerTrack type alias for compatibility with vue-music-flow
 * You can extend this if needed for your app
 */
export type PlayerTrack = TMusicFlow

/**
 * MusicFlowComponent interface for player component ref
 * Mirrors the internal methods and state of MusicFlow
 */
export interface MusicFlowComponent {
  // Internal player methods that MusicFlow exposes
  onPlaySingleTrack?: (track: PlayerTrack) => void
  onPlayAsPlaylist?: (tracks: PlayerTrack[], track?: PlayerTrack) => void
  togglePlayback?: () => void
  onPlayPreviousTrack?: () => void
  onPlayNextTrack?: () => void
  onClosePlayer?: () => void
  // State getters
  isPlaying?: boolean
  currentTrack?: PlayerTrack
  playlist?: PlayerTrack[]
  // Alternative method names that might be available
  playTrack?: (track: PlayerTrack) => void
  playPlaylist?: (tracks: PlayerTrack[]) => void
}
/**
 * Music-related type definitions for the MusicPlatform
 */

/**
 * Represents a music track with metadata and file information
 */
export interface MusicTrack {
  /** Unique identifier for the track */
  id: string
  /** URL to the audio file */
  audio: string
  /** Track title */
  title: string
  /** Artist name */
  artist: string
  /** Album name */
  album: string
  /** URL to the album artwork */
  artwork: string
  /** Duration in seconds */
  duration: number
  /** Audio bitrate (optional) */
  bitrate?: number
  /** Sample rate in Hz (optional) */
  sampleRate?: number
  /** Audio codec (optional) */
  codec?: string
  /** Full file path */
  filePath: string
  /** File name */
  fileName: string
  /** File size in bytes */
  fileSize: number
  /** Error message if track failed to load (optional) */
  error?: string
  /** Original metadata object (optional) */
  original?: any
}

/**
 * Result of a music directory scan operation
 */
export interface MusicScanResult {
  /** Whether the scan was successful */
  success: boolean
  /** Number of files found in this scan */
  count: number
  /** Total number of files found */
  total: number
  /** Current page number */
  page: number
  /** Number of items per page */
  limit: number
  /** Total number of pages */
  totalPages: number
  /** Array of music tracks found */
  files: MusicTrack[]
}