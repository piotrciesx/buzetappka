'use client'

import { CSSProperties, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Tag } from '../lib/budgetPageTypes'
import DescriptionSuggestionDeleteMenu from './DescriptionSuggestionDeleteMenu'
import PaymentSplitEditor from './PaymentSplitEditor'
import {
  buildDateFromDayInput,
  getDayInputFromDate,
  getDaysInMonth,
  normalizeDayInput,
} from '../lib/dateUtils'
import { DescriptionSuggestion, DescriptionSuggestionSet } from '../lib/suggestionUtils'
import { splitTagInput } from '../lib/tagUtils'
import { useDescriptionSuggestions } from '../lib/useDescriptionSuggestions'
import {
  createPaymentSplitItemsFromStoredSplits,
  getTransactionPaymentSourceDisplayLines,
  PaymentSplitInput,
} from '../lib/paymentSplitUtils'

type Transaction = {
  id: string
  category_id: string
  amount: number | string
  description: string | null
  date: string
  day_is_null?: boolean
  payment_source_id?: string | null
  created_at?: string
  is_deleted?: boolean
  deleted_at?: string | null
}

type TransactionPaymentSplit = {
  id: string
  transaction_id: string
  payment_source_id: string
  amount: number
  created_at?: string
}

type MoveTarget = {
  id: string
  label: string
}

type HeatmapMode = 'normal' | 'balance'
type HeatmapVariant = 'balance' | 'income' | 'expense'

type Props = {
  selectedMonth: string
  transactions: Transaction[]
  styles: Record<string, CSSProperties>
  isSelectedMonthLocked: boolean
  getAmountNumber: (value: unknown) => number
  getMoveTargetsForTransaction: (transaction: Transaction) => MoveTarget[]
  getSignedAmountForTransaction: (transaction: Transaction) => number
  onUpdateTransaction: (
    transactionId: string,
    amountText: string,
    descriptionText: string,
    dateText: string,
    tagNames?: string[],
    dayIsNullOverride?: boolean,
    paymentSourceId?: string | null,
    paymentSplitItems?: PaymentSplitInput[]
  ) => Promise<void>
  onDeleteTransaction: (transactionId: string) => Promise<void>
  onMoveTransaction: (transactionId: string, targetCategoryId: string) => Promise<void>
  onAddTransactionForDay?: (dayText: string) => void
  calendarTitle?: string
  calendarSubtitle?: string
  heatmapVariant?: HeatmapVariant
  heatmapMode?: HeatmapMode
  onHeatmapModeChange?: (value: HeatmapMode) => void
  heatmapInverted?: boolean
  onHeatmapInvertedChange?: (value: boolean) => void
  defaultHeatmapMode?: HeatmapMode
  defaultHeatmapInverted?: boolean
  heatmapStorageKey?: string
  showHeatmapControls?: boolean
  descriptionSuggestions: DescriptionSuggestionSet
  getPaymentSourceOptionsForCategoryId?: (
    categoryId: string
  ) => Array<{
    id: string
    name: string
    type: string
    optionLabel?: string
  }>
  transactionTagsMap?: Record<string, Tag[]>
  transactionPaymentSplitsMap?: Record<string, TransactionPaymentSplit[]>
  onTagClick?: (tagId: string) => void
  onDeleteDescriptionSuggestion?: (
    categoryId: string | null | undefined,
    suggestion: DescriptionSuggestion
  ) => void
}

const calendarPanelStyle = {
  marginBottom: 20,
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: 14,
  padding: 16,
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
} as const

const calendarWeekdaysStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
  gap: 8,
  marginTop: 12,
} as const

const calendarWeekdayStyle = {
  padding: '8px 10px',
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  color: '#6b7280',
} as const

const calendarGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
  gap: 8,
  marginTop: 8,
} as const

const calendarDayCellStyle = {
  minHeight: 108,
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 10,
  background: '#f8fafc',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 8,
  cursor: 'pointer',
  position: 'relative' as const,
  textAlign: 'left' as const,
} as const

const calendarExpandBadgeStyle = {
  position: 'absolute' as const,
  top: 8,
  right: 8,
  width: 18,
  height: 18,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 11,
  fontWeight: 700,
  color: '#475569',
  border: '1px solid #cbd5e1',
  borderRadius: 6,
  background: '#ffffff',
  lineHeight: 1,
  pointerEvents: 'none' as const,
} as const

const calendarEmptyCellStyle = {
  minHeight: 108,
  border: '1px dashed #e5e7eb',
  borderRadius: 12,
  padding: 10,
  background: '#f9fafb',
} as const

