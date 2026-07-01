
"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import {
  UI_COLOR_OPTIONS,
  getUiColor,
  getUiIcon,
  type UiColorKey,
  type UiIconKey,
} from "../../lib/userAppearance";
import CategoryIcon from "../CategoryIcon";
import FoundationIconPicker from "../ui/FoundationIconPicker";
import {
  CreatorSummaryCard,
  FormField,
  MoneyField,
  MonthField,
  PrimaryAction,
  SecondaryAction,
} from "../ui/FoundationPrimitives";
import type { FormState } from "./financialGoalsPanelTypes";

type FinancialGoalFormProps = {
  formState: FormState;
  isSaving: boolean;
  submitLabel: string;
  savingLabel: string;
  cancelLabel?: string;
  onFormStateChange: (nextFormState: FormState) => void;
  onSubmit: () => void;
  onCancel?: () => void;
};

type GoalFormAppearance = FormState & {
  icon?: string | null;
  icon_key?: string | null;
  color?: string | null;
  color_tone?: string | null;
};

const SUGGESTED_GOAL_ICON_KEYS = [
  "system-goals",
  "car",
  "travel",
  "savings",
  "gift",
  "home",
  "education",
  "briefcase",
  "calendar",
  "investments",
  "more",
];

const DEFAULT_GOAL_ICON = "system-goals";
const DEFAULT_GOAL_COLOR = "blue";

const resolveGoalIconKey = (formState: FormState) => {
  const appearance = formState as GoalFormAppearance;
  const iconKey = appearance.icon_key || appearance.icon || DEFAULT_GOAL_ICON;

  return getUiIcon(iconKey as UiIconKey) ? iconKey : DEFAULT_GOAL_ICON;
};

const resolveGoalColorKey = (formState: FormState) => {
  const appearance = formState as GoalFormAppearance;
  const colorKey =
    appearance.color_tone || appearance.color || DEFAULT_GOAL_COLOR;

  return getUiColor(colorKey as UiColorKey)?.tone || DEFAULT_GOAL_COLOR;
};

const parseGoalAmount = (value: string) => {
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const formatAmount = (value: number) =>
  new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 2,
  }).format(value);

