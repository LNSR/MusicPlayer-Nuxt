import { MusicService } from '~/server/service/music/music'
import { prisma } from '~/lib/prisma'
import { promises as fs } from 'fs'
import path from 'path'

type CreateSongForm = {
  title: string
  albumId: number
  duration: number
  file: { filename: string; data: Buffer }
}

type CreateSongResponse = {
  success: boolean
  song: any 
}

export default defineEventHandler(async (event): Promise<CreateSongResponse> => {
  const musicService = new MusicService()

  // Parse multipart/form-data
  const form = await readMultipartFormData(event)
  if (!form) {
    throw createError({ statusCode: 400, statusMessage: 'No form data received' })
  }

  // Extract fields
  const title = form.find(f => f.name === 'title')?.data?.toString()
  const albumId = Number(form.find(f => f.name === 'albumId')?.data?.toString())
  const duration = Number(form.find(f => f.name === 'duration')?.data?.toString())
  const file = form.find(f => f.name === 'file')

  if (!title || !albumId || !duration || !file) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  // Save file to public/uploads (ensure the directory exists)
  const uploadDir = path.resolve('public/uploads')
  await fs.mkdir(uploadDir, { recursive: true })
  const fileName = `${Date.now()}_${file.filename}`
  const filePath = path.join(uploadDir, fileName)
  await fs.writeFile(filePath, file.data)

  // Store file URL (relative to public)
  const fileUrl = `/uploads/${fileName}`

  const song = await musicService.createSong({
    title,
    albumId,
    duration,
  })

  // Update the song with fileUrl
  const updatedSong = await prisma.track.update({
    where: { id: song.id },
    data: { fileUrl }
  })

  return { success: true, song: updatedSong }
})

