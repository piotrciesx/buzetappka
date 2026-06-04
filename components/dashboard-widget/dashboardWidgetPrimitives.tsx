import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { uiListRowApi } from '../../lib/uiFoundation'

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

const joinClassNames = (...classNames: Array<string | undefined>) =>
  classNames.filter(Boolean).join(' ')

export function RankingRow({ children, className, style, ...props }: PrimitiveProps) {
  return (
    <div
      className={joinClassNames(uiListRowApi.classNames.row, uiListRowApi.classNames.rowXs, className)}
      data-dashboard-widget-ranking-row="true"
      data-row-density={uiListRowApi.density.compact}
      data-row-kind={uiListRowApi.kind.ranking}
      style={style}
      {...props}
    >
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