const calendarDayNumberStyle = {
  fontSize: 14,
  fontWeight: 700,
  color: '#111827',
} as const

const calendarDayMetaStyle = {
  fontSize: 12,
  color: '#4b5563',
  lineHeight: 1.4,
} as const

const calendarDayCountStyle = {
  fontSize: 12,
  color: '#6b7280',
} as const

const overlayStyle = {
  position: 'fixed' as const,
  inset: 0,
  background: 'rgba(15, 23, 42, 0.35)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
  zIndex: 1000,
} as const

const modalStyle = {
  width: 'min(860px, 100%)',
  maxHeight: '85vh',
  overflowY: 'auto' as const,
  background: '#ffffff',
  borderRadius: 16,
  border: '1px solid #dbeafe',
  boxShadow: '0 20px 40px rgba(15, 23, 42, 0.18)',
  padding: 18,
} as const

const modalHeaderStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 14,
} as const

const modalTitleStyle = {
  fontSize: 18,
  fontWeight: 700,
  color: '#111827',
  marginBottom: 4,
} as const

const modalSubtitleStyle = {
  fontSize: 13,
  color: '#6b7280',
} as const

const closeButtonStyle = {
  border: '1px solid #d1d5db',
  background: '#ffffff',
  borderRadius: 10,
  padding: '8px 10px',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
} as const

const daySummaryCardStyle = {
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 12,
  background: '#f8fafc',
  marginBottom: 14,
} as const

const transactionsListStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 10,
} as const

const transactionCardStyle = {
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 12,
  background: '#ffffff',
} as const

const transactionTopRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 8,
} as const

const transactionAmountStyle = {
  fontSize: 15,
  fontWeight: 700,
  color: '#111827',
} as const

const transactionDescriptionStyle = {
  fontSize: 14,
  color: '#374151',
} as const

const transactionTagsStyle = {
  display: 'flex',
  gap: 6,
  flexWrap: 'wrap' as const,
  marginTop: 8,
} as const

const transactionTagBadgeStyle = {
  fontSize: 12,
  padding: '4px 8px',
  borderRadius: 999,
  background: '#eff6ff',
  border: '1px solid #bfdbfe',
  color: '#1d4ed8',
  cursor: 'pointer',
} as const

const emptyDayStyle = {
  border: '1px dashed #d1d5db',
  borderRadius: 12,
  padding: 14,
  background: '#f9fafb',
  color: '#6b7280',
  fontSize: 14,
} as const

const transactionActionsStyle = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: 8,
  marginTop: 10,
} as const

const formRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap' as const,
  marginTop: 8,
} as const

const inputStyle = {
  border: '1px solid #d1d5db',
  borderRadius: 10,
  padding: '8px 10px',
  fontSize: 14,
  minHeight: 38,
} as const

const smallInputStyle = {
  ...inputStyle,
  width: 90,
} as const

const wideInputStyle = {
  ...inputStyle,
  flex: 1,
  minWidth: 180,
} as const

const descriptionFieldWrapStyle = {
  flex: 1,
  minWidth: 220,
  position: 'relative' as const,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 0,
} as const

const suggestionsDropdownStyle = {
  position: 'absolute' as const,
  top: 'calc(100% + 4px)',
  left: 0,
  right: 0,
  zIndex: 20,
  background: '#ffffff',
  border: '1px solid #d1d5db',
  borderRadius: 10,
  boxShadow: '0 10px 24px rgba(15, 23, 42, 0.12)',
  overflow: 'hidden' as const,
} as const

const suggestionButtonBaseStyle = {
  width: '100%',
  textAlign: 'left' as const,
  border: 'none',
  background: '#ffffff',
  padding: '10px 12px',
  cursor: 'pointer',
  fontSize: 13,
  color: '#111827',
} as const

const tagFieldWrapStyle = {
  marginTop: 8,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 8,
} as const

const tagBadgesWrapStyle = {
  display: 'flex',
  gap: 6,
  flexWrap: 'wrap' as const,
} as const

const tagBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '4px 8px',
  borderRadius: 999,
  background: '#eff6ff',
  border: '1px solid #bfdbfe',
  color: '#1d4ed8',
  fontSize: 12,
  fontWeight: 600,
} as const

const tagRemoveButtonStyle = {
  border: 'none',
  background: 'transparent',
  color: '#1d4ed8',
  cursor: 'pointer',
  fontSize: 14,
  lineHeight: 1,
  padding: 0,
} as const

const primaryButtonStyle = {
  border: '1px solid #2563eb',
  background: '#2563eb',
  color: '#ffffff',
  borderRadius: 10,
  padding: '8px 10px',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
} as const

