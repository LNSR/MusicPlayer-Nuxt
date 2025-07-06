export interface Music {
  id: number
  title: string
  albumId: number
  album?: {
    id: number
    title: string
    artistId: number
    artist?: {
      id: number
      name: string
      coverUrl?: string | null
    }
    coverUrl?: string | null
    released?: string | null
  }
  duration: number
  fileUrl: string
  coverUrl?: string | null
  genre?: string | null
  released?: string | null
  createdAt: string
  updatedAt: string
}