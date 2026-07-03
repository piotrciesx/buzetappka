export const uiZIndex = {
  // Semantic layers for new UI foundation work.
  base: 0,
  raised: 1,
  sticky: 40,
  dropdown: 1200,
  popover: 2200,
  panel: 2600,
  drawer: 2600,
  modal: 3000,
  toast: 12000,
  criticalOverlay: 130000,

  // Legacy bridge aliases. Keep values stable until the owning module migrates.
  floatingAction: 950,
  modalBase: 1000,
  modalRaised: 1001,
  modalPrompt: 1100,
  dropdownRaised: 1201,
  sidebar: 900,
  dashboardOverlay: 1200,
  mobileDrawer: 1300,
  dashboardAddPanel: 1450,
  floatingMenu: 1600,
  floatingMenuBase: 1700,
  floatingMenuElevated: 1800,
  sidebarPanel: 2300,
  mobilePanel: 2400,
  sidePanelOverlay: 2600,
  sidePanel: 2610,
  sidePanelDropdown: 2700,
  mobilePopover: 3100,
  mobileCritical: 3200,
  rightRailDropdown: 3600,
  profileMenu: 4200,
  workspacePopover: 5000,
  widgetDropdown: 20,
  widgetConfig: 12,
  widgetControl: 4,
  widgetHeader: 5,
  widgetConfigOpen: 7,
  widgetOverlay: 8,
  creatorDropdown: 30,
  localBase: 0,
  localRaised: 1,
  localOverlay: 2,
  localAbove: 3,
  localControl: 4,
  localHeader: 5,
  localActive: 10,
  localEmergency: 42,
  mobileCategoryMenu: 760,
  categoryPopover: 20000,
  categoryPopoverElevated: 20010,
  categoryAutocomplete: 20020,
  categoryOverlay: 22000,
  topbar: 90000,
  topbarDropdown: 90020,
  topbarOverlay: 120000,
  topbarOverlayRaised: 120001,
  topbarCritical: 120010,
  globalCritical: 130000,
} as const;

export const uiColorTokens = {
  primaryNavy: "#082C7A",
  primaryBlue: "#215DFF",
  softBlue: "#EAF1FF",
  lightBlueBorder: "#D6E4FF",
  extraLightBlue: "#F7FAFF",
  primaryText: "#13203A",
  secondaryText: "#5F6B85",
  mutedText: "#98A2B3",
  whiteText: "#FFFFFF",
  mainBackground: "#F8FAFD",
  cardBackground: "#FFFFFF",
  softSectionBackground: "#F4F7FC",
  hoverBackground: "#F2F6FF",
  primaryBorder: "#215DFF",
  softBorder: "#DCE6F7",
  dividerBorder: "#E8EEF8",
  disabledBorder: "#E2E8F3",
  income: "#11884F",
  incomeSoft: "#E9F8F1",
  expense: "#D7263D",
  expenseSoft: "#FFF1F2",
  balancePositive: "#11884F",
  balanceNegative: "#D7263D",
  limitWarning: "#F59E0B",
  limitExceeded: "#D7263D",
  success: "#1FA971",
  successSoft: "#E9F8F1",
  error: "#E5484D",
  errorSoft: "#FFF1F2",
  warning: "#F59E0B",
  warningSoft: "#FFF7E8",
  shadowLight: "rgba(15,23,42,0.04)",
  shadowMedium: "rgba(15,23,42,0.08)",
  shadowStrong: "rgba(15,23,42,0.14)",
  softBlueGradient: "linear-gradient(180deg,#FFFFFF 0%,#F7FAFF 100%)",
  incomeGradient: "linear-gradient(180deg,#F2FFF8 0%,#E7F9EF 100%)",
  expenseGradient: "linear-gradient(180deg,#FFF6F6 0%,#FFF0F0 100%)",
} as const;

export const uiColorRoleTokens = {
  surface: {
    app: "var(--ui-surface-app)",
    card: "var(--ui-surface-card)",
    panel: "var(--ui-surface-panel)",
    widget: "var(--ui-surface-widget)",
    modal: "var(--ui-surface-modal)",
    dropdown: "var(--ui-surface-dropdown)",
    soft: "var(--ui-surface-soft)",
    hover: "var(--ui-surface-hover)",
    active: "var(--ui-surface-active)",
    empty: "var(--ui-surface-empty)",
    disabled: "var(--ui-surface-disabled)",
  },
  text: {
    primary: "var(--ui-text-primary)",
    secondary: "var(--ui-text-secondary)",
    muted: "var(--ui-text-muted)",
    inverse: "var(--ui-text-inverse)",
    link: "var(--ui-text-link)",
  },
  border: {
    soft: "var(--ui-border-soft)",
    strong: "var(--ui-border-strong)",
    active: "var(--ui-border-active)",
    divider: "var(--ui-border-divider)",
    disabled: "var(--ui-border-disabled)",
  },
  financial: {
    income: "var(--ui-financial-income)",
    incomeSoft: "var(--ui-financial-income-soft)",
    expense: "var(--ui-financial-expense)",
    expenseSoft: "var(--ui-financial-expense-soft)",
    balancePositive: "var(--ui-financial-balance-positive)",
    balanceNegative: "var(--ui-financial-balance-negative)",
  },
  status: {
    success: "var(--ui-status-success)",
    successSoft: "var(--ui-status-success-soft)",
    warning: "var(--ui-status-warning)",
    warningSoft: "var(--ui-status-warning-soft)",
    error: "var(--ui-status-error)",
    errorSoft: "var(--ui-status-error-soft)",
    info: "var(--ui-status-info)",
    infoSoft: "var(--ui-status-info-soft)",
  },
  overlay: {
    backdropSoft: "var(--ui-overlay-backdrop-soft)",
    backdropStandard: "var(--ui-overlay-backdrop-standard)",
    backdropStrong: "var(--ui-overlay-backdrop-strong)",
  },
  shadow: {
    none: "var(--ui-shadow-none)",
    light: "var(--ui-shadow-light)",
    medium: "var(--ui-shadow-medium)",
    strong: "var(--ui-shadow-strong)",
  },
  chart: {
    positive: "var(--ui-chart-positive)",
    negative: "var(--ui-chart-negative)",
    neutral: "var(--ui-chart-neutral)",
    blue: "var(--ui-chart-blue)",
    positiveSoft: "var(--ui-chart-positive-soft)",
    negativeSoft: "var(--ui-chart-negative-soft)",
    neutralSoft: "var(--ui-chart-neutral-soft)",
    grid: "var(--ui-chart-grid)",
    axis: "var(--ui-chart-axis)",
    surface: "var(--ui-chart-surface)",
  },
  heatmap: {
    low: "var(--ui-heatmap-low)",
    medium: "var(--ui-heatmap-medium)",
    high: "var(--ui-heatmap-high)",
    empty: "var(--ui-heatmap-empty)",
    border: "var(--ui-heatmap-border)",
    text: "var(--ui-heatmap-text)",
    textInverse: "var(--ui-heatmap-text-inverse)",
  },
} as const;

export const uiTypographyTokens = {
  hierarchy: {
    t1: "var(--ui-type-t1)",
    t2: "var(--ui-type-t2)",
    t3: "var(--ui-type-t3)",
    t4: "var(--ui-type-t4)",
    t5: "var(--ui-type-t5)",
  },
  role: {
    financialValue: "var(--ui-type-financial-value)",
    label: "var(--ui-type-label)",
    metadata: "var(--ui-type-metadata)",
    helper: "var(--ui-type-helper)",
    placeholder: "var(--ui-type-placeholder)",
    widgetTitle: "var(--ui-type-widget-title)",
    widgetMeta: "var(--ui-type-widget-meta)",
    dashboardValue: "var(--ui-type-dashboard-value)",
  },
  weight: {
    regular: "var(--ui-font-weight-regular)",
    medium: "var(--ui-font-weight-medium)",
    semibold: "var(--ui-font-weight-semibold)",
    bold: "var(--ui-font-weight-bold)",
  },
  lineHeight: {
    compact: "var(--ui-line-height-compact)",
    body: "var(--ui-line-height-body)",
    heading: "var(--ui-line-height-heading)",
  },
} as const;

