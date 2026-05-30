import { supabase } from "./supabase"

async function uploadAvatar(file: File, userId: string) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
  const path = `${userId}/avatar.${ext}`

  const { data, error } = await supabase.storage
    .from("avatars")
    .upload(path, file, {
      upsert: true,
      contentType: file.type || `image/${ext}`,
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

async function uploadPage(
  file: File,
  collectionId: string,
  position: number,
  onProgress?: (uploaded: number, total: number) => void,
) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
  const path = `${collectionId}/${position}.${ext}`

  const { data, error } = await supabase.storage
    .from("pages")
    .upload(path, file, {
      upsert: true,
      contentType: file.type || `image/${ext}`,
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
