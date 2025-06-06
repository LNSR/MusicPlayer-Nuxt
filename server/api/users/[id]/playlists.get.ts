import redis from '~/lib/redis'

export default defineEventHandler(async (event) => {
  const userId = Number(event.context.params?.id)
  const cacheKey = `user:${userId}:playlists`
  
  const cached = await redis.get(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }
  
  const playlists = await prisma.playlist.findMany({
    where: { userId },
    include: { tracks: true }
  })
  
  // Cache for 10 minutes
  await redis.setex(cacheKey, 600, JSON.stringify({ playlists }))
  
  return { playlists }
})