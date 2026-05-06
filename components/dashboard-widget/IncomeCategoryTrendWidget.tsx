'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Category, Tag, Transaction } from '../../lib/budgetPageTypes'
import type { DashboardStats, TopCategory } from '../../lib/dashboardStats'
import type { DashboardWidgetLayoutItem } from '../../lib/dashboardTypes'
import { getUniqueCategoryLabel } from '../../lib/categoryUtils'
import { getExistingDaysInMonth } from '../../lib/dateUtils'
import type { DashboardWidgetPixelRect } from './dashboardWidgetTileTypes'
import { SOFT_BORDER, SOFT_TEXT } from './dashboardWidgetTileStyles'

type Props = {
  widget: DashboardWidgetLayoutItem
  rect: DashboardWidgetPixelRect
  transactions: Transaction[]
  selectedMonth: string
  budgetStartDate: string
  excludedMonthsSet: Set<string>
  transactionTagsMap: Record<string, Tag[]>
  dashboardStats: DashboardStats
  topExpenseCategories: TopCategory[]
  latestTransactions: Transaction[]
  categoriesById: Record<string, Category>
  getSignedAmountForTransaction: (transaction: Transaction) => number
}

type MonthPoint = {
  key: string
  label: string
  existingDays: number
  isExcluded: boolean
  valuesBySeriesId: Record<string, number>
}

type CategoryOption = {
  id: string
  name: string
  level: 'category' | 'subcategory'
  parentId: string | null
  color: string
  total: number
  categoryIds: Set<string>
}

const FONT =
  'var(--font-app-sans)'

const SERIES_COLORS = [
  '#0f766e',
  '#2563eb',
  '#7c3aed',
  '#ea580c',
  '#db2777',
  '#65a30d',
  '#0891b2',
  '#9333ea',
  '#ca8a04',
  '#dc2626',
]

const rootStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  gridTemplateRows: '1fr auto',
  gap: 6,
  padding: '8px 10px 6px',
  boxSizing: 'border-box',
  overflow: 'hidden',
  fontFamily: FONT,
}

const chartBoxStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  border: `1px solid ${SOFT_BORDER}`,
  borderRadius: 14,
  background: 'rgba(255,255,255,0.6)',
  padding: '6px 7px 0',
  display: 'grid',
  gridTemplateRows: 'minmax(0, 1fr)',
  gap: 0,
  overflow: 'hidden',
}

const chartAreaStyle: CSSProperties = {
  position: 'relative',
  minWidth: 0,
  minHeight: 0,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
}

const svgWrapStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  minWidth: 0,
  minHeight: 0,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
}

const scaleLabelBaseStyle: CSSProperties = {
  position: 'absolute',
  left: 0,
  width: 34,
  textAlign: 'right',
  color: 'rgba(100,116,139,0.52)',
  fontSize: 8.5,
  lineHeight: 1.2,
  fontWeight: 500,
  transform: 'translateY(-50%)',
  pointerEvents: 'none',
  userSelect: 'none',
  fontFamily: FONT,
}

const monthLabelBaseStyle: CSSProperties = {
  position: 'absolute',
  color: SOFT_TEXT,
  fontSize: 8.5,
  lineHeight: 1.2,
  fontWeight: 600,
  textAlign: 'center',
  transform: 'translateX(-50%)',
  pointerEvents: 'none',
  userSelect: 'none',
  fontFamily: FONT,
  whiteSpace: 'nowrap',
}

const footerStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gridTemplateColumns: 'auto minmax(0, 1fr)',
  alignItems: 'center',
  gap: 8,
  overflow: 'visible',
}

const dropdownWrapStyle: CSSProperties = {
  position: 'relative',
  minWidth: 0,
}

const dropdownButtonStyle: CSSProperties = {
  minWidth: 156,
  height: 24,
  border: `1px solid ${SOFT_BORDER}`,
  borderRadius: 8,
  background: 'rgba(255,255,255,0.86)',
  color: '#334155',
  fontSize: 10.5,
  fontWeight: 600,
  padding: '2px 8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 6,
  cursor: 'pointer',
}

