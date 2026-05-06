export function getNearestDndSwapTargetId(
  itemIds: string[],
  activeId: string,
  overId: string,
  shouldLimitToNeighbor: boolean
) {
  if (!shouldLimitToNeighbor) {
    return overId
  }

  const activeIndex = itemIds.indexOf(activeId)
  const overIndex = itemIds.indexOf(overId)

  if (activeIndex < 0 || overIndex < 0 || activeIndex === overIndex) {
    return overId
  }

  const direction = overIndex > activeIndex ? 1 : -1
  return itemIds[activeIndex + direction] || overId
}
