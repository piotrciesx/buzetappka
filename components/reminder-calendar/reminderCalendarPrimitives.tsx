import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'

type Tone = 'default' | 'info' | 'success' | 'warning' | 'danger' | 'muted'

type PrimitiveProps<T extends HTMLElement> = HTMLAttributes<T> & {
  children?: ReactNode
}

type ReminderCardProps = PrimitiveProps<HTMLDivElement> & {
  tone?: Tone
}

export function ReminderCard({ children, tone = 'default', ...props }: ReminderCardProps) {
  return (
    <div data-reminder-card="true" data-reminder-tone={tone} {...props}>
      {children}
    </div>
  )
}

type ReminderStatusBadgeProps = PrimitiveProps<HTMLSpanElement> & {
  tone?: Tone
}

export function ReminderStatusBadge({
  children,
  tone = 'info',
  ...props
}: ReminderStatusBadgeProps) {
  return (
    <span data-reminder-status-badge="true" data-reminder-tone={tone} {...props}>
      {children}
    </span>
  )
}

export function ReminderActionRow({ children, ...props }: PrimitiveProps<HTMLDivElement>) {
  return (
    <div data-reminder-action-row="true" {...props}>
      {children}
    </div>
  )
}

export function CalendarSurface({ children, ...props }: PrimitiveProps<HTMLElement>) {
  return (
    <section data-calendar-surface="true" {...props}>
      {children}
    </section>
  )
}

type CalendarCellProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  state?: 'default' | 'selected' | 'future' | 'excluded' | 'disabled'
}

export function CalendarCell({
  children,
  state = 'default',
  ...props
}: CalendarCellProps) {
  return (
    <button data-calendar-cell="true" data-calendar-cell-state={state} {...props}>
      {children}
    </button>
  )
}

export function CalendarLegend({ children, ...props }: PrimitiveProps<HTMLDivElement>) {
  return (
    <div data-calendar-legend="true" {...props}>
      {children}
    </div>
  )
}

export function CalendarEntryRow({ children, ...props }: PrimitiveProps<HTMLDivElement>) {
  return (
    <div data-calendar-entry-row="true" {...props}>
      {children}
    </div>
  )
}

export function HeatmapScale({ children, ...props }: PrimitiveProps<HTMLDivElement>) {
  return (
    <div data-heatmap-scale="true" {...props}>
      {children}
    </div>
  )
}