const dropdownPanelStyle: CSSProperties = {
  position: 'absolute',
  left: 0,
  bottom: 28,
  zIndex: 20,
  width: 250,
  maxHeight: 260,
  overflowY: 'auto',
  border: `1px solid ${SOFT_BORDER}`,
  borderRadius: 10,
  background: 'rgba(255,255,255,0.98)',
  boxShadow: '0 12px 28px rgba(15,23,42,0.12)',
  padding: 8,
  display: 'grid',
  gap: 7,
}

const sectionTitleStyle: CSSProperties = {
  color: SOFT_TEXT,
  fontSize: 10,
  lineHeight: 1.2,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: 0.3,
  marginTop: 3,
}

const checkboxRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'auto 8px minmax(0, 1fr)',
  alignItems: 'center',
  gap: 7,
  color: '#334155',
  fontSize: 11,
  fontWeight: 600,
  cursor: 'pointer',
}

const disabledRowStyle: CSSProperties = {
  ...checkboxRowStyle,
  opacity: 0.38,
  cursor: 'not-allowed',
}

const legendStyle: CSSProperties = {
  minWidth: 0,
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: 10,
  color: SOFT_TEXT,
  fontSize: 10.5,
  lineHeight: 1.2,
  fontWeight: 600,
  overflow: 'hidden',
}

const legendItemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 5,
  minWidth: 0,
  maxWidth: 126,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const dotStyle: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: 999,
  flex: '0 0 auto',
}

const emptyStyle: CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  height: '100%',
  color: SOFT_TEXT,
  fontSize: 12,
  textAlign: 'center',
  padding: 10,
}

function getMonthList(selectedMonth: string, count: number) {
  const [year, month] = selectedMonth.split('-').map(Number)
  const result: string[] = []

  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(year, month - 1 - index, 1)
    const nextYear = date.getFullYear()
    const nextMonth = String(date.getMonth() + 1).padStart(2, '0')
    result.push(`${nextYear}-${nextMonth}`)
  }

  return result
}

function getBudgetStartMonth(budgetStartDate: string) {
  return budgetStartDate.slice(0, 7)
}

function isMonthBeforeBudgetStart(month: string, budgetStartDate: string) {
  const budgetStartMonth = getBudgetStartMonth(budgetStartDate)
  return Boolean(budgetStartMonth) && month < budgetStartMonth
}

function formatMonthLabel(month: string) {
  const [year, monthNumber] = month.split('-')
  return `${monthNumber}.${year.slice(2)}`
}

function getCategoryName(category: Category) {
  return String((category as Category & { name?: string }).name ?? 'Bez nazwy')
}

function getCategoryParentId(category: Category) {
  const value = (category as Category & { parent_id?: string | null; parentId?: string | null }).parent_id
  return value ?? (category as Category & { parentId?: string | null }).parentId ?? null
}

function getCategoryKind(category: Category) {
  const raw = String(
    (category as Category & { kind?: string; type?: string; category_type?: string }).kind ??
      (category as Category & { type?: string }).type ??
      (category as Category & { category_type?: string }).category_type ??
      ''
  ).toLowerCase()

  return raw
}

function isIncomeRoot(category: Category) {
  const name = getCategoryName(category).toLowerCase()
  const kind = getCategoryKind(category)

  return kind === 'income' || kind === 'incomes' || name === 'przychody'
}

function getDayFromDate(date: string) {
  const day = Number(date.slice(8, 10))
  return Number.isFinite(day) ? day : 0
}

function getNiceStep(maxValue: number) {
  if (maxValue <= 0) return 1

  const roughStep = maxValue / 4
  const power = Math.pow(10, Math.floor(Math.log10(roughStep)))
  const normalized = roughStep / power

  if (normalized <= 1) return power
  if (normalized <= 2) return 2 * power
  if (normalized <= 5) return 5 * power
  return 10 * power
}

