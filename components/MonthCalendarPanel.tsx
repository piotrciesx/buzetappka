'use client'

import { CSSProperties, KeyboardEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import DescriptionSuggestionDeleteMenu from './DescriptionSuggestionDeleteMenu'
import PaymentSplitEditor from './PaymentSplitEditor'
import {
  buildDateFromDayInput,
  getDayInputFromDate,
  getDaysInMonth,
  isFutureDate,
  isDateBeforeBudgetStart,
  isMonthPartialByBudgetStart,
  normalizeDayInput,
} from '../lib/dateUtils'
import { splitTagInput } from '../lib/tagUtils'
import { useDescriptionSuggestions } from '../lib/useDescriptionSuggestions'
import {
  createPaymentSplitItemsFromStoredSplits,
  getTransactionPaymentSourceDisplayLines,
  PaymentSplitInput,
} from '../lib/paymentSplitUtils'

import type {
  HeatmapMode,
  MonthCalendarPanelProps,
  Transaction,
} from './month-calendar/monthCalendarTypes'
import MonthCalendarContainer from './month-calendar/MonthCalendarContainer'
import MonthCalendarDayModal from './month-calendar/MonthCalendarDayModal'
import MonthCalendarNoDaySection from './month-calendar/MonthCalendarNoDaySection'
import MonthCalendarToolbar from './month-calendar/MonthCalendarToolbar'
import {
  badgeStyle,
  calendarDayCellStyle,
  calendarDayCountStyle,
  calendarDayMetaStyle,
  calendarDayNumberStyle,
  calendarExpandBadgeStyle,
  dangerButtonStyle,
  descriptionFieldWrapStyle,
  formRowStyle,
  noDayHintStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
  smallInputStyle,
  suggestionButtonBaseStyle,
  suggestionsDropdownStyle,
  tagBadgeStyle,
  tagBadgesWrapStyle,
  tagFieldWrapStyle,
  tagRemoveButtonStyle,
  transactionActionsStyle,
  transactionAmountStyle,
  transactionCardStyle,
  transactionDescriptionStyle,
  transactionTagBadgeStyle,
  transactionTagsStyle,
  transactionTopRowStyle,
  wideInputStyle,
} from './month-calendar/monthCalendarStyles'

const formatAmount = (value: number) => {
  return new Intl.NumberFormat('pl-PL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const normalizeAmountInput = (value: string) => {
  return value.replace(',', '.')
}

const getStoredHeatmapSettings = (
  storageKey: string | undefined,
  defaultMode: HeatmapMode,
  defaultInverted: boolean
) => {
  if (!storageKey || typeof window === 'undefined') {
    return {
      mode: defaultMode,
      inverted: defaultInverted,
    }
  }

  try {
    const raw = window.localStorage.getItem(storageKey)

    if (!raw) {
      return {
        mode: defaultMode,
        inverted: defaultInverted,
      }
    }

    const parsed = JSON.parse(raw) as {
      mode?: HeatmapMode
      inverted?: boolean
    }

    return {
      mode: parsed.mode === 'normal' || parsed.mode === 'balance' ? parsed.mode : defaultMode,
      inverted: typeof parsed.inverted === 'boolean' ? parsed.inverted : defaultInverted,
    }
  } catch {
    return {
      mode: defaultMode,
      inverted: defaultInverted,
    }
  }
}

const clamp = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value))
}

const rgbToCss = ([r, g, b]: [number, number, number]) => {
  return `rgb(${r}, ${g}, ${b})`
}

const hslToRgb = (
  hue: number,
  saturationPercent: number,
  lightnessPercent: number
): [number, number, number] => {
  const saturation = clamp(saturationPercent, 0, 100) / 100
  const lightness = clamp(lightnessPercent, 0, 100) / 100
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const hueSection = ((hue % 360) + 360) % 360 / 60
  const secondComponent = chroma * (1 - Math.abs((hueSection % 2) - 1))
  const match = lightness - chroma / 2

  let redPrime = 0
  let greenPrime = 0
  let bluePrime = 0

  if (hueSection >= 0 && hueSection < 1) {
    redPrime = chroma
    greenPrime = secondComponent
  } else if (hueSection < 2) {
    redPrime = secondComponent
    greenPrime = chroma
  } else if (hueSection < 3) {
    greenPrime = chroma
    bluePrime = secondComponent
  } else if (hueSection < 4) {
    greenPrime = secondComponent
    bluePrime = chroma
  } else if (hueSection < 5) {
    redPrime = secondComponent
    bluePrime = chroma
  } else {
    redPrime = chroma
    bluePrime = secondComponent
  }

  return [
    Math.round((redPrime + match) * 255),
    Math.round((greenPrime + match) * 255),
    Math.round((bluePrime + match) * 255),
  ]
}

