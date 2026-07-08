"use client";

import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PaymentMethodType, PaymentSource, PaymentSourceType, Transaction } from "../lib/budgetPageTypes";
import {
  getUiColor,
  type UiColorKey,
  type UiIconKey,
} from "../lib/userAppearance";
import {
  getPaymentSourceColorTone,
  getPaymentSourceIconKey,
  getPaymentMethodTypeOption,
  PAYMENT_METHOD_TYPE_OPTIONS,
  PAYMENT_SOURCE_SORT_OPTIONS,
  PaymentSourceSortMode,
  PaymentSourceListKind,
} from "../lib/paymentSources";
import CategoryIcon from "./CategoryIcon";
import FoundationColorPicker from "./ui/FoundationColorPicker";
import FoundationIconPicker from "./ui/FoundationIconPicker";
import ManagementModuleShell from "./ui/ManagementModuleShell";
import { useManagementScreenStack } from "./ui/useManagementScreenStack";
import { EmptyState } from "./utility-panels/utilityPanelPrimitives";
import {
  CollapsibleSecondarySection,
  CreatorModal,
  CreatorSection,
  CreatorSummaryCard,
  DangerAction,
  FormField,
  HeroHeader,
  IconAction,
  ManagementSelect,
  PrimaryAction,
  SecondaryAction,
  SectionHeader,
} from "./ui/FoundationPrimitives";

type PaymentSourceStats = {
  sourceId: string;
  incomeTotal: number;
  expenseTotal: number;
  transactionCount: number;
  lastUsedAt: string | null;
};

type PaymentSourceTotals = {
  incomeTotal: number;
  expenseTotal: number;
  transactionCount: number;
};

type PaymentSourceSettings = {
  defaultIncomePaymentSourceId: string | null;
  defaultExpensePaymentSourceId: string | null;
  showIncomePaymentSource: boolean;
  showExpensePaymentSource: boolean;
};

type Props = {
  paymentSources: PaymentSource[];
  paymentSourceStats: PaymentSourceStats[];
  paymentSourceSettings: PaymentSourceSettings;
  paymentSourceTransactionsById: Record<string, Transaction[]>;
  onSave: (input: {
    id?: string;
    allowArchivedDuplicateName?: boolean;
    name: string;
    type: PaymentSourceType;
    paymentMethodType: PaymentMethodType;
    emoji: string;
    color: string;
    isIncomeSource: boolean;
    isExpenseSource: boolean;
  }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRestore: (id: string) => Promise<void>;
  onSetDefault: (
    kind: PaymentSourceListKind,
    id: string | null,
  ) => Promise<void>;
  onSetFieldVisibility: (
    kind: PaymentSourceListKind,
    isVisible: boolean,
  ) => Promise<void>;
  onCopyList: (
    sourceKind: PaymentSourceListKind,
    targetKind: PaymentSourceListKind,
  ) => Promise<void>;
  openCreateRequest?: number;
  onCloseModule?: () => void;
  styles: Record<string, CSSProperties>;
};

type PaymentSourceDraft = {
  id?: string;
  name: string;
  type: PaymentSourceType;
  paymentMethodType: PaymentMethodType;
  icon: UiIconKey;
  color: UiColorKey;
  isIncomeSource: boolean;
  isExpenseSource: boolean;
};

const DEFAULT_DRAFT: PaymentSourceDraft = {
  name: "",
  type: "card",
  paymentMethodType: "other",
  icon: "card",
  color: "blue",
  isIncomeSource: true,
  isExpenseSource: true,
};

const SUGGESTED_PAYMENT_SOURCE_ICONS: UiIconKey[] = [
  "card",
  "cash",
  "bank",
  "savings",
  "gift",
  "more",
];

const inferPaymentSourceTypeFromIcon = (icon: UiIconKey): PaymentSourceType => {
  if (icon === "cash") {
    return "cash";
  }

  if (icon === "card") {
    return "card";
  }

  if (["bank", "savings", "investments"].includes(icon)) {
    return "account";
  }

  return "other";
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 2,
  }).format(value);

const formatCompactCurrency = (value: number) => {
  const absoluteValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  const formatDecimal = (input: number) =>
    new Intl.NumberFormat("pl-PL", {
      maximumFractionDigits: input >= 10 ? 0 : 1,
      minimumFractionDigits: 0,
    }).format(input);

  if (absoluteValue >= 1_000_000_000) {
    return `${sign}${formatDecimal(absoluteValue / 1_000_000_000)} mld zł`;
  }

  if (absoluteValue >= 1_000_000) {
    return `${sign}${formatDecimal(absoluteValue / 1_000_000)} mln zł`;
  }

  if (absoluteValue >= 100_000) {
    return `${sign}${formatDecimal(absoluteValue / 1_000)} tys. zł`;
  }

  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 2,
  }).format(value);
};

const formatCompactNumber = (value: number) =>
  new Intl.NumberFormat("pl-PL", {
    notation: Math.abs(value) >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: Math.abs(value) >= 10_000 ? 1 : 0,
  }).format(value);

const calculateShare = (value: number, total: number) => {
  if (!Number.isFinite(value) || !Number.isFinite(total) || total <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, Math.round((Math.abs(value) / Math.abs(total)) * 100)),
  );
};

