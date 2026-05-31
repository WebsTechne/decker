import { supabase } from "./supabase"
import imageCompression from "browser-image-compression"

const PAGE_MAX_MB = 5.5 // just under the 6MB bucket limit
const AVATAR_MAX_MB = 4 // because I feel like 4mb

async function compressIfNeeded(file: File, maxSizeMB: number): Promise<File> {
  const fileSizeMB = file.size / (1024 * 1024)

  if (fileSizeMB <= maxSizeMB) return file // no compression needed

  return imageCompression(file, {
    maxSizeMB,
    maxWidthOrHeight: 2560, // keep resolution high for readability
    useWebWorker: true,
    initialQuality: 0.85, // high quality
  })
}

async function uploadAvatar(file: File, userId: string) {
  const processed = await compressIfNeeded(file, AVATAR_MAX_MB)
  const ext = processed.name.split(".").pop()?.toLowerCase() ?? "jpg"
  const path = `${userId}/avatar.${ext}`

  const { data, error } = await supabase.storage
    .from("avatars")
    .upload(path, processed, {
      upsert: true,
      contentType: processed.type || `image/${ext}`,
    })

  if (error) {
    console.error("Avatar upload failed:", { path, userId, error })
    throw error
  }

  const { data: publicData } = supabase.storage
    .from("avatars")
    .getPublicUrl(data.path)

  return publicData.publicUrl
}

async function uploadPage(file: File, collectionId: string, position: number) {
  const processed = await compressIfNeeded(file, PAGE_MAX_MB)
  const ext = processed.name.split(".").pop()?.toLowerCase() ?? "jpg"
  const path = `${collectionId}/${position}.${ext}`

  const { data, error } = await supabase.storage
    .from("pages")
    .upload(path, processed, {
      upsert: true,
      contentType: processed.type || `image/${ext}`,
    })

  if (error) {
    console.error("Page upload failed:", { path, collectionId, error })
    throw error
  }

  const { data: publicData } = supabase.storage
    .from("pages")
    .getPublicUrl(data.path)

  return publicData.publicUrl
}

async function uploadPages(
  files: File[],
  collectionId: string,
  onProgress?: (uploaded: number, total: number) => void,
) {
  let uploaded = 0

  const urls = await Promise.all(
    files.map(async (file, index) => {
      const url = await uploadPage(file, collectionId, index)
      uploaded++
      onProgress?.(uploaded, files.length)
      return { url, position: index }
    }),
  )

  return urls
}

export { uploadAvatar, uploadPage, uploadPages }