const secondaryButtonStyle = {
  border: '1px solid #d1d5db',
  background: '#ffffff',
  color: '#111827',
  borderRadius: 10,
  padding: '8px 10px',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
} as const

const dangerButtonStyle = {
  border: '1px solid #fecaca',
  background: '#fff1f2',
  color: '#b91c1c',
  borderRadius: 10,
  padding: '8px 10px',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
} as const

const heatmapBarStyle = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap' as const,
  marginTop: 14,
  marginBottom: 8,
} as const

const heatmapLegendStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 8,
  marginBottom: 8,
  fontSize: 12,
  color: '#4b5563',
} as const

const heatmapLegendLabelsStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  fontSize: 12,
  fontWeight: 600,
  color: '#4b5563',
} as const

const heatmapLegendBarStyle = {
  width: '100%',
  height: 14,
  borderRadius: 999,
  border: '1px solid #d8dee8',
  background:
    'linear-gradient(90deg, rgb(204, 62, 47) 0%, rgb(239, 208, 124) 50%, rgb(44, 163, 92) 100%)',
  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.5)',
} as const

const heatmapSwitchRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap' as const,
  marginBottom: 8,
  fontSize: 12,
  color: '#4b5563',
} as const

const noDaySectionStyle = {
  marginTop: 18,
  borderTop: '1px solid #e5e7eb',
  paddingTop: 16,
} as const

const noDaySummaryStyle = {
  marginTop: 8,
  marginBottom: 12,
  padding: 12,
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  background: '#f8fafc',
} as const

const noDayHintStyle = {
  fontSize: 12,
  color: '#6b7280',
  marginTop: 6,
  lineHeight: 1.4,
} as const

const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  border: '1px solid #cbd5e1',
  background: '#f8fafc',
  color: '#475569',
  borderRadius: 999,
  padding: '4px 8px',
  fontSize: 12,
  fontWeight: 600,
} as const

const weekdayLabels = ['pon', 'wt', 'śr', 'czw', 'pt', 'sob', 'ndz']

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

