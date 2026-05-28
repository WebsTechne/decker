import { cn } from "#/lib/utils"
import { useMemo, useState } from "react"

function DropZone({
  onFiles,
  preview,
  multiple = false,
}: {
  onFiles: (files: File[]) => void
  preview?: File
  multiple?: boolean
}) {
  const [dragging, setDragging] = useState(false)
  const previewUrl = useMemo(
    () => (preview ? URL.createObjectURL(preview) : null),
    [preview],
  )

  return (
    <section className="flex flex-col gap-2">
      <div className={cn("flex flex-wrap gap-1", previewUrl && "mb-2")}>
        {previewUrl && (
          <img src={previewUrl} alt="preview" className="h-40 object-contain" />
        )}
      </div>

      {/* {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((file, i) => (
            <div key={i} className="relative aspect-square">
              <img
                src={URL.createObjectURL(file)}
                alt={`page ${i + 1}`}
                className="h-full w-full rounded-lg object-cover"
              />
              <button
                onClick={() => removeFile(i)}
                className="flex-center absolute top-1 right-1 size-5 rounded-full bg-black/60 text-white"
              >
                ×
              </button>
              <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-xs text-white">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      )} */}

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          onFiles(Array.from(e.dataTransfer.files))
        }}
        onClick={() => document.getElementById("file-input")?.click()}
        className={cn(
          "flex-center h-37.5 cursor-pointer rounded-xl border-2 border-dashed p-8 transition-colors",
          dragging ? "border-blue-500 bg-blue-500/10" : "border-muted",
        )}
      >
        <p className="w-max text-center">Drop images here or click to browse</p>
        <input
          id="file-input"
          type="file"
          multiple={multiple}
          accept="image/*"
          className="hidden"
          onChange={(e) => onFiles(Array.from(e.target.files ?? []))}
        />
      </div>
    </section>
  )
}

export { DropZone }