export const uiPrimitiveContracts = {
  button: ["hero", "standard", "utility", "icon"],
  buttonState: ["active"],
  buttonTone: ["default", "danger", "success"],
  buttonWidth: ["auto", "equal", "full"],
  buttonDensity: ["compact", "normal"],
  iconButton: ["default", "subtle", "danger", "active"],
  input: [
    "s",
    "m",
    "l",
    "search",
    "amount",
    "textarea",
    "default",
    "small",
    "invalid",
    "disabled",
  ],
  amountInput: ["default", "hero"],
  select: ["default", "s", "m", "l", "invalid", "disabled"],
  checkbox: ["default", "field", "comfortable", "disabled"],
  form: ["default", "comfortable"],
  formSection: ["default", "creator"],
  heroHeader: ["module", "creator"],
  collapsibleSecondarySection: ["default", "collapsed", "expanded"],
  collapsibleChevron: ["collapsed", "expanded", "toneInherited"],
  primaryDisabledOverlay: ["whiteOverlay", "inverseText", "noShadow"],
  visualIndentLevel: ["hero", "section", "record"],
  sectionToneInheritance: ["smartColorBySection"],
  sectionToneTypography: [
    "titleInheritsTone",
    "iconInheritsTone",
    "chevronInheritsTone",
  ],
  creatorModal: ["compact", "standard", "wide"],
  creatorLayout: ["main", "summary", "footer"],
  creatorHeader: ["default"],
  creatorStep: ["default", "separated", "grouped"],
  creatorSection: ["separated", "grouped"],
  creatorSummary: ["default"],
  creatorPreviewCard: ["goal", "payment-source", "default"],
  formField: ["regular", "comfortable", "hero"],
  fieldEmphasis: ["standard", "hero"],
  moneyField: ["default", "hero", "currencySuffix"],
  monthField: ["default", "empty", "withNativePicker"],
  infoBanner: ["inline", "module", "footer-guidance"],
  creatorHeroZone: ["default"],
  picker: ["rich", "gallery"],
  pickerTrigger: ["default", "comfortable"],
  separator: ["light", "strong", "vertical"],
  sectionRecord: ["default", "light", "strong"],
  badge: ["neutral", "info", "success", "warning", "danger"],
  tag: ["default", "interactive", "removable"],
  segmentedControl: ["default", "compact"],
  card: ["default", "elevated", "interactive"],
  recordCard: ["simple", "metric", "progress", "expandable"],
  recordInteraction: ["static", "interactive"],
  statusPillShape: ["pill", "softRect"],
  panel: ["workspace", "utility", "side", "rail"],
  surface: ["card", "panel", "widget", "modal", "dropdown", "empty"],
  surfaceLevel: ["flat", "raised", "floating"],
  surfaceDensity: ["compact", "normal"],
  modal: ["s", "m", "l", "xl"],
  overlay: ["popover", "drawer", "workspace"],
  dropdown: [
    "action",
    "select",
    "searchable",
    "autocomplete",
    "context",
    "utilityPopover",
  ],
  dropdownPlacement: ["bottom", "top", "context"],
  dropdownAlign: ["start", "center", "end"],
  list: ["compact", "normal"],
  row: ["xs", "sm", "md", "lg"],
  rowKind: ["list", "category", "transaction", "ranking", "utility", "table"],
  rowState: [
    "default",
    "hover",
    "active",
    "selected",
    "open",
    "dragging",
    "disabled",
  ],
  rowDensity: ["compact", "normal"],
  toolbar: ["default", "compact", "sticky"],
  typography: ["t1", "t2", "t3", "t4", "t5"],
  typographyRole: [
    "financialValue",
    "label",
    "metadata",
    "helper",
    "placeholder",
    "widgetTitle",
    "widgetMeta",
    "dashboardValue",
  ],
} as const;

export const uiSurfaceApi = {
  classNames: {
    surface: "ui-surface",
    card: "ui-surface--card",
    panel: "ui-surface--panel",
    widget: "ui-surface--widget",
    modal: "ui-surface--modal",
    dropdown: "ui-surface--dropdown",
    empty: "ui-surface--empty",
  },
  attributes: {
    level: "data-surface-level",
    density: "data-surface-density",
  },
  level: {
    flat: "flat",
    raised: "raised",
    floating: "floating",
  },
  density: {
    compact: "compact",
    normal: "normal",
  },
} as const;

export const uiSurfacePrimitives = {
  base: {
    className: uiSurfaceApi.classNames.surface,
    border: "var(--ui-frame-border)",
    radius: "var(--ui-radius-lg)",
    background: "var(--ui-surface-card)",
    color: "var(--ui-text-primary)",
    shadow: "var(--ui-frame-shadow)",
  },
  surfaceCard: {
    className: `${uiSurfaceApi.classNames.surface} ${uiSurfaceApi.classNames.card}`,
    border: "var(--ui-frame-border)",
    radius: "var(--ui-card-radius)",
    background: "var(--ui-surface-card)",
    shadow: "var(--ui-frame-shadow)",
    padding: "var(--ui-surface-card-padding)",
  },
  surfacePanel: {
    className: `${uiSurfaceApi.classNames.surface} ${uiSurfaceApi.classNames.panel}`,
    border: "var(--ui-frame-border)",
    radius: "var(--ui-panel-radius)",
    background: "var(--ui-surface-panel)",
    shadow: "var(--ui-frame-shadow)",
    padding: "var(--ui-surface-panel-padding)",
  },
  surfaceWidget: {
    className: `${uiSurfaceApi.classNames.surface} ${uiSurfaceApi.classNames.widget}`,
    border: "var(--ui-frame-border)",
    radius: "var(--ui-card-radius)",
    background: "var(--ui-surface-widget)",
    shadow: "var(--ui-frame-shadow)",
    padding: "var(--ui-surface-card-padding)",
  },
  surfaceModal: {
    className: `${uiSurfaceApi.classNames.surface} ${uiSurfaceApi.classNames.modal}`,
    border: "var(--ui-frame-border)",
    radius: "var(--ui-modal-radius)",
    background: "var(--ui-surface-modal)",
    shadow: "var(--ui-shadow-modal), var(--ui-frame-ring)",
    padding: "var(--ui-surface-modal-padding)",
  },
  surfaceDropdown: {
    className: `${uiSurfaceApi.classNames.surface} ${uiSurfaceApi.classNames.dropdown}`,
    border: "var(--ui-frame-border)",
    radius: "var(--ui-dropdown-radius)",
    background: "var(--ui-surface-dropdown)",
    text: "var(--ui-dropdown-text)",
    shadow: "var(--ui-overlay-dropdown-shadow-tight), var(--ui-frame-ring)",
    padding: "var(--ui-surface-dropdown-padding)",
  },
  surfaceEmpty: {
    className: `${uiSurfaceApi.classNames.surface} ${uiSurfaceApi.classNames.empty}`,
    border: "1px dashed var(--ui-surface-empty-border)",
    radius: "var(--ui-panel-radius)",
    background: "var(--ui-surface-empty)",
    shadow: "var(--ui-shadow-none)",
    padding: "var(--ui-surface-empty-padding)",
  },
  card: {
    border: "var(--ui-frame-border)",
    radius: "var(--ui-card-radius)",
    background: "var(--ui-surface-card)",
    shadow: "var(--ui-frame-shadow)",
    padding: "var(--ui-surface-card-padding)",
  },
  panel: {
    border: "var(--ui-frame-border)",
    radius: "var(--ui-panel-radius)",
    background: "var(--ui-surface-workspace)",
    shadow: "var(--ui-frame-shadow)",
    padding: "var(--ui-surface-panel-padding)",
  },
  utilityPanel: {
    border: "var(--ui-frame-border)",
    radius: "var(--ui-panel-radius)",
    background: "var(--ui-surface-rail)",
    shadow: "var(--ui-frame-shadow)",
    padding: "var(--ui-surface-panel-padding)",
  },
  modalSurface: {
    border: "var(--ui-frame-border)",
    radius: "var(--ui-modal-radius)",
    background: "var(--ui-surface-modal)",
    shadow: "var(--ui-shadow-modal), var(--ui-frame-ring)",
    padding: "var(--ui-surface-modal-padding)",
  },
  modalSurfaceNeutral: {
    border: "var(--ui-frame-border)",
    radius: "var(--ui-modal-radius)",
    background: "var(--ui-surface-modal)",
    shadow: "var(--ui-overlay-modal-shadow-neutral), var(--ui-frame-ring)",
    padding: "var(--ui-surface-modal-padding)",
  },
  modalSurfacePrompt: {
    border: "var(--ui-frame-border)",
    radius: "var(--ui-modal-radius)",
    background: "var(--ui-surface-modal)",
    shadow: "var(--ui-surface-modal-shadow-prompt), var(--ui-frame-ring)",
    padding: "var(--ui-surface-modal-padding)",
  },
  modalSurfaceStrong: {
    border: "var(--ui-frame-border)",
    radius: "var(--ui-modal-radius)",
    background: "var(--ui-surface-modal)",
    shadow: "var(--ui-overlay-modal-shadow-strong), var(--ui-frame-ring)",
    padding: "var(--ui-surface-modal-padding-compact)",
  },
  modalSurfaceInfoBorder: {
    border: "var(--ui-frame-border)",
    radius: "var(--ui-modal-radius)",
    background: "var(--ui-surface-modal)",
    shadow: "var(--ui-shadow-modal), var(--ui-frame-ring)",
    padding: "var(--ui-surface-modal-padding)",
  },
  dropdownSurface: {
    border: "var(--ui-frame-border)",
    radius: "var(--ui-dropdown-radius)",
    background: "var(--ui-surface-dropdown)",
    text: "var(--ui-dropdown-text)",
    shadow: "var(--ui-overlay-dropdown-shadow-tight), var(--ui-frame-ring)",
    padding: "var(--ui-surface-dropdown-padding)",
  },
  profileDropdownSurface: {
    border: "var(--ui-frame-border)",
    radius: "var(--ui-radius-sm)",
    background: "var(--ui-surface-dropdown)",
    text: "var(--ui-dropdown-text)",
    shadow: "var(--ui-shadow-dropdown), var(--ui-frame-ring)",
    padding: "var(--ui-surface-dropdown-padding)",
  },
  popoverSurface: {
    border: "var(--ui-frame-border)",
    radius: "var(--ui-radius-sm)",
    background: "var(--ui-surface-dropdown)",
    text: "var(--ui-dropdown-text)",
    shadow: "var(--ui-shadow-dropdown), var(--ui-frame-ring)",
    padding: "var(--ui-surface-popover-padding)",
  },
  widgetSurface: {
    border: "var(--ui-frame-border)",
    radius: "var(--ui-card-radius)",
    background: "var(--ui-surface-widget)",
    shadow: "var(--ui-frame-shadow)",
    padding: "var(--ui-surface-card-padding)",
  },
  emptyState: {
    border: "1px dashed var(--ui-surface-empty-border)",
    radius: "var(--ui-panel-radius)",
    background: "rgba(255, 255, 255, 0.42)",
    padding: "var(--ui-surface-empty-padding)",
  },
  infoBox: {
    border: "1px solid var(--ui-surface-border-default)",
    radius: "var(--ui-radius-lg)",
    background: "var(--ui-surface-info)",
    padding: "var(--ui-surface-card-padding)",
  },
  statusBox: {
    danger: {
      border: "1px solid var(--ui-surface-border-danger)",
      radius: "var(--ui-surface-status-radius)",
      background: "var(--ui-surface-status-danger)",
      padding: "var(--ui-surface-status-padding)",
    },
  },
} as const;