function formatScaleValue(value: number) {
  if (Math.abs(value) >= 1000000) return `${Math.round(value / 100000) / 10} mln`
  if (Math.abs(value) >= 1000) return `${Math.round(value / 100) / 10}k`
  return String(Math.round(value))
}

function getVisibleModeLabel(selectedCount: number, selectedLevel: 'category' | 'subcategory' | null) {
  if (selectedCount === 0) return 'nic nie wybrano'
  if (selectedLevel === 'category') return `kategorie · ${selectedCount}`
  if (selectedLevel === 'subcategory') return `podkategorie · ${selectedCount}`
  return `wybrane · ${selectedCount}`
}

function collectDescendantIds(categoryId: string, childrenByParent: Record<string, Category[]>): Set<string> {
  const result = new Set<string>([categoryId])
  const children = childrenByParent[categoryId] ?? []

  children.forEach((child) => {
    collectDescendantIds(child.id, childrenByParent).forEach((id) => result.add(id))
  })

  return result
}

function buildCategoryOptions(
  categoriesById: Record<string, Category>,
  transactions: Transaction[],
  months: string[],
  budgetStartDate: string,
  excludedMonthsSet: Set<string>,
  getSignedAmountForTransaction: (transaction: Transaction) => number
): CategoryOption[] {
  const categories = Object.values(categoriesById)
  const childrenByParent: Record<string, Category[]> = {}

  categories.forEach((category) => {
    const parentId = getCategoryParentId(category)
    if (!parentId) return
    if (!childrenByParent[parentId]) childrenByParent[parentId] = []
    childrenByParent[parentId].push(category)
  })

  const root = categories.find(isIncomeRoot)
  const level2 = root ? childrenByParent[root.id] ?? [] : categories.filter((category) => !getCategoryParentId(category))
  const level3 = level2.flatMap((category) => childrenByParent[category.id] ?? [])
  const scopeCategoryIds = [...level2, ...level3].map((category) => category.id)
  const allowedMonths = new Set(months)

  const getTotalForIds = (categoryIds: Set<string>) => {
    return transactions.reduce((sum, transaction) => {
      if (transaction.is_deleted || !categoryIds.has(transaction.category_id)) return sum

      const month = transaction.date.slice(0, 7)
      const day = getDayFromDate(transaction.date)
      const existingDays = getExistingDaysInMonth(month)

      if (
        !allowedMonths.has(month) ||
        isMonthBeforeBudgetStart(month, budgetStartDate) ||
        excludedMonthsSet.has(month) ||
        existingDays === 0 ||
        day < 1 ||
        day > existingDays
      ) {
        return sum
      }

      const amount = getSignedAmountForTransaction(transaction)
      return amount >= 0 ? sum + amount : sum
    }, 0)
  }

  const categoryOptions = level2.map((category, index) => {
    const categoryIds = collectDescendantIds(category.id, childrenByParent)
    return {
      id: category.id,
      name: getUniqueCategoryLabel(category.id, categoriesById, scopeCategoryIds),
      level: 'category' as const,
      parentId: getCategoryParentId(category),
      color: SERIES_COLORS[index % SERIES_COLORS.length],
      total: getTotalForIds(categoryIds),
      categoryIds,
    }
  })

  const subcategoryOptions = level3.map((category, index) => {
    const categoryIds = collectDescendantIds(category.id, childrenByParent)
    return {
      id: category.id,
      name: getUniqueCategoryLabel(category.id, categoriesById, scopeCategoryIds),
      level: 'subcategory' as const,
      parentId: getCategoryParentId(category),
      color: SERIES_COLORS[(index + categoryOptions.length) % SERIES_COLORS.length],
      total: getTotalForIds(categoryIds),
      categoryIds,
    }
  })

  return [...categoryOptions, ...subcategoryOptions].filter((option) => option.total > 0)
}

