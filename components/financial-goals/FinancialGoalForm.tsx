'use client'

import { useState } from 'react'
import { uiInputApi } from '../../lib/uiFoundation'
import {
  UI_COLOR_OPTIONS,
  getUiColor,
  getUiIcon,
  type UiColorKey,
  type UiIconKey,
} from '../../lib/userAppearance'
import FoundationIconPicker from '../ui/FoundationIconPicker'
import type { FormState } from './financialGoalsPanelTypes'

type FinancialGoalFormProps = {
  formState: FormState
  isSaving: boolean
  submitLabel: string
  savingLabel: string
  cancelLabel?: string
  onFormStateChange: (nextFormState: FormState) => void
  onSubmit: () => void
  onCancel?: () => void
}

type GoalFormAppearance = FormState & {
  icon?: string | null
  icon_key?: string | null
  color?: string | null
  color_tone?: string | null
}

const SUGGESTED_GOAL_ICON_KEYS = [
  'system-goals',
  'car',
  'travel',
  'savings',
  'gift',
  'home',
  'education',
  'briefcase',
  'calendar',
  'investments',
  'more',
]

const DEFAULT_GOAL_ICON = 'system-goals'
const DEFAULT_GOAL_COLOR = 'blue'

const resolveGoalIconKey = (formState: FormState) => {
  const appearance = formState as GoalFormAppearance
  const iconKey = appearance.icon_key || appearance.icon || DEFAULT_GOAL_ICON

  return getUiIcon(iconKey as UiIconKey) ? iconKey : DEFAULT_GOAL_ICON
}

const resolveGoalColorKey = (formState: FormState) => {
  const appearance = formState as GoalFormAppearance
  const colorKey = appearance.color_tone || appearance.color || DEFAULT_GOAL_COLOR

  return getUiColor(colorKey as UiColorKey)?.tone || DEFAULT_GOAL_COLOR
}

export default function FinancialGoalForm({
  formState,
  isSaving,
  submitLabel,
  savingLabel,
  cancelLabel = 'Anuluj',
  onFormStateChange,
  onSubmit,
  onCancel,
}: FinancialGoalFormProps) {
  const [activePicker, setActivePicker] = useState<'color' | 'icon' | null>(null)

  const selectedIconKey = resolveGoalIconKey(formState)
  const selectedColorKey = resolveGoalColorKey(formState)
  const selectedColor = getUiColor(selectedColorKey as UiColorKey)

  const updateAppearance = (nextAppearance: Partial<GoalFormAppearance>) => {
    onFormStateChange({
      ...formState,
      ...nextAppearance,
    } as FormState)
  }

  const renderColorPicker = () => {
    const isOpen = activePicker === 'color'

    return (
      <div
        data-ui-picker-control="true"
        data-ui-picker-variant="gallery"
        data-open={isOpen ? 'true' : 'false'}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          data-ui-picker-trigger="true"
          aria-expanded={isOpen}
          onClick={() => setActivePicker(isOpen ? null : 'color')}
        >
          <span data-ui-picker-value="true">
            <span data-ui-color-swatch="true" data-ui-tone={selectedColor.tone} />
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
                  })
                  setActivePicker(null)
                }}
              >
                <span data-ui-color-swatch="true" data-ui-tone={option.tone} />
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderIconPicker = () => {
    return (
      <FoundationIconPicker
        value={selectedIconKey as UiIconKey}
        tone={selectedColor.tone}
        isOpen={activePicker === 'icon'}
        suggestedIconKeys={SUGGESTED_GOAL_ICON_KEYS}
        fallbackLabel="Ikona celu"
        onOpenChange={(isOpen) => setActivePicker(isOpen ? 'icon' : null)}
        onChange={(iconKey) => {
          updateAppearance({
            icon: iconKey,
            icon_key: iconKey,
          })
        }}
      />
    )
  }

  return (
    <div
      data-ui-section="true"
      data-financial-goal-form="true"
      onClick={() => {
        if (activePicker) {
          setActivePicker(null)
        }
      }}
    >
      <div data-financial-goal-form-card="true">
        <div data-financial-goal-form-grid="true">
          <label data-ui-field-wrapper="true" data-field-span="full">
            <span data-ui-field-label="true">Nazwa celu</span>
            <input
              className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputM}`}
              data-input-width={uiInputApi.width.full}
              placeholder="np. Wycieczka, laptop, poduszka finansowa"
              value={formState.name}
              onChange={(event) => onFormStateChange({ ...formState, name: event.target.value })}
            />
          </label>

          <label data-ui-field-wrapper="true">
            <span data-ui-field-label="true">Kwota docelowa</span>
            <span data-ui-amount-shell="true">
              <input
                className={uiInputApi.classNames.amountField}
                data-input-width={uiInputApi.width.full}
                placeholder="0,00"
                inputMode="decimal"
                value={formState.targetAmount}
                onChange={(event) =>
                  onFormStateChange({ ...formState, targetAmount: event.target.value })
                }
              />
              <span aria-hidden="true">zł</span>
            </span>
          </label>

          <div data-ui-field-wrapper="true">
            <span data-ui-field-label="true">Kolor</span>
            {renderColorPicker()}
          </div>

          <div data-ui-field-wrapper="true">
            <span data-ui-field-label="true">Ikona</span>
            {renderIconPicker()}
          </div>

          <label data-ui-field-wrapper="true">
            <span data-ui-field-label="true">Miesiąc startu</span>
            <input
              className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputM}`}
              data-input-width={uiInputApi.width.full}
              type="month"
              value={formState.startMonth}
              onChange={(event) =>
                onFormStateChange({ ...formState, startMonth: event.target.value })
              }
            />
          </label>

          <label data-ui-field-wrapper="true">
            <span data-ui-field-label="true">Deadline</span>
            <input
              className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputM}`}
              data-input-width={uiInputApi.width.full}
              type="month"
              value={formState.deadlineMonth}
              onChange={(event) =>
                onFormStateChange({ ...formState, deadlineMonth: event.target.value })
              }
            />
          </label>

          <div data-financial-goal-form-info="true">
            <span aria-hidden="true">i</span>
            <span>
              Cel nie ma osobnego źródła finansowania. Jest rozliczany z nadwyżki budżetu
              zgodnie z trybem ustawionym dla danego miesiąca.
            </span>
          </div>
        </div>
      </div>

      <div data-ui-form-actions="true">
        {onCancel && (
          <button type="button" data-ui-button-cancel="true" onClick={onCancel}>
            {cancelLabel}
          </button>
        )}
        <button
          type="button"
          data-ui-button-confirm="true"
          disabled={isSaving || !formState.name.trim() || !formState.targetAmount}
          onClick={onSubmit}
        >
          {isSaving ? savingLabel : submitLabel}
        </button>
      </div>
    </div>
  )
}
