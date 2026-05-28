import { cn } from "#/lib/utils"
import { useState } from "react"

function DropZone({ onFiles }: { onFiles: (files: File[]) => void }) {
  const [dragging, setDragging] = useState(false)

  return (
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
        "flex-center cursor-pointer rounded-xl border-2 border-dashed p-8 transition-colors",
        dragging ? "border-blue-500 bg-blue-500/10" : "border-muted",
      )}
    >
      <p className="w-max">Drop images here or click to browse</p>
      <input
        id="file-input"
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => onFiles(Array.from(e.target.files ?? []))}
      />
    </div>
  )
}

export { DropZone }
