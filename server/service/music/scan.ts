import { promises as fs } from 'fs'
import path from 'path'
import { parseFile } from 'music-metadata'
import redis from '~/lib/redis'

const SCAN_UPLOADS_CACHE_KEY = 'scan:uploads'
const SCAN_ALBUMS_CACHE_KEY = 'scan:albums'
const CACHE_TTL = 60 * 5 // 5 minutes

export class ScanUploadsService {
  async scanUploads() {
    const cached = await redis.get(SCAN_UPLOADS_CACHE_KEY)
    if (cached) return JSON.parse(cached)

    const uploadDir = path.resolve('public/uploads')
    await fs.mkdir(uploadDir, { recursive: true })
    const files = await fs.readdir(uploadDir)
    const result = await this._scanDir(uploadDir, '/uploads')

    await redis.set(SCAN_UPLOADS_CACHE_KEY, JSON.stringify(result), 'EX', CACHE_TTL)
    return result
  }

  async scanAlbums() {
    const cached = await redis.get(SCAN_ALBUMS_CACHE_KEY)
    if (cached) return JSON.parse(cached)

    const uploadDir = path.resolve('public/uploads')
    await fs.mkdir(uploadDir, { recursive: true })
    const result = await this._scanAlbumsRecursive(uploadDir, '/uploads')

    await redis.set(SCAN_ALBUMS_CACHE_KEY, JSON.stringify(result), 'EX', CACHE_TTL)
    return result
  }

  private async _scanDir(dirPath: string, urlPrefix: string) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    const results: any[] = []

    // Find cover image in this directory
    const coverEntry = entries.find(
      entry => entry.isFile() && /cover\.(jpg|jpeg|png)$/i.test(entry.name)
    )
    const coverUrl = coverEntry ? `${urlPrefix}/${coverEntry.name}` : null

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      const relUrl = `${urlPrefix}/${entry.name}`

      if (entry.isDirectory()) {
        const nested = await this._scanDir(fullPath, relUrl)
        results.push(...nested)
      } else if (/\.(mp3|wav|flac|ogg|m4a)$/i.test(entry.name)) {
        try {
          const metadata = await parseFile(fullPath)
          results.push({
            fileName: entry.name,
            fileUrl: relUrl,
            title: metadata.common.title || '',
            artist: metadata.common.artist || '',
            duration: metadata.format.duration ? Math.round(metadata.format.duration) : 0,
            coverUrl,
          })
        } catch (err) {
          continue
        }
      }
    }
    return results
  }

  // Recursively scan for albums and their tracks
  private async _scanAlbumsRecursive(dirPath: string, urlPrefix: string) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    const albums: any[] = []

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const albumPath = path.join(dirPath, entry.name)
        const albumUrl = `${urlPrefix}/${entry.name}`
        const albumEntries = await fs.readdir(albumPath, { withFileTypes: true })

        // Find cover image
        const coverFile = albumEntries.find(f =>
          f.isFile() && /cover\.(jpg|jpeg|png)$/i.test(f.name)
        )
        const coverUrl = coverFile ? `${albumUrl}/${coverFile.name}` : null

        // Find audio files
        const tracks = []
        for (const file of albumEntries) {
          if (file.isFile() && /\.(mp3|wav|flac|ogg|m4a)$/i.test(file.name)) {
            const filePath = path.join(albumPath, file.name)
            try {
              const metadata = await parseFile(filePath)
              tracks.push({
                fileName: file.name,
                fileUrl: `${albumUrl}/${file.name}`,
                title: metadata.common.title || file.name,
                artist: metadata.common.artist || '',
                duration: metadata.format.duration ? Math.round(metadata.format.duration) : 0,
              })
            } catch {
              continue
            }
          }
        }

        // Recursively scan for nested albums
        const subAlbums = await this._scanAlbumsRecursive(albumPath, albumUrl)
        albums.push({
          albumName: entry.name,
          albumUrl,
          coverUrl,
          tracks,
          subAlbums: subAlbums.length ? subAlbums : undefined,
        })
      }
    }
    return albums
  }
}