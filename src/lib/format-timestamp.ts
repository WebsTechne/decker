function formatListTimestamp({
  createdAt,
  now,
}: {
  createdAt: Date | string
  now: Date
}): string {
  const d = toUTCDate(createdAt)
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMs / 3_600_000)
  const diffDays = Math.floor(diffMs / 86_400_000)

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const olderDates = d.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
  })

  const isToday = d.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday = d.toDateString() === yesterday.toDateString()

  if (isToday) {
    if (diffMins < 1) return "Just now"
    else if (diffMins < 60) return `${diffMins}m`
    else return `${diffHours}h`
  } else if (isYesterday) return "Yesterday"
  else if (diffDays < 7) return days[d.getDay()]
  return olderDates
}

const getDayLabel = (date: Date): string => {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  if (isSameDay(date, today)) return "Today"
  if (isSameDay(date, yesterday)) return "Yesterday"

  return date.toLocaleDateString("en-US", { month: "long", day: "numeric" })
  // → "March 21"
}

const toUTCDate = (d: Date | string): Date => {
  if (d instanceof Date) return d
  return new Date(d.endsWith("Z") ? d : d + "Z")
}

export { formatListTimestamp, getDayLabel, toUTCDate }
