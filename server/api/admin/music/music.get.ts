import { MusicService } from '~/server/service/music/music';

export default defineEventHandler(async (event) => {
  try {
    const musicService = new MusicService();
    const allSongs = await musicService.getAllSongs();
    return allSongs;
  } catch (error) {
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch music',
    }));
  }
});