export const uiLayoutPrimitives = {
  appShell: {
    leftWidth: "var(--ui-shell-left-width)",
    rightRailWidth: "var(--ui-shell-right-rail-width)",
    topHeight: "var(--ui-shell-top-height)",
    gap: "var(--ui-shell-gap)",
    radius: "var(--ui-shell-radius)",
    contentLayer: uiZIndex.localRaised,
  },
  topbar: {
    layer: uiZIndex.topbar,
    overlayLayer: uiZIndex.topbarOverlay,
    insetY: "var(--ui-topbar-inset-y)",
    insetX: "var(--ui-topbar-inset-x)",
    radius: "var(--ui-topbar-radius)",
    gap: "var(--ui-topbar-gap)",
    minHeight: "var(--ui-topbar-min-height)",
  },
  leftSidebar: {
    layer: uiZIndex.sidebar,
    width: "var(--ui-left-sidebar-width)",
    radius: "var(--ui-left-sidebar-radius)",
    padding: "var(--ui-left-sidebar-padding)",
  },
  rightRail: {
    layer: uiZIndex.dashboardOverlay,
    width: "var(--ui-right-rail-width)",
    maxWidth: "var(--ui-right-rail-content-max-width)",
    stickyTop: "var(--ui-right-rail-sticky-top)",
  },
  workspace: {
    layer: uiZIndex.localRaised,
    railWidth: "var(--ui-shell-workspace-rail-width)",
    gap: "var(--ui-shell-gap)",
  },
  sidePanel: {
    layer: uiZIndex.sidePanel,
    overlayLayer: uiZIndex.sidePanelOverlay,
    left: "var(--ui-side-panel-left)",
    top: "var(--ui-side-panel-top)",
    width: "var(--ui-side-panel-width)",
    radius: "var(--ui-side-panel-radius)",
  },
  drawer: {
    layer: uiZIndex.sidebarPanel,
    left: "var(--ui-drawer-left)",
    top: "var(--ui-drawer-top)",
    width: "var(--ui-drawer-width)",
  },
  floatingLayer: {
    layer: uiZIndex.floatingAction,
  },
} as const;

export const uiButtonApi = {
  classNames: {
    hero: "ui-button--hero",
    standard: "ui-button--standard",
    utility: "ui-button--utility",
    icon: "ui-button--icon",
  },
  attributes: {
    state: "data-button-state",
    tone: "data-button-tone",
    width: "data-button-width",
    density: "data-button-density",
  },
  legacyClassNames: {
    primary: "ui-button-primary",
    secondary: "ui-button-secondary",
    danger: "ui-button-danger",
    hero: "ui-button-hero",
    standard: "ui-button-standard",
    utility: "ui-button-utility",
    icon: "ui-button-icon",
  },
} as const;

export const uiModalApi = {
  classNames: {
    backdrop: "ui-overlay-backdrop",
    modal: "ui-modal",
    modalS: "ui-modal--s",
    modalM: "ui-modal--m",
    modalL: "ui-modal--l",
    modalXl: "ui-modal--xl",
    header: "ui-modal__header",
    body: "ui-modal__body",
    footer: "ui-modal__footer",
    close: "ui-modal__close",
    popover: "ui-popover",
    drawer: "ui-drawer",
    workspaceOverlay: "ui-workspace-overlay",
  },
  attributes: {
    backdrop: "data-overlay-backdrop",
    size: "data-modal-size",
    layer: "data-overlay-layer",
    closeArea: "data-modal-close-area",
  },
  backdrop: {
    soft: "soft",
    standard: "standard",
    strong: "strong",
  },
} as const;

export const uiDropdownApi = {
  classNames: {
    dropdown: "ui-dropdown",
    action: "ui-dropdown--action",
    select: "ui-dropdown--select",
    searchable: "ui-dropdown--searchable",
    autocomplete: "ui-dropdown--autocomplete",
    context: "ui-dropdown--context",
    utilityPopover: "ui-popover--utility",
    item: "ui-dropdown__item",
    itemLabel: "ui-dropdown__item-label",
    itemMeta: "ui-dropdown__item-meta",
    separator: "ui-dropdown__separator",
    search: "ui-dropdown__search",
    empty: "ui-dropdown__empty",
  },
  attributes: {
    placement: "data-dropdown-placement",
    align: "data-dropdown-align",
    state: "data-dropdown-state",
    tone: "data-dropdown-tone",
  },
  placement: {
    bottom: "bottom",
    top: "top",
    context: "context",
  },
  align: {
    start: "start",
    center: "center",
    end: "end",
  },
} as const;

export const uiInputApi = {
  classNames: {
    input: "ui-input",
    inputS: "ui-input--s",
    inputM: "ui-input--m",
    inputL: "ui-input--l",
    searchField: "ui-search-field",
    amountField: "ui-amount-field",
    textarea: "ui-textarea",
    select: "ui-select",
  },
  attributes: {
    state: "data-input-state",
    width: "data-input-width",
    density: "data-input-density",
  },
  state: {
    default: "default",
    error: "error",
    disabled: "disabled",
  },
  width: {
    auto: "auto",
    compact: "compact",
    full: "full",
  },
  density: {
    compact: "compact",
    normal: "normal",
  },
} as const;

export const uiFormApi = {
  attributes: {
    shell: "data-ui-form-shell",
    density: "data-ui-form-density",
    field: "data-ui-field",
    fieldWrapper: "data-ui-field-wrapper",
    fieldLabel: "data-ui-field-label",
    meta: "data-ui-form-meta",
    actions: "data-ui-form-actions",
    grid: "data-ui-form-grid",
  },
  density: {
    default: "default",
    comfortable: "comfortable",
  },
} as const;

export const uiAmountApi = {
  classNames: {
    field: uiInputApi.classNames.amountField,
  },
  attributes: {
    shell: "data-ui-amount-shell",
    variant: "data-ui-amount-variant",
    hero: "data-ui-hero-input",
    currency: "data-ui-amount-currency",
  },
  variant: {
    default: "default",
    hero: "hero",
  },
} as const;

export const uiPickerApi = {
  attributes: {
    control: "data-ui-picker-control",
    variant: "data-ui-picker-variant",
    trigger: "data-ui-picker-trigger",
    value: "data-ui-picker-value",
    menu: "data-ui-picker-menu",
    grid: "data-ui-picker-menu-grid",
    search: "data-ui-picker-search",
    chevron: "data-ui-picker-chevron",
    more: "data-ui-picker-more",
    empty: "data-ui-picker-empty",
  },
  variant: {
    rich: "rich",
    gallery: "gallery",
  },
} as const;

export const uiCreatorApi = {
  attributes: {
    header: "data-ui-creator-header",
    layout: "data-ui-creator-layout",
    main: "data-ui-creator-main",
    step: "data-ui-creator-step",
    stepState: "data-ui-creator-step-state",
    stepIcon: "data-ui-creator-step-icon",
    stepContent: "data-ui-creator-step-content",
    stepHeader: "data-ui-creator-step-header",
    summary: "data-ui-creator-summary",
    summaryHeader: "data-ui-creator-summary-header",
    summaryHeaderIcon: "data-ui-summary-header-icon",
    summaryHeaderCopy: "data-ui-summary-header-copy",
    summaryCard: "data-ui-creator-summary-card",
    summaryTitle: "data-ui-creator-summary-title",
    footer: "data-ui-creator-footer",
    section: "data-ui-creator-section",
    heroZone: "data-ui-creator-hero-zone",
    heroActions: "data-ui-creator-hero-actions",
    quickActions: "data-ui-creator-quick-actions",
    segments: "data-ui-creator-segments",
    statusRow: "data-ui-creator-status-row",
    availabilityOption: "data-ui-availability-option",
    availabilityIcon: "data-ui-availability-icon",
    checkboxVisual: "data-ui-checkbox-visual",
  },
  density: {
    comfortable: "comfortable",
  },
  controlSize: {
    comfortable: "comfortable",
  },
} as const;