const formatMonthLabel = (value: string) => {
  if (!value) return "bieżący miesiąc";

  const [year, month] = value.split("-").map(Number);

  if (!year || !month) return value;

  return new Intl.DateTimeFormat("pl-PL", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
};


const formatMonthFieldLabel = (value: string, emptyLabel = "Wybierz miesiąc") => {
  if (!value) return emptyLabel;

  const label = formatMonthLabel(value);
  return label.charAt(0).toLocaleUpperCase("pl-PL") + label.slice(1);
};

const getGoalPeriodLabel = (startMonth: string, deadlineMonth: string) => {
  const startLabel = formatMonthLabel(startMonth);

  if (!deadlineMonth) {
    return `od ${startLabel}`;
  }

  return `${startLabel} → ${formatMonthLabel(deadlineMonth)}`;
};

export default function FinancialGoalForm({
  formState,
  isSaving,
  submitLabel,
  savingLabel,
  cancelLabel = "Anuluj",
  onFormStateChange,
  onSubmit,
  onCancel,
}: FinancialGoalFormProps) {
  const [activePicker, setActivePicker] = useState<"color" | "icon" | null>(
    null,
  );

  const selectedIconKey = resolveGoalIconKey(formState);
  const selectedColorKey = resolveGoalColorKey(formState);
  const selectedColor = getUiColor(selectedColorKey as UiColorKey);

  const updateAppearance = (nextAppearance: Partial<GoalFormAppearance>) => {
    onFormStateChange({
      ...formState,
      ...nextAppearance,
    } as FormState);
  };

  const renderColorPicker = () => {
    const isOpen = activePicker === "color";

    return (
      <div
        data-ui-picker-control="true"
        data-ui-picker-variant="gallery"
        data-open={isOpen ? "true" : "false"}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          data-ui-picker-trigger="true"
          aria-expanded={isOpen}
          onClick={() => setActivePicker(isOpen ? null : "color")}
        >
          <span data-ui-picker-value="true">
            <span
              data-ui-color-swatch="true"
              data-ui-tone={selectedColor.tone}
            />
            {selectedColor.label}
          </span>
          <span data-ui-picker-chevron="true" aria-hidden="true" />
        </button>
        {isOpen && (
          <div data-ui-picker-menu="true" data-layout="colors">
            {UI_COLOR_OPTIONS.map((option) => (
              <button
                key={option.tone}
                type="button"
                data-ui-color-option="true"
                data-ui-tone={option.tone}
                data-active={selectedColorKey === option.tone}
                aria-label={`Wybierz kolor: ${option.label}`}
                title={option.label}
                onClick={() => {
                  updateAppearance({
                    color: option.tone,
                    color_tone: option.tone,
                  });
                  setActivePicker(null);
                }}
              >
                <span data-ui-color-swatch="true" data-ui-tone={option.tone} />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderIconPicker = () => (
    <FoundationIconPicker
      value={selectedIconKey as UiIconKey}
      tone={selectedColor.tone}
      isOpen={activePicker === "icon"}
      suggestedIconKeys={SUGGESTED_GOAL_ICON_KEYS}
      fallbackLabel="Ikona celu"
      onOpenChange={(isOpen) => setActivePicker(isOpen ? "icon" : null)}
      onChange={(iconKey) => {
        updateAppearance({
          icon: iconKey,
          icon_key: iconKey,
        });
      }}
    />
  );

  const normalizedName = formState.name.trim() || "Nowy cel";
  const targetAmount = parseGoalAmount(formState.targetAmount);
  const targetAmountLabel = formatAmount(targetAmount);
  const collectedAmountLabel = formatAmount(0);
  const remainingAmountLabel = formatAmount(targetAmount);
  const goalPeriodLabel = getGoalPeriodLabel(
    formState.startMonth,
    formState.deadlineMonth,
  );
  const startMonthFieldLabel = formatMonthFieldLabel(formState.startMonth, "Bieżący miesiąc");
  const deadlineMonthFieldLabel = formatMonthFieldLabel(formState.deadlineMonth);

  return (
    <>
      <div
        data-ui-creator-layout="true"
        onClick={() => {
          if (activePicker) {
            setActivePicker(null);
          }
        }}
      >
        <div data-ui-creator-main="true">
          <section data-ui-creator-step="true" data-ui-tone="neutral-accent-1">
            <span data-ui-creator-step-icon="true" aria-hidden="true">
              1
            </span>
            <div data-ui-creator-step-content="true">
              <header data-ui-creator-step-header="true">
                <strong>Nazwa i kwota docelowa</strong>
                <span>Określ nazwę celu, kwotę do zebrania i ramy czasowe.</span>
              </header>

              <div data-ui-form-shell="true" data-ui-form-density="comfortable">
                <div data-ui-form-grid="two" data-ui-form-grid-role="goal-primary">
                  <FormField label="Nazwa celu">
                    <span data-ui-input-affix="true" data-ui-input-affix-tone="name">
                      <span data-ui-input-leading="true" aria-hidden="true">Aa</span>
                      <input
                        className="ui-input"
                        data-input-width="full"
                        data-input-variant="creator"
                        placeholder="np. Wycieczka, laptop, poduszka finansowa"
                        value={formState.name}
                        onChange={(event) =>
                          onFormStateChange({
                            ...formState,
                            name: event.target.value,
                          })
                        }
                      />
                    </span>
                  </FormField>

                  <FormField label="Kwota docelowa">
                    <MoneyField
                      leading={<CategoryIcon iconKey="system-goals" size="small" />}
                      placeholder="0,00"
                      value={formState.targetAmount}
                      onChange={(event) =>
                        onFormStateChange({
                          ...formState,
                          targetAmount: event.target.value,
                        })
                      }
                    />
                  </FormField>
                </div>

                <div data-ui-form-grid="two" data-ui-form-grid-role="period">
                  <FormField label="Miesiąc startu">
                    <MonthField
                      leading={<CategoryIcon iconKey="calendar" size="small" />}
                      displayValue={startMonthFieldLabel}
                      aria-label="Miesiąc startu"
                      value={formState.startMonth}
                      onChange={(event) =>
                        onFormStateChange({
                          ...formState,
                          startMonth: event.target.value,
                        })
                      }
                    />
                  </FormField>

                  <FormField label="Deadline (opcjonalnie)">
                    <MonthField
                      leading={<CategoryIcon iconKey="calendar" size="small" />}
                      displayValue={deadlineMonthFieldLabel}
                      isEmpty={!formState.deadlineMonth}
                      aria-label="Deadline"
                      value={formState.deadlineMonth}
                      onChange={(event) =>
                        onFormStateChange({
                          ...formState,
                          deadlineMonth: event.target.value,
                        })
                      }
                    />
                  </FormField>
                </div>
              </div>
            </div>
          </section>

          <section data-ui-creator-step="true" data-ui-tone="neutral-accent-2">
            <span data-ui-creator-step-icon="true" aria-hidden="true">
              2
            </span>
            <div data-ui-creator-step-content="true">
              <header data-ui-creator-step-header="true">
                <strong>Wygląd</strong>
                <span>Kolor i ikona będą widoczne na karcie celu.</span>
              </header>

              <div data-ui-picker-row="true" data-ui-picker-row-size="comfortable">
                <div data-ui-field="true" data-ui-field-size="comfortable">
                  Kolor
                  {renderColorPicker()}
                </div>

                <div data-ui-field="true" data-ui-field-size="comfortable">
                  Ikona
                  {renderIconPicker()}
                </div>
              </div>
            </div>
          </section>

          <div data-ui-info-banner="true" data-ui-tone="info">
            <CategoryIcon iconKey="info" size="small" />
            <span>
              Cel nie ma osobnego źródła finansowania. Jest rozliczany z
              nadwyżki budżetu zgodnie z trybem ustawionym dla danego miesiąca.
            </span>
          </div>
        </div>

        <aside data-ui-creator-summary="true" aria-label="Podsumowanie celu">
          <header data-ui-creator-summary-header="true">
            <strong>Podsumowanie celu</strong>
            <span>Sprawdź najważniejsze dane celu przed zapisaniem.</span>
          </header>

          <CreatorSummaryCard
            kind="goal"
            layout="summary-list"
            recordType="goal"
            tone={selectedColor.tone}
          >
            <div data-ui-creator-preview-identity="true">
              <span
                data-ui-icon-tile="true"
                data-ui-icon-role="creator-summary"
                data-ui-tone={selectedColor.tone}
                aria-hidden="true"
              >
                <CategoryIcon
                  iconKey={selectedIconKey as UiIconKey}
                  size="large"
                />
              </span>

              <div data-ui-creator-preview-copy="true">
                <strong data-ui-large-record-title="true">
                  {normalizedName}
                </strong>
                <span data-ui-status-inline="true" data-ui-tone="active">
                  <span aria-hidden="true" />
                  w trakcie
                </span>
                <span data-ui-record-period="true">
                  <CategoryIcon iconKey="calendar" size="small" />
                  <span>{goalPeriodLabel}</span>
                </span>
              </div>
            </div>

            <div data-ui-creator-preview-metrics="true" data-ui-summary-metrics-layout="clean-list">
              <div data-ui-creator-preview-metric="true" data-ui-tone="neutral-accent-1">
                <span><CategoryIcon iconKey="system-goals" size="small" /> Kwota docelowa</span>
                <strong>{targetAmountLabel}</strong>
              </div>
              <div data-ui-creator-preview-metric="true" data-ui-tone="success">
                <span><CategoryIcon iconKey="investments" size="small" /> Uzbierano</span>
                <strong>{collectedAmountLabel}</strong>
              </div>
              <div data-ui-creator-preview-metric="true" data-ui-tone="danger">
                <span><CategoryIcon iconKey="warning" size="small" /> Brakuje do celu</span>
                <strong>{remainingAmountLabel}</strong>
              </div>
              <div data-ui-creator-preview-metric="true" data-ui-tone="neutral-accent-2">
                <span><CategoryIcon iconKey="more" size="small" /> Priorytet</span>
                <strong>—</strong>
              </div>
            </div>

            <div
              data-ui-large-record-progress="true"
              style={
                {
                  "--ui-goal-progress": "0%",
                  "--ui-goal-progress-color": "var(--ui-neutral-accent-2-text)",
                } as CSSProperties
              }
            >
              <div data-ui-large-record-progress-header="true">
                <span>Postęp celu</span>
                <strong>0%</strong>
              </div>
              <span data-ui-large-record-progress-track="true" aria-hidden="true">
                <span data-ui-large-record-progress-fill="true" />
              </span>
            </div>
          </CreatorSummaryCard>

        </aside>
      </div>

      <footer data-ui-creator-footer="true">
        {onCancel && (
          <SecondaryAction onClick={onCancel} disabled={isSaving}>
            {cancelLabel}
          </SecondaryAction>
        )}
        <PrimaryAction
          disabled={
            isSaving || !formState.name.trim() || !formState.targetAmount
          }
          onClick={onSubmit}
          width="full"
          density="comfort"
        >
          {isSaving ? savingLabel : submitLabel}
        </PrimaryAction>
      </footer>
    </>
  );
}
