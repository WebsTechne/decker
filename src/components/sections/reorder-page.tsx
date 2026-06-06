import { DragDropProvider } from "@dnd-kit/react"
import { useSortable, isSortable } from "@dnd-kit/react/sortable"
import type { CollectionData } from "#/server/collections"

type Page = CollectionData["pages"][number]

function SortablePage({
  page,
  index,
  onPageClick,
}: {
  page: Page
  index: number
  onPageClick?: (index: number) => void
}) {
  const { ref, isDragging } = useSortable({ id: page.id, index })

  return (
    <div
      ref={ref}
      className="relative cursor-grab touch-none overflow-hidden rounded-lg active:cursor-grabbing"
      style={{ opacity: isDragging ? 0.4 : 1 }}
    >
      <div
        style={
          page.width && page.height
            ? { paddingBottom: `${(page.height / page.width) * 100}%` }
            : { paddingBottom: "133%" }
        }
        className="bg-muted relative"
        onClick={() => onPageClick?.(index)} // to open the lightbox to preview this page
      >
        <img
          src={page.imageUrl}
          alt={`Page ${index + 1}`}
          className="absolute inset-0 h-full w-full object-contain"
          draggable={false}
        />
        <span className="font-heading absolute right-1.5 bottom-1.5 rounded bg-black/60 px-1.5 py-0.5 text-xs font-bold text-white">
          {index < 9 && "0"}
          {index + 1}
        </span>
      </div>
    </div>
  )
}

function PageReorder({
  pages,
  onChange,
  onPageClick,
}: {
  pages: Page[]
  onChange: (pages: Page[]) => void
  onPageClick?: (index: number) => void
}) {
  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return

        const { source } = event.operation

        if (isSortable(source)) {
          const { initialIndex, index } = source
          if (initialIndex === index) return

          const newPages = [...pages]
          const [removed] = newPages.splice(initialIndex, 1)
          newPages.splice(index, 0, removed)
          onChange(newPages)
        }
      }}
    >
      <div className="grid grid-cols-3 gap-2">
        {pages.map((page, i) => (
          <SortablePage
            key={page.id}
            page={page}
            index={i}
            onPageClick={onPageClick}
          />
        ))}
      </div>
    </DragDropProvider>
  )
}
export { PageReorder }
