import { useState, type ButtonHTMLAttributes } from 'react'
import type { DashboardWidgetDefinition, DashboardWidgetLayoutItem } from '../../lib/dashboardTypes'
import { uiZIndex } from '../../lib/uiFoundation'
import {
  dragHandleStyle,
  iconButtonStyle,
  metaStyle,
  tileHeaderStyle,
  tileTitleStyle,
} from './dashboardWidgetTileStyles'
import { WidgetControls, WidgetHeader } from './dashboardWidgetPrimitives'

type DashboardWidgetHeaderProps = {
  widget: DashboardWidgetLayoutItem
  safeDefinition: DashboardWidgetDefinition
  dragHandleProps?: ButtonHTMLAttributes<HTMLButtonElement>
  isMobileDashboard: boolean
  onToggleSize: () => void
  onRemove: () => void
}

export default function DashboardWidgetHeader({
  widget,
  safeDefinition,
  dragHandleProps,
  isMobileDashboard,
  onToggleSize,
  onRemove,
}: DashboardWidgetHeaderProps) {
  const [isRemoveHovered, setIsRemoveHovered] = useState(false)
  const isLarge = widget.width >= 4
  const sizeButtonLabel = isLarge ? 'Mały' : 'Duży'

  return (
    <WidgetHeader
      style={{
        ...tileHeaderStyle,
        position: 'relative',
        zIndex: uiZIndex.widgetHeader,
        minWidth: 0,
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <div style={tileTitleStyle}>{safeDefinition.title}</div>
        {widget.width > 1 && <div style={metaStyle}>{safeDefinition.description}</div>}
      </div>

      <WidgetControls
        style={{ display: 'inline-flex', gap: isMobileDashboard ? 4 : 6, flexShrink: 0 }}
        onPointerDown={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {!isMobileDashboard && (
          <button
            type="button"
            data-dashboard-ignore-drag="true"
            data-dashboard-config-control="true"
            style={{
              ...iconButtonStyle,
              width: 'auto',
              minWidth: 34,
              padding: '0 8px',
              fontSize: 14,
              fontWeight: 600,
            }}
            aria-label={`Przełącz kafel ${safeDefinition.title} na tryb ${sizeButtonLabel}`}
            onClick={onToggleSize}
            title={`Przełącz na tryb ${sizeButtonLabel}`}
          >
            ↔
          </button>
        )}

        <button
          type="button"
          data-dashboard-ignore-drag="true"
          style={{
            ...iconButtonStyle,
            width: isMobileDashboard ? 28 : iconButtonStyle.width,
            height: isMobileDashboard ? 28 : iconButtonStyle.height,
            minWidth: isMobileDashboard ? 28 : iconButtonStyle.minWidth,
            borderRadius: isMobileDashboard ? 10 : iconButtonStyle.borderRadius,
            color: isRemoveHovered ? 'var(--ui-financial-expense)' : 'var(--ui-text-secondary)',
            borderColor: isRemoveHovered ? 'var(--ui-financial-expense-soft)' : iconButtonStyle.borderColor,
            background: isRemoveHovered ? 'var(--ui-financial-expense-soft)' : iconButtonStyle.background,
          }}
          aria-label={`Usuń kafel ${safeDefinition.title}`}
          onClick={onRemove}
          onMouseEnter={() => setIsRemoveHovered(true)}
          onMouseLeave={() => setIsRemoveHovered(false)}
          title="Usuń"
        >
          ×
        </button>

        {!isMobileDashboard && dragHandleProps && (
          <button
            type="button"
            data-dashboard-ignore-drag="true"
            style={dragHandleStyle}
            aria-label={`Przeciągnij kafel ${safeDefinition.title}`}
            title="Przeciągnij"
            {...dragHandleProps}
          >
            ⋮⋮
          </button>
        )}
      </WidgetControls>
    </WidgetHeader>
  )
}
