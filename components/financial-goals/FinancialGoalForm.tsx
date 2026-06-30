
"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { uiInputApi } from "../../lib/uiFoundation";
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
                <strong>Cel</strong>
                <span>Nazwa, kwota i podstawowe dane celu.</span>
              </header>

              <div data-ui-form-shell="true" data-ui-form-density="comfortable">
                <label data-ui-field="true" data-ui-field-size="comfortable">
                  Nazwa celu
                  <span data-ui-input-affix="true" data-ui-input-affix-tone="name">
                    <span data-ui-input-leading="true" aria-hidden="true">Aa</span>
                    <input
                      className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputM}`}
                      data-input-width={uiInputApi.width.full}
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
                </label>

                <div data-ui-form-grid="two">
                  <label data-ui-field="true" data-ui-field-size="comfortable">
                    Kwota docelowa
                    <span data-ui-amount-shell="true" data-ui-input-affix="true">
                      <span data-ui-input-leading="true" aria-hidden="true">
                        <CategoryIcon iconKey="system-goals" size="small" />
                      </span>
                      <input
                        className={uiInputApi.classNames.amountField}
                        data-input-width={uiInputApi.width.full}
                        data-input-variant="creator"
                        placeholder="0,00"
                        inputMode="decimal"
                        value={formState.targetAmount}
                        onChange={(event) =>
                          onFormStateChange({
                            ...formState,
                            targetAmount: event.target.value,
                          })
                        }
                      />
                      <span data-ui-amount-currency="true" aria-hidden="true">zł</span>
                    </span>
                  </label>

                  <label data-ui-field="true" data-ui-field-size="comfortable">
                    Miesiąc startu
                    <span data-ui-input-affix="true" data-ui-month-shell="true" data-empty="false">
                      <span data-ui-input-leading="true" aria-hidden="true">
                        <CategoryIcon iconKey="calendar" size="small" />
                      </span>
                      <input
                        className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputM}`}
                        data-input-width={uiInputApi.width.full}
                        data-input-variant="creator"
                        type="month"
                        value={formState.startMonth}
                        onChange={(event) =>
                          onFormStateChange({
                            ...formState,
                            startMonth: event.target.value,
                          })
                        }
                      />
                    </span>
                  </label>

                  <label data-ui-field="true" data-ui-field-size="comfortable">
                    Deadline
                    <span data-ui-input-affix="true" data-ui-month-shell="true" data-empty={formState.deadlineMonth ? "false" : "true"}>
                      <span data-ui-input-leading="true" aria-hidden="true">
                        <CategoryIcon iconKey="calendar" size="small" />
                      </span>
                      <input
                        className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputM}`}
                        data-input-width={uiInputApi.width.full}
                        data-input-variant="creator"
                        type="month"
                        value={formState.deadlineMonth}
                        onChange={(event) =>
                          onFormStateChange({
                            ...formState,
                            deadlineMonth: event.target.value,
                          })
                        }
                      />
                      {!formState.deadlineMonth && (
                        <span data-ui-month-placeholder="true">Wybierz miesiąc</span>
                      )}
                    </span>
                  </label>
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

        <aside data-ui-creator-summary="true" aria-label="Podgląd celu">
          <header data-ui-creator-summary-header="true">
            <strong>Podgląd celu</strong>
            <span>Tak będzie wyglądał cel na Twojej liście.</span>
          </header>

          <div
            data-ui-creator-preview-card="true"
            data-ui-creator-preview-kind="goal"
            data-ui-record-type="goal"
            data-ui-tone={selectedColor.tone}
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

            <div data-ui-creator-preview-metrics="true">
              <div data-ui-creator-preview-metric="true" data-ui-tone="neutral-accent-1">
                <span>Docelowa</span>
                <strong>{targetAmountLabel}</strong>
              </div>
              <div data-ui-creator-preview-metric="true" data-ui-tone="success">
                <span>Uzbierano</span>
                <strong>{collectedAmountLabel}</strong>
              </div>
              <div data-ui-creator-preview-metric="true" data-ui-tone="danger">
                <span>Brakuje</span>
                <strong>{remainingAmountLabel}</strong>
              </div>
              <div data-ui-creator-preview-metric="true" data-ui-tone="neutral-accent-2">
                <span>Priorytet</span>
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
          </div>

          <div
            data-ui-info-banner="true"
            data-ui-info-banner-variant="module-guidance"
          >
            <CategoryIcon iconKey="info" size="small" />
            <span>Podgląd prezentuje dane z formularza celu.</span>
          </div>
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
