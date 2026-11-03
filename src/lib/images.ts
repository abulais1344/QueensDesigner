/** Downscales an uploaded photo and returns it as a JPEG data URL (~100–200 KB). */
export async function compressImage(file: File, maxSize = 1400, quality = 0.82): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error(`${file.name} is not an image`)
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Image processing is not supported in this browser')
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', quality)
}