export default function MonthCalendarPanel(props: Props) {
  const {
    selectedMonth,
    transactions,
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

  const transactionsWithoutDay = useMemo(() => {
    return transactions.filter((transaction) => transaction.day_is_null)
  }, [transactions])

  const transactionsByDay = useMemo(() => {
    return transactionsWithDay.reduce<Record<string, Transaction[]>>((acc, transaction) => {
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
  }, [transactionsWithDay])

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
    const values = Object.values(dayStats)
      .map((item) => item.signedSum)
      .filter((value) => value > 0)

    return getReferenceValue(values)
  }, [dayStats])

  const negativeHeatmapReference = useMemo(() => {
    const values = Object.values(dayStats)
      .map((item) => item.signedSum)
      .filter((value) => value < 0)
      .map((value) => Math.abs(value))

    return getReferenceValue(values)
  }, [dayStats])

  const sumHeatmapReference = useMemo(() => {
    const values = Object.values(dayStats)
      .map((item) => item.rawSum)
      .filter((value) => value > 0)

    return getReferenceValue(values)
  }, [dayStats])

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

  const dayCells = Array.from({ length: firstDayOffset }, (_, index) => (
    <div key={`empty-${index}`} style={calendarEmptyCellStyle} />
  ))

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dayKey = String(day).padStart(2, '0')
    const stats = dayStats[dayKey]
    const isActive = selectedDay === dayKey

    let cellStyle: CSSProperties = calendarDayCellStyle
    let dynamicTextColor = '#111827'

    if (heatmapMode === 'normal') {
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
      <button key={dayKey} type="button" style={cellStyle} onClick={() => setSelectedDay(dayKey)}>
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

        {stats ? (
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
    <>
      <section style={calendarPanelStyle}>
        <div style={styles.sectionTitle}>{calendarTitle}</div>
        <div style={{ ...styles.pageSubtitle, marginBottom: 0 }}>{calendarSubtitle}</div>

        {showHeatmapControls && (
          <>
            <div style={heatmapBarStyle}>
              <button
                type="button"
                style={heatmapMode === 'normal' ? primaryButtonStyle : secondaryButtonStyle}
                onClick={() => handleHeatmapModeChange('normal')}
              >
                zwykły
              </button>

              <button
                type="button"
                style={heatmapMode === 'balance' ? primaryButtonStyle : secondaryButtonStyle}
                onClick={() => handleHeatmapModeChange('balance')}
              >
                heatmapa
              </button>
            </div>

            <label style={heatmapSwitchRowStyle}>
              <input
                type="checkbox"
                checked={heatmapInverted}
                onChange={(event) => handleHeatmapInvertedChange(event.target.checked)}
              />
              <span>Odwróć kierunek kolorów</span>
            </label>
          </>
        )}

        {heatmapMode === 'balance' && (
          <div style={heatmapLegendStyle}>
            <div style={heatmapLegendLabelsStyle}>
              <span>{legendLabels.left}</span>
              <span>{legendLabels.right}</span>
            </div>
            <div style={heatmapLegendBarStyle} />
          </div>
        )}

        <div style={calendarWeekdaysStyle}>
          {weekdayLabels.map((label) => (
            <div key={label} style={calendarWeekdayStyle}>
              {label}
            </div>
          ))}
        </div>

        <div style={calendarGridStyle}>{dayCells}</div>

        <div style={noDaySectionStyle}>
          <div style={styles.sectionTitle}>Bez dnia / pozostałe</div>

          <div style={noDaySummaryStyle}>
            <div style={styles.l2Name}>Podsumowanie wpisów bez dnia</div>
            <div style={{ ...calendarDayMetaStyle, marginTop: 6 }}>
              Suma: <strong>{formatAmount(noDayTransactionsSum)} zł</strong>
            </div>
            <div style={{ ...calendarDayMetaStyle, marginTop: 4 }}>
              Liczba wpisów: <strong>{transactionsWithoutDay.length}</strong>
            </div>
            <div style={noDayHintStyle}>
              Te wpisy należą do wybranego miesiąca, ale nie są przypisane do konkretnego dnia i
              nie wpływają na heatmapę.
            </div>
          </div>

          {transactionsWithoutDay.length === 0 ? (
            <div style={styles.emptyStateCard}>Brak wpisów bez dnia w tym miesiącu.</div>
          ) : (
            <div style={transactionsListStyle}>
              {transactionsWithoutDay.map((transaction) =>
                renderTransactionCard(transaction, 'no-day')
              )}
            </div>
          )}
        </div>
      </section>

      <DescriptionSuggestionDeleteMenu
        isOpen={Boolean(suggestionToDelete)}
        x={deletePromptPosition.x}
        y={deletePromptPosition.y}
        onConfirm={confirmDeleteSuggestion}
        onCancel={closeDeletePrompt}
      />

      {selectedDay && (
        <div style={overlayStyle} onClick={closeModal}>
          <div style={modalStyle} onClick={(event) => event.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <div>
                <div style={modalTitleStyle}>
                  Wpisy z dnia {selectedDay}.{selectedMonth.slice(5, 7)}.{selectedMonth.slice(0, 4)}
                </div>
                <div style={modalSubtitleStyle}>
                  Podgląd i operacje dla wpisów z wybranego dnia.
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {!isSelectedMonthLocked && onAddTransactionForDay && (
                  <button
                    type="button"
                    style={primaryButtonStyle}
                    onClick={() => {
                      onAddTransactionForDay(selectedDay)
                      closeModal()
                    }}
                  >
                    dodaj wpis
                  </button>
                )}

                <button type="button" style={closeButtonStyle} onClick={closeModal}>
                  zamknij
                </button>
              </div>
            </div>

            <div style={daySummaryCardStyle}>
              <div style={styles.l2Name}>Podsumowanie dnia</div>
              <div style={{ ...calendarDayMetaStyle, marginTop: 6 }}>
                {getDayMetricLabel()}:{' '}
                <strong>
                  {heatmapVariant === 'balance' && selectedDayPrimaryValue > 0 ? '+' : ''}
                  {formatAmount(selectedDayPrimaryValue)} zł
                </strong>
              </div>
              {heatmapVariant === 'balance' && (
                <div style={{ ...calendarDayMetaStyle, marginTop: 4 }}>
                  Suma nominalna wpisów: <strong>{formatAmount(selectedDayRawSum)} zł</strong>
                </div>
              )}
              <div style={{ ...calendarDayMetaStyle, marginTop: 4 }}>
                Liczba wpisów: <strong>{selectedDayTransactions.length}</strong>
              </div>
            </div>

            {selectedDayTransactions.length === 0 ? (
              <div style={emptyDayStyle}>
                Brak wpisów w tym dniu.
                {!isSelectedMonthLocked && onAddTransactionForDay && (
                  <div style={{ marginTop: 12 }}>
                    <button
                      type="button"
                      style={primaryButtonStyle}
                      onClick={() => {
                        onAddTransactionForDay(selectedDay)
                        closeModal()
                      }}
                    >
                      dodaj pierwszy wpis z tego dnia
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={transactionsListStyle}>
                {selectedDayTransactions.map((transaction) =>
                  renderTransactionCard(transaction, 'day')
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
