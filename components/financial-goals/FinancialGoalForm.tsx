'use client'

import { useMemo, useState } from 'react'
import CategoryIcon from '../CategoryIcon'
import { uiInputApi } from '../../lib/uiFoundation'
import {
  APP_ICONS,
  UI_COLOR_OPTIONS,
  getUiColor,
  getUiIcon,
  getUiIconSearchText,
  type UiColorKey,
  type UiIconKey,
} from '../../lib/userAppearance'
import { useScrollSelectedIconIntoView } from '../ui/useScrollSelectedIconIntoView'
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
  const [isIconPickerExpanded, setIsIconPickerExpanded] = useState(false)
  const [iconSearch, setIconSearch] = useState('')

  const selectedIconKey = resolveGoalIconKey(formState)
  const selectedColorKey = resolveGoalColorKey(formState)
  const selectedIcon = getUiIcon(selectedIconKey as UiIconKey)
  const selectedColor = getUiColor(selectedColorKey as UiColorKey)

  const selectedIconOptionRef = useScrollSelectedIconIntoView({
    isOpen: activePicker === 'icon',
    selectedKey: selectedIconKey,
    scrollSignal: isIconPickerExpanded,
  })

  const orderedIcons = useMemo(() => {
    const suggestedIcons = SUGGESTED_GOAL_ICON_KEYS
      .map((iconKey) => APP_ICONS.find((option) => option.key === iconKey))
      .filter((option): option is (typeof APP_ICONS)[number] => Boolean(option))

    return [
      ...suggestedIcons,
      ...APP_ICONS.filter((option) => !SUGGESTED_GOAL_ICON_KEYS.includes(option.key)),
    ]
  }, [])

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
    const isOpen = activePicker === 'icon'
    const normalizedSearch = iconSearch.trim().toLocaleLowerCase('pl-PL')
    const baseIcons = isIconPickerExpanded
      ? orderedIcons
      : orderedIcons.filter((option) => SUGGESTED_GOAL_ICON_KEYS.includes(option.key))
    const visibleIcons = normalizedSearch
      ? orderedIcons.filter((option) => getUiIconSearchText(option).includes(normalizedSearch))
      : baseIcons

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
          onClick={() => {
            const nextIsOpen = !isOpen
            setActivePicker(nextIsOpen ? 'icon' : null)

            if (nextIsOpen) {
              setIconSearch('')
            }
          }}
        >
          <span data-ui-picker-value="true">
            <span data-ui-icon-tile="true" data-ui-tone={selectedColor.tone}>
              <CategoryIcon iconKey={selectedIconKey as UiIconKey} />
            </span>
            {selectedIcon?.label || 'Ikona celu'}
          </span>
          <span data-ui-picker-chevron="true" aria-hidden="true" />
        </button>
        {isOpen && (
          <div data-ui-picker-menu="true" data-layout="icons">
            <label data-ui-picker-search="true">
              <input
                type="search"
                value={iconSearch}
                onChange={(event) => setIconSearch(event.target.value)}
                placeholder="Szukaj ikony..."
                autoFocus
              />
            </label>
            <div data-ui-picker-menu-grid="true">
              {visibleIcons.map((option) => (
                <button
                  key={option.key}
                  ref={selectedIconKey === option.key ? selectedIconOptionRef : undefined}
                  type="button"
                  data-ui-icon-select-option="true"
                  data-ui-tone={selectedColor.tone}
                  data-active={selectedIconKey === option.key}
                  aria-label={`Wybierz ikonę: ${option.label}`}
                  title={option.label}
                  onClick={() => {
                    updateAppearance({
                      icon: option.key,
                      icon_key: option.key,
                    })
                    setActivePicker(null)
                    setIconSearch('')
                  }}
                >
                  <span data-ui-icon-tile="true" data-ui-tone={selectedColor.tone}>
                    <CategoryIcon iconKey={option.key} />
                  </span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
            {!isIconPickerExpanded && !normalizedSearch && (
              <button
                type="button"
                data-ui-picker-more="true"
                onClick={() => setIsIconPickerExpanded(true)}
              >
                Pokaż więcej ikon
              </button>
            )}
            {visibleIcons.length === 0 && (
              <div data-ui-picker-empty="true">Brak ikon dla tej nazwy.</div>
            )}
          </div>
        )}
      </div>
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