export const uiSeparatorApi = {
  attributes: {
    sectionHeader: "data-ui-section-header",
    section: "data-ui-section-separator",
    record: "data-ui-record-separator",
    vertical: "data-ui-vertical-separator",
    weight: "data-ui-separator-weight",
  },
  weight: {
    light: "light",
    strong: "strong",
  },
} as const;

export const uiSectionRecordApi = {
  attributes: {
    record: "data-ui-section-record",
    main: "data-ui-section-record-main",
    copy: "data-ui-section-record-copy",
    title: "data-ui-section-record-title",
    meta: "data-ui-section-record-meta",
    metrics: "data-ui-section-record-metrics",
    status: "data-ui-section-record-status",
    actions: "data-ui-section-record-actions",
    state: "data-ui-record-state",
  },
  state: {
    active: "active",
    archived: "archived",
  },
} as const;

export const uiCheckboxApi = {
  classNames: {
    root: "ui-checkbox",
    input: "ui-checkbox__input",
    label: "ui-checkbox__label",
  },
  attributes: {
    layout: "data-checkbox-layout",
    density: "data-checkbox-density",
    state: "data-checkbox-state",
    variant: "data-checkbox-variant",
    align: "data-checkbox-align",
    group: "data-ui-checkbox-field-group",
  },
  layout: {
    inline: "inline",
    stacked: "stacked",
  },
  density: {
    compact: "compact",
    normal: "normal",
    comfortable: "comfortable",
  },
  variant: {
    field: "field",
  },
  align: {
    field: "field",
  },
} as const;

export const uiStatusPillApi = {
  attributes: {
    root: "data-ui-status-pill",
    tone: "data-ui-tone",
  },
  tone: {
    success: "success",
    danger: "danger",
  },
} as const;

export const uiListRowApi = {
  classNames: {
    list: "ui-list",
    listCompact: "ui-list--compact",
    listNormal: "ui-list--normal",
    row: "ui-row",
    rowXs: "ui-row--xs",
    rowSm: "ui-row--sm",
    rowMd: "ui-row--md",
    rowLg: "ui-row--lg",
    main: "ui-row__main",
    meta: "ui-row__meta",
    value: "ui-row__value",
    actions: "ui-row__actions",
    icon: "ui-row__icon",
    drag: "ui-row__drag",
  },
  attributes: {
    kind: "data-row-kind",
    state: "data-row-state",
    density: "data-row-density",
  },
  kind: {
    list: "list",
    category: "category",
    transaction: "transaction",
    ranking: "ranking",
    utility: "utility",
    table: "table",
  },
  state: {
    default: "default",
    hover: "hover",
    active: "active",
    selected: "selected",
    open: "open",
    dragging: "dragging",
    disabled: "disabled",
  },
  density: {
    compact: "compact",
    normal: "normal",
  },
} as const;

export const uiListRowPrimitives = {
  list: {
    className: uiListRowApi.classNames.list,
    gap: "var(--ui-row-section-gap)",
  },
  listCompact: {
    className: `${uiListRowApi.classNames.list} ${uiListRowApi.classNames.listCompact}`,
    gap: "var(--ui-spacing-xs)",
  },
  listNormal: {
    className: `${uiListRowApi.classNames.list} ${uiListRowApi.classNames.listNormal}`,
    gap: "var(--ui-row-section-gap)",
  },
  row: {
    className: uiListRowApi.classNames.row,
    minHeight: "var(--ui-row-height-md)",
    padding: "var(--ui-row-padding-y) var(--ui-row-padding-x)",
    gap: "var(--ui-row-gap)",
    divider: "var(--ui-row-divider)",
    background: "transparent",
  },
  rowXs: {
    className: `${uiListRowApi.classNames.row} ${uiListRowApi.classNames.rowXs}`,
    minHeight: "var(--ui-row-height-xs)",
  },
  rowSm: {
    className: `${uiListRowApi.classNames.row} ${uiListRowApi.classNames.rowSm}`,
    minHeight: "var(--ui-row-height-sm)",
  },
  rowMd: {
    className: `${uiListRowApi.classNames.row} ${uiListRowApi.classNames.rowMd}`,
    minHeight: "var(--ui-row-height-md)",
  },
  rowLg: {
    className: `${uiListRowApi.classNames.row} ${uiListRowApi.classNames.rowLg}`,
    minHeight: "var(--ui-row-height-lg)",
  },
  main: {
    className: uiListRowApi.classNames.main,
    gap: "var(--ui-spacing-xs)",
  },
  meta: {
    className: uiListRowApi.classNames.meta,
    color: "var(--ui-text-muted)",
    fontSize: "var(--ui-type-metadata)",
    lineHeight: "var(--ui-line-height-compact)",
  },
  value: {
    className: uiListRowApi.classNames.value,
    color: "var(--ui-text-primary)",
  },
  actions: {
    className: uiListRowApi.classNames.actions,
    gap: "var(--ui-spacing-xs)",
    actionSize: "var(--ui-row-action-size)",
  },
  icon: {
    className: uiListRowApi.classNames.icon,
    size: "var(--ui-row-icon-size)",
  },
  drag: {
    className: uiListRowApi.classNames.drag,
    size: "var(--ui-row-drag-size)",
  },
} as const;

export const uiFormPrimitives = {
  shell: {
    attribute: uiFormApi.attributes.shell,
    gap: "var(--ui-spacing-form-comfortable-gap)",
  },
  comfortableShell: {
    attribute: uiFormApi.attributes.shell,
    density: uiFormApi.density.comfortable,
    gap: "var(--ui-spacing-form-section-gap)",
    controlHeight: "var(--ui-input-height-comfortable)",
    controlPadding: "var(--ui-input-padding-comfortable)",
    labelGap: "var(--ui-spacing-form-label-gap)",
  },
  field: {
    attribute: uiFormApi.attributes.field,
    gap: "var(--ui-spacing-form-label-gap)",
  },
  actions: {
    attribute: uiFormApi.attributes.actions,
    gap: "var(--ui-spacing-action-gap)",
  },
} as const;

export const uiPickerPrimitives = {
  gallery: {
    controlAttribute: uiPickerApi.attributes.control,
    variant: uiPickerApi.variant.gallery,
    triggerHeight: "var(--ui-picker-trigger-height)",
    triggerPadding: "var(--ui-picker-trigger-padding)",
    triggerGap: "var(--ui-picker-trigger-gap)",
    triggerRadius: "var(--ui-picker-trigger-radius)",
  },
} as const;

export const uiCreatorPrimitives = {
  header: {
    attribute: uiCreatorApi.attributes.header,
    titleSize: "var(--ui-module-hero-title-size)",
    iconSize: "var(--ui-module-hero-icon-size)",
    iconGlyphSize: "var(--ui-module-hero-glyph-size)",
  },
  layout: {
    attribute: uiCreatorApi.attributes.layout,
    gap: "var(--ui-creator-layout-gap)",
    summaryWidth: "var(--ui-creator-summary-width)",
  },
  step: {
    attribute: uiCreatorApi.attributes.step,
    iconAttribute: uiCreatorApi.attributes.stepIcon,
    titleSize: "var(--ui-creator-step-title-size)",
    iconSize: "var(--ui-creator-step-icon-size)",
  },
  summary: {
    attribute: uiCreatorApi.attributes.summary,
    padding: "var(--ui-creator-summary-padding)",
    width: "var(--ui-creator-summary-width)",
  },
  section: {
    attribute: uiCreatorApi.attributes.section,
    gap: "var(--ui-creator-section-gap)",
    paddingY: "var(--ui-creator-section-padding-y)",
  },
  heroZone: {
    attribute: uiCreatorApi.attributes.heroZone,
    padding: "var(--ui-creator-hero-zone-padding)",
    gap: "var(--ui-creator-hero-zone-gap)",
    radius: "var(--ui-creator-hero-zone-radius)",
    border: "var(--ui-creator-hero-zone-border)",
    background: "var(--ui-creator-hero-zone-bg)",
  },
} as const;

export const uiSeparatorPrimitives = {
  light: {
    weight: uiSeparatorApi.weight.light,
    height: "1px",
    margin: "var(--ui-record-separator-light-margin)",
    color: "var(--ui-record-separator-light-color)",
  },
  strong: {
    weight: uiSeparatorApi.weight.strong,
    height: "1px",
    margin: "var(--ui-record-separator-strong-margin)",
    color: "var(--ui-record-separator-strong-color)",
  },
  vertical: {
    attribute: uiSeparatorApi.attributes.vertical,
    width: "1px",
    color: "var(--ui-record-section-vertical-separator-color)",
  },
} as const;

