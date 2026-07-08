"use client";

import {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
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



type AuxiliarySummaryStripProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  density?: FoundationDensity;
  columns?: 3 | 4 | "auto";
};

export function AuxiliarySummaryStrip({
  children,
  density = "regular",
  columns = "auto",
  ...props
}: AuxiliarySummaryStripProps) {
  return (
    <div
      {...props}
      data-ui-auxiliary-summary="true"
      data-ui-density={density}
      data-ui-auxiliary-summary-columns={columns}
    >
      <div data-ui-auxiliary-summary-grid="true">{children}</div>
    </div>
  );
}

type AuxiliarySummaryItemProps = HTMLAttributes<HTMLElement> & {
  icon?: ReactNode;
  label: ReactNode;
  value: ReactNode;
  description?: ReactNode;
  tone?: FoundationTone;
};

export function AuxiliarySummaryItem({
  icon,
  label,
  value,
  description,
  tone = "neutral-blue",
  ...props
}: AuxiliarySummaryItemProps) {
  return (
    <article {...props} data-ui-auxiliary-summary-item="true" data-ui-tone={tone}>
      {icon && (
        <span data-ui-auxiliary-summary-icon="true" data-ui-tone={tone} aria-hidden="true">
          {icon}
        </span>
      )}
      <span data-ui-auxiliary-summary-copy="true">
        <span data-ui-auxiliary-summary-label="true">{label}</span>
        <strong data-ui-auxiliary-summary-value="true">{value}</strong>
        {description && <small data-ui-auxiliary-summary-description="true">{description}</small>}
      </span>
    </article>
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
  const [contentHeight, setContentHeight] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const contentInnerRef = useRef<HTMLDivElement | null>(null);
  const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isControlled = collapsed !== undefined;
  const isCollapsed = isControlled ? collapsed : internalCollapsed;

  const measureContent = useCallback(() => {
    const nextHeight = contentInnerRef.current?.scrollHeight ?? 0;
    setContentHeight(nextHeight);
  }, []);

  const startContentAnimation = useCallback(() => {
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
    }

    setIsAnimating(true);
    animationTimerRef.current = setTimeout(() => {
      setIsAnimating(false);
      animationTimerRef.current = null;
    }, 260);
  }, []);

  const toggleCollapsed = () => {
    measureContent();
    startContentAnimation();

    const nextCollapsed = !isCollapsed;
    if (!isControlled) {
      setInternalCollapsed(nextCollapsed);
    }
    onCollapsedChange?.(nextCollapsed);
  };

  useEffect(() => {
    measureContent();

    const node = contentInnerRef.current;
    if (!node || typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(() => {
      measureContent();
    });
    resizeObserver.observe(node);

    return () => {
      resizeObserver.disconnect();
    };
  }, [children, measureContent]);

  useEffect(() => {
    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, []);

  const animatedHeight = isCollapsed ? 0 : Math.max(contentHeight, 1);

  return (
    <section
      data-ui-collapsible-secondary-section="true"
      data-ui-density={density}
      data-ui-tone={tone}
      data-ui-indent-level="section"
      data-ui-collapsed={isCollapsed ? "true" : "false"}
      data-ui-collapsible-animating={isAnimating ? "true" : "false"}
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
        style={{ maxHeight: animatedHeight }}
      >
        <div data-ui-collapsible-secondary-content-clip="true" ref={contentInnerRef}>
          <div data-ui-collapsible-secondary-content-inner="true">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

type ActionIntent = "neutral" | "warning" | "danger" | "restore" | "success";

type ActionProps = {
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  title?: string;
  width?: "auto" | "wide" | "full";
  density?: FoundationDensity;
  intent?: ActionIntent;
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
  intent = "neutral",
}: ActionProps) {
  return (
    <button
      type={type}
      data-ui-action="secondary"
      data-ui-action-intent={intent}
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
  intent = "danger",
}: ActionProps) {
  return (
    <button
      type={type}
      data-ui-action="danger"
      data-ui-action-intent={intent}
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



type ManagementSelectOption<Value extends string = string> = {
  value: Value;
  label: ReactNode;
  disabled?: boolean;
};

type ManagementSelectProps<Value extends string = string> = {
  id?: string;
  value: Value;
  options: ManagementSelectOption<Value>[];
  onChange: (value: Value) => void;
  disabled?: boolean;
  ariaLabel?: string;
  width?: "auto" | "full";
  placeholder?: ReactNode;
};

export function ManagementSelect<Value extends string = string>({
  id,
  value,
  options,
  onChange,
  disabled = false,
  ariaLabel,
  width = "auto",
  placeholder = "Wybierz",
}: ManagementSelectProps<Value>) {
  const [isOpen, setIsOpen] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const scrollAnimationRef = useRef<number | null>(null);
  const selectedOption = options.find((option) => option.value === value);

  const stopScrollAnimation = useCallback(() => {
    if (scrollAnimationRef.current !== null) {
      window.cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }
  }, []);

  const updateScrollState = useCallback(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      setCanScrollUp(false);
      setCanScrollDown(false);
      return;
    }

    const tolerance = 1;
    const nextCanScrollUp = viewport.scrollTop > tolerance;
    const nextCanScrollDown =
      viewport.scrollTop + viewport.clientHeight < viewport.scrollHeight - tolerance;

    setCanScrollUp(nextCanScrollUp);
    setCanScrollDown(nextCanScrollDown);
  }, []);

  const startScrollAnimation = useCallback(
    (direction: -1 | 1) => {
      stopScrollAnimation();

      let previousTimestamp = 0;

      const tick = (timestamp: number) => {
        const viewport = viewportRef.current;

        if (!viewport) {
          stopScrollAnimation();
          return;
        }

        if (previousTimestamp === 0) {
          previousTimestamp = timestamp;
        }

        const elapsed = Math.min(timestamp - previousTimestamp, 32);
        previousTimestamp = timestamp;
        viewport.scrollTop += direction * Math.max(1.5, elapsed * 0.18);
        updateScrollState();

        const isAtTop = viewport.scrollTop <= 1;
        const isAtBottom =
          viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 1;

        if ((direction === -1 && isAtTop) || (direction === 1 && isAtBottom)) {
          stopScrollAnimation();
          return;
        }

        scrollAnimationRef.current = window.requestAnimationFrame(tick);
      };

      scrollAnimationRef.current = window.requestAnimationFrame(tick);
    },
    [stopScrollAnimation, updateScrollState],
  );

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (disabled) {
      setIsOpen(false);
    }
  }, [disabled]);

  useEffect(() => {
    if (!isOpen) {
      stopScrollAnimation();
      setCanScrollUp(false);
      setCanScrollDown(false);
      return;
    }

    const viewport = viewportRef.current;

    if (!viewport) return;

    const animationFrame = window.requestAnimationFrame(updateScrollState);

    viewport.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      viewport.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
      stopScrollAnimation();
    };
  }, [isOpen, options.length, stopScrollAnimation, updateScrollState]);

  return (
    <div
      ref={rootRef}
      data-ui-management-select-control="true"
      data-ui-management-select-width={width}
      data-open={isOpen ? "true" : "false"}
      data-disabled={disabled ? "true" : undefined}
    >
      <button
        id={id}
        type="button"
        data-ui-management-select-trigger="true"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setIsOpen(true);
          }
        }}
      >
        <span data-ui-management-select-value="true">
          {selectedOption?.label ?? placeholder}
        </span>
        <span data-ui-picker-chevron="true" aria-hidden="true" />
      </button>

      {isOpen && (
        <div data-ui-management-select-menu="true" role="listbox" aria-labelledby={id}>
          {canScrollUp && (
            <div
              data-ui-management-select-scroll-zone="up"
              aria-hidden="true"
              onPointerEnter={() => startScrollAnimation(-1)}
              onPointerLeave={stopScrollAnimation}
              onPointerCancel={stopScrollAnimation}
            >
              <span data-ui-management-select-scroll-icon="true" />
            </div>
          )}

          <div ref={viewportRef} data-ui-management-select-viewport="true">
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  data-ui-management-select-option="true"
                  data-selected={isSelected ? "true" : undefined}
                  disabled={option.disabled}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  <span data-ui-management-select-option-label="true">{option.label}</span>
                  {isSelected && (
                    <span data-ui-management-select-check="true" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {canScrollDown && (
            <div
              data-ui-management-select-scroll-zone="down"
              aria-hidden="true"
              onPointerEnter={() => startScrollAnimation(1)}
              onPointerLeave={stopScrollAnimation}
              onPointerCancel={stopScrollAnimation}
            >
              <span data-ui-management-select-scroll-icon="true" />
            </div>
          )}
        </div>
      )}
    </div>
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
