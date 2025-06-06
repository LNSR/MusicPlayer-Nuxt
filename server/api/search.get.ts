import redis from '~/lib/redis'
import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const searchTerm = query.q as string
  
  if (!searchTerm) {
    setResponseStatus(event, 400)
    return { message: 'Search term required' }
  }
  
  const cacheKey = `search:${searchTerm.toLowerCase()}`
  const cached = await redis.get(cacheKey)
  
  if (cached) {
    return JSON.parse(cached)
  }
  
  const results = await prisma.track.findMany({
    where: {
      OR: [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { artist: { name: { contains: searchTerm, mode: 'insensitive' } } }
      ]
    },
    include: { artist: true, album: true }
  })
  
  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify({ results }))
  
  return { results }
})