export const uiSectionRecordPrimitives = {
  record: {
    attribute: uiSectionRecordApi.attributes.record,
    gap: "var(--ui-section-record-gap)",
    iconSize: "var(--ui-section-record-icon-size)",
  },
  copy: {
    attribute: uiSectionRecordApi.attributes.copy,
    gap: "var(--ui-space-2)",
  },
  metrics: {
    attribute: uiSectionRecordApi.attributes.metrics,
    gap: "var(--ui-section-record-metric-gap)",
  },
  actions: {
    attribute: uiSectionRecordApi.attributes.actions,
    gap: "var(--ui-section-record-metric-gap)",
  },
} as const;

export const uiControlPrimitives = {
  button: {
    hero: {
      className: uiButtonApi.classNames.hero,
      minHeight: "var(--ui-button-height-hero)",
      radius: "var(--ui-button-radius)",
      padding: "var(--ui-button-padding-hero)",
      border: "2px solid var(--ui-button-border-strong)",
      background: "var(--ui-button-bg)",
      color: "var(--ui-button-text-strong)",
      fontWeight: "var(--ui-button-font-weight-hero)",
      cursor: "pointer",
    },
    standard: {
      className: uiButtonApi.classNames.standard,
      minHeight: "var(--ui-button-height-standard)",
      radius: "var(--ui-button-radius)",
      padding: "var(--ui-button-padding-standard)",
      border: "1px solid var(--ui-button-border-strong)",
      background: "var(--ui-button-bg)",
      color: "var(--ui-button-text)",
      fontWeight: "var(--ui-button-font-weight-standard)",
      cursor: "pointer",
    },
    utility: {
      className: uiButtonApi.classNames.utility,
      minHeight: "var(--ui-button-height-utility)",
      radius: "var(--ui-button-radius)",
      padding: "var(--ui-button-padding-utility)",
      border: "1px solid var(--ui-button-border)",
      background: "var(--ui-button-bg)",
      color: "var(--ui-button-text)",
      fontWeight: "var(--ui-button-font-weight-utility)",
      cursor: "pointer",
    },
    icon: {
      className: uiButtonApi.classNames.icon,
      width: "var(--ui-button-height-icon)",
      minWidth: "var(--ui-button-height-icon)",
      height: "var(--ui-button-height-icon)",
      minHeight: "var(--ui-button-height-icon)",
      radius: "var(--ui-button-radius)",
      padding: 0,
      border: "1px solid var(--ui-button-border)",
      background: "var(--ui-button-bg-tint)",
      color: "var(--ui-button-text)",
      cursor: "pointer",
    },
    primary: {
      className: uiButtonApi.legacyClassNames.primary,
      mapsTo: uiButtonApi.classNames.standard,
      minHeight: "var(--ui-button-height-standard)",
      radius: "var(--ui-button-radius)",
      padding: "var(--ui-button-padding-standard)",
      border: "1px solid var(--ui-button-border-strong)",
      background: "var(--ui-button-bg)",
      color: "var(--ui-button-text-strong)",
      fontWeight: "var(--ui-button-font-weight-standard)",
      cursor: "pointer",
    },
    secondary: {
      className: uiButtonApi.legacyClassNames.secondary,
      mapsTo: uiButtonApi.classNames.utility,
      minHeight: "var(--ui-button-height-utility)",
      radius: "var(--ui-button-radius)",
      padding: "var(--ui-button-padding-utility)",
      border: "1px solid var(--ui-button-border)",
      background: "var(--ui-button-bg)",
      color: "var(--ui-button-text)",
      fontWeight: "var(--ui-button-font-weight-utility)",
      cursor: "pointer",
    },
    danger: {
      className: uiButtonApi.legacyClassNames.danger,
      mapsTo: uiButtonApi.classNames.utility,
      tone: "danger",
      minHeight: "var(--ui-button-height-utility)",
      radius: "var(--ui-button-radius)",
      padding: "var(--ui-button-padding-utility)",
      border: "1px solid var(--ui-button-border)",
      background: "var(--ui-button-bg)",
      color: "var(--ui-color-expense)",
      fontWeight: "var(--ui-button-font-weight-utility)",
      cursor: "pointer",
    },
    menuItem: {
      padding: "var(--ui-button-menu-padding)",
      radius: "var(--ui-radius-none)",
      fontSize: "var(--ui-font-size-body)",
      cursor: "pointer",
    },
    profileMenuItem: {
      padding: "var(--ui-button-profile-menu-padding)",
      radius: "var(--ui-space-3)",
      cursor: "pointer",
    },
  },
  iconButton: {
    default: {
      radius: "var(--ui-button-radius)",
      cursor: "pointer",
    },
    avatar: {
      radius: "50%",
      cursor: "pointer",
    },
  },
  input: {
    s: {
      className: `${uiInputApi.classNames.input} ${uiInputApi.classNames.inputS}`,
      height: "var(--ui-input-height-s)",
      radius: "var(--ui-input-radius)",
      padding: "var(--ui-input-padding-s)",
      border: "var(--ui-input-border)",
      background: "var(--ui-input-bg)",
      color: "var(--ui-input-text)",
      fontSize: "var(--ui-input-font-size-s)",
      outline: "none",
    },
    m: {
      className: `${uiInputApi.classNames.input} ${uiInputApi.classNames.inputM}`,
      height: "var(--ui-input-height-m)",
      radius: "var(--ui-input-radius)",
      padding: "var(--ui-input-padding-m)",
      border: "var(--ui-input-border)",
      background: "var(--ui-input-bg)",
      color: "var(--ui-input-text)",
      fontSize: "var(--ui-input-font-size-m)",
      outline: "none",
    },
    l: {
      className: `${uiInputApi.classNames.input} ${uiInputApi.classNames.inputL}`,
      height: "var(--ui-input-height-l)",
      radius: "var(--ui-input-radius)",
      padding: "var(--ui-input-padding-l)",
      border: "var(--ui-input-border)",
      background: "var(--ui-input-bg)",
      color: "var(--ui-input-text)",
      fontSize: "var(--ui-input-font-size-l)",
      outline: "none",
    },
    search: {
      className: uiInputApi.classNames.searchField,
      height: "var(--ui-search-field-height)",
      radius: "var(--ui-input-radius)",
      padding: "var(--ui-search-field-padding)",
      border: "var(--ui-input-border)",
      background: "var(--ui-input-bg)",
      color: "var(--ui-input-text)",
      fontSize: "var(--ui-input-font-size-m)",
      outline: "none",
    },
    amount: {
      className: uiInputApi.classNames.amountField,
      height: "var(--ui-amount-field-height)",
      radius: "var(--ui-input-radius)",
      padding: "var(--ui-amount-field-padding)",
      border: "var(--ui-input-border)",
      background: "var(--ui-input-bg)",
      color: "var(--ui-input-text)",
      fontSize: "var(--ui-input-font-size-l)",
      outline: "none",
      textAlign: "right",
    },
    amountHero: {
      className: uiInputApi.classNames.amountField,
      variant: uiAmountApi.variant.hero,
      height: "var(--ui-amount-hero-height)",
      radius: "var(--ui-input-radius)",
      padding: "var(--ui-amount-hero-padding)",
      border: "var(--ui-input-border)",
      background: "var(--ui-input-bg)",
      color: "var(--ui-input-text)",
      fontSize: "var(--ui-amount-hero-font-size)",
      fontWeight: "var(--ui-font-weight-bold)",
      outline: "none",
      textAlign: "right",
    },
    textarea: {
      className: uiInputApi.classNames.textarea,
      minHeight: "var(--ui-textarea-min-height)",
      radius: "var(--ui-input-radius)",
      padding: "var(--ui-textarea-padding)",
      border: "var(--ui-input-border)",
      background: "var(--ui-input-bg)",
      color: "var(--ui-input-text)",
      fontSize: "var(--ui-input-font-size-m)",
      outline: "none",
      resize: "vertical",
    },
    modal: {
      className: `${uiInputApi.classNames.input} ${uiInputApi.classNames.inputL}`,
      height: "var(--ui-input-height-lg)",
      radius: "var(--ui-input-radius)",
      padding: "var(--ui-input-padding-md)",
      border: "var(--ui-input-border)",
      background: "var(--ui-input-bg)",
      color: "var(--ui-input-text)",
      fontSize: "var(--ui-font-size-body)",
      outline: "none",
    },
  },
  select: {
    s: {
      className: `${uiInputApi.classNames.select} ${uiInputApi.classNames.inputS}`,
      height: "var(--ui-input-height-s)",
      radius: "var(--ui-input-radius)",
      padding: "var(--ui-input-padding-s)",
      border: "var(--ui-input-border)",
      background: "var(--ui-input-bg)",
      color: "var(--ui-input-text)",
      fontSize: "var(--ui-input-font-size-s)",
      outline: "none",
    },
    m: {
      className: `${uiInputApi.classNames.select} ${uiInputApi.classNames.inputM}`,
      height: "var(--ui-input-height-m)",
      radius: "var(--ui-input-radius)",
      padding: "var(--ui-input-padding-m)",
      border: "var(--ui-input-border)",
      background: "var(--ui-input-bg)",
      color: "var(--ui-input-text)",
      fontSize: "var(--ui-input-font-size-m)",
      outline: "none",
    },
    l: {
      className: `${uiInputApi.classNames.select} ${uiInputApi.classNames.inputL}`,
      height: "var(--ui-input-height-l)",
      radius: "var(--ui-input-radius)",
      padding: "var(--ui-input-padding-l)",
      border: "var(--ui-input-border)",
      background: "var(--ui-input-bg)",
      color: "var(--ui-input-text)",
      fontSize: "var(--ui-input-font-size-l)",
      outline: "none",
    },
    modal: {
      className: `${uiInputApi.classNames.select} ${uiInputApi.classNames.inputL}`,
      height: "var(--ui-select-height-lg)",
      radius: "var(--ui-input-radius)",
      padding: "var(--ui-input-padding-md)",
      border: "var(--ui-input-border)",
      background: "var(--ui-input-bg)",
      color: "var(--ui-input-text)",
      fontSize: "var(--ui-font-size-body)",
      outline: "none",
    },
  },
  checkbox: {
    default: {
      gap: "var(--ui-checkbox-gap)",
    },
    field: {
      gap: "var(--ui-checkbox-gap)",
      minHeight: "var(--ui-checkbox-field-height)",
      padding: "var(--ui-checkbox-field-padding)",
      border: "var(--ui-input-border)",
      radius: "var(--ui-input-radius)",
      background: "var(--ui-input-bg)",
    },
  },
  badge: {
    danger: {
      minWidth: "var(--ui-badge-min-width-sm)",
      height: "var(--ui-badge-height-sm)",
      radius: "var(--ui-badge-radius)",
      background: "var(--ui-color-expense)",
      color: "var(--ui-color-white-text)",
    },
  },
  statusPill: {
    default: {
      attribute: uiStatusPillApi.attributes.root,
      radius: "var(--ui-radius-pill)",
      padding: "0 var(--ui-space-6)",
    },
    success: {
      tone: uiStatusPillApi.tone.success,
      background: "var(--ui-financial-income-soft)",
      color: "var(--ui-financial-income)",
    },
    danger: {
      tone: uiStatusPillApi.tone.danger,
      background: "var(--ui-financial-expense-soft)",
      color: "var(--ui-financial-expense)",
    },
  },
  tag: {
    default: {
      radius: "var(--ui-radius-pill)",
      padding: "var(--ui-space-2) var(--ui-space-4)",
    },
  },
  segmentedControl: {
    default: {
      gap: "var(--ui-space-2)",
      padding: "var(--ui-space-2)",
      radius: "var(--ui-radius-pill)",
    },
  },
} as const;

