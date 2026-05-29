import { NEUTRAL, labelStyle, listRowStyle, metricBoxStyle, progressTrackStyle } from './dashboardWidgetTileStyles'
import { clampPercent, formatPercent } from './dashboardWidgetTileUtils'
import { MetricCard, ProgressBar as ProgressBarPrimitive } from './dashboardWidgetPrimitives'

export function MetricBox({
  label,
  value,
  color = NEUTRAL,
}: {
  label: string
  value: string | number
  color?: string
}) {
  return (
    <MetricCard style={metricBoxStyle}>
      <div style={labelStyle}>{label}</div>
      <div style={{ marginTop: 3, fontSize: 14, fontWeight: 600, color, lineHeight: 1.2 }}>
        {value}
      </div>
    </MetricCard>
  )
}

export function ProgressBar({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div>
      <div style={listRowStyle}>
        <span style={labelStyle}>{label}</span>
        <strong style={{ color, fontWeight: 600 }}>{formatPercent(value)}</strong>
      </div>
      <ProgressBarPrimitive value={clampPercent(value)} color={color} style={progressTrackStyle} />
    </div>
  )
}
