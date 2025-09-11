import { promises as fs } from 'fs'
import path from 'path'
import { parseFile } from 'music-metadata'

/**
 * MusicService handles scanning music directories, extracting metadata, and artwork.
 *
 * @class MusicService
 */
export class MusicService {
    musicDir: string

    constructor(baseDir?: string) {
        this.musicDir = path.join(baseDir || process.cwd(), 'public', 'music')
    }

    /**
     * Generate a numeric ID from a file path hash.
     * @param filePath
     * @returns {number}
     */
    generateNumericId(filePath: string): number {
        let hash = 0
        for (let i = 0; i < filePath.length; i++) {
            const char = filePath.charCodeAt(i)
            hash = ((hash << 5) - hash) + char
            hash = hash & hash // Convert to 32-bit integer
        }
        return Math.abs(hash)
    }

    /**
     * Recursively scan a directory for audio files and extract metadata.
     * @param dirPath
     * @param relativePath
     * @returns {Promise<any[]>}
     */
    async scanDirectory(dirPath: string, relativePath = 'music'): Promise<any[]> {
        const files: any[] = []
        const entries = await fs.readdir(dirPath, { withFileTypes: true })
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name)
            const relPath = path.join(relativePath, entry.name)
            if (entry.isDirectory()) {
                const subFiles = await this.scanDirectory(fullPath, relPath)
                files.push(...subFiles)
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase()
                const audioExtensions = ['.mp3', '.flac', '.wav', '.ogg', '.m4a', '.aac', '.wma']
                if (audioExtensions.includes(ext)) {
                    try {
                        const stats = await fs.stat(fullPath)
                        const maxFileSize = 100 * 1024 * 1024 // 100MB
                        if (stats.size > maxFileSize) {
                            files.push({
                                id: this.generateNumericId(relPath),
                                audio: `/${relPath}`,
                                title: path.parse(entry.name).name,
                                artist: 'Unknown Artist',
                                album: 'Unknown Album',
                                artwork: 'https://placehold.co/400x400',
                                duration: 0,
                                filePath: relPath,
                                fileName: entry.name,
                                fileSize: stats.size,
                                error: 'File too large to process'
                            })
                            continue
                        }
                        const metadata = await Promise.race([
                            parseFile(fullPath),
                            new Promise((_, reject) => setTimeout(() => reject(new Error('Metadata parsing timeout')), 10000))
                        ]) as any
                        const artwork = '/api/music?file=' + encodeURIComponent(relPath)
                        files.push({
                            id: this.generateNumericId(relPath),
                            audio: `/${relPath}`,
                            title: metadata.common.title || path.parse(entry.name).name,
                            artist: metadata.common.artist || 'Unknown Artist',
                            album: metadata.common.album || 'Unknown Album',
                            artwork: artwork,
                            duration: metadata.format.duration || 0,
                            bitrate: metadata.format.bitrate,
                            sampleRate: metadata.format.sampleRate,
                            codec: metadata.format.codec,
                            filePath: relPath,
                            fileName: entry.name,
                            fileSize: stats.size
                        })
                    } catch (error) {
                        const stats = await fs.stat(fullPath)
                        files.push({
                            id: this.generateNumericId(relPath),
                            audio: `/${relPath}`,
                            title: path.parse(entry.name).name,
                            artist: 'Unknown Artist',
                            album: 'Unknown Album',
                            artwork: 'https://placehold.co/400x400',
                            duration: 0,
                            filePath: relPath,
                            fileName: entry.name,
                            fileSize: stats.size,
                            error: 'Failed to parse metadata'
                        })
                    }
                }
            }
        }
        return files
    }

    /**
     * Get paginated music files from the music directory.
     * @param page
     * @param limit
     * @returns {Promise<{files: any[], total: number, totalPages: number, count: number, page: number, limit: number}>}
     */
    async getPaginatedMusicFiles(page = 1, limit = 50) {
        await fs.access(this.musicDir)
        const allMusicFiles = await this.scanDirectory(this.musicDir, 'music')
        const totalFiles = allMusicFiles.length
        const offset = (page - 1) * limit
        const paginatedFiles = allMusicFiles.slice(offset, offset + limit)
        const totalPages = Math.ceil(totalFiles / limit)
        return {
            files: paginatedFiles,
            total: totalFiles,
            totalPages,
            count: paginatedFiles.length,
            page,
            limit
        }
    }

    /**
     * Extract artwork from an audio file, or return SVG placeholder if not found.
     * @param fullPath
     * @returns {Promise<{format: string, data: Uint8Array} | {svg: string}>}
     */
    async extractArtwork(fullPath: string): Promise<{ format: string, data: Uint8Array } | { svg: string }> {
        try {
            const metadata = await parseFile(fullPath)
            if (metadata.common.picture && metadata.common.picture.length > 0) {
                const picture = metadata.common.picture[0]
                if (picture && picture.format && picture.data) {
                    // music-metadata returns picture.data as Uint8Array
                    return { format: picture.format, data: picture.data as Uint8Array }
                }
            }
        } catch (err) {
            // fallthrough to placeholder
        }
        const svgPlaceholder = `<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 400 400\" width=\"400\" height=\"400\"><rect width=\"400\" height=\"400\" fill=\"#f3f4f6\"/><circle cx=\"200\" cy=\"160\" r=\"60\" fill=\"#9ca3af\"/><path d=\"M140 280 Q200 240 260 280 L260 340 Q200 380 140 340 Z\" fill=\"#6b7280\"/><circle cx=\"180\" cy=\"150\" r=\"8\" fill=\"#ffffff\"/><circle cx=\"220\" cy=\"150\" r=\"8\" fill=\"#ffffff\"/><text x=\"200\" y=\"320\" text-anchor=\"middle\" fill=\"#6b7280\" font-family=\"Arial, sans-serif\" font-size=\"14\">No Artwork</text></svg>`
        return { svg: svgPlaceholder }
    }
}
