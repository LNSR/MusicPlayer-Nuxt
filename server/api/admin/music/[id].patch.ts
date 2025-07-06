import { MusicService } from '~/server/service/music/music'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)
  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid track ID' })
  }

  const body = await readBody(event)
  // Accepts partial update: title, albumId, duration
  const { title, albumId, duration } = body

  if (!title && !albumId && !duration) {
    throw createError({ statusCode: 400, statusMessage: 'No fields to update' })
  }

  const musicService = new MusicService()
  const updated = await musicService.updateSong(id, { title, albumId, duration })
  return { success: true, updated }
})