const uiFloatingLayerOverlayContract = {
  layer: uiZIndex.floatingAction,
  radius: "var(--ui-radius-pill)",
  shadow: "var(--ui-shadow-floating)",
  ownsFocus: false,
  dismissesOnOutsidePointer: false,
} as const;

export const uiBackdropPrimitives = {
  soft: {
    className: uiModalApi.classNames.backdrop,
    tone: uiModalApi.backdrop.soft,
    background: "var(--ui-overlay-backdrop-soft)",
    blur: "var(--ui-overlay-backdrop-blur-soft)",
  },
  standard: {
    className: uiModalApi.classNames.backdrop,
    tone: uiModalApi.backdrop.standard,
    background: "var(--ui-overlay-backdrop)",
    blur: "var(--ui-overlay-backdrop-blur-standard)",
  },
  strong: {
    className: uiModalApi.classNames.backdrop,
    tone: uiModalApi.backdrop.strong,
    background: "var(--ui-overlay-backdrop-strong)",
    blur: "var(--ui-overlay-backdrop-blur-strong)",
  },
} as const;

export const uiModalSizePrimitives = {
  s: {
    className: uiModalApi.classNames.modalS,
    width: "var(--ui-modal-width-s)",
    maxWidth: "var(--ui-modal-max-width-s)",
    maxHeight: "var(--ui-modal-max-height-s)",
  },
  m: {
    className: uiModalApi.classNames.modalM,
    width: "var(--ui-modal-width-m)",
    maxWidth: "var(--ui-modal-max-width-m)",
    maxHeight: "var(--ui-modal-max-height-m)",
  },
  l: {
    className: uiModalApi.classNames.modalL,
    width: "var(--ui-modal-width-l)",
    maxWidth: "var(--ui-modal-max-width-l)",
    maxHeight: "var(--ui-modal-max-height-l)",
  },
  xl: {
    className: uiModalApi.classNames.modalXl,
    width: "var(--ui-modal-width-xl)",
    maxWidth: "var(--ui-modal-max-width-xl)",
    maxHeight: "var(--ui-modal-max-height-xl)",
  },
} as const;

const uiDropdownBasePrimitive = {
  className: uiDropdownApi.classNames.dropdown,
  layer: uiZIndex.dropdown,
  zIndex: "var(--ui-z-dropdown)",
  border: "var(--ui-dropdown-border)",
  radius: "var(--ui-dropdown-radius)",
  background: "var(--ui-surface-dropdown)",
  text: "var(--ui-dropdown-text)",
  shadow: "var(--ui-dropdown-shadow)",
  padding: "var(--ui-dropdown-padding)",
  itemPadding: "var(--ui-dropdown-item-padding)",
  itemHeight: "var(--ui-dropdown-item-height-action)",
  itemFontSize: "var(--ui-dropdown-item-font-size)",
  itemFontWeight: "var(--ui-dropdown-item-font-weight)",
  itemLineHeight: "var(--ui-dropdown-item-line-height)",
  itemHoverBackground: "var(--ui-dropdown-item-hover-background)",
  itemActiveBackground: "var(--ui-dropdown-item-active-background)",
  gap: "var(--ui-dropdown-gap)",
  placementOffset: "var(--ui-dropdown-placement-offset)",
  scrollBehavior: "var(--ui-dropdown-scroll-behavior)",
  dismissesOnOutsidePointer: true,
  dismissesOnEscape: true,
} as const;

export const uiDropdownPrimitives = {
  actionMenu: {
    ...uiDropdownBasePrimitive,
    variantClassName: uiDropdownApi.classNames.action,
    width: "var(--ui-dropdown-width-action)",
    maxWidth: "var(--ui-dropdown-max-width-action)",
    maxHeight: "var(--ui-dropdown-max-height-action)",
    itemHeight: "var(--ui-dropdown-item-height-action)",
    placement: uiDropdownApi.placement.bottom,
    align: uiDropdownApi.align.end,
  },
  selectMenu: {
    ...uiDropdownBasePrimitive,
    variantClassName: uiDropdownApi.classNames.select,
    width: "var(--ui-dropdown-width-select)",
    maxWidth: "var(--ui-dropdown-max-width-select)",
    maxHeight: "var(--ui-dropdown-max-height-select)",
    itemHeight: "var(--ui-dropdown-item-height-select)",
    placement: uiDropdownApi.placement.bottom,
    align: uiDropdownApi.align.start,
  },
  searchableDropdown: {
    ...uiDropdownBasePrimitive,
    variantClassName: uiDropdownApi.classNames.searchable,
    width: "var(--ui-dropdown-width-searchable)",
    maxWidth: "var(--ui-dropdown-max-width-searchable)",
    maxHeight: "var(--ui-dropdown-max-height-searchable)",
    itemHeight: "var(--ui-dropdown-item-height-searchable)",
    searchClassName: uiDropdownApi.classNames.search,
    placement: uiDropdownApi.placement.bottom,
    align: uiDropdownApi.align.start,
  },
  autocomplete: {
    ...uiDropdownBasePrimitive,
    variantClassName: uiDropdownApi.classNames.autocomplete,
    layer: uiZIndex.popover,
    zIndex: "var(--ui-z-popover)",
    width: "var(--ui-dropdown-width-autocomplete)",
    maxWidth: "var(--ui-dropdown-max-width-autocomplete)",
    maxHeight: "var(--ui-dropdown-max-height-autocomplete)",
    itemHeight: "var(--ui-dropdown-item-height-autocomplete)",
    placement: uiDropdownApi.placement.bottom,
    align: uiDropdownApi.align.start,
  },
  contextMenu: {
    ...uiDropdownBasePrimitive,
    variantClassName: uiDropdownApi.classNames.context,
    width: "var(--ui-dropdown-width-context)",
    maxWidth: "var(--ui-dropdown-max-width-context)",
    maxHeight: "var(--ui-dropdown-max-height-context)",
    itemHeight: "var(--ui-dropdown-item-height-context)",
    placement: uiDropdownApi.placement.context,
    align: uiDropdownApi.align.start,
  },
  utilityPopover: {
    className: uiModalApi.classNames.popover,
    layer: uiZIndex.popover,
    zIndex: "var(--ui-z-popover)",
    radius: "var(--ui-radius-sm)",
    background: "var(--ui-surface-dropdown)",
    shadow: "var(--ui-shadow-popover)",
    padding: "var(--ui-overlay-popover-padding)",
    bodyOverflow: "var(--ui-popover-body-overflow)",
    variantClassName: uiDropdownApi.classNames.utilityPopover,
    width: "var(--ui-dropdown-width-utility)",
    maxWidth: "var(--ui-dropdown-max-width-utility)",
    maxHeight: "var(--ui-dropdown-max-height-utility)",
    itemHeight: "var(--ui-dropdown-item-height-utility)",
    itemPadding: "var(--ui-dropdown-item-padding)",
    gap: "var(--ui-dropdown-gap)",
    placement: uiDropdownApi.placement.bottom,
    align: uiDropdownApi.align.end,
    dismissesOnOutsidePointer: true,
    dismissesOnEscape: true,
  },
} as const;

