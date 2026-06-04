import type { HTMLAttributes, ReactNode } from 'react'
import { uiListRowApi, uiSurfaceApi } from '../../lib/uiFoundation'

type UtilityPanelTone = 'default' | 'danger' | 'info' | 'success'

type UtilityPrimitiveProps<T extends HTMLElement> = HTMLAttributes<T> & {
  children: ReactNode
}

type UtilityPanelProps = UtilityPrimitiveProps<HTMLElement> & {
  variant?: 'default' | 'compact'
}

const joinClassNames = (...classNames: Array<string | undefined>) =>
  classNames.filter(Boolean).join(' ')

export function UtilityPanel({
  children,
  className,
  variant = 'default',
  ...props
}: UtilityPanelProps) {
  return (
    <section
      className={joinClassNames(uiSurfaceApi.classNames.surface, uiSurfaceApi.classNames.panel, className)}
      data-surface-density={variant === 'compact' ? uiSurfaceApi.density.compact : uiSurfaceApi.density.normal}
      data-surface-level={uiSurfaceApi.level.raised}
      data-utility-panel="true"
      data-utility-variant={variant}
      {...props}
    >
      {children}
    </section>
  )
}

type SettingsSectionProps = UtilityPrimitiveProps<HTMLElement> & {
  tone?: UtilityPanelTone
}

export function SettingsSection({
  children,
  className,
  tone = 'default',
  ...props
}: SettingsSectionProps) {
  return (
    <section
      className={joinClassNames(uiSurfaceApi.classNames.surface, uiSurfaceApi.classNames.card, className)}
      data-surface-density={uiSurfaceApi.density.compact}
      data-surface-level={uiSurfaceApi.level.flat}
      data-utility-settings-section="true"
      data-utility-tone={tone}
      {...props}
    >
      {children}
    </section>
  )
}

export function ActionRow({ children, ...props }: UtilityPrimitiveProps<HTMLDivElement>) {
  return (
    <div data-utility-action-row="true" {...props}>
      {children}
    </div>
  )
}

type ListRowProps = UtilityPrimitiveProps<HTMLDivElement> & {
  tone?: UtilityPanelTone
}

export function ListRow({ children, className, tone = 'default', ...props }: ListRowProps) {
  return (
    <div
      className={joinClassNames(
        uiListRowApi.classNames.row,
        uiListRowApi.classNames.rowLg,
        uiSurfaceApi.classNames.surface,
        uiSurfaceApi.classNames.card,
        className
      )}
      data-row-density={uiListRowApi.density.normal}
      data-row-kind={uiListRowApi.kind.utility}
      data-row-state={uiListRowApi.state.default}
      data-surface-density={uiSurfaceApi.density.compact}
      data-surface-level={uiSurfaceApi.level.flat}
      data-utility-list-row="true"
      data-utility-tone={tone}
      {...props}
    >
      {children}
    </div>
  )
}

export function DangerZone({ children, className, ...props }: UtilityPrimitiveProps<HTMLElement>) {
  return (
    <section
      className={joinClassNames(uiSurfaceApi.classNames.surface, uiSurfaceApi.classNames.card, className)}
      data-surface-density={uiSurfaceApi.density.compact}
      data-surface-level={uiSurfaceApi.level.flat}
      data-utility-danger-zone="true"
      data-utility-tone="danger"
      {...props}
    >
      {children}
    </section>
  )
}

type StatusBoxProps = UtilityPrimitiveProps<HTMLDivElement> & {
  tone?: UtilityPanelTone
}

export function StatusBox({ children, className, tone = 'info', ...props }: StatusBoxProps) {
  return (
    <div
      className={joinClassNames(uiSurfaceApi.classNames.surface, uiSurfaceApi.classNames.card, className)}
      data-surface-density={uiSurfaceApi.density.compact}
      data-surface-level={uiSurfaceApi.level.flat}
      data-utility-status-box="true"
      data-utility-tone={tone}
      {...props}
    >
      {children}
    </div>
  )
}

export function EmptyState({ children, className, ...props }: UtilityPrimitiveProps<HTMLDivElement>) {
  return (
    <div
      className={joinClassNames(uiSurfaceApi.classNames.surface, uiSurfaceApi.classNames.empty, className)}
      data-surface-density={uiSurfaceApi.density.compact}
      data-surface-level={uiSurfaceApi.level.flat}
      data-utility-empty-state="true"
      {...props}
    >
      {children}
    </div>
  )
}

export function MetadataGrid({ children, ...props }: UtilityPrimitiveProps<HTMLDivElement>) {
  return (
    <div data-utility-metadata-grid="true" {...props}>
      {children}
    </div>
  )
}
