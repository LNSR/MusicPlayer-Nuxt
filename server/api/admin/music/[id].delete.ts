import { MusicService } from '~/server/service/music/music'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)
  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid track ID' })
  }

  const musicService = new MusicService()
  const deleted = await musicService.deleteSong(id)
  return { success: true, deleted }
})