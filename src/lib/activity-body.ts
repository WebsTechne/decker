import type { ActivityType } from "#/generated/prisma/enums"

export type { ActivityType }

const truncate = (str: string, max = 40) =>
  str.length > max ? str.slice(0, max) + "…" : str

export function generateActivityBody(
  type: ActivityType,
  actor: string,
  collectionName: string,
  extra?: { commentBody?: string; pageCount?: number },
): string {
  const col = `"${truncate(collectionName)}"`

  switch (type) {
    case "SAVE":
      return `${actor} saved your collection ${col}`
    case "COMMENT":
      return `${actor} commented on your collection ${col}${extra?.commentBody ? ` — "${truncate(extra.commentBody, 60)}"` : ""}`
    case "PAGE_ADDED":
      return `${actor} added ${extra?.pageCount ?? "some"} new page${(extra?.pageCount ?? 2) > 1 ? "s" : ""} to ${col}`
    case "PAGE_DELETED":
      return `${actor} removed ${extra?.pageCount ?? "some"} page${(extra?.pageCount ?? 2) > 1 ? "s" : ""} from ${col}`
    case "COLLECTION_UPDATED":
      return `${col} was updated by ${actor}`
  }
}
