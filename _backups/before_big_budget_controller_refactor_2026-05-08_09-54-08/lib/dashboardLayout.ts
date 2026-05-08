import { DASHBOARD_GRID_COLUMNS } from './dashboardWidgetConfig'
import { DashboardWidgetLayoutItem, DashboardWidgetSize } from './dashboardTypes'

type DashboardAnchorLayout = DashboardWidgetSize & {
  id: string
  x: number
  y: number
}

const SMALL_WIDGET_SIZE: DashboardWidgetSize = {
  width: 2,
  height: 3,
}

const LARGE_WIDGET_SIZE: DashboardWidgetSize = {
  width: 4,
  height: 3,
}

const getDashboardWidgetModeSize = (size: DashboardWidgetSize): DashboardWidgetSize => {
  if (size.width >= 4) {
    return LARGE_WIDGET_SIZE
  }

  return SMALL_WIDGET_SIZE
}

const normalizeDashboardWidgetPosition = (
  x: number,
  y: number,
  width: number,
  columns: number
) => {
  return {
    x: Math.max(0, Math.min(columns - width, Math.round(x) || 0)),
    y: Math.max(0, Math.round(y) || 0),
  }
}

export const normalizeDashboardWidgetSize = (
  size: DashboardWidgetSize,
  columns = DASHBOARD_GRID_COLUMNS
): DashboardWidgetSize => {
  const modeSize = getDashboardWidgetModeSize(size)
  const width =
    modeSize.width >= LARGE_WIDGET_SIZE.width && columns >= LARGE_WIDGET_SIZE.width
      ? LARGE_WIDGET_SIZE.width
      : SMALL_WIDGET_SIZE.width

  return {
    width,
    height: modeSize.height,
  }
}

export const sortDashboardWidgetsByPosition = (widgets: DashboardWidgetLayoutItem[]) => {
  return [...widgets].sort((left, right) => {
    if (left.y !== right.y) {
      return left.y - right.y
    }

    if (left.x !== right.x) {
      return left.x - right.x
    }

    return left.id.localeCompare(right.id)
  })
}

const canPlaceWidget = (
  occupiedCells: Set<string>,
  x: number,
  y: number,
  size: DashboardWidgetSize,
  columns: number
) => {
  if (x + size.width > columns) {
    return false
  }

  for (let row = y; row < y + size.height; row += 1) {
    for (let column = x; column < x + size.width; column += 1) {
      if (occupiedCells.has(`${column}:${row}`)) {
        return false
      }
    }
  }

  return true
}

const occupyWidgetCells = (
  occupiedCells: Set<string>,
  x: number,
  y: number,
  size: DashboardWidgetSize
) => {
  for (let row = y; row < y + size.height; row += 1) {
    for (let column = x; column < x + size.width; column += 1) {
      occupiedCells.add(`${column}:${row}`)
    }
  }
}

const placeWidgetInNextFreeSpace = (
  occupiedCells: Set<string>,
  widget: DashboardWidgetLayoutItem,
  columns: number
) => {
  const size = normalizeDashboardWidgetSize(widget, columns)

  let y = 0

  while (true) {
    for (let x = 0; x < columns; x += size.width) {
      if (canPlaceWidget(occupiedCells, x, y, size, columns)) {
        occupyWidgetCells(occupiedCells, x, y, size)

        return {
          ...widget,
          ...size,
          x,
          y,
        }
      }
    }

    y += size.height
  }
}

const buildPackedDashboardLayout = (
  widgets: DashboardWidgetLayoutItem[],
  anchorLayout: DashboardAnchorLayout | null,
  columns: number
) => {
  const occupiedCells = new Set<string>()
  const packedWidgets = new Map<string, DashboardWidgetLayoutItem>()
  const orderedWidgets = sortDashboardWidgetsByPosition(widgets)

  if (anchorLayout) {
    const anchorWidget = orderedWidgets.find((widget) => widget.id === anchorLayout.id)

    if (anchorWidget) {
      const size = normalizeDashboardWidgetSize(anchorLayout, columns)
      const position = normalizeDashboardWidgetPosition(
        anchorLayout.x,
        anchorLayout.y,
        size.width,
        columns
      )

      occupyWidgetCells(occupiedCells, position.x, position.y, size)

      packedWidgets.set(anchorWidget.id, {
        ...anchorWidget,
        ...size,
        ...position,
      })
    }
  }

  for (const widget of orderedWidgets) {
    if (packedWidgets.has(widget.id)) {
      continue
    }

    packedWidgets.set(widget.id, placeWidgetInNextFreeSpace(occupiedCells, widget, columns))
  }

  return sortDashboardWidgetsByPosition([...packedWidgets.values()])
}

export const packDashboardWidgets = (
  widgets: DashboardWidgetLayoutItem[],
  columns = DASHBOARD_GRID_COLUMNS
) => {
  return buildPackedDashboardLayout(widgets, null, columns)
}

export const projectDashboardWidgets = (
  widgets: DashboardWidgetLayoutItem[],
  anchorLayout: DashboardAnchorLayout,
  columns = DASHBOARD_GRID_COLUMNS
) => {
  return buildPackedDashboardLayout(widgets, anchorLayout, columns)
}

export const getDashboardLayoutHeight = (widgets: DashboardWidgetLayoutItem[]) => {
  return widgets.reduce((maxHeight, widget) => Math.max(maxHeight, widget.y + widget.height), 0)
}
