export type FittedItemsResult<T> = {
  visibleItems: T[]
  hiddenCount: number
  itemSize: number
  visibleCount: number
}

export const getFittedItems = <T>({
  availableSize,
  items,
  minItemSize,
  preferredItemSize,
  gap = 0,
  minVisibleRatio = 0.9,
}: {
  availableSize: number
  items: T[]
  minItemSize: number
  preferredItemSize: number
  gap?: number
  minVisibleRatio?: number
}): FittedItemsResult<T> => {
  if (items.length === 0 || availableSize <= 0) {
    return {
      visibleItems: [],
      hiddenCount: items.length,
      itemSize: 0,
      visibleCount: 0,
    }
  }

  const preferredWithGap = preferredItemSize + gap
  const rawCapacity = (availableSize + gap) / preferredWithGap
  const fullCount = Math.max(1, Math.floor(rawCapacity))
  const nextRatio = rawCapacity - fullCount
  let visibleCount = Math.min(
    items.length,
    nextRatio >= minVisibleRatio ? Math.ceil(rawCapacity) : fullCount
  )

  while (visibleCount > 1) {
    const nextItemSize = (availableSize - gap * (visibleCount - 1)) / visibleCount
    if (nextItemSize >= minItemSize) break
    visibleCount -= 1
  }

  visibleCount = Math.max(1, Math.min(items.length, visibleCount))
  const itemSize = Math.max(
    0,
    (availableSize - gap * Math.max(0, visibleCount - 1)) / visibleCount
  )

  return {
    visibleItems: items.slice(0, visibleCount),
    hiddenCount: Math.max(0, items.length - visibleCount),
    itemSize,
    visibleCount,
  }
}

export const getFittedGridItems = <T>({
  availableHeight,
  columns,
  items,
  minRowHeight,
  preferredRowHeight,
  gap = 0,
  minVisibleRatio = 0.9,
}: {
  availableHeight: number
  columns: number
  items: T[]
  minRowHeight: number
  preferredRowHeight: number
  gap?: number
  minVisibleRatio?: number
}) => {
  const safeColumns = Math.max(1, columns)
  const rows = Array.from(
    { length: Math.ceil(items.length / safeColumns) },
    (_, rowIndex) => rowIndex
  )
  const fittedRows = getFittedItems({
    availableSize: availableHeight,
    items: rows,
    minItemSize: minRowHeight,
    preferredItemSize: preferredRowHeight,
    gap,
    minVisibleRatio,
  })
  const visibleCount = Math.min(items.length, fittedRows.visibleCount * safeColumns)

  return {
    visibleItems: items.slice(0, visibleCount),
    hiddenCount: Math.max(0, items.length - visibleCount),
    rowHeight: fittedRows.itemSize,
    visibleRows: fittedRows.visibleCount,
  }
}