const getLuminance = ([r, g, b]: [number, number, number]) => {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const getSortedNumbers = (values: number[]) => {
  return [...values].sort((left, right) => left - right)
}

const getQuantile = (sortedValues: number[], quantile: number) => {
  if (sortedValues.length === 0) {
    return 0
  }

  if (sortedValues.length === 1) {
    return sortedValues[0]
  }

  const clampedQuantile = clamp(quantile, 0, 1)
  const index = (sortedValues.length - 1) * clampedQuantile
  const lowerIndex = Math.floor(index)
  const upperIndex = Math.ceil(index)

  if (lowerIndex === upperIndex) {
    return sortedValues[lowerIndex]
  }

  const interpolationFactor = index - lowerIndex

  return (
    sortedValues[lowerIndex] +
    (sortedValues[upperIndex] - sortedValues[lowerIndex]) * interpolationFactor
  )
}

const getReferenceValue = (values: number[]) => {
  if (values.length === 0) {
    return 0
  }

  const sortedValues = getSortedNumbers(values)
  const p60 = getQuantile(sortedValues, 0.6)
  const p85 = getQuantile(sortedValues, 0.85)
  const maxValue = sortedValues[sortedValues.length - 1]

  return Math.max(p85, p60 * 1.35, maxValue * 0.18, 1)
}

const getHeatmapIntensity = (absoluteValue: number, referenceValue: number) => {
  if (absoluteValue <= 0 || referenceValue <= 0) {
    return 0
  }

  const ratio = absoluteValue / referenceValue
  const compressed = Math.log1p(ratio * 6.5) / Math.log1p(7.5)
  const softened = Math.pow(clamp(compressed, 0, 1), 0.82)

  return clamp(softened, 0, 1)
}

const getBalanceHeatmapVisual = (
  value: number,
  negativeReference: number,
  positiveReference: number,
  inverted: boolean
) => {
  const effectiveValue = inverted ? value * -1 : value

  if (effectiveValue === 0) {
    const neutralRgb = hslToRgb(42, 92, 56)

    return {
      background: rgbToCss(neutralRgb),
      textColor: '#111827',
      borderColor: rgbToCss(hslToRgb(34, 92, 36)),
    }
  }

  const isPositive = effectiveValue > 0
  const intensity = getHeatmapIntensity(
    Math.abs(effectiveValue),
    isPositive ? positiveReference : negativeReference
  )
  const hue = isPositive ? 145 : 8
  const saturation = 88 + intensity * 8
  const lightness = 62 - intensity * 24
  const borderLightness = Math.max(lightness - 18, 20)
  const backgroundRgb = hslToRgb(hue, saturation, lightness)
  const borderRgb = hslToRgb(hue, Math.min(100, saturation + 4), borderLightness)
  const luminance = getLuminance(backgroundRgb)

  return {
    background: rgbToCss(backgroundRgb),
    textColor: luminance < 162 ? '#ffffff' : '#111827',
    borderColor: rgbToCss(borderRgb),
  }
}

const getDirectionalHeatmapVisual = (
  value: number,
  referenceValue: number,
  lowHue: number,
  highHue: number,
  inverted: boolean
) => {
  const intensity = getHeatmapIntensity(value, referenceValue)
  const startHue = inverted ? highHue : lowHue
  const endHue = inverted ? lowHue : highHue
  const hue = startHue + (endHue - startHue) * intensity
  const saturation = 86 + intensity * 10
  const lightness = 62 - intensity * 22
  const backgroundRgb = hslToRgb(hue, saturation, lightness)
  const borderRgb = hslToRgb(hue, Math.min(100, saturation + 4), Math.max(lightness - 18, 20))
  const luminance = getLuminance(backgroundRgb)

  return {
    background: rgbToCss(backgroundRgb),
    textColor: luminance < 162 ? '#ffffff' : '#111827',
    borderColor: rgbToCss(borderRgb),
  }
}

export default function MonthCalendarPanel(props: MonthCalendarPanelProps) {
  const {
    selectedMonth,
    transactions,
    budgetStartDate,
    isSelectedMonthExcluded = false,
    isUpdatingSelectedMonthExclusion = false,
    onToggleSelectedMonthExcluded,
    styles,
    isSelectedMonthLocked,
    getAmountNumber,
    getMoveTargetsForTransaction,
    getSignedAmountForTransaction,
    onUpdateTransaction,
    onDeleteTransaction,
    onMoveTransaction,
    onAddTransactionForDay,
    calendarTitle = 'Kalendarz miesiąca',
    calendarSubtitle = 'Kliknij dzień, aby zobaczyć wpisy z tego dnia.',
    heatmapVariant = 'balance',
    heatmapMode: controlledHeatmapMode,
    onHeatmapModeChange,
    heatmapInverted: controlledHeatmapInverted,
    onHeatmapInvertedChange,
    defaultHeatmapMode = 'balance',
    defaultHeatmapInverted = false,
    heatmapStorageKey,
    showHeatmapControls = true,
    descriptionSuggestions,
    getPaymentSourceOptionsForCategoryId,
    transactionTagsMap = {},
    transactionPaymentSplitsMap = {},
    onTagClick,
    onDeleteDescriptionSuggestion,
  } = props

  const [localHeatmapSettings, setLocalHeatmapSettings] = useState(() =>
    getStoredHeatmapSettings(heatmapStorageKey, defaultHeatmapMode, defaultHeatmapInverted)
  )

  const heatmapMode = controlledHeatmapMode ?? localHeatmapSettings.mode
  const heatmapInverted = controlledHeatmapInverted ?? localHeatmapSettings.inverted

  useEffect(() => {
    if (!heatmapStorageKey || controlledHeatmapMode !== undefined) {
      return
    }

    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(
      heatmapStorageKey,
      JSON.stringify({
        mode: localHeatmapSettings.mode,
        inverted: localHeatmapSettings.inverted,
      })
    )
  }, [controlledHeatmapMode, heatmapStorageKey, localHeatmapSettings])

  const handleHeatmapModeChange = (value: HeatmapMode) => {
    if (controlledHeatmapMode === undefined) {
      setLocalHeatmapSettings((prev) => ({
        ...prev,
        mode: value,
      }))
    }

    onHeatmapModeChange?.(value)
  }

  const handleHeatmapInvertedChange = (value: boolean) => {
    if (controlledHeatmapInverted === undefined) {
      setLocalHeatmapSettings((prev) => ({
        ...prev,
        inverted: value,
      }))
    }

    onHeatmapInvertedChange?.(value)
  }

  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null)
  const [editDay, setEditDay] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editTagNames, setEditTagNames] = useState<string[]>([])
  const [editTagInput, setEditTagInput] = useState('')
  const [editPaymentSourceId, setEditPaymentSourceId] = useState('')
  const [editPaymentSplitItems, setEditPaymentSplitItems] = useState<PaymentSplitInput[]>([])
  const [isEditDescriptionFocused, setIsEditDescriptionFocused] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [movingTransactionId, setMovingTransactionId] = useState<string | null>(null)
  const [moveTargetCategoryId, setMoveTargetCategoryId] = useState('')
  const [isMoving, setIsMoving] = useState(false)

  const editAmountInputRef = useRef<HTMLInputElement | null>(null)
  const editDescriptionInputRef = useRef<HTMLInputElement | null>(null)

  const [year, month] = selectedMonth.split('-').map(Number)
  const daysInMonth = getDaysInMonth(selectedMonth)
  const firstDayOffset = (new Date(year, month - 1, 1).getDay() + 6) % 7

  const transactionsWithDay = useMemo(() => {
    return transactions.filter((transaction) => !transaction.day_is_null)
  }, [transactions])

  const isSelectedMonthPartial = isMonthPartialByBudgetStart(selectedMonth, budgetStartDate)

  const transactionsWithoutDay = useMemo(() => {
    return transactions.filter((transaction) => transaction.day_is_null)
  }, [transactions])

  const transactionsByDay = useMemo(() => {
    return transactionsWithDay.reduce<Record<string, Transaction[]>>((acc, transaction) => {
      if (isDateBeforeBudgetStart(transaction.date, budgetStartDate)) {
        return acc
      }

      const day = transaction.date.slice(8, 10)

      if (!day) {
        return acc
      }

      if (!acc[day]) {
        acc[day] = []
      }

      acc[day].push(transaction)
      return acc
    }, {})
  }, [budgetStartDate, transactionsWithDay])

  const dayStats = useMemo(() => {
    return Object.entries(transactionsByDay).reduce<
      Record<string, { count: number; rawSum: number; signedSum: number }>
    >((acc, [day, dayTransactions]) => {
      const rawSum = dayTransactions.reduce((total, transaction) => {
        return total + getAmountNumber(transaction.amount)
      }, 0)

      const signedSum = dayTransactions.reduce((total, transaction) => {
        return total + getSignedAmountForTransaction(transaction)
      }, 0)

      acc[day] = {
        count: dayTransactions.length,
        rawSum,
        signedSum,
      }

      return acc
    }, {})
  }, [transactionsByDay, getAmountNumber, getSignedAmountForTransaction])

  const positiveHeatmapReference = useMemo(() => {
    const values = Object.entries(dayStats)
      .filter(([day]) => !isFutureDate(`${selectedMonth}-${day}`))
      .map(([, item]) => item.signedSum)
      .filter((value) => value > 0)

    return getReferenceValue(values)
  }, [dayStats, selectedMonth])

  const negativeHeatmapReference = useMemo(() => {
    const values = Object.entries(dayStats)
      .filter(([day]) => !isFutureDate(`${selectedMonth}-${day}`))
      .map(([, item]) => item.signedSum)
      .filter((value) => value < 0)
      .map((value) => Math.abs(value))

    return getReferenceValue(values)
  }, [dayStats, selectedMonth])

  const sumHeatmapReference = useMemo(() => {
    const values = Object.entries(dayStats)
      .filter(([day]) => !isFutureDate(`${selectedMonth}-${day}`))
      .map(([, item]) => item.rawSum)
      .filter((value) => value > 0)

    return getReferenceValue(values)
  }, [dayStats, selectedMonth])

  const selectedDayTransactions = selectedDay ? transactionsByDay[selectedDay] || [] : []

  const selectedDayRawSum = selectedDayTransactions.reduce((total, transaction) => {
    return total + getAmountNumber(transaction.amount)
  }, 0)

  const selectedDaySignedSum = selectedDayTransactions.reduce((total, transaction) => {
    return total + getSignedAmountForTransaction(transaction)
  }, 0)

  const getDayMetricLabel = () => {
    return heatmapVariant === 'balance' ? 'Bilans' : 'Suma'
  }

  const getDayMetricValue = (stats: { rawSum: number; signedSum: number } | undefined) => {
    if (!stats) {
      return 0
    }

    return heatmapVariant === 'balance' ? stats.signedSum : stats.rawSum
  }

  const selectedDayPrimaryValue =
    heatmapVariant === 'balance' ? selectedDaySignedSum : selectedDayRawSum

  const noDayTransactionsSum = useMemo(() => {
    return transactionsWithoutDay.reduce((total, transaction) => {
      return total + getAmountNumber(transaction.amount)
    }, 0)
  }, [transactionsWithoutDay, getAmountNumber])

  const legendLabels = useMemo(() => {
    if (heatmapVariant === 'income') {
      return {
        left: heatmapInverted ? 'większa suma przychodów' : 'mniejsza suma przychodów',
        right: heatmapInverted ? 'mniejsza suma przychodów' : 'większa suma przychodów',
      }
    }

    if (heatmapVariant === 'expense') {
      return {
        left: heatmapInverted ? 'mniejsza suma wydatków' : 'większa suma wydatków',
        right: heatmapInverted ? 'większa suma wydatków' : 'mniejsza suma wydatków',
      }
    }

    return {
      left: heatmapInverted ? 'dodatni bilans' : 'ujemny bilans',
      right: heatmapInverted ? 'ujemny bilans' : 'dodatni bilans',
    }
  }, [heatmapInverted, heatmapVariant])

  const currentEditingTransaction = useMemo(() => {
    if (!editingTransactionId) {
      return null
    }

    return transactions.find((transaction) => transaction.id === editingTransactionId) || null
  }, [editingTransactionId, transactions])

  const {
    filteredSuggestions: filteredDescriptionSuggestions,
    activeSuggestionIndex,
    applySuggestion,
    handleKeyDown: handleSuggestionKeyDown,
    handleSuggestionContextMenu,
    handleSuggestionPointerDown,
    handleSuggestionPointerUp,
    handleSuggestionPointerLeave,
    suggestionToDelete,
    deletePromptPosition,
    closeDeletePrompt,
    confirmDeleteSuggestion,
  } = useDescriptionSuggestions({
    query: editDescription,
    setQuery: setEditDescription,
    categoryId: currentEditingTransaction?.category_id,
    isEnabled: isEditDescriptionFocused,
    descriptionSuggestions,
    inputRef: editDescriptionInputRef,
    onDeleteSuggestion: onDeleteDescriptionSuggestion,
  })

  const closeModal = () => {
    setSelectedDay(null)
    setEditingTransactionId(null)
    setEditDay('')
    setEditAmount('')
    setEditDescription('')
    setEditTagNames([])
    setEditTagInput('')
    setEditPaymentSourceId('')
    setIsEditDescriptionFocused(false)
    setIsUpdating(false)
    setMovingTransactionId(null)
    setMoveTargetCategoryId('')
    setIsMoving(false)
    closeDeletePrompt()
  }

  const startEditingTransaction = (transaction: Transaction) => {
    setMovingTransactionId(null)
    setMoveTargetCategoryId('')
    setEditingTransactionId(transaction.id)
    setEditDay(transaction.day_is_null ? '' : getDayInputFromDate(transaction.date, selectedMonth))
    setEditAmount(String(getAmountNumber(transaction.amount)))
    setEditDescription(transaction.description || '')
    const nextTagNames = (transactionTagsMap[transaction.id] || []).map((tag) => tag.name)
    setEditTagNames(nextTagNames)
    setEditTagInput(nextTagNames.join(', '))
    setEditPaymentSourceId(transaction.payment_source_id || '')
    setEditPaymentSplitItems(
      createPaymentSplitItemsFromStoredSplits(transactionPaymentSplitsMap[transaction.id] || [])
    )
    closeDeletePrompt()

    window.setTimeout(() => {
      editAmountInputRef.current?.focus()
    }, 0)
  }

  const cancelEditingTransaction = () => {
    setEditingTransactionId(null)
    setEditDay('')
    setEditAmount('')
    setEditDescription('')
    setEditTagNames([])
    setEditTagInput('')
    setEditPaymentSourceId('')
    setEditPaymentSplitItems([])
    setIsEditDescriptionFocused(false)
    setIsUpdating(false)
    closeDeletePrompt()
  }

  const saveEditingTransaction = async (transactionId: string) => {
    if (isUpdating) {
      return
    }

    const currentTransaction = transactions.find((item) => item.id === transactionId)

    if (!currentTransaction) {
      alert('Nie znaleziono wpisu do zapisu')
      return
    }

    const normalizedDay = normalizeDayInput(editDay, selectedMonth)
    let nextTransactionDate = currentTransaction.date
    let nextDayIsNull = Boolean(currentTransaction.day_is_null)

    if (normalizedDay) {
      const builtDate = buildDateFromDayInput(selectedMonth, normalizedDay)

      if (!builtDate) {
        alert('Podaj poprawny dzień transakcji')
        return
      }

      nextTransactionDate = builtDate
      nextDayIsNull = false
    } else if (!currentTransaction.day_is_null) {
      alert('Podaj dzień transakcji')
      return
    } else {
      nextDayIsNull = true
    }

    setIsUpdating(true)

    try {
      await onUpdateTransaction(
        transactionId,
        editAmount,
        editDescription,
        nextTransactionDate,
        editTagNames,
        nextDayIsNull,
        editPaymentSourceId || null,
        editPaymentSplitItems
      )
      cancelEditingTransaction()
    } catch {
      setIsUpdating(false)
    }
  }

  const handleEditFieldKeyDown = async (
    event: KeyboardEvent<HTMLInputElement>,
    transactionId: string,
    field: 'day' | 'amount' | 'description'
  ) => {
    if (field === 'description' && handleSuggestionKeyDown(event)) {
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      cancelEditingTransaction()
      return
    }

    if (event.key !== 'Enter' || event.shiftKey) {
      return
    }

    event.preventDefault()

    if (field === 'day') {
      editAmountInputRef.current?.focus()
      return
    }

    if (field === 'amount') {
      editDescriptionInputRef.current?.focus()
      return
    }

    await saveEditingTransaction(transactionId)
  }

  const startMovingTransaction = (transaction: Transaction) => {
    setEditingTransactionId(null)
    setEditDay('')
    setEditAmount('')
    setEditDescription('')
    setEditTagNames([])
    setEditTagInput('')
    setEditPaymentSourceId('')
    setMovingTransactionId(transaction.id)
    setMoveTargetCategoryId('')
    closeDeletePrompt()
  }

  const cancelMovingTransaction = () => {
    setMovingTransactionId(null)
    setMoveTargetCategoryId('')
    setIsMoving(false)
  }

  const saveMovingTransaction = async (transactionId: string) => {
    if (isMoving || !moveTargetCategoryId) {
      return
    }

    setIsMoving(true)

    try {
      await onMoveTransaction(transactionId, moveTargetCategoryId)
      cancelMovingTransaction()
    } catch {
      setIsMoving(false)
    }
  }

  const renderTransactionCard = (transaction: Transaction, context: 'day' | 'no-day') => {
    const isEditing = editingTransactionId === transaction.id
    const isMovingCurrent = movingTransactionId === transaction.id
    const moveTargets = getMoveTargetsForTransaction(transaction)
    const isNoDayTransaction = Boolean(transaction.day_is_null)
    const transactionTags = transactionTagsMap[transaction.id] || []
    const signedAmount = getSignedAmountForTransaction(transaction)
    const showSignedAmount = heatmapVariant === 'balance'
    const paymentSourceOptions = getPaymentSourceOptionsForCategoryId?.(transaction.category_id) || []
    const paymentSourceLabels = getTransactionPaymentSourceDisplayLines({
      transaction,
      splitItems: transactionPaymentSplitsMap[transaction.id] || [],
      paymentSourceOptions,
    })

    return (
      <div key={transaction.id} style={transactionCardStyle}>
        <div style={transactionTopRowStyle}>
          <div
            style={{
              ...transactionAmountStyle,
              color: showSignedAmount
                ? signedAmount > 0
                  ? '#15803d'
                  : signedAmount < 0
                    ? '#b91c1c'
                    : transactionAmountStyle.color
                : transactionAmountStyle.color,
            }}
          >
            {showSignedAmount
              ? `${signedAmount > 0 ? '+' : signedAmount < 0 ? '-' : ''}${formatAmount(Math.abs(signedAmount))} zł`
              : `${formatAmount(getAmountNumber(transaction.amount))} zł`}
          </div>

          <div style={{ ...calendarDayMetaStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
            {isNoDayTransaction ? (
              <span style={badgeStyle}>bez dnia</span>
            ) : (
              <span>{transaction.date}</span>
            )}
          </div>
        </div>

        {isEditing ? (
          <div style={formRowStyle}>
            <input
              style={smallInputStyle}
              value={editDay}
              onChange={(event) => setEditDay(normalizeDayInput(event.target.value, selectedMonth))}
              placeholder={isNoDayTransaction ? 'dzień (opcjonalnie)' : 'dzień'}
              inputMode="numeric"
              onBlur={() => {
                setEditDay((prev) => normalizeDayInput(prev, selectedMonth))
              }}
              onKeyDown={async (event) => {
                await handleEditFieldKeyDown(event, transaction.id, 'day')
              }}
            />

            <input
              ref={editAmountInputRef}
              style={smallInputStyle}
              value={editAmount}
              onChange={(event) => setEditAmount(normalizeAmountInput(event.target.value))}
              placeholder="kwota"
              onKeyDown={async (event) => {
                await handleEditFieldKeyDown(event, transaction.id, 'amount')
              }}
            />

            <div style={descriptionFieldWrapStyle}>
              <input
                ref={editDescriptionInputRef}
                style={wideInputStyle}
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
                onFocus={() => setIsEditDescriptionFocused(true)}
                onBlur={() => setIsEditDescriptionFocused(false)}
                placeholder="opis"
                onKeyDown={async (event) => {
                  await handleEditFieldKeyDown(event, transaction.id, 'description')
                }}
              />

              {filteredDescriptionSuggestions.length > 0 && (
                <div style={suggestionsDropdownStyle}>
                  {filteredDescriptionSuggestions.map((suggestion, index) => {
                    const isActive = index === activeSuggestionIndex

                    return (
                      <button
                        key={`${transaction.id}-${suggestion.text}`}
                        type="button"
                        style={{
                          ...suggestionButtonBaseStyle,
                          background: isActive ? '#eff6ff' : '#ffffff',
                          color: isActive ? '#1d4ed8' : '#111827',
                          borderTop:
                            index === 0 ? 'none' : '1px solid #e5e7eb',
                        }}
                        onMouseDown={(event) => {
                          event.preventDefault()
                        }}
                        onClick={() => {
                          applySuggestion(suggestion.text)
                        }}
                        onContextMenu={(event) => {
                          handleSuggestionContextMenu(event, suggestion)
                        }}
                        onPointerDown={(event) => {
                          handleSuggestionPointerDown(suggestion, event)
                        }}
                        onPointerUp={handleSuggestionPointerUp}
                        onPointerLeave={handleSuggestionPointerLeave}
                        onPointerCancel={handleSuggestionPointerLeave}
                      >
                        {suggestion.text}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div style={tagFieldWrapStyle}>
              <input
                style={wideInputStyle}
                value={editTagInput}
                onChange={(event) => {
                  const nextValue = event.target.value
                  setEditTagInput(nextValue)
                  setEditTagNames(splitTagInput(nextValue))
                }}
                placeholder="tagi, po przecinku"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                onKeyDown={async (event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    await saveEditingTransaction(transaction.id)
                  }
                }}
              />

              {editTagNames.length > 0 && (
                <div style={tagBadgesWrapStyle}>
                  {editTagNames.map((tagName) => (
                    <span key={tagName} style={tagBadgeStyle}>
                      #{tagName}
                      <button
                        type="button"
                        style={tagRemoveButtonStyle}
                        onClick={() => {
                          const nextTagNames = editTagNames.filter((item) => item !== tagName)
                          setEditTagNames(nextTagNames)
                          setEditTagInput(nextTagNames.join(', '))
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <PaymentSplitEditor
              amount={editAmount}
              isVisible={paymentSourceOptions.length > 0}
              selectedPaymentSourceId={editPaymentSourceId}
              setSelectedPaymentSourceId={setEditPaymentSourceId}
              paymentSourceOptions={paymentSourceOptions}
              paymentSplitItems={editPaymentSplitItems}
              setPaymentSplitItems={setEditPaymentSplitItems}
              styles={styles}
            />
          </div>
        ) : isMovingCurrent ? (
          <div style={formRowStyle}>
            <select
              style={wideInputStyle}
              value={moveTargetCategoryId}
              onChange={(event) => setMoveTargetCategoryId(event.target.value)}
            >
              <option value="">Wybierz kategorię</option>
              {moveTargets.map((target) => (
                <option key={target.id} value={target.id}>
                  {target.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <div style={transactionDescriptionStyle}>{transaction.description?.trim() || 'Brak opisu'}</div>
            {paymentSourceLabels.map((label) => (
              <div key={`${transaction.id}-${label}`} style={{ ...calendarDayMetaStyle, marginTop: 6 }}>
                {label}
              </div>
            ))}

            {transactionTags.length > 0 && (
              <div style={transactionTagsStyle}>
                {transactionTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    style={transactionTagBadgeStyle}
                    onClick={() => onTagClick?.(tag.id)}
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {!isEditing && context === 'no-day' && (
          <div style={noDayHintStyle}>
            Ten wpis należy do miesiąca, ale nie wpływa na konkretny dzień ani heatmapę.
          </div>
        )}

        {!isSelectedMonthLocked && (
          <div style={transactionActionsStyle}>
            {isEditing ? (
              <>
                <button
                  type="button"
                  style={primaryButtonStyle}
                  disabled={isUpdating}
                  onClick={async () => {
                    await saveEditingTransaction(transaction.id)
                  }}
                >
                  {isUpdating ? 'zapisywanie...' : 'zapisz'}
                </button>

                <button
                  type="button"
                  style={secondaryButtonStyle}
                  onClick={cancelEditingTransaction}
                >
                  anuluj
                </button>
              </>
            ) : isMovingCurrent ? (
              <>
                <button
                  type="button"
                  style={primaryButtonStyle}
                  disabled={isMoving || !moveTargetCategoryId}
                  onClick={async () => {
                    await saveMovingTransaction(transaction.id)
                  }}
                >
                  {isMoving ? 'zapisywanie...' : 'zapisz'}
                </button>

                <button
                  type="button"
                  style={secondaryButtonStyle}
                  onClick={cancelMovingTransaction}
                >
                  anuluj
                </button>
              </>
            ) : (
              <>
                {context === 'no-day' && (
                  <button
                    type="button"
                    style={primaryButtonStyle}
                    onClick={() => startEditingTransaction(transaction)}
                  >
                    dodaj dzień
                  </button>
                )}

                <button
                  type="button"
                  style={secondaryButtonStyle}
                  onClick={() => startEditingTransaction(transaction)}
                >
                  edytuj
                </button>

                <button
                  type="button"
                  style={secondaryButtonStyle}
                  onClick={() => startMovingTransaction(transaction)}
                >
                  przenieś
                </button>

                <button
                  type="button"
                  style={dangerButtonStyle}
                  onClick={async () => {
                    await onDeleteTransaction(transaction.id)
                  }}
                >
                  usuń
                </button>
              </>
            )}
          </div>
        )}
      </div>
    )
  }

  const dayCells: ReactNode[] = []

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dayKey = String(day).padStart(2, '0')
    const dateText = `${selectedMonth}-${dayKey}`
    const stats = dayStats[dayKey]
    const isActive = selectedDay === dayKey
    const isBeforeBudgetStart = isDateBeforeBudgetStart(dateText, budgetStartDate)
    const isFuture = isFutureDate(dateText)

    let cellStyle: CSSProperties = calendarDayCellStyle
    let dynamicTextColor = '#111827'

    if (isFuture) {
      cellStyle = {
        ...calendarDayCellStyle,
        background: '#f1f5f9',
        border: '1px solid #e2e8f0',
        opacity: 0.62,
      }
      dynamicTextColor = '#64748b'
    } else if (isBeforeBudgetStart) {
      cellStyle = {
        ...calendarDayCellStyle,
        background: '#f3f4f6',
        border: '1px dashed #d1d5db',
        opacity: 0.58,
      }
      dynamicTextColor = '#6b7280'
    } else if (heatmapMode === 'normal') {
      cellStyle = isActive
        ? {
            ...calendarDayCellStyle,
            background: '#eef6ff',
            border: '1px solid #93c5fd',
          }
        : calendarDayCellStyle
    } else {
      const visual =
        heatmapVariant === 'balance'
          ? getBalanceHeatmapVisual(
              stats?.signedSum || 0,
              negativeHeatmapReference,
              positiveHeatmapReference,
              heatmapInverted
            )
          : getDirectionalHeatmapVisual(
              stats?.rawSum || 0,
              sumHeatmapReference,
              heatmapVariant === 'income' ? 8 : 145,
              heatmapVariant === 'income' ? 145 : 8,
              heatmapInverted
            )

      dynamicTextColor = visual.textColor

      cellStyle = {
        ...calendarDayCellStyle,
        background: visual.background,
        border: `1px solid ${visual.borderColor}`,
      }

      if (isActive) {
        cellStyle = {
          ...cellStyle,
          boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.35)',
        }
      }
    }

    dayCells.push(
      <button
        key={dayKey}
        type="button"
        style={cellStyle}
        disabled={isBeforeBudgetStart}
        onClick={() => setSelectedDay(dayKey)}
      >
        <div
          style={{
            ...calendarExpandBadgeStyle,
            color: dynamicTextColor,
            background: dynamicTextColor === '#ffffff' ? 'rgba(255,255,255,0.14)' : '#ffffff',
            border:
              dynamicTextColor === '#ffffff'
                ? '1px solid rgba(255,255,255,0.28)'
                : '1px solid #cbd5e1',
          }}
        >
          ↗
        </div>

        <div style={{ ...calendarDayNumberStyle, color: dynamicTextColor }}>{day}</div>

        {isBeforeBudgetStart ? (
          <div style={{ ...calendarDayMetaStyle, color: dynamicTextColor }}>Poza zakresem</div>
        ) : isFuture ? (
          <div style={{ ...calendarDayMetaStyle, color: dynamicTextColor }}>Przyszłość</div>
        ) : stats ? (
          <>
            <div
              style={{
                ...calendarDayMetaStyle,
                color: heatmapMode === 'balance' ? dynamicTextColor : calendarDayMetaStyle.color,
              }}
            >
              {getDayMetricLabel()}:{' '}
              <strong>
                {heatmapVariant === 'balance' && getDayMetricValue(stats) > 0 ? '+' : ''}
                {formatAmount(getDayMetricValue(stats))} zł
              </strong>
            </div>
            <div
              style={{
                ...calendarDayCountStyle,
                color: heatmapMode === 'balance' ? dynamicTextColor : calendarDayCountStyle.color,
              }}
            >
              {stats.count === 1 ? '1 wpis' : `Wpisy: ${stats.count}`}
            </div>
          </>
        ) : (
          <div style={{ ...calendarDayMetaStyle, color: dynamicTextColor }}>Brak wpisów</div>
        )}
      </button>
    )
  }

  return (
    <MonthCalendarContainer
      firstDayOffset={firstDayOffset}
      dayCells={dayCells}
      heatmapMode={heatmapMode}
      legendLabels={legendLabels}
      toolbar={
        <MonthCalendarToolbar
          title={calendarTitle}
          subtitle={calendarSubtitle}
          styles={styles}
          heatmapMode={heatmapMode}
          heatmapInverted={heatmapInverted}
          showHeatmapControls={showHeatmapControls}
          onHeatmapModeChange={handleHeatmapModeChange}
          onHeatmapInvertedChange={handleHeatmapInvertedChange}
        />
      }
      notices={
        <>
          {isSelectedMonthPartial && (
            <div style={{ ...styles.infoBox, marginBottom: 10 }}>
              Ten miesiąc jest niepełny — dane przed datą startową nie są liczone.
            </div>
          )}
          {isSelectedMonthExcluded && (
            <div style={{ ...styles.infoBox, marginBottom: 10 }}>
              Ten miesiąc jest wyłączony ze statystyk.
            </div>
          )}
          {onToggleSelectedMonthExcluded && (
            <div style={{ marginBottom: 10 }}>
              <button
                type="button"
                style={isSelectedMonthExcluded ? styles.primaryButton : styles.secondaryButton}
                disabled={isUpdatingSelectedMonthExclusion}
                onClick={() => {
                  void onToggleSelectedMonthExcluded()
                }}
              >
                {isUpdatingSelectedMonthExclusion
                  ? 'Zapisywanie...'
                  : isSelectedMonthExcluded
                    ? 'Przywróć miesiąc do statystyk'
                    : 'Wyłącz miesiąc ze statystyk'}
              </button>
            </div>
          )}
        </>
      }
      noDaySection={
        <MonthCalendarNoDaySection
          transactionsWithoutDay={transactionsWithoutDay}
          noDayTransactionsSum={noDayTransactionsSum}
          styles={styles}
          formatAmount={formatAmount}
          renderTransactionCard={renderTransactionCard}
        />
      }
      suggestionMenu={
        <DescriptionSuggestionDeleteMenu
          isOpen={Boolean(suggestionToDelete)}
          x={deletePromptPosition.x}
          y={deletePromptPosition.y}
          onConfirm={confirmDeleteSuggestion}
          onCancel={closeDeletePrompt}
        />
      }
      dayModal={
        selectedDay ? (
          <MonthCalendarDayModal
            selectedDay={selectedDay}
            selectedMonth={selectedMonth}
            selectedDayTransactions={selectedDayTransactions}
            selectedDayPrimaryValue={selectedDayPrimaryValue}
            selectedDayRawSum={selectedDayRawSum}
            heatmapVariant={heatmapVariant}
            isSelectedMonthLocked={isSelectedMonthLocked}
            styles={styles}
            getDayMetricLabel={getDayMetricLabel}
            formatAmount={formatAmount}
            renderTransactionCard={renderTransactionCard}
            onAddTransactionForDay={onAddTransactionForDay}
            onClose={closeModal}
          />
        ) : null
      }
    />
  )
}
