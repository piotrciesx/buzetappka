import type { CSSProperties } from 'react'
import { controlsStyle, resizeHintStyle } from './dashboardWidgetTileStyles'

type DashboardWidgetControlsProps = {
  widgetId: string
  widgetWidth: number
  styles: Record<string, CSSProperties>
  onRemove: (id: string) => void
}

export default function DashboardWidgetControls({
  widgetId,
  widgetWidth,
  styles,
  onRemove,
}: DashboardWidgetControlsProps) {
  return (
    <div style={controlsStyle}>
      <div style={resizeHintStyle}>{widgetWidth > 1 ? 'Zmień rozmiar krawędzią.' : ''}</div>

      <button
        type="button"
        data-dashboard-ignore-resize="true"
        style={styles.dangerButton}
        onClick={() => onRemove(widgetId)}
      >
        Usuń
      </button>
    </div>
  )
}