export default function IncomeCategoryTrendWidget({
  rect,
  transactions,
  selectedMonth,
  budgetStartDate,
  excludedMonthsSet,
  categoriesById,
  getSignedAmountForTransaction,
}: Props) {
  const isCompact = rect.width < 520
  const monthsCount = isCompact ? 6 : 12
  const [selectedIds, setSelectedIds] = useState<string[] | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isDropdownOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null
      if (!target || dropdownRef.current?.contains(target)) return
      setIsDropdownOpen(false)
    }

    window.addEventListener('pointerdown', handlePointerDown)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [isDropdownOpen])

  const months = useMemo(() => getMonthList(selectedMonth, monthsCount), [selectedMonth, monthsCount])

  const options = useMemo(
    () =>
      buildCategoryOptions(
        categoriesById,
        transactions,
        months,
        budgetStartDate,
        excludedMonthsSet,
        getSignedAmountForTransaction
      ),
    [categoriesById, transactions, months, budgetStartDate, excludedMonthsSet, getSignedAmountForTransaction]
  )

  const defaultSelectedIds = useMemo(() => {
    const preferred = options.filter((option) => option.level === 'category')
    const source = preferred.length > 0 ? preferred : options
    return [...source].sort((left, right) => right.total - left.total).slice(0, 3).map((option) => option.id)
  }, [options])

  const activeSelectedIds = selectedIds ?? defaultSelectedIds
  const selectedOptions = useMemo(
    () => options.filter((option) => activeSelectedIds.includes(option.id)),
    [activeSelectedIds, options]
  )
  const selectedLevel = selectedOptions[0]?.level ?? null

  const data: MonthPoint[] = useMemo(() => {
    const map: Record<string, MonthPoint> = {}

    months.forEach((month) => {
      map[month] = {
        key: month,
        label: formatMonthLabel(month),
        existingDays: getExistingDaysInMonth(month),
        isExcluded: excludedMonthsSet.has(month) || isMonthBeforeBudgetStart(month, budgetStartDate),
        valuesBySeriesId: {},
      }
    })

    transactions.forEach((transaction) => {
      if (transaction.is_deleted) return

      const month = transaction.date.slice(0, 7)
      const day = getDayFromDate(transaction.date)
      const monthPoint = map[month]

      if (!monthPoint || monthPoint.isExcluded || monthPoint.existingDays === 0 || day < 1 || day > monthPoint.existingDays) {
        return
      }

      const amount = getSignedAmountForTransaction(transaction)
      if (amount < 0) return

      selectedOptions.forEach((option) => {
        if (!option.categoryIds.has(transaction.category_id)) return
        monthPoint.valuesBySeriesId[option.id] = (monthPoint.valuesBySeriesId[option.id] ?? 0) + amount
      })
    })

    return months.map((month) => map[month])
  }, [transactions, months, budgetStartDate, excludedMonthsSet, getSignedAmountForTransaction, selectedOptions])

  const rawMaxValue = Math.max(
    1,
    ...data
      .filter((point) => !point.isExcluded)
      .flatMap((point) => selectedOptions.map((option) => point.valuesBySeriesId[option.id] ?? 0))
  )
  const scaleStep = getNiceStep(rawMaxValue)
  const scaleMaxValue = Math.max(scaleStep, Math.ceil(rawMaxValue / scaleStep) * scaleStep)
  const scaleValues = Array.from({ length: Math.floor(scaleMaxValue / scaleStep) + 1 }, (_, index) => index * scaleStep).slice(0, 6)

  if (options.length === 0) {
    return <div style={emptyStyle}>Brak danych przychodowych dla kategorii.</div>
  }

  const viewBoxWidth = 100
  const viewBoxHeight = 48
  const chartLeft = 13
  const chartRight = 95
  const chartTop = 7
  const chartBottom = 39
  const chartHeight = chartBottom - chartTop
  const monthLabelTopPercent = ((chartBottom + 3.4) / viewBoxHeight) * 100

  const getPointX = (index: number) => (data.length <= 1 ? (chartLeft + chartRight) / 2 : chartLeft + (index / (data.length - 1)) * (chartRight - chartLeft))
  const getPointY = (value: number) => chartBottom - (value / scaleMaxValue) * chartHeight

  const buildPath = (seriesId: string) =>
    data
      .map((point, index) => {
        if (point.isExcluded) {
          return ''
        }

        const x = getPointX(index)
        const y = getPointY(point.valuesBySeriesId[seriesId] ?? 0)
        return `${index > 0 && !data[index - 1]?.isExcluded ? 'L' : 'M'} ${x.toFixed(2)} ${y.toFixed(2)}`
      })
      .filter(Boolean)
      .join(' ')

  const toggleOption = (option: CategoryOption, checked: boolean) => {
    const current = selectedIds ?? defaultSelectedIds
    const next = checked ? [...current, option.id] : current.filter((id) => id !== option.id)
    setSelectedIds([...new Set(next)])
  }

  return (
    <div style={rootStyle}>
      <div style={chartBoxStyle}>
        <div style={chartAreaStyle}>
          <div style={svgWrapStyle}>
            <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} width="100%" height="100%" preserveAspectRatio="none">
              {scaleValues.map((value) => {
                const y = getPointY(value)
                return (
                  <line
                    key={value}
                    x1={chartLeft}
                    y1={y}
                    x2={chartRight}
                    y2={y}
                    stroke={value === 0 ? 'rgba(148,163,184,0.34)' : 'rgba(148,163,184,0.16)'}
                    strokeWidth={value === 0 ? 1 : 0.8}
                    vectorEffect="non-scaling-stroke"
                  />
                )
              })}

              {selectedOptions.map((option) => (
                <path
                  key={option.id}
                  d={buildPath(option.id)}
                  fill="none"
                  stroke={option.color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
          </div>

          {scaleValues.map((value) => {
            const topPercent = (getPointY(value) / viewBoxHeight) * 100
            return (
              <div key={value} style={{ ...scaleLabelBaseStyle, top: `${topPercent}%` }}>
                {formatScaleValue(value)}
              </div>
            )
          })}

          {data.map((point, index) => {
            if (isCompact && index % 2 === 1 && index !== data.length - 1) {
              return null
            }

            const leftPercent = (getPointX(index) / viewBoxWidth) * 100
            return (
              <div key={point.key} style={{ ...monthLabelBaseStyle, left: `${leftPercent}%`, top: `${monthLabelTopPercent}%` }}>
                {point.label}
              </div>
            )
          })}
        </div>
      </div>

      <div style={footerStyle}>
        <div ref={dropdownRef} style={dropdownWrapStyle}>
          <button type="button" style={dropdownButtonStyle} onClick={() => setIsDropdownOpen((previousValue) => !previousValue)}>
            <span>{getVisibleModeLabel(activeSelectedIds.length, selectedLevel)}</span>
            <span>{isDropdownOpen ? '▴' : '▾'}</span>
          </button>

          {isDropdownOpen && (
            <div style={dropdownPanelStyle}>
              <div style={sectionTitleStyle}>Kategorie</div>
              {options.filter((option) => option.level === 'category').map((option) => {
                const checked = activeSelectedIds.includes(option.id)
                const disabled = selectedLevel === 'subcategory' && !checked
                return (
                  <label key={option.id} style={disabled ? disabledRowStyle : checkboxRowStyle}>
                    <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => toggleOption(option, event.target.checked)} />
                    <span style={{ ...dotStyle, background: option.color }} />
                    <span>{option.name}</span>
                  </label>
                )
              })}

              <div style={sectionTitleStyle}>Podkategorie</div>
              {options.filter((option) => option.level === 'subcategory').map((option) => {
                const checked = activeSelectedIds.includes(option.id)
                const disabled = selectedLevel === 'category' && !checked
                return (
                  <label key={option.id} style={disabled ? disabledRowStyle : checkboxRowStyle}>
                    <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => toggleOption(option, event.target.checked)} />
                    <span style={{ ...dotStyle, background: option.color }} />
                    <span>{option.name}</span>
                  </label>
                )
              })}
            </div>
          )}
        </div>

        <div style={legendStyle}>
          {selectedOptions.slice(0, 4).map((option) => (
            <span key={option.id} style={legendItemStyle}>
              <span style={{ ...dotStyle, background: option.color }} />
              <span>{option.name}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