export const uiOverlayContracts = {
  modal: {
    className: uiModalApi.classNames.modal,
    layer: uiZIndex.modal,
    width: "100%",
    maxWidth: "var(--ui-modal-max-width-m)",
    maxHeight: "var(--ui-modal-max-height-m)",
    radius: "var(--ui-modal-radius)",
    shadow: "var(--ui-shadow-modal)",
    padding: "var(--ui-overlay-modal-padding)",
    backdrop: "var(--ui-overlay-backdrop)",
    bodyOverflow: "var(--ui-modal-body-overflow)",
    headerPadding: "var(--ui-modal-header-padding)",
    bodyPadding: "var(--ui-modal-body-padding)",
    footerPadding: "var(--ui-modal-footer-padding)",
    closeArea: "var(--ui-modal-close-area)",
    ownsFocus: true,
    dismissesOnBackdrop: true,
  },
  dropdown: {
    className: uiDropdownApi.classNames.dropdown,
    layer: uiZIndex.dropdown,
    width: "var(--ui-dropdown-width-action)",
    maxWidth: "var(--ui-dropdown-max-width-action)",
    maxHeight: "var(--ui-dropdown-max-height-action)",
    radius: "var(--ui-dropdown-radius)",
    text: "var(--ui-dropdown-text)",
    shadow: "var(--ui-shadow-dropdown)",
    padding: "var(--ui-overlay-dropdown-padding)",
    itemHeight: "var(--ui-dropdown-item-height-action)",
    itemPadding: "var(--ui-dropdown-item-padding)",
    itemFontSize: "var(--ui-dropdown-item-font-size)",
    itemFontWeight: "var(--ui-dropdown-item-font-weight)",
    itemLineHeight: "var(--ui-dropdown-item-line-height)",
    itemHoverBackground: "var(--ui-dropdown-item-hover-background)",
    itemActiveBackground: "var(--ui-dropdown-item-active-background)",
    gap: "var(--ui-dropdown-gap)",
    placementOffset: "var(--ui-dropdown-placement-offset)",
    bodyOverflow: "var(--ui-dropdown-scroll-behavior)",
    ownsFocus: false,
    dismissesOnOutsidePointer: true,
    dismissesOnEscape: true,
  },
  popover: {
    className: uiModalApi.classNames.popover,
    layer: uiZIndex.popover,
    width: "var(--ui-popover-width)",
    minWidth: "var(--ui-popover-min-width)",
    maxWidth: "var(--ui-popover-max-width)",
    maxHeight: "var(--ui-popover-max-height)",
    radius: "var(--ui-radius-sm)",
    shadow: "var(--ui-shadow-popover)",
    padding: "var(--ui-overlay-popover-padding)",
    bodyOverflow: "var(--ui-popover-body-overflow)",
    ownsFocus: false,
    dismissesOnOutsidePointer: true,
  },
  sidePanel: {
    layer: uiZIndex.sidePanel,
    backdropLayer: uiZIndex.sidePanelOverlay,
    radius: "var(--ui-panel-radius)",
    shadow: "var(--ui-shadow-panel)",
    ownsFocus: false,
    dismissesOnBackdrop: true,
  },
  drawer: {
    className: uiModalApi.classNames.drawer,
    layer: uiZIndex.drawer,
    width: "var(--ui-drawer-panel-width)",
    maxWidth: "var(--ui-drawer-panel-max-width)",
    maxHeight: "var(--ui-drawer-panel-max-height)",
    radius: "var(--ui-panel-radius)",
    shadow: "var(--ui-shadow-panel)",
    padding: "var(--ui-overlay-drawer-padding)",
    bodyOverflow: "var(--ui-drawer-panel-body-overflow)",
    ownsFocus: true,
    dismissesOnBackdrop: true,
  },
  workspaceOverlay: {
    className: uiModalApi.classNames.workspaceOverlay,
    layer: uiZIndex.panel,
    width: "var(--ui-workspace-overlay-width)",
    maxWidth: "var(--ui-workspace-overlay-max-width)",
    maxHeight: "var(--ui-workspace-overlay-max-height)",
    radius: "var(--ui-panel-radius)",
    shadow: "var(--ui-shadow-panel)",
    padding: "var(--ui-overlay-workspace-padding)",
    bodyOverflow: "var(--ui-workspace-overlay-body-overflow)",
    ownsFocus: true,
    dismissesOnBackdrop: true,
  },
  toast: {
    layer: uiZIndex.toast,
    radius: "var(--ui-radius-xl)",
    shadow: "var(--ui-shadow-popover)",
    ownsFocus: false,
    dismissesOnOutsidePointer: false,
  },
  tooltip: {
    layer: uiZIndex.popover,
    radius: "var(--ui-radius-sm)",
    shadow: "var(--ui-shadow-subtle)",
    ownsFocus: false,
    dismissesOnOutsidePointer: false,
  },
  floatingLayer: uiFloatingLayerOverlayContract,
  floatingActions: uiFloatingLayerOverlayContract,
} as const;

export const uiOverlayPrimitives = {
  modal: uiOverlayContracts.modal,
  modalS: {
    ...uiOverlayContracts.modal,
    ...uiModalSizePrimitives.s,
  },
  modalM: {
    ...uiOverlayContracts.modal,
    ...uiModalSizePrimitives.m,
  },
  modalL: {
    ...uiOverlayContracts.modal,
    ...uiModalSizePrimitives.l,
  },
  modalXl: {
    ...uiOverlayContracts.modal,
    ...uiModalSizePrimitives.xl,
  },
  modalBase: {
    ...uiOverlayContracts.modal,
    layer: uiZIndex.modalBase,
  },
  modalRaised: {
    ...uiOverlayContracts.modal,
    layer: uiZIndex.modalRaised,
  },
  modalPrompt: {
    ...uiOverlayContracts.modal,
    layer: uiZIndex.modalPrompt,
    backdrop: "var(--ui-overlay-backdrop-prompt)",
  },
  dropdown: uiOverlayContracts.dropdown,
  actionMenu: uiDropdownPrimitives.actionMenu,
  selectMenu: uiDropdownPrimitives.selectMenu,
  searchableDropdown: uiDropdownPrimitives.searchableDropdown,
  autocomplete: uiDropdownPrimitives.autocomplete,
  contextMenu: uiDropdownPrimitives.contextMenu,
  utilityPopover: uiDropdownPrimitives.utilityPopover,
  dropdownRaised: {
    ...uiOverlayContracts.dropdown,
    layer: uiZIndex.dropdownRaised,
    shadow: "var(--ui-overlay-dropdown-shadow-tight)",
  },
  profileDropdown: {
    ...uiOverlayContracts.dropdown,
    layer: uiZIndex.profileMenu,
    radius: "var(--ui-radius-sm)",
  },
  popover: uiOverlayContracts.popover,
  inlinePopover: {
    ...uiOverlayContracts.popover,
    layer: uiZIndex.sticky,
    shadow: "var(--ui-shadow-dropdown)",
  },
  drawer: uiOverlayContracts.drawer,
  sidePanel: uiOverlayContracts.sidePanel,
  workspaceOverlay: uiOverlayContracts.workspaceOverlay,
  backdropSoft: uiBackdropPrimitives.soft,
  backdropStandard: uiBackdropPrimitives.standard,
  backdropStrong: uiBackdropPrimitives.strong,
  toast: uiOverlayContracts.toast,
  floatingLayer: uiOverlayContracts.floatingLayer,
  floatingActions: uiOverlayContracts.floatingActions,
} as const;