const buildPaymentSourceTotals = (
  sources: PaymentSource[],
  statsById: Record<string, PaymentSourceStats>,
): PaymentSourceTotals => {
  return sources.reduce<PaymentSourceTotals>(
    (totals, source) => {
      const stats = statsById[source.id];

      if (!stats) {
        return totals;
      }

      return {
        incomeTotal: totals.incomeTotal + Math.max(0, stats.incomeTotal),
        expenseTotal: totals.expenseTotal + Math.max(0, stats.expenseTotal),
        transactionCount:
          totals.transactionCount + Math.max(0, stats.transactionCount),
      };
    },
    {
      incomeTotal: 0,
      expenseTotal: 0,
      transactionCount: 0,
    },
  );
};

const sortPaymentSources = (
  sources: PaymentSource[],
  statsById: Record<string, PaymentSourceStats>,
  mode: PaymentSourceSortMode,
) => {
  if (mode === "manual") return [...sources];

  return [...sources].sort((firstSource, secondSource) => {
    const firstStats = statsById[firstSource.id];
    const secondStats = statsById[secondSource.id];
    const usageDifference =
      mode === "transactions_count_desc"
        ? (secondStats?.transactionCount || 0) - (firstStats?.transactionCount || 0)
        : mode === "expenses_amount_desc"
          ? (secondStats?.expenseTotal || 0) - (firstStats?.expenseTotal || 0)
          : mode === "income_amount_desc"
            ? (secondStats?.incomeTotal || 0) - (firstStats?.incomeTotal || 0)
            : mode === "last_used_desc"
              ? (secondStats?.lastUsedAt || "").localeCompare(firstStats?.lastUsedAt || "")
              : 0;

    if (usageDifference !== 0) {
      return usageDifference;
    }

    return firstSource.name.localeCompare(secondSource.name, "pl-PL", {
      sensitivity: "base",
    });
  });
};

const normalizeName = (value: string) =>
  value.trim().toLocaleLowerCase("pl-PL");

const HelpHint = ({ label }: { label: string }) => (
  <span
    data-ui-help="true"
    tabIndex={0}
    aria-label={label}
    data-tooltip={label}
  />
);

