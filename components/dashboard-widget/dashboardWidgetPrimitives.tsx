import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

type PrimitiveProps<T extends HTMLElement = HTMLDivElement> = HTMLAttributes<T> & {
  children?: ReactNode
  style?: CSSProperties
}

export function DashboardWidgetShell({ children, style, ...props }: PrimitiveProps) {
  return (
    <div data-dashboard-widget-shell="true" style={style} {...props}>
      {children}
    </div>
  )
}

export function WidgetHeader({ children, style, ...props }: PrimitiveProps) {
  return (
    <div data-dashboard-widget-header="true" style={style} {...props}>
      {children}
    </div>
  )
}

export function WidgetBody({ children, style, ...props }: PrimitiveProps) {
  return (
    <div data-dashboard-widget-body="true" style={style} {...props}>
      {children}
    </div>
  )
}

export function WidgetControls({ children, style, ...props }: PrimitiveProps) {
  return (
    <div data-dashboard-widget-controls="true" style={style} {...props}>
      {children}
    </div>
  )
}

export function MetricCard({ children, style, ...props }: PrimitiveProps) {
  return (
    <div data-dashboard-widget-metric-card="true" style={style} {...props}>
      {children}
    </div>
  )
}

export function ChartSurface({ children, style, ...props }: PrimitiveProps) {
  return (
    <div data-dashboard-widget-chart-surface="true" style={style} {...props}>
      {children}
    </div>
  )
}

export function ProgressBar({
  value,
  color,
  style,
}: {
  value: number
  color: string
  style?: CSSProperties
}) {
  return (
    <div data-dashboard-widget-progress="true" style={style}>
      <div
        data-dashboard-widget-progress-fill="true"
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          background: color,
        }}
      />
    </div>
  )
}

export function RankingRow({ children, style, ...props }: PrimitiveProps) {
  return (
    <div data-dashboard-widget-ranking-row="true" style={style} {...props}>
      {children}
    </div>
  )
}

export function EmptyState({ children, style, ...props }: PrimitiveProps) {
  return (
    <div data-dashboard-widget-empty-state="true" style={style} {...props}>
      {children}
    </div>
  )
}