export type UiZIndexToken = keyof typeof uiZIndex;
export type UiLayoutPrimitive = keyof typeof uiLayoutPrimitives;
export type UiSurfacePrimitive = keyof typeof uiSurfacePrimitives;
export type UiSurfaceLevel = keyof typeof uiSurfaceApi.level;
export type UiSurfaceDensity = keyof typeof uiSurfaceApi.density;
export type UiModalSize = keyof typeof uiModalSizePrimitives;
export type UiBackdropTone = keyof typeof uiBackdropPrimitives;
export type UiDropdownPrimitive = keyof typeof uiDropdownPrimitives;
export type UiDropdownPlacement = keyof typeof uiDropdownApi.placement;
export type UiDropdownAlign = keyof typeof uiDropdownApi.align;
export type UiListRowPrimitive = keyof typeof uiListRowPrimitives;
export type UiFormPrimitive = keyof typeof uiFormPrimitives;
export type UiPickerPrimitive = keyof typeof uiPickerPrimitives;
export type UiCreatorPrimitive = keyof typeof uiCreatorPrimitives;
export type UiSeparatorPrimitive = keyof typeof uiSeparatorPrimitives;
export type UiSectionRecordPrimitive = keyof typeof uiSectionRecordPrimitives;
export type UiRowKind = keyof typeof uiListRowApi.kind;
export type UiRowState = keyof typeof uiListRowApi.state;
export type UiRowDensity = keyof typeof uiListRowApi.density;
export type UiOverlayKind = keyof typeof uiOverlayContracts;
export type UiOverlayPrimitive = keyof typeof uiOverlayPrimitives;

// Foundation large module public API v1 — visual rules and contracts.
export const uiSupportingTokens = {
  blue: {
    surface: "var(--ui-support-blue-surface)",
    border: "var(--ui-support-blue-border)",
    text: "var(--ui-support-blue-text)",
  },
  sky: {
    surface: "var(--ui-support-sky-surface)",
    border: "var(--ui-support-sky-border)",
    text: "var(--ui-support-sky-text)",
  },
  cyan: {
    surface: "var(--ui-support-cyan-surface)",
    border: "var(--ui-support-cyan-border)",
    text: "var(--ui-support-cyan-text)",
  },
  teal: {
    surface: "var(--ui-support-teal-surface)",
    border: "var(--ui-support-teal-border)",
    text: "var(--ui-support-teal-text)",
  },
  mint: {
    surface: "var(--ui-support-mint-surface)",
    border: "var(--ui-support-mint-border)",
    text: "var(--ui-support-mint-text)",
  },
  olive: {
    surface: "var(--ui-support-olive-surface)",
    border: "var(--ui-support-olive-border)",
    text: "var(--ui-support-olive-text)",
  },
  slate: {
    surface: "var(--ui-support-slate-surface)",
    border: "var(--ui-support-slate-border)",
    text: "var(--ui-support-slate-text)",
  },
} as const;

/** @deprecated Use uiSupportingTokens. Kept as a source-compatibility bridge. */
export const uiNeutralAccentTokens = uiSupportingTokens;

export const uiCollapsibleSecondarySectionApi = {
  attributes: {
    root: "data-ui-collapsible-secondary-section",
    trigger: "data-ui-collapsible-secondary-trigger",
    main: "data-ui-collapsible-secondary-main",
    icon: "data-ui-collapsible-secondary-icon",
    copy: "data-ui-collapsible-secondary-copy",
    chevron: "data-ui-collapsible-secondary-chevron",
    content: "data-ui-collapsible-secondary-content",
    collapsed: "data-ui-collapsed",
    density: "data-ui-density",
  },
  states: {
    collapsed: "true",
    expanded: "false",
  },
  purpose:
    "Lekka rozwijana belka dla wymaganych, ale drugorzędnych sekcji w dużych modułach, gdy pełna sekcja spycha główną zawartość za nisko.",
} as const;

export const uiLargeModuleApi = {
  module: "data-ui-large-module",
  heroHeader: "data-ui-hero-header",
  heroHeaderIcon: "data-ui-hero-header-icon",
  heroHeaderCopy: "data-ui-hero-header-copy",
  heroHeaderActions: "data-ui-hero-header-actions",
  section: "data-ui-large-section",
  sectionHeader: "data-ui-large-section-header",
  sectionHeaderIcon: "data-ui-large-section-header-icon",
  sectionHeaderCopy: "data-ui-large-section-header-copy",
  sectionHeaderTrailing: "data-ui-large-section-header-trailing",
  collapsibleSecondarySection: "data-ui-collapsible-secondary-section",
  collapsibleSecondaryTrigger: "data-ui-collapsible-secondary-trigger",
  collapsibleSecondaryContent: "data-ui-collapsible-secondary-content",
  collapsibleSecondaryState: "data-ui-collapsed",
  heavyDivider: "data-ui-heavy-divider",
  recordList: "data-ui-large-record-list",
  record: "data-ui-large-record",
  recordIdentity: "data-ui-large-record-identity",
  recordIdentityCopy: "data-ui-large-record-identity-copy",
  recordTitle: "data-ui-large-record-title",
  recordMeta: "data-ui-large-record-meta",
  metricGroup: "data-ui-metric-group",
  metricColumns: "data-ui-metric-columns",
  metricCard: "data-ui-metric-card",
  metricLabel: "data-ui-metric-card-label",
  metricValue: "data-ui-metric-card-value",
  metricDetail: "data-ui-metric-card-detail",
  metricProgress: "data-ui-metric-card-progress",
  metricProgressFill: "data-ui-metric-card-progress-fill",
  actionGroup: "data-ui-action-group",
  actionStack: "data-ui-action-stack",
  settingsStrip: "data-ui-settings-strip",
  settingsStripField: "data-ui-settings-strip-field",
  settingsStripLabel: "data-ui-settings-strip-label",
  settingsStripControl: "data-ui-settings-strip-control",
  settingsStripActions: "data-ui-settings-strip-actions",
  heroIconRole: 'data-ui-icon-role="large-record-hero"',
} as const;

export const uiMetricToneApi = {
  supportBlue: "support-blue",
  supportSky: "support-sky",
  supportCyan: "support-cyan",
  supportTeal: "support-teal",
  supportMint: "support-mint",
  supportOlive: "support-olive",
  supportSlate: "support-slate",
  success: "success",
  danger: "danger",
} as const;

export const uiHelpPatternApi = {
  tooltip: "Short contextual help hidden behind a help icon.",
  description: "Short visible section context that helps scan the screen.",
  infoBanner:
    "Visible explanation for advanced logic or important persistent context.",
  statusBanner: "Visible success, warning, danger or info state feedback.",
} as const;

export type UiSupportingToken = keyof typeof uiSupportingTokens;
/** @deprecated Use UiSupportingToken. */
export type UiNeutralAccentToken = UiSupportingToken;
export type UiMetricTone = keyof typeof uiMetricToneApi;
export type UiLargeModuleApiKey = keyof typeof uiLargeModuleApi;
export type UiCreatorApiKey = keyof typeof uiCreatorApi;

// Foundation Core v5 — public presentation contracts.
// These replace local hero/header/action/layout contracts during v5 migration.
export const uiDensityV5 = {
  compact: "compact",
  regular: "regular",
  comfort: "comfort",
} as const;

export const uiActionApiV5 = {
  attributes: {
    action: "data-ui-action",
    width: "data-ui-action-width",
    tone: "data-ui-action-tone",
    density: "data-ui-density",
  },
  variant: {
    primary: "primary",
    secondary: "secondary",
    danger: "danger",
    icon: "icon",
  },
  width: {
    auto: "auto",
    wide: "wide",
    full: "full",
  },
} as const;

export const uiHeroHeaderApiV5 = {
  root: "data-ui-hero-header",
  variant: "data-ui-hero-variant",
  density: "data-ui-density",
  main: "data-ui-hero-main",
  icon: "data-ui-hero-icon",
  copy: "data-ui-hero-copy",
  actions: "data-ui-hero-actions",
} as const;

export const uiSectionHeaderApiV5 = {
  root: "data-ui-section-header-v5",
  density: "data-ui-density",
  main: "data-ui-section-header-main",
  icon: "data-ui-section-header-icon-v5",
  copy: "data-ui-section-header-copy-v5",
  trailing: "data-ui-section-header-trailing-v5",
} as const;

export const uiModalSurfaceApiV5 = {
  root: "data-ui-modal-surface",
  size: "data-ui-modal-size",
  density: "data-ui-density",
  layer: "data-ui-modal-layer",
} as const;

export const uiVisualIndentationLevels = {
  hero: {
    attribute: 'data-ui-indent-level="hero"',
    role: "Hero Header axis. Used only for the module or creator header.",
  },
  section: {
    attribute: 'data-ui-indent-level="section"',
    role: "Section axis. Used by SectionHeader and CollapsibleSecondarySection; icons align even when one section is inside a tonal bar.",
  },
  record: {
    attribute: 'data-ui-indent-level="record"',
    role: "Record axis. Used by LargeRecord and list cards; icon axis sits one hierarchy level deeper than section icons.",
  },
} as const;

export const uiCollapsibleSecondarySectionPattern = {
  primitive: "CollapsibleSecondarySection",
  purpose:
    "Required but secondary content that would otherwise push the main module content too low.",
  rule: "Do not shrink inner controls. Collapse the secondary section and keep the primary content visually dominant.",
  color:
    "Smart Color by Section: the tonal background inherits the section tone.",
  hierarchy: "It is a section header variant, not a card.",
  disclosure:
    "Small sideways chevron for collapsed state; rotates when expanded.",
  copy: "Use either a description or a help tooltip. Do not duplicate the same explanation in both places.",
} as const;
