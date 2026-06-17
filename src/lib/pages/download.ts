import JSZip from "jszip"
import FileSaver from "file-saver"
import { safeFileName } from "../name"

const { saveAs } = FileSaver

type Page = {
  imageUrl: string
  position: number
}

type DownloadCollectionOptions = {
  onProgress?: (percent: number) => void
}

const CHUNK_SIZE = 5

export async function downloadCollection(
  collectionName: string,
  pages: Page[],
  options?: DownloadCollectionOptions,
) {
  try {
    const zip = new JSZip()

    const sortedPages = [...pages].sort((a, b) => a.position - b.position)

    let downloadedCount = 0

    for (let i = 0; i < sortedPages.length; i += CHUNK_SIZE) {
      const chunk = sortedPages.slice(i, i + CHUNK_SIZE)

      await Promise.all(
        chunk.map(async (page, chunkIndex) => {
          const pageIndex = i + chunkIndex

          const response = await fetch(page.imageUrl)

          if (!response.ok) {
            throw new Error(`Failed to fetch page ${pageIndex + 1}`)
          }

          const blob = await response.blob()

          zip.file(`page-${String(pageIndex + 1).padStart(2, "0")}.jpg`, blob)

          downloadedCount++

          // First 50% of progress = downloading files
          options?.onProgress?.((downloadedCount / sortedPages.length) * 50)
        }),
      )
    }

    const zipBlob = await zip.generateAsync(
      {
        type: "blob",
      },
      (metadata) => {
        // Remaining 50% = zip creation
        options?.onProgress?.(50 + metadata.percent / 2)
      },
    )

    saveAs(zipBlob, `${safeFileName(collectionName)}.zip`)

    options?.onProgress?.(100)
  } catch (error) {
    console.error("Collection download failed:", error)
    throw error
  }
}
