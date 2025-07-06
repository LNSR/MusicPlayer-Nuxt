import { prisma } from '~/lib/prisma'
import redis from '~/lib/redis'

const ALL_SONGS_CACHE_KEY = 'music:all';
const SONG_CACHE_KEY = (id: number) => `music:${id}`;

export class MusicService {
  // Fetch all tracks with album and artist info, with Redis caching
  async getAllSongs() {
    const cached = await redis.get(ALL_SONGS_CACHE_KEY);
    if (cached) return JSON.parse(cached);

    const songs = await prisma.track.findMany({
      include: {
        album: {
          include: {
            artist: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    });

    await redis.set(ALL_SONGS_CACHE_KEY, JSON.stringify(songs), 'EX', 60 * 5); // cache for 5 minutes
    return songs;
  }

  // Fetch a single track by ID, with Redis caching
  async getSongById(id: number) {
    if (!id || isNaN(Number(id))) throw new Error('Invalid track ID');
    const cacheKey = SONG_CACHE_KEY(id);
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const song = await prisma.track.findUnique({
      where: { id: Number(id) },
      include: {
        album: {
          include: {
            artist: true,
          },
        },
      },
    });

    if (song) await redis.set(cacheKey, JSON.stringify(song), 'EX', 60 * 5); // cache for 5 minutes
    return song;
  }

  // Create a new track and invalidate relevant caches
  async createSong(data: { title: string; albumId: number; duration: number }) {
    if (!data.title || !data.albumId || !data.duration) {
      throw new Error('Missing required fields');
    }
    const song = await prisma.track.create({
      data: {
        title: data.title,
        albumId: data.albumId,
        duration: data.duration,
      },
    });
    await redis.del(ALL_SONGS_CACHE_KEY);
    return song;
  }

  // Update an existing track and invalidate relevant caches
  async updateSong(id: number, data: { title?: string; albumId?: number; duration?: number }) {
    if (!id || isNaN(Number(id))) throw new Error('Invalid track ID');
    const song = await prisma.track.update({
      where: { id: Number(id) },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.albumId && { albumId: data.albumId }),
        ...(data.duration && { duration: data.duration }),
      },
    });
    await Promise.all([
      redis.del(ALL_SONGS_CACHE_KEY),
      redis.del(SONG_CACHE_KEY(id)),
    ]);
    return song;
  }

  // Delete a track and invalidate relevant caches
  async deleteSong(id: number) {
    if (!id || isNaN(Number(id))) throw new Error('Invalid track ID');
    const song = await prisma.track.delete({
      where: { id: Number(id) },
    });
    await Promise.all([
      redis.del(ALL_SONGS_CACHE_KEY),
      redis.del(SONG_CACHE_KEY(id)),
    ]);
    return song;
  }
}