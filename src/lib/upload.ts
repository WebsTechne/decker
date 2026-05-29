import { supabase } from "./supabase"

export async function uploadAvatar(file: File, userId: string) {
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
