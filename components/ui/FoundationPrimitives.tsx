"use client";

import {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  useState,
} from "react";

type FoundationDensity = "compact" | "regular" | "comfort";
type FoundationTone =
  | "default"
  | "danger"
  | "success"
  | "brand-primary"
  | "neutral-blue"
  | "support-blue"
  | "support-sky"
  | "support-cyan"
  | "support-teal"
  | "support-mint"
  | "support-olive"
  | "support-slate"
  | "information-steel"
  | "information-blue"
  | "information-cyan"
  | "information-teal"
  | "information-mint"
  | "information-indigo"
  | string;

type HeroHeaderProps = {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  tone?: FoundationTone;
  variant?: "module" | "creator" | "compact" | "context";
  density?: FoundationDensity;
  metadata?: ReactNode;
  primaryAction?: ReactNode;
  closeAction?: ReactNode;
  children?: ReactNode;
};

export function HeroHeader({
  icon,
  title,
  description,
  metadata,
  tone = "brand-primary",
  variant = "module",
  density = "regular",
  primaryAction,
  closeAction,
  children,
}: HeroHeaderProps) {
  return (
    <header
      data-ui-hero-header="true"
      data-ui-hero-variant={variant}
      data-ui-density={density}
      data-ui-indent-level="hero"
    >
      <div data-ui-hero-main="true">
        {icon && (
          <span data-ui-hero-icon="true" data-ui-tone={tone} aria-hidden="true">
            {icon}
          </span>
        )}
        <div data-ui-hero-copy="true">
          <strong>{title}</strong>
          {description && <span>{description}</span>}
          {metadata && <div data-ui-hero-metadata="true">{metadata}</div>}
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
  );
}

type SectionHeaderProps = {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  help?: ReactNode;
  tone?: FoundationTone;
  density?: FoundationDensity;
  trailing?: ReactNode;
};

