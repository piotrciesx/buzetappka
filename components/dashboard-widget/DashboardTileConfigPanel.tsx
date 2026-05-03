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
  zIndex: 12,
  width: 280,
  maxWidth: 'calc(100% - 24px)',
  border: '1px solid rgba(148, 163, 184, 0.28)',
  borderRadius: 16,
  background: 'rgba(255, 255, 255, 0.94)',
  boxShadow: '0 18px 44px rgba(15, 23, 42, 0.18)',
  padding: 12,
  backdropFilter: 'blur(16px)',
}

const rowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  gap: 8,
  alignItems: 'center',
  padding: '7px 0',
  borderBottom: '1px solid rgba(226, 232, 240, 0.78)',
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
    <div data-dashboard-ignore-drag="true" data-dashboard-config-panel="true" style={panelStyle}>
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
            border: '1px solid rgba(148, 163, 184, 0.32)',
            borderRadius: 999,
            padding: '7px 10px',
            background: widget.mode === 'auto' ? '#0f172a' : '#ffffff',
            color: widget.mode === 'auto' ? '#ffffff' : '#334155',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          Auto
        </button>
        <button
          type="button"
          onClick={() => updateModules(widget.enabledModules)}
          style={{
            flex: 1,
            border: '1px solid rgba(148, 163, 184, 0.32)',
            borderRadius: 999,
            padding: '7px 10px',
            background: widget.mode === 'custom' ? '#0f172a' : '#ffffff',
            color: widget.mode === 'custom' ? '#ffffff' : '#334155',
            fontSize: 12,
            fontWeight: 700,
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
