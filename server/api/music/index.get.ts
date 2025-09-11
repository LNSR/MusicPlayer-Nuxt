import path from 'path'
import { createError, setHeader, getQuery } from 'h3'
import { MusicService } from '@@/server/services/music.service'
import { logger } from '@@/lib/logger'

export default defineEventHandler(async (event) => {
    try {
        const musicService = new MusicService()
        const query = getQuery(event)
        const fileParamForArtwork = query.file as string | undefined

        // Serve embedded artwork if file param is present
        if (fileParamForArtwork) {
            const filePath = decodeURIComponent(fileParamForArtwork.replace(/\+/g, '%2B'))
            const fullPath = path.join(process.cwd(), 'public', filePath)

            // Security: ensure requested file is within the music directory
            if (!fullPath.startsWith(musicService.musicDir)) {
                throw createError({ statusCode: 403, statusMessage: 'Access denied' })
            }

            // Check file exists
            try {
                await import('fs').then(m => m.promises.access(fullPath))
            } catch {
                throw createError({ statusCode: 404, statusMessage: 'File not found' })
            }

            // Validate extension
            const ext = path.extname(fullPath).toLowerCase()
            const audioExtensions = ['.mp3', '.flac', '.wav', '.ogg', '.m4a', '.aac']
            if (!audioExtensions.includes(ext)) {
                throw createError({ statusCode: 400, statusMessage: 'Not an audio file' })
            }

            // Try extract artwork
            const artworkResult = await musicService.extractArtwork(fullPath)
            if ('format' in artworkResult && 'data' in artworkResult) {
                setHeader(event, 'Content-Type', artworkResult.format)
                setHeader(event, 'Cache-Control', 'public, max-age=31536000')
                setHeader(event, 'Content-Length', artworkResult.data.length)
                return artworkResult.data
            } else if ('svg' in artworkResult) {
                setHeader(event, 'Content-Type', 'image/svg+xml')
                setHeader(event, 'Cache-Control', 'public, max-age=3600')
                return artworkResult.svg
            }

        }

        // Get paginated music files
        const page = parseInt(query.page as string) || 1
        const limit = Math.min(parseInt(query.limit as string) || 50, 100)
        const { files, total, totalPages, count } = await musicService.getPaginatedMusicFiles(page, limit)
        return {
            success: true,
            count,
            total,
            page,
            limit,
            totalPages,
            files
        }
    } catch (error) {
        logger.error('Error scanning music directory', { error: error instanceof Error ? error.message : String(error) })
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to scan music directory'
        })
    }
})