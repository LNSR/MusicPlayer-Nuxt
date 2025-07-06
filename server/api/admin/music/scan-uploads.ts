import { ScanUploadsService } from '~/server/service/music/scan'

export default defineEventHandler(async () => {
  const service = new ScanUploadsService()
  return await service.scanUploads()
})