import type { CSSProperties } from 'react'
import { DASHBOARD_MODULE_LABELS, getDashboardDefinition } from '../../lib/dashboardWidgetConfig'
import type {
  DashboardModuleId,
  DashboardTileMode,
  DashboardWidgetLayoutItem,
} from '../../lib/dashboardTypes'

const panelStyle: CSSProperties = {
  position: 'absolute',
  top: 48,
  right: 12,
}

const rowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  gap: 8,
  alignItems: 'center',
  padding: '7px 0',
  borderBottom: '1px solid var(--ui-border-divider)',
}

type Props = {
  widget: DashboardWidgetLayoutItem
  onChange: (
    update: {
      mode: DashboardTileMode
      enabledModules: DashboardModuleId[]
      moduleOrder: DashboardModuleId[]
    }
  ) => void
}

export default function DashboardTileConfigPanel({ widget, onChange }: Props) {
  const definition = getDashboardDefinition(widget.containerType)
  const orderedModules = [
    ...widget.moduleOrder,
    ...definition.moduleOrder.filter((moduleId) => !widget.moduleOrder.includes(moduleId)),
  ]
  const enabledSet = new Set(widget.enabledModules)

  const updateModules = (enabledModules: DashboardModuleId[], moduleOrder = orderedModules) => {
    onChange({
      mode: 'custom',
      enabledModules,
      moduleOrder,
    })
  }

  const moveModule = (moduleId: DashboardModuleId, direction: -1 | 1) => {
    const currentIndex = orderedModules.indexOf(moduleId)
    const nextIndex = currentIndex + direction
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= orderedModules.length) return

    const nextOrder = [...orderedModules]
    const [item] = nextOrder.splice(currentIndex, 1)
    nextOrder.splice(nextIndex, 0, item)
    updateModules(widget.enabledModules, nextOrder)
  }

  return (
    <div
      className="ui-popover ui-popover--utility"
      data-dashboard-ignore-drag="true"
      data-dashboard-config-panel="true"
      data-dropdown-placement="bottom"
      data-dropdown-align="end"
      style={panelStyle}
    >
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <button
          type="button"
          onClick={() =>
            onChange({
              mode: 'auto',
              enabledModules: definition.defaultModules,
              moduleOrder: definition.moduleOrder,
            })
          }
          style={{
            flex: 1,
            border: '1px solid var(--ui-border-soft)',
            borderRadius: 999,
            padding: '7px 10px',
            background: widget.mode === 'auto' ? 'var(--ui-text-primary)' : 'var(--ui-surface-card)',
            color: widget.mode === 'auto' ? 'var(--ui-surface-card)' : 'var(--ui-text-secondary)',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Auto
        </button>
        <button
          type="button"
          onClick={() => updateModules(widget.enabledModules)}
          style={{
            flex: 1,
            border: '1px solid var(--ui-border-soft)',
            borderRadius: 999,
            padding: '7px 10px',
            background: widget.mode === 'custom' ? 'var(--ui-text-primary)' : 'var(--ui-surface-card)',
            color: widget.mode === 'custom' ? 'var(--ui-surface-card)' : 'var(--ui-text-secondary)',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Własne
        </button>
      </div>

      <div style={{ maxHeight: 270 }}>
        {orderedModules.map((moduleId) => {
          const checked = enabledSet.has(moduleId)

          return (
            <div key={moduleId} style={rowStyle}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => {
                    const nextEnabled = event.target.checked
                      ? [...widget.enabledModules, moduleId]
                      : widget.enabledModules.filter((item) => item !== moduleId)

                    updateModules(nextEnabled)
                  }}
                />
                {DASHBOARD_MODULE_LABELS[moduleId]}
              </label>
              <span style={{ display: 'inline-flex', gap: 4 }}>
                <button type="button" aria-label="Przesuń wyżej" onClick={() => moveModule(moduleId, -1)}>
                  ↑
                </button>
                <button type="button" aria-label="Przesuń niżej" onClick={() => moveModule(moduleId, 1)}>
                  ↓
                </button>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
