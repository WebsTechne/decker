import { supabase } from "../supabase"

async function deletePage(raw: string[], collectionId: string) {
  const filePaths = raw.map((r) => `${collectionId}/${r}`)
  const { error } = await supabase.storage.from("pages").remove(filePaths)

  if (error) {
    console.error("Page delete failed:", { raw, collectionId, error })
    throw error
  }
  return { data: `${raw.length} pages deleted successfully` }
}

export { deletePage }
