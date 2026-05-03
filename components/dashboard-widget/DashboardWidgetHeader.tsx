import { useState, type ButtonHTMLAttributes } from 'react'
import type { DashboardWidgetDefinition, DashboardWidgetLayoutItem } from '../../lib/dashboardTypes'
import {
  dragHandleStyle,
  iconButtonStyle,
  metaStyle,
  tileHeaderStyle,
  tileTitleStyle,
} from './dashboardWidgetTileStyles'

type DashboardWidgetHeaderProps = {
  widget: DashboardWidgetLayoutItem
  safeDefinition: DashboardWidgetDefinition
  dragHandleProps: ButtonHTMLAttributes<HTMLButtonElement>
  onConfigOpen: () => void
  onToggleSize: () => void
  onRemove: () => void
}

export default function DashboardWidgetHeader({
  widget,
  safeDefinition,
  dragHandleProps,
  onConfigOpen,
  onToggleSize,
  onRemove,
}: DashboardWidgetHeaderProps) {
  const [isRemoveHovered, setIsRemoveHovered] = useState(false)
  const isLarge = widget.width >= 4
  const sizeButtonLabel = isLarge ? 'Mały' : 'Duży'

  return (
    <div style={{ ...tileHeaderStyle, minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={tileTitleStyle}>{safeDefinition.title}</div>
        {widget.width > 1 && <div style={metaStyle}>{safeDefinition.description}</div>}
      </div>

      <div style={{ display: 'inline-flex', gap: 6, flexShrink: 0 }}>
        <button
          type="button"
          data-dashboard-ignore-drag="true"
          data-dashboard-config-control="true"
          style={{
            ...iconButtonStyle,
            width: 'auto',
            minWidth: 54,
            padding: '0 9px',
            fontSize: 11,
            fontWeight: 800,
          }}
          aria-label={`Przełącz kafel ${safeDefinition.title} na tryb ${sizeButtonLabel}`}
          onClick={onToggleSize}
          title={`Przełącz na tryb ${sizeButtonLabel}`}
        >
          {sizeButtonLabel}
        </button>

        <button
          type="button"
          data-dashboard-ignore-drag="true"
          data-dashboard-config-control="true"
          style={iconButtonStyle}
          aria-label={`Konfiguruj kafel ${safeDefinition.title}`}
          onClick={onConfigOpen}
          title="Konfiguruj"
        >
          ✎
        </button>

        <button
          type="button"
          data-dashboard-ignore-drag="true"
          style={{
            ...iconButtonStyle,
            color: isRemoveHovered ? '#dc2626' : '#64748b',
            borderColor: isRemoveHovered ? 'rgba(220,38,38,0.34)' : iconButtonStyle.borderColor,
            background: isRemoveHovered ? 'rgba(254,242,242,0.88)' : iconButtonStyle.background,
          }}
          aria-label={`Usuń kafel ${safeDefinition.title}`}
          onClick={onRemove}
          onMouseEnter={() => setIsRemoveHovered(true)}
          onMouseLeave={() => setIsRemoveHovered(false)}
          title="Usuń"
        >
          ×
        </button>

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
      </div>
    </div>
  )
}