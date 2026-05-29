import type { HTMLAttributes, ReactNode } from 'react'

type UtilityPanelTone = 'default' | 'danger' | 'info' | 'success'

type UtilityPrimitiveProps<T extends HTMLElement> = HTMLAttributes<T> & {
  children: ReactNode
}

type UtilityPanelProps = UtilityPrimitiveProps<HTMLElement> & {
  variant?: 'default' | 'compact'
}

export function UtilityPanel({
  children,
  variant = 'default',
  ...props
}: UtilityPanelProps) {
  return (
    <section data-utility-panel="true" data-utility-variant={variant} {...props}>
      {children}
    </section>
  )
}

type SettingsSectionProps = UtilityPrimitiveProps<HTMLElement> & {
  tone?: UtilityPanelTone
}

export function SettingsSection({
  children,
  tone = 'default',
  ...props
}: SettingsSectionProps) {
  return (
    <section data-utility-settings-section="true" data-utility-tone={tone} {...props}>
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

export function ListRow({ children, tone = 'default', ...props }: ListRowProps) {
  return (
    <div data-utility-list-row="true" data-utility-tone={tone} {...props}>
      {children}
    </div>
  )
}

export function DangerZone({ children, ...props }: UtilityPrimitiveProps<HTMLElement>) {
  return (
    <section data-utility-danger-zone="true" data-utility-tone="danger" {...props}>
      {children}
    </section>
  )
}

type StatusBoxProps = UtilityPrimitiveProps<HTMLDivElement> & {
  tone?: UtilityPanelTone
}

export function StatusBox({ children, tone = 'info', ...props }: StatusBoxProps) {
  return (
    <div data-utility-status-box="true" data-utility-tone={tone} {...props}>
      {children}
    </div>
  )
}

export function EmptyState({ children, ...props }: UtilityPrimitiveProps<HTMLDivElement>) {
  return (
    <div data-utility-empty-state="true" {...props}>
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