export function SectionHeader({
  icon,
  title,
  description,
  help,
  tone = "neutral-blue",
  density = "regular",
  trailing,
}: SectionHeaderProps) {
  return (
    <header
      data-ui-section-header-v5="true"
      data-ui-density={density}
      data-ui-tone={tone}
      data-ui-indent-level="section"
    >
      <div data-ui-section-header-main="true">
        {icon && (
          <span
            data-ui-section-header-icon-v5="true"
            data-ui-tone={tone}
            aria-hidden="true"
          >
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
      {trailing && (
        <div data-ui-section-header-trailing-v5="true">{trailing}</div>
      )}
    </header>
  );
}

type CollapsibleSecondarySectionProps = {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  help?: ReactNode;
  tone?: FoundationTone;
  density?: FoundationDensity;
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (isCollapsed: boolean) => void;
  children: ReactNode;
};

export function CollapsibleSecondarySection({
  icon,
  title,
  description,
  help,
  tone = "neutral-blue",
  density = "regular",
  defaultCollapsed = true,
  collapsed,
  onCollapsedChange,
  children,
}: CollapsibleSecondarySectionProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const isControlled = collapsed !== undefined;
  const isCollapsed = isControlled ? collapsed : internalCollapsed;

  const toggleCollapsed = () => {
    const nextCollapsed = !isCollapsed;
    if (!isControlled) {
      setInternalCollapsed(nextCollapsed);
    }
    onCollapsedChange?.(nextCollapsed);
  };

  return (
    <section
      data-ui-collapsible-secondary-section="true"
      data-ui-density={density}
      data-ui-tone={tone}
      data-ui-indent-level="section"
      data-ui-collapsed={isCollapsed ? "true" : "false"}
    >
      <button
        type="button"
        data-ui-collapsible-secondary-trigger="true"
        aria-expanded={!isCollapsed}
        onClick={toggleCollapsed}
      >
        <span data-ui-collapsible-secondary-main="true">
          {icon && (
            <span
              data-ui-collapsible-secondary-icon="true"
              data-ui-tone={tone}
              aria-hidden="true"
            >
              {icon}
            </span>
          )}
          <span data-ui-collapsible-secondary-copy="true">
            <span data-ui-title-with-help="true">
              <strong>{title}</strong>
              {help}
            </span>
            {description && <small>{description}</small>}
          </span>
        </span>
        <span data-ui-collapsible-secondary-chevron="true" aria-hidden="true" />
      </button>

      <div
        data-ui-collapsible-secondary-content="true"
        aria-hidden={isCollapsed}
        inert={isCollapsed}
      >
        <div data-ui-collapsible-secondary-content-clip="true">
          <div data-ui-collapsible-secondary-content-inner="true">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

type ActionProps = {
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  title?: string;
  width?: "auto" | "wide" | "full";
  density?: FoundationDensity;
};

export function PrimaryAction({
  children,
  type = "button",
  disabled,
  onClick,
  ariaLabel,
  title,
  width = "auto",
  density = "regular",
}: ActionProps) {
  return (
    <button
      type={type}
      data-ui-action="primary"
      data-ui-action-width={width}
      data-ui-density={density}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
    >
      {children}
    </button>
  );
}

export function SecondaryAction({
  children,
  type = "button",
  disabled,
  onClick,
  ariaLabel,
  title,
  width = "auto",
  density = "regular",
}: ActionProps) {
  return (
    <button
      type={type}
      data-ui-action="secondary"
      data-ui-action-width={width}
      data-ui-density={density}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
    >
      {children}
    </button>
  );
}

export function DangerAction({
  children,
  type = "button",
  disabled,
  onClick,
  ariaLabel,
  title,
  width = "auto",
  density = "regular",
}: ActionProps) {
  return (
    <button
      type={type}
      data-ui-action="danger"
      data-ui-action-width={width}
      data-ui-density={density}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
    >
      {children}
    </button>
  );
}

type IconActionProps = Omit<ActionProps, "width"> &
  Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "children" | "type" | "disabled" | "onClick" | "title"
  > & {
    tone?: "default" | "danger" | "subtle";
  };

export function IconAction({
  children,
  type = "button",
  disabled,
  onClick,
  ariaLabel,
  title,
  tone = "default",
  density = "regular",
  ...buttonProps
}: IconActionProps) {
  return (
    <button
      {...buttonProps}
      type={type}
      data-ui-action="icon"
      data-ui-action-tone={tone}
      data-ui-density={density}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
    >
      {children}
    </button>
  );
}

type CreatorModalProps = HTMLAttributes<HTMLElement> & {
  size?: "compact" | "standard" | "wide";
  density?: FoundationDensity;
  children: ReactNode;
};

export function CreatorModal({
  size = "standard",
  density = "comfort",
  children,
  ...sectionProps
}: CreatorModalProps) {
  return (
    <section
      {...sectionProps}
      data-ui-modal-surface="true"
      data-ui-modal-size="creator"
      data-ui-density={density}
      data-ui-creator-modal="true"
      data-ui-creator-variant={size}
    >
      {children}
    </section>
  );
}

type CreatorSectionProps = {
  step: number;
  title: ReactNode;
  description?: ReactNode;
  help?: ReactNode;
  tone?: FoundationTone;
  variant?: "separated" | "grouped" | "hero";
  children: ReactNode;
};

const STEP_TONES: FoundationTone[] = [
  "blue",
  "lavender",
  "mint",
  "coral",
  "olive",
  "slate",
];

const getSupportingToneForStep = (step: number): FoundationTone => {
  const normalizedStep = Number.isFinite(step)
    ? Math.max(1, Math.floor(step))
    : 1;

  return STEP_TONES[(normalizedStep - 1) % STEP_TONES.length];
};

export function CreatorSection({
  step,
  title,
  description,
  help,
  tone,
  variant = "separated",
  children,
}: CreatorSectionProps) {
  const resolvedTone = tone || getSupportingToneForStep(step);

  return (
    <section
      data-ui-creator-step="true"
      data-ui-creator-section-variant={variant}
      data-ui-tone={resolvedTone}
    >
      <span data-ui-creator-step-icon="true" aria-hidden="true">
        {step}
      </span>
      <div data-ui-creator-step-content="true">
        <header data-ui-creator-step-header="true">
          <span data-ui-title-with-help="true">
            <strong>{title}</strong>
            {help}
          </span>
          {description && <span>{description}</span>}
        </header>
        {children}
      </div>
    </section>
  );
}

type FormFieldProps = {
  label: ReactNode;
  children: ReactNode;
  description?: ReactNode;
  help?: ReactNode;
  size?: "regular" | "comfortable";
  emphasis?: "standard" | "hero";
  tone?: FoundationTone;
};

export function FormField({
  label,
  children,
  description,
  help,
  size = "comfortable",
  emphasis = "standard",
  tone,
}: FormFieldProps) {
  return (
    <label
      data-ui-field="true"
      data-ui-form-field="true"
      data-ui-field-size={size}
      data-ui-field-emphasis={emphasis}
      data-ui-tone={tone}
    >
      <span data-ui-title-with-help="true">
        <span>{label}</span>
        {help}
      </span>
      {children}
      {description && (
        <small data-ui-field-description="true">{description}</small>
      )}
    </label>
  );
}

type MoneyFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  leading?: ReactNode;
  currency?: string;
};

export function MoneyField({
  leading,
  currency = "zł",
  ...inputProps
}: MoneyFieldProps) {
  return (
    <span data-ui-amount-shell="true" data-ui-input-affix="true">
      {leading && (
        <span data-ui-input-leading="true" aria-hidden="true">
          {leading}
        </span>
      )}
      <input
        className="ui-amount-field"
        data-input-variant="creator"
        inputMode="decimal"
        {...inputProps}
      />
      <span data-ui-amount-currency="true" aria-hidden="true">
        {currency}
      </span>
    </span>
  );
}

type MonthFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  leading?: ReactNode;
  displayValue: ReactNode;
  isEmpty?: boolean;
};

export function MonthField({
  leading,
  displayValue,
  isEmpty = false,
  ...inputProps
}: MonthFieldProps) {
  return (
    <span
      data-ui-input-affix="true"
      data-ui-month-shell="true"
      data-empty={isEmpty ? "true" : "false"}
    >
      {leading && (
        <span data-ui-input-leading="true" aria-hidden="true">
          {leading}
        </span>
      )}
      <span data-ui-month-value="true" aria-hidden="true">
        {displayValue}
      </span>
      <input
        className="ui-input"
        data-input-variant="creator"
        type="month"
        {...inputProps}
      />
    </span>
  );
}

type CreatorSummaryCardProps = {
  kind?: string;
  layout?: string;
  recordType?: string;
  tone?: FoundationTone;
  children: ReactNode;
};

export function CreatorSummaryCard({
  kind = "default",
  layout,
  recordType,
  tone = "neutral-blue",
  children,
}: CreatorSummaryCardProps) {
  return (
    <div
      data-ui-creator-preview-card="true"
      data-ui-creator-preview-kind={kind}
      data-ui-creator-preview-layout={layout}
      data-ui-record-type={recordType}
      data-ui-tone={tone}
    >
      {children}
    </div>
  );
}