export default function PaymentSourcesPanel({
  paymentSources,
  paymentSourceStats,
  paymentSourceSettings,
  paymentSourceTransactionsById,
  onSave,
  onDelete,
  onRestore,
  onSetDefault,
  openCreateRequest,
  onCloseModule = () => undefined,
}: Props) {
  const [draft, setDraft] = useState<PaymentSourceDraft>(DEFAULT_DRAFT);
  const [settingsDraft, setSettingsDraft] = useState(paymentSourceSettings);
  const [activeList, setActiveList] = useState<"active" | "archived">("active");
  const [methodFilter, setMethodFilter] = useState<PaymentMethodType | "all">("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "income" | "expense">("all");
  const [sortMode, setSortMode] = useState<PaymentSourceSortMode>("manual");
  const [isDefaultSourcesCollapsed, setIsDefaultSourcesCollapsed] =
    useState(true);
  const [activePicker, setActivePicker] = useState<"color" | "icon" | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isConfigSaving, setIsConfigSaving] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [errorText, setErrorText] = useState("");
  const [duplicateSourceId, setDuplicateSourceId] = useState<string | null>(
    null,
  );
  const previousOpenCreateRequestRef = useRef(openCreateRequest);
  const {
    currentScreen: screen,
    canGoBack,
    pushScreen,
    goBack,
  } = useManagementScreenStack();
  const isFormOpen = screen.name === "create" || screen.name === "edit";
  const selectedSourceDetailsId = screen.name === "details" ? screen.recordId : null;

  useEffect(() => {
    setSettingsDraft(paymentSourceSettings);
  }, [paymentSourceSettings]);

  const statsById = useMemo(() => {
    return paymentSourceStats.reduce<Record<string, PaymentSourceStats>>(
      (acc, item) => {
        acc[item.sourceId] = item;
        return acc;
      },
      {},
    );
  }, [paymentSourceStats]);

  const activeSources = useMemo(
    () =>
      sortPaymentSources(
        paymentSources
          .filter((source) => !source.archived_at)
          .filter((source) => methodFilter === "all" || (source.payment_method_type || "other") === methodFilter)
          .filter((source) => availabilityFilter === "all" || (availabilityFilter === "income" ? source.is_income_source !== false : source.is_expense_source !== false)),
        statsById,
        sortMode,
      ),
    [availabilityFilter, methodFilter, paymentSources, sortMode, statsById],
  );
  const archivedSources = useMemo(
    () =>
      sortPaymentSources(
        paymentSources
          .filter((source) => Boolean(source.archived_at))
          .filter((source) => methodFilter === "all" || (source.payment_method_type || "other") === methodFilter),
        statsById,
        sortMode,
      ),
    [methodFilter, paymentSources, sortMode, statsById],
  );

  const incomeSources = activeSources.filter(
    (source) => source.is_income_source !== false,
  );
  const expenseSources = activeSources.filter(
    (source) => source.is_expense_source !== false,
  );
  const duplicateSource = duplicateSourceId
    ? paymentSources.find((source) => source.id === duplicateSourceId) || null
    : null;

  const activeSourceTotals = useMemo(
    () => buildPaymentSourceTotals(activeSources, statsById),
    [activeSources, statsById],
  );
  const archivedSourceTotals = useMemo(
    () => buildPaymentSourceTotals(archivedSources, statsById),
    [archivedSources, statsById],
  );

  const selectedSourceDetails = selectedSourceDetailsId
    ? paymentSources.find((source) => source.id === selectedSourceDetailsId) || null
    : null;

  const closeForm = () => {
    setDraft(DEFAULT_DRAFT);
    setActivePicker(null);
    setErrorText("");
    setDuplicateSourceId(null);
    goBack();
  };

  const openNewForm = useCallback(() => {
    setDraft(DEFAULT_DRAFT);
    setStatusText("");
    setErrorText("");
    setDuplicateSourceId(null);
    setActivePicker(null);
    pushScreen({ name: "create" });
  }, [pushScreen]);

  useEffect(() => {
    if (
      openCreateRequest === undefined ||
      previousOpenCreateRequestRef.current === openCreateRequest
    ) {
      return;
    }

    previousOpenCreateRequestRef.current = openCreateRequest;
    openNewForm();
  }, [openCreateRequest, openNewForm]);

  const openSourceDetails = (source: PaymentSource) => {
    pushScreen({ name: "details", recordId: source.id });
  };

  const openEditForm = (source: PaymentSource) => {
    setDraft({
      id: source.id,
      name: source.name,
      type: source.type,
      paymentMethodType: source.payment_method_type || "other",
      icon: getPaymentSourceIconKey(source),
      color: getPaymentSourceColorTone(source),
      isIncomeSource: source.is_income_source !== false,
      isExpenseSource: source.is_expense_source !== false,
    });
    setStatusText("");
    setErrorText("");
    setDuplicateSourceId(null);
    setActivePicker(null);
    pushScreen({ name: "edit", recordId: source.id });
  };

  const handleScreenBack = () => {
    if (isFormOpen) {
      setDraft(DEFAULT_DRAFT);
      setActivePicker(null);
      setErrorText("");
      setDuplicateSourceId(null);
    }
    goBack();
  };

  const isSettingsDirty =
    settingsDraft.defaultIncomePaymentSourceId !==
      paymentSourceSettings.defaultIncomePaymentSourceId ||
    settingsDraft.defaultExpensePaymentSourceId !==
      paymentSourceSettings.defaultExpensePaymentSourceId;

  const saveSettingsDraft = async () => {
    setIsConfigSaving(true);
    setStatusText("");
    setErrorText("");

    try {
      await onSetDefault("income", settingsDraft.defaultIncomePaymentSourceId);
      await onSetDefault(
        "expense",
        settingsDraft.defaultExpensePaymentSourceId,
      );
      setStatusText("Zapisano ustawienia źródeł płatności.");
    } catch (error) {
      setErrorText(
        error instanceof Error
          ? error.message
          : "Nie udało się zapisać ustawień źródeł płatności.",
      );
    } finally {
      setIsConfigSaving(false);
    }
  };

  const saveDraft = async (allowArchivedDuplicateName = false) => {
    const trimmedName = draft.name.trim();

    if (!trimmedName) {
      setErrorText("Wpisz nazwę źródła.");
      return;
    }

    if (!draft.isIncomeSource && !draft.isExpenseSource) {
      setErrorText(
        "Źródło musi być dostępne przynajmniej dla przychodów albo wydatków.",
      );
      return;
    }

    const duplicateCandidates = paymentSources.filter((source) => {
      if (draft.id && source.id === draft.id) {
        return false;
      }

      return normalizeName(source.name) === normalizeName(trimmedName);
    });
    const duplicate =
      duplicateCandidates.find((source) => !source.archived_at) ||
      duplicateCandidates[0];

    if (duplicate && (!allowArchivedDuplicateName || !duplicate.archived_at)) {
      setDuplicateSourceId(duplicate.id);
      setErrorText("");
      return;
    }

    setDuplicateSourceId(null);
    setIsSaving(true);
    setErrorText("");

    try {
      await onSave({
        id: draft.id,
        allowArchivedDuplicateName,
        name: trimmedName,
        type: draft.type,
        paymentMethodType: draft.paymentMethodType,
        emoji: draft.icon,
        color: draft.color,
        isIncomeSource: draft.isIncomeSource,
        isExpenseSource: draft.isExpenseSource,
      });
      closeForm();
      setStatusText(
        draft.id ? "Zapisano źródło płatności." : "Dodano źródło płatności.",
      );
    } catch (error) {
      setErrorText(
        error instanceof Error
          ? error.message
          : "Nie udało się zapisać źródła płatności.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const deleteSource = async (source: PaymentSource) => {
    const stats = statsById[source.id];
    const hasHistory = Boolean(stats?.transactionCount);

    setIsSaving(true);
    setStatusText("");
    setErrorText("");

    try {
      await onDelete(source.id);
      setStatusText(
        hasHistory
          ? "Źródło ma historię, więc zostało zarchiwizowane i nie pojawi się przy nowych wpisach."
          : "Usunięto źródło płatności.",
      );
    } catch (error) {
      setErrorText(
        error instanceof Error
          ? error.message
          : "Nie udało się usunąć źródła płatności.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const restoreSource = async (
    source: PaymentSource,
    closeAfterRestore = false,
  ) => {
    setIsSaving(true);
    setStatusText("");
    setErrorText("");

    try {
      await onRestore(source.id);
      if (closeAfterRestore) {
        closeForm();
      }
      setActiveList("active");
      setStatusText("Przywrócono źródło płatności.");
    } catch (error) {
      setErrorText(
        error instanceof Error
          ? error.message
          : "Nie udało się przywrócić źródła płatności.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const renderAvailability = (label: string, isActive: boolean) => (
    <span
      data-ui-status-pill="true"
      data-ui-pill-shape="soft-rect"
      data-ui-compact="icon-only"
      data-ui-tone={isActive ? "success" : "danger"}
      data-active={isActive ? "true" : "false"}
      aria-label={label}
      title={label}
    >
      <span aria-hidden="true">{isActive ? "↑" : "↓"}</span>
      <span data-ui-visually-hidden="true">{label}</span>
    </span>
  );

  const renderMetric = (input: {
    iconKey: string;
    label: string;
    percent: number;
    detail: string;
    tone?:
      | "neutral-blue"
      | "success"
      | "danger";
    title?: string;
  }) => (
    <span
      data-ui-metric-card="true"
      data-ui-tone={input.tone || "neutral-blue"}
      title={input.title}
      style={{ "--ui-metric-progress": `${input.percent}%` } as CSSProperties}
    >
      <span data-ui-metric-card-label="true">
        <CategoryIcon iconKey={input.iconKey} size="small" />
        <span>{input.label}</span>
      </span>
      <strong data-ui-metric-card-value="true">{input.percent}%</strong>
      <span data-ui-metric-card-detail="true">{input.detail}</span>
      <span data-ui-metric-card-progress="true" aria-hidden="true">
        <span data-ui-metric-card-progress-fill="true" />
      </span>
    </span>
  );

  const renderColorPicker = () => {
    return (
      <FoundationColorPicker
        value={draft.color}
        isOpen={activePicker === "color"}
        onOpenChange={(isOpen) => setActivePicker(isOpen ? "color" : null)}
        onChange={(color) =>
          setDraft((currentDraft) => ({ ...currentDraft, color }))
        }
      />
    );
  };

  const renderIconPicker = () => {
    return (
      <FoundationIconPicker
        value={draft.icon}
        tone={draft.color}
        isOpen={activePicker === "icon"}
        suggestedIconKeys={SUGGESTED_PAYMENT_SOURCE_ICONS}
        fallbackLabel="Ikona"
        onOpenChange={(isOpen) => setActivePicker(isOpen ? "icon" : null)}
        onChange={(iconKey) => {
          setDraft((currentDraft) => ({
            ...currentDraft,
            icon: iconKey,
            type: inferPaymentSourceTypeFromIcon(iconKey),
          }));
        }}
      />
    );
  };

  const renderSourceCard = (
    source: PaymentSource,
    totals: PaymentSourceTotals,
  ) => {
    const iconKey = getPaymentSourceIconKey(source);
    const colorTone = getPaymentSourceColorTone(source);
    const color = getUiColor(colorTone);
    const stats = statsById[source.id] || {
      sourceId: source.id,
      incomeTotal: 0,
      expenseTotal: 0,
      transactionCount: 0,
      lastUsedAt: null,
    };
    const isArchived = Boolean(source.archived_at);
    const hasHistory = stats.transactionCount > 0;

    return (
      <article
        key={source.id}
        data-ui-large-record="true"
        data-ui-record-card="true"
        data-ui-record-variant="metric"
        data-ui-record-surface="white"
        data-ui-record-interactive="true"
        data-ui-indent-level="record"
        data-ui-tone={color.tone}
        data-ui-record-state={isArchived ? "archived" : "active"}
        data-ui-selected={selectedSourceDetailsId === source.id ? "true" : undefined}
        role="button"
        tabIndex={0}
        onClick={(event) => {
          if (event.target instanceof Element && event.target.closest("button")) return;
          openSourceDetails(source);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openSourceDetails(source);
          }
        }}
      >
        <div data-ui-large-record-identity="true">
          <span
            data-ui-icon-tile="true"
            data-ui-icon-role="large-record-hero"
            data-ui-tone={color.tone}
            aria-hidden="true"
          >
            <CategoryIcon iconKey={iconKey} size="large" />
          </span>

          <div data-ui-large-record-identity-copy="true">
            <strong data-ui-large-record-title="true">{source.name}</strong>
            <span>{getPaymentMethodTypeOption(source.payment_method_type).label}</span>
            <div data-ui-status-pill-group="true">
              {renderAvailability(
                "Przychody",
                source.is_income_source !== false && !isArchived,
              )}
              {renderAvailability(
                "Wydatki",
                source.is_expense_source !== false && !isArchived,
              )}
            </div>
          </div>
        </div>

        <div data-ui-metric-group="true" data-ui-metric-columns="3">
          {renderMetric({
            iconKey: "system-records",
            label: "wpisy",
            tone: "neutral-blue",
            percent: calculateShare(
              stats.transactionCount,
              totals.transactionCount,
            ),
            detail: `${formatCompactNumber(stats.transactionCount)} z ${formatCompactNumber(totals.transactionCount)} wpisów`,
            title: `${stats.transactionCount} z ${totals.transactionCount} wpisów`,
          })}

          {renderMetric({
            iconKey: "system-income",
            label: "przychody",
            percent: calculateShare(stats.incomeTotal, totals.incomeTotal),
            detail: `${formatCompactCurrency(stats.incomeTotal)} z ${formatCompactCurrency(totals.incomeTotal)}`,
            tone: "success",
            title: `${formatCurrency(stats.incomeTotal)} z ${formatCurrency(totals.incomeTotal)}`,
          })}

          {renderMetric({
            iconKey: "system-expense",
            label: "wydatki",
            percent: calculateShare(stats.expenseTotal, totals.expenseTotal),
            detail: `${formatCompactCurrency(stats.expenseTotal)} z ${formatCompactCurrency(totals.expenseTotal)}`,
            tone: "danger",
            title: `${formatCurrency(stats.expenseTotal)} z ${formatCurrency(totals.expenseTotal)}`,
          })}
        </div>

        <div
          data-ui-action-group="true"
          data-ui-action-stack="record"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          {isArchived ? (
            <SecondaryAction
              disabled={isSaving}
              onClick={() => void restoreSource(source)}
            >
              Przywróć
            </SecondaryAction>
          ) : (
            <>
              <SecondaryAction onClick={() => openEditForm(source)}>
                Edytuj
              </SecondaryAction>
              <DangerAction
                disabled={isSaving}
                onClick={() => void deleteSource(source)}
              >
                {hasHistory ? "Archiwizuj" : "Usuń"}
              </DangerAction>
            </>
          )}
        </div>
      </article>
    );
  };

  const renderSourceDetails = (source: PaymentSource) => {
    const iconKey = getPaymentSourceIconKey(source);
    const colorTone = getPaymentSourceColorTone(source);
    const color = getUiColor(colorTone);
    const stats = statsById[source.id] || {
      sourceId: source.id,
      incomeTotal: 0,
      expenseTotal: 0,
      transactionCount: 0,
      lastUsedAt: null,
    };
    const transactions = (paymentSourceTransactionsById || {})[source.id] || [];

    return (
      <section data-ui-record-details="true" data-ui-tone={color.tone}>
        <div data-ui-record-details-header="true">
          <div data-ui-large-record-identity="true">
            <span
              data-ui-icon-tile="true"
              data-ui-icon-role="large-record-hero"
              data-ui-tone={color.tone}
              aria-hidden="true"
            >
              <CategoryIcon iconKey={iconKey} size="large" />
            </span>
            <div data-ui-large-record-identity-copy="true">
              <strong data-ui-large-record-title="true">{source.name}</strong>
              <span>{getPaymentMethodTypeOption(source.payment_method_type).label}</span>
              <div data-ui-status-pill-group="true">
                {renderAvailability(
                  "Przychody",
                  source.is_income_source !== false && !source.archived_at,
                )}
                {renderAvailability(
                  "Wydatki",
                  source.is_expense_source !== false && !source.archived_at,
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            data-ui-details-close="true"
            aria-label="Zamknij szczegóły źródła"
            onClick={handleScreenBack}
          >
            <CategoryIcon iconKey="close" size="small" />
          </button>
        </div>

        <div data-ui-record-details-metrics="true">
          {renderMetric({
            iconKey: "system-records",
            label: "wpisy",
            tone: "neutral-blue",
            percent: stats.transactionCount > 0 ? 100 : 0,
            detail: `${formatCompactNumber(stats.transactionCount)} wpisów`,
            title: `${stats.transactionCount} wpisów`,
          })}
          {renderMetric({
            iconKey: "system-income",
            label: "przychody",
            percent: stats.incomeTotal > 0 ? 100 : 0,
            detail: formatCompactCurrency(stats.incomeTotal),
            tone: "success",
            title: formatCurrency(stats.incomeTotal),
          })}
          {renderMetric({
            iconKey: "system-expense",
            label: "wydatki",
            percent: stats.expenseTotal > 0 ? 100 : 0,
            detail: formatCompactCurrency(stats.expenseTotal),
            tone: "danger",
            title: formatCurrency(stats.expenseTotal),
          })}
        </div>

        <div data-ui-record-details-list="true">
          <strong>Informacje o źródle</strong>
          <span>Typ płatności: {getPaymentMethodTypeOption(source.payment_method_type).label}</span>
          <span>Ostatnie użycie: {stats.lastUsedAt || "brak"}</span>
        </div>

        <div data-ui-record-details-list="true">
          <strong>Transakcje tego źródła</strong>
          {transactions.length === 0 ? (
            <span>Brak transakcji.</span>
          ) : (
            transactions.map((transaction) => {
              const amount = Number(transaction.amount);
              const isIncome = amount >= 0;

              return (
                <span
                  key={transaction.id}
                  data-ui-transaction-row="true"
                  data-ui-tone={isIncome ? "success" : "danger"}
                >
                  <span>{transaction.date} · {transaction.description || "Bez opisu"}</span>
                  <strong>{formatCurrency(amount)}</strong>
                </span>
              );
            })
          )}
        </div>

        <div data-ui-action-group="true">
          <SecondaryAction onClick={() => openEditForm(source)}>Edytuj</SecondaryAction>
          {!source.archived_at && (
            <DangerAction onClick={() => void deleteSource(source)}>
              Archiwizuj / usuń
            </DangerAction>
          )}
          {source.archived_at && (
            <SecondaryAction onClick={() => void restoreSource(source)}>
              Przywróć
            </SecondaryAction>
          )}
          <SecondaryAction onClick={() => void onSetDefault("expense", source.id)}>
            Domyślne dla wydatków
          </SecondaryAction>
          <SecondaryAction onClick={() => void onSetDefault("income", source.id)}>
            Domyślne dla przychodów
          </SecondaryAction>
        </div>
      </section>
    );
  };

  if (selectedSourceDetails) {
    const detailsSources = activeList === "active" ? activeSources : archivedSources;
    const detailsTotals = activeList === "active" ? activeSourceTotals : archivedSourceTotals;

    return (
      <ManagementModuleShell
        screen={screen}
        title={selectedSourceDetails.name}
        canGoBack={canGoBack}
        onBack={handleScreenBack}
        onClose={onCloseModule}
      >
      <section
        data-ui-payment-sources-shell="true"
        data-ui-payment-sources-mode="details"
        data-ui-foundation-only="true"
        data-ui-large-module="true"
        data-ui-utility-modal-size="xl"
      >
        <div data-ui-management-split="true">
          <div data-ui-management-split-list="true">
            {detailsSources.map((source) => renderSourceCard(source, detailsTotals))}
          </div>
          {renderSourceDetails(selectedSourceDetails)}
        </div>
      </section>
      </ManagementModuleShell>
    );
  }

  return (
    <ManagementModuleShell
      screen={screen}
      title={screen.name === "edit" ? "Edytuj źródło" : screen.name === "create" ? "Nowe źródło" : "Źródła płatności"}
      canGoBack={canGoBack}
      onBack={handleScreenBack}
      onClose={onCloseModule}
      onAdd={openNewForm}
      addLabel="Dodaj"
    >
    <section
      data-ui-payment-sources-shell="true"
      data-ui-payment-sources-mode="list"
      data-ui-foundation-only="true"
      data-ui-large-module="true"
      data-ui-utility-modal-size="xl"
    >
      <CollapsibleSecondarySection
        tone="neutral-blue"
        icon={<CategoryIcon iconKey="system-payment-sources" size="small" />}
        title="Domyślne źródła płatności"
        help={
          <HelpHint label="Ustaw źródła, które będą podpowiadane przy nowych wpisach." />
        }
        defaultCollapsed
        collapsed={isDefaultSourcesCollapsed}
        onCollapsedChange={setIsDefaultSourcesCollapsed}
      >
        <div data-ui-settings-strip="true">
          <div
            data-ui-settings-strip-field="true"
            data-ui-settings-position="primary"
          >
            <label
              data-ui-settings-strip-label="true"
              htmlFor="default-income-payment-source"
            >
              Domyślne źródło przychodów
            </label>
            <span data-ui-settings-strip-control="true">
              <ManagementSelect
                id="default-income-payment-source"
                value={settingsDraft.defaultIncomePaymentSourceId || ""}
                disabled={isConfigSaving}
                width="full"
                options={[
                  { value: "", label: "Brak domyślnego źródła" },
                  ...incomeSources.map((source) => ({
                    value: source.id,
                    label: source.name,
                  })),
                ]}
                onChange={(value) =>
                  setSettingsDraft((currentDraft) => ({
                    ...currentDraft,
                    defaultIncomePaymentSourceId: value || null,
                  }))
                }
              />
            </span>
          </div>
          <div
            data-ui-settings-strip-field="true"
            data-ui-settings-position="secondary"
          >
            <label
              data-ui-settings-strip-label="true"
              htmlFor="default-expense-payment-source"
            >
              Domyślne źródło wydatków
            </label>
            <span data-ui-settings-strip-control="true">
              <ManagementSelect
                id="default-expense-payment-source"
                value={settingsDraft.defaultExpensePaymentSourceId || ""}
                disabled={isConfigSaving}
                width="full"
                options={[
                  { value: "", label: "Brak domyślnego źródła" },
                  ...expenseSources.map((source) => ({
                    value: source.id,
                    label: source.name,
                  })),
                ]}
                onChange={(value) =>
                  setSettingsDraft((currentDraft) => ({
                    ...currentDraft,
                    defaultExpensePaymentSourceId: value || null,
                  }))
                }
              />
            </span>
          </div>
          <div data-ui-settings-strip-actions="true">
            <PrimaryAction
              disabled={isConfigSaving || !isSettingsDirty}
              onClick={() => void saveSettingsDraft()}
            >
              {isConfigSaving ? "Zapisywanie..." : "Zapisz ustawienia"}
            </PrimaryAction>
          </div>
        </div>
      </CollapsibleSecondarySection>

      {statusText && (
        <div data-ui-status-banner="true" data-ui-tone="success">
          <CategoryIcon iconKey="info" size="small" />
          <span>{statusText}</span>
        </div>
      )}
      {errorText && (
        <div data-ui-status-banner="true" data-ui-tone="danger">
          <CategoryIcon iconKey="warning" size="small" />
          <span>{errorText}</span>
        </div>
      )}

      <section data-ui-payment-section="sources" data-ui-large-section="true">
        <SectionHeader
          tone="neutral-blue"
          icon={<CategoryIcon iconKey="system-records" size="small" />}
          title="Twoje źródła"
          help={
            <HelpHint
              label={
                activeList === "active"
                  ? "Aktywne źródła dostępne w kreatorze wpisów."
                  : "Źródła zachowane ze względu na historię wpisów."
              }
            />
          }
        />
        <div data-ui-management-toolbar="true">
          <div data-ui-management-toolbar-group="true">
            <span data-ui-management-toolbar-label="empty">Tryb</span>
            <div
              data-ui-list-switch="true"
              data-ui-management-switch="true"
              role="group"
              aria-label="Zakres źródeł płatności"
            >
              <button
                type="button"
                data-active={activeList === "active" ? "true" : undefined}
                onClick={() => setActiveList("active")}
              >
                Aktywne
              </button>
              <button
                type="button"
                data-active={activeList === "archived" ? "true" : undefined}
                onClick={() => setActiveList("archived")}
              >
                Archiwalne
              </button>
            </div>
          </div>

          <div data-ui-management-toolbar-group="true">
            <span data-ui-management-toolbar-label="true">Dostępność</span>
            <ManagementSelect<"all" | "income" | "expense">
              value={availabilityFilter}
              disabled={activeList !== "active"}
              onChange={(value) => setAvailabilityFilter(value)}
              options={[
                { value: "all", label: "Wszystkie" },
                { value: "expense", label: "Do wydatków" },
                { value: "income", label: "Do przychodów" },
              ]}
            />
          </div>

          <div data-ui-management-toolbar-group="true">
            <span data-ui-management-toolbar-label="true">Typ metody płatności</span>
            <ManagementSelect<PaymentMethodType | "all">
              value={methodFilter}
              onChange={(value) => setMethodFilter(value)}
              options={[
                { value: "all", label: "Wszystkie typy" },
                ...PAYMENT_METHOD_TYPE_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                })),
              ]}
            />
          </div>

          <div data-ui-management-toolbar-group="true">
            <span data-ui-management-toolbar-label="true">Sortowanie</span>
            <ManagementSelect<PaymentSourceSortMode>
              value={sortMode}
              onChange={(value) => setSortMode(value)}
              options={PAYMENT_SOURCE_SORT_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
            />
          </div>
        </div>
        <div
          data-ui-payment-sources-list-window="true"
          style={{
            paddingInlineEnd: "var(--ui-space-2)",
          }}
        >
          <div data-ui-large-record-list="true">
            {(activeList === "active" ? activeSources : archivedSources).length ===
            0 ? (
              <EmptyState>
                {activeList === "active"
                  ? "Brak aktywnych źródeł płatności."
                  : "Brak archiwalnych źródeł płatności."}
              </EmptyState>
            ) : (
              (activeList === "active" ? activeSources : archivedSources).map(
                (source) =>
                  renderSourceCard(
                    source,
                    activeList === "active"
                      ? activeSourceTotals
                      : archivedSourceTotals,
                  ),
              )
            )}
          </div>
        </div>
      </section>

      {isFormOpen && (
        <div data-ui-overlay="true" onClick={closeForm}>
          <CreatorModal
            size="compact"
            onClick={(event) => {
              event.stopPropagation();
              if (activePicker) {
                setActivePicker(null);
              }
            }}
          >
            <HeroHeader
              variant="creator"
              density="comfort"
              tone="brand-primary"
              icon={<CategoryIcon iconKey={draft.icon} />}
              title={draft.id ? "Edytuj źródło" : "Nowe źródło"}
              description="Utwórz źródło płatności lub przychodów i określ, gdzie ma być dostępne."
              closeAction={
                <IconAction
                  ariaLabel="Zamknij"
                  onClick={closeForm}
                  density="comfort"
                >
                  <CategoryIcon iconKey="close" />
                </IconAction>
              }
            />

            <div data-ui-creator-layout="true">
              <div data-ui-creator-main="true">
                <CreatorSection
                  step={1}
                  variant="hero"
                  title="Nazwa źródła"
                  help={<HelpHint label="To nazwa widoczna w aplikacji." />}
                >
                  <FormField
                    label={<span data-ui-visually-hidden="true">Nazwa</span>}
                    emphasis="hero"
                    tone="neutral-blue"
                  >
                    <span data-ui-input-affix="true">
                      <span data-ui-input-leading="true" aria-hidden="true">
                        Aa
                      </span>
                      <input
                        className="ui-input"
                        data-input-width="full"
                        data-input-variant="creator"
                        value={draft.name}
                        onChange={(event) => {
                          setDraft((currentDraft) => ({
                            ...currentDraft,
                            name: event.target.value,
                          }));
                          setDuplicateSourceId(null);
                          setErrorText("");
                        }}
                        placeholder="np. Gotówka, Karta kredytowa, Konto główne"
                      />
                      {draft.name.trim() && (
                        <button
                          type="button"
                          data-ui-input-clear="true"
                          aria-label="Wyczyść nazwę"
                          onClick={() => {
                            setDraft((currentDraft) => ({
                              ...currentDraft,
                              name: "",
                            }));
                            setDuplicateSourceId(null);
                            setErrorText("");
                          }}
                        >
                          ×
                        </button>
                      )}
                    </span>
                  </FormField>

                  {duplicateSource && (
                    <div
                      data-ui-status-banner="true"
                      data-ui-tone={
                        duplicateSource.archived_at ? "warning" : "danger"
                      }
                      data-ui-payment-duplicate-banner="true"
                    >
                      {!draft.id && duplicateSource.archived_at ? (
                        <>
                          <strong>
                            Istnieje archiwalne źródło o tej nazwie.
                          </strong>
                          <div data-ui-action-group="true">
                            <PrimaryAction
                              disabled={isSaving}
                              onClick={() =>
                                void restoreSource(duplicateSource, true)
                              }
                            >
                              Przywróć istniejące
                            </PrimaryAction>
                            <SecondaryAction
                              disabled={isSaving}
                              onClick={() => void saveDraft(true)}
                            >
                              Utwórz nowe mimo wszystko
                            </SecondaryAction>
                          </div>
                        </>
                      ) : (
                        <>
                          <strong>
                            Źródło „{duplicateSource.name}” już istnieje.
                          </strong>
                          <span>
                            Edytuj istniejące źródło, żeby zmienić dostępność
                            dla przychodów lub wydatków.
                          </span>
                          <PrimaryAction
                            onClick={() => openEditForm(duplicateSource)}
                          >
                            Edytuj istniejące źródło
                          </PrimaryAction>
                        </>
                      )}
                    </div>
                  )}
                  <FormField label="Typ płatności">
                    <ManagementSelect<PaymentMethodType>
                      value={draft.paymentMethodType}
                      width="full"
                      onChange={(value) => setDraft((currentDraft) => ({
                        ...currentDraft,
                        paymentMethodType: value,
                      }))}
                      options={PAYMENT_METHOD_TYPE_OPTIONS.map((option) => ({
                        value: option.value,
                        label: `${option.label} — ${option.description}`,
                      }))}
                    />
                  </FormField>
                </CreatorSection>

                <CreatorSection
                  step={2}
                  title="Wygląd"
                  help={
                    <HelpHint label="Wybierz kolor i ikonę reprezentujące to źródło." />
                  }
                >
                  <div
                    data-ui-picker-row="true"
                    data-ui-picker-row-size="comfortable"
                  >
                    <div data-ui-field="true" data-ui-field-size="comfortable">
                      Kolor
                      {renderColorPicker()}
                    </div>
                    <div data-ui-field="true" data-ui-field-size="comfortable">
                      Ikona
                      {renderIconPicker()}
                    </div>
                  </div>
                </CreatorSection>

                <CreatorSection
                  step={3}
                  title="Dostępność"
                  help={
                    <HelpHint label="Określ, do jakich typów operacji ma być dostępne to źródło." />
                  }
                >
                  <div
                    data-ui-checkbox-field-group="true"
                    data-ui-checkbox-group-size="comfortable"
                  >
                    <label
                      data-ui-checkbox="true"
                      data-checkbox-variant="neutral-card"
                      data-checkbox-density="comfortable"
                      data-checkbox-align="center"
                      data-checked={draft.isIncomeSource ? "true" : "false"}
                    >
                      <input
                        className="ui-checkbox__input"
                        type="checkbox"
                        checked={draft.isIncomeSource}
                        onChange={(event) =>
                          setDraft((currentDraft) => ({
                            ...currentDraft,
                            isIncomeSource: event.target.checked,
                          }))
                        }
                      />
                      <span
                        data-ui-checkbox-support-icon="true"
                        data-ui-tone="success"
                        aria-hidden="true"
                      >
                        ↑
                      </span>
                      <span className="ui-checkbox__label">Przychody</span>
                    </label>
                    <label
                      data-ui-checkbox="true"
                      data-checkbox-variant="neutral-card"
                      data-checkbox-density="comfortable"
                      data-checkbox-align="center"
                      data-checked={draft.isExpenseSource ? "true" : "false"}
                    >
                      <input
                        className="ui-checkbox__input"
                        type="checkbox"
                        checked={draft.isExpenseSource}
                        onChange={(event) =>
                          setDraft((currentDraft) => ({
                            ...currentDraft,
                            isExpenseSource: event.target.checked,
                          }))
                        }
                      />
                      <span
                        data-ui-checkbox-support-icon="true"
                        data-ui-tone="danger"
                        aria-hidden="true"
                      >
                        ↓
                      </span>
                      <span className="ui-checkbox__label">Wydatki</span>
                    </label>
                  </div>
                </CreatorSection>
              </div>

              <aside
                data-ui-creator-summary="true"
                aria-label="Podsumowanie źródła"
              >
                <header data-ui-creator-summary-header="true">
                  <span data-ui-creator-summary-heading="true">
                    <span
                      data-ui-creator-summary-header-icon="true"
                      aria-hidden="true"
                    >
                      ✦
                    </span>
                    <strong>Podsumowanie źródła</strong>
                  </span>
                  <span>Tak będzie wyglądało źródło na Twojej liście.</span>
                </header>

                <CreatorSummaryCard kind="payment-source" tone={draft.color}>
                  <span
                    data-ui-icon-tile="true"
                    data-ui-icon-role="creator-summary"
                    data-ui-tone={draft.color}
                    aria-hidden="true"
                  >
                    <CategoryIcon iconKey={draft.icon} size="large" />
                  </span>
                  <strong data-ui-creator-summary-title="true">
                    {draft.name.trim() || "Nowe źródło"}
                  </strong>
                  <div
                    data-ui-status-pill-group="true"
                    data-ui-summary-status="true"
                  >
                    {renderAvailability("Przychody", draft.isIncomeSource)}
                    {renderAvailability("Wydatki", draft.isExpenseSource)}
                  </div>
                </CreatorSummaryCard>

                <div
                  data-ui-info-banner="true"
                  data-ui-info-banner-variant="module-guidance"
                >
                  <CategoryIcon iconKey="info" size="small" />
                  <span>
                    Podsumowanie aktualizuje się na bieżąco wraz ze zmianami.
                  </span>
                </div>
              </aside>
            </div>

            <footer data-ui-creator-footer="true">
              <SecondaryAction onClick={closeForm} disabled={isSaving}>
                Anuluj
              </SecondaryAction>
              <PrimaryAction
                width="full"
                density="comfort"
                onClick={() => void saveDraft()}
                disabled={
                  isSaving ||
                  !draft.name.trim() ||
                  (!draft.isIncomeSource && !draft.isExpenseSource)
                }
              >
                {isSaving
                  ? "Zapisywanie..."
                  : draft.id
                    ? "Zapisz zmiany"
                    : "Zapisz źródło"}
              </PrimaryAction>
            </footer>
          </CreatorModal>
        </div>
      )}
    </section>
    </ManagementModuleShell>
  );
}
