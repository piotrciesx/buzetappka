import { uiTypographyTokens } from '../../lib/uiFoundation'
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
      <div style={{ marginTop: 3, fontSize: uiTypographyTokens.hierarchy.t3, fontWeight: uiTypographyTokens.weight.semibold, color, lineHeight: uiTypographyTokens.lineHeight.compact }}>
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
        <strong style={{ color, fontWeight: uiTypographyTokens.weight.semibold }}>{formatPercent(value)}</strong>
      </div>
      <ProgressBarPrimitive value={clampPercent(value)} color={color} style={progressTrackStyle} />
    </div>
  )
}
