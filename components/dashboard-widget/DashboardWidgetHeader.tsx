import type { ButtonHTMLAttributes } from 'react'
import { DASHBOARD_WIDGET_DEFINITIONS } from '../../lib/dashboardWidgetConfig'
import type {
  DashboardWidgetDefinition,
  DashboardWidgetLayoutItem,
  DashboardWidgetType,
} from '../../lib/dashboardTypes'
import {
  dragHandleStyle,
  metaStyle,
  selectStyle,
  tileHeaderStyle,
} from './dashboardWidgetTileStyles'

type DashboardWidgetHeaderProps = {
  widget: DashboardWidgetLayoutItem
  safeDefinition: DashboardWidgetDefinition
  hasKnownDefinition: boolean
  dragHandleProps: ButtonHTMLAttributes<HTMLButtonElement>
  onWidgetTypeChange: (id: string, type: DashboardWidgetType) => void
}

export default function DashboardWidgetHeader({
  widget,
  safeDefinition,
  hasKnownDefinition,
  dragHandleProps,
  onWidgetTypeChange,
}: DashboardWidgetHeaderProps) {
  return (
    <div style={tileHeaderStyle}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <select
          data-dashboard-ignore-resize="true"
          value={hasKnownDefinition ? widget.type : safeDefinition.type}
          onChange={(event) =>
            onWidgetTypeChange(widget.id, event.target.value as DashboardWidgetType)
          }
          style={selectStyle}
          aria-label="Wybierz statystykę na kaflu"
        >
          {DASHBOARD_WIDGET_DEFINITIONS.map((item) => (
            <option key={item.type} value={item.type}>
              {item.title}
            </option>
          ))}
        </select>

        {widget.width > 1 && (
          <div style={metaStyle}>
            {safeDefinition.description} · {widget.width}x{widget.height}
          </div>
        )}
      </div>

      <button
        type="button"
        data-dashboard-ignore-resize="true"
        style={dragHandleStyle}
        aria-label={`Przeciągnij widget ${safeDefinition.title}`}
        {...dragHandleProps}
      >
        ⋮⋮
      </button>
    </div>
  )
}
