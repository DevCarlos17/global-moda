import { useState } from 'react'
import { toast } from 'sonner'
import { cloudinaryService } from '@/services/cloudinaryService'

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false)

  const upload = async (file: File): Promise<string | null> => {
    setIsUploading(true)
    try {
      const result = await cloudinaryService.upload(file)
      return result.url
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al subir la imagen')
      return null
    } finally {
      setIsUploading(false)
    }
  }

  return { upload, isUploading }
}
