import { ButtonHTMLAttributes, ReactNode } from 'react'

type FoundationDensity = 'compact' | 'regular' | 'comfort'
type FoundationTone = 'default' | 'danger' | 'success' | 'neutral-accent-1' | 'neutral-accent-2' | 'neutral-accent-3' | 'neutral-accent-4' | 'neutral-accent-5' | 'neutral-accent-6' | string

type HeroHeaderProps = {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  tone?: FoundationTone
  variant?: 'module' | 'creator' | 'compact'
  density?: FoundationDensity
  primaryAction?: ReactNode
  closeAction?: ReactNode
  children?: ReactNode
}

export function HeroHeader({
  icon,
  title,
  description,
  tone = 'neutral-accent-1',
  variant = 'module',
  density = 'regular',
  primaryAction,
  closeAction,
  children,
}: HeroHeaderProps) {
  return (
    <header data-ui-hero-header="true" data-ui-hero-variant={variant} data-ui-density={density}>
      <div data-ui-hero-main="true">
        {icon && (
          <span data-ui-hero-icon="true" data-ui-tone={tone} aria-hidden="true">
            {icon}
          </span>
        )}
        <div data-ui-hero-copy="true">
          <strong>{title}</strong>
          {description && <span>{description}</span>}
        </div>
      </div>

      {(primaryAction || closeAction || children) && (
        <div data-ui-hero-actions="true">
          {primaryAction}
          {children}
          {closeAction}
        </div>
      )}
    </header>
  )
}

type SectionHeaderProps = {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  help?: ReactNode
  tone?: FoundationTone
  density?: FoundationDensity
  trailing?: ReactNode
}

export function SectionHeader({
  icon,
  title,
  description,
  help,
  tone = 'neutral-accent-1',
  density = 'regular',
  trailing,
}: SectionHeaderProps) {
  return (
    <header data-ui-section-header-v5="true" data-ui-density={density}>
      <div data-ui-section-header-main="true">
        {icon && (
          <span data-ui-section-header-icon-v5="true" data-ui-tone={tone} aria-hidden="true">
            {icon}
          </span>
        )}
        <div data-ui-section-header-copy-v5="true">
          <span data-ui-title-with-help="true">
            <strong>{title}</strong>
            {help}
          </span>
          {description && <small>{description}</small>}
        </div>
      </div>
      {trailing && <div data-ui-section-header-trailing-v5="true">{trailing}</div>}
    </header>
  )
}

type ActionProps = {
  children: ReactNode
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  onClick?: () => void
  ariaLabel?: string
  title?: string
  width?: 'auto' | 'wide' | 'full'
  density?: FoundationDensity
}

export function PrimaryAction({ children, type = 'button', disabled, onClick, ariaLabel, title, width = 'auto', density = 'regular' }: ActionProps) {
  return (
    <button type={type} data-ui-action="primary" data-ui-action-width={width} data-ui-density={density} disabled={disabled} onClick={onClick} aria-label={ariaLabel} title={title}>
      {children}
    </button>
  )
}

export function SecondaryAction({ children, type = 'button', disabled, onClick, ariaLabel, title, width = 'auto', density = 'regular' }: ActionProps) {
  return (
    <button type={type} data-ui-action="secondary" data-ui-action-width={width} data-ui-density={density} disabled={disabled} onClick={onClick} aria-label={ariaLabel} title={title}>
      {children}
    </button>
  )
}

export function DangerAction({ children, type = 'button', disabled, onClick, ariaLabel, title, width = 'auto', density = 'regular' }: ActionProps) {
  return (
    <button type={type} data-ui-action="danger" data-ui-action-width={width} data-ui-density={density} disabled={disabled} onClick={onClick} aria-label={ariaLabel} title={title}>
      {children}
    </button>
  )
}

type IconActionProps = Omit<ActionProps, 'width'> &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type' | 'disabled' | 'onClick' | 'title'> & {
  tone?: 'default' | 'danger' | 'subtle'
}

export function IconAction({ children, type = 'button', disabled, onClick, ariaLabel, title, tone = 'default', density = 'regular', ...buttonProps }: IconActionProps) {
  return (
    <button {...buttonProps} type={type} data-ui-action="icon" data-ui-action-tone={tone} data-ui-density={density} disabled={disabled} onClick={onClick} aria-label={ariaLabel} title={title}>
      {children}
    </button>
  )
}
