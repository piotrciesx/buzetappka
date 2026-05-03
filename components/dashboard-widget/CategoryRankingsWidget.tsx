'use client'

import type { CSSProperties } from 'react'
import type { Category, Tag, Transaction } from '../../lib/budgetPageTypes'
import type { DashboardStats, TopCategory } from '../../lib/dashboardStats'
import type { DashboardWidgetLayoutItem } from '../../lib/dashboardTypes'
import { getExistingDaysInMonth } from '../../lib/dateUtils'
import type { DashboardWidgetPixelRect } from './dashboardWidgetTileTypes'
import { GREEN, RED, SOFT_BORDER, SOFT_TEXT } from './dashboardWidgetTileStyles'
import { clampPercent, formatMoney } from './dashboardWidgetTileUtils'

type CategoryRankingsWidgetProps = {
  widget: DashboardWidgetLayoutItem
  rect: DashboardWidgetPixelRect
  transactions: Transaction[]
  selectedMonth: string
  excludedMonthsSet: Set<string>
  transactionTagsMap: Record<string, Tag[]>
  dashboardStats: DashboardStats
  topExpenseCategories: TopCategory[]
  latestTransactions: Transaction[]
  categoriesById: Record<string, Category>
  getSignedAmountForTransaction: (transaction: Transaction) => number
}

type RankingItem = {
  categoryId: string
  name: string
  amount: number
  absAmount: number
  kind: 'income' | 'expense'
  color: string
}

const FONT =
  'var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const DONUT_COLORS = ['#15803d', '#dc2626', '#2563eb', '#9333ea', '#ea580c']

const rootStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  minWidth: 0,
  minHeight: 0,
  boxSizing: 'border-box',
  padding: '12px 12px 8px',
  display: 'grid',
  gridTemplateRows: '1fr',
  overflow: 'hidden',
  fontFamily: FONT,
}

const compactListStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  gridTemplateRows: 'repeat(7, minmax(0, 1fr))',
  overflow: 'hidden',
}

const wideLayoutStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) minmax(190px, 0.46fr)',
  gap: 18,
  overflow: 'hidden',
}

const wideListStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  gridTemplateRows: 'repeat(5, minmax(0, 1fr))',
  overflow: 'hidden',
}

const rowStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  gridTemplateColumns: '24px minmax(0, 1fr) 92px',
  alignItems: 'center',
  gap: 9,
  overflow: 'hidden',
}

const compactRowStyle: CSSProperties = {
  ...rowStyle,
  gridTemplateColumns: '22px minmax(0, 1fr) 84px',
  gap: 7,
}

const rankStyle: CSSProperties = {
  minWidth: 0,
  color: 'rgba(100,116,139,0.62)',
  fontSize: 10.2,
  lineHeight: 1,
  fontWeight: 660,
  whiteSpace: 'nowrap',
}

const middleStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gap: 5,
  overflow: 'hidden',
}

const nameStyle: CSSProperties = {
  minWidth: 0,
  color: '#172033',
  fontSize: 10.9,
  lineHeight: 1.08,
  fontWeight: 640,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const amountStyle: CSSProperties = {
  minWidth: 0,
  fontSize: 10.8,
  lineHeight: 1,
  fontWeight: 700,
  textAlign: 'right',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const trackStyle: CSSProperties = {
  minWidth: 0,
  width: '100%',
  height: 6,
  minHeight: 6,
  maxHeight: 6,
  flex: '0 0 6px',
  borderRadius: 999,
  background: 'rgba(226,232,240,0.72)',
  overflow: 'hidden',
  transform: 'translateZ(0)',
}

const fillStyle: CSSProperties = {
  height: 6,
  minHeight: 6,
  maxHeight: 6,
  transform: 'translateZ(0)',
}

const chartPanelStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  borderLeft: '1px solid rgba(203,213,225,0.48)',
  paddingLeft: 18,
  display: 'grid',
  gridTemplateRows: 'auto 1fr',
  gap: 8,
  overflow: 'hidden',
}

const chartTitleStyle: CSSProperties = {
  minWidth: 0,
  color: '#172033',
  fontSize: 12,
  lineHeight: 1.1,
  fontWeight: 670,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const chartSubtitleStyle: CSSProperties = {
  minWidth: 0,
  color: SOFT_TEXT,
  fontSize: 10.3,
  lineHeight: 1.15,
  fontWeight: 520,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  marginTop: 3,
}

const donutAreaStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  gridTemplateRows: 'minmax(0, 1fr) auto',
  gap: 8,
  overflow: 'hidden',
}

const donutWrapStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  placeItems: 'center',
  overflow: 'hidden',
}

const legendStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gap: 5,
  overflow: 'hidden',
}

const legendRowStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gridTemplateColumns: '8px minmax(0, 1fr) auto',
  alignItems: 'center',
  gap: 6,
  overflow: 'hidden',
}

const dotStyle: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: 999,
  flex: '0 0 auto',
}

const legendNameStyle: CSSProperties = {
  minWidth: 0,
  color: '#334155',
  fontSize: 9.8,
  lineHeight: 1,
  fontWeight: 560,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const legendPercentStyle: CSSProperties = {
  minWidth: 0,
  color: SOFT_TEXT,
  fontSize: 9.6,
  lineHeight: 1,
  fontWeight: 650,
  whiteSpace: 'nowrap',
}

const emptyStyle: CSSProperties = {
  height: '100%',
  minHeight: 0,
  display: 'grid',
  placeItems: 'center',
  color: SOFT_TEXT,
  fontSize: 12,
  lineHeight: 1.35,
  textAlign: 'center',
  padding: 12,
  fontFamily: FONT,
}

function getCategoryName(category: Category | undefined) {
  if (!category) {
    return 'Bez kategorii'
  }

  return String((category as Category & { name?: string }).name ?? 'Bez kategorii')
}

function getCategoryParentId(category: Category | undefined) {
  if (!category) {
    return null
  }

  const value = (category as Category & { parent_id?: string | null; parentId?: string | null })
    .parent_id

  return value ?? (category as Category & { parentId?: string | null }).parentId ?? null
}

function getDisplayCategory(categoryId: string, categoriesById: Record<string, Category>) {
  const category = categoriesById[categoryId]
  const parentId = getCategoryParentId(category)
  const parent = parentId ? categoriesById[parentId] : undefined

  if (parent) {
    return `${getCategoryName(parent)} / ${getCategoryName(category)}`
  }

  return getCategoryName(category)
}

function getDayFromDate(date: string) {
  const day = Number(date.slice(8, 10))

  return Number.isFinite(day) ? day : 0
}

function buildDonutSegments(items: RankingItem[]) {
  const total = items.reduce((sum, item) => sum + item.absAmount, 0)

  if (total <= 0) {
    return []
  }

  let cursor = 0

  return items.map((item) => {
    const value = item.absAmount / total
    const dash = value * 100
    const segment = {
      item,
      dash,
      offset: 25 - cursor,
      percent: value * 100,
    }

    cursor += dash

    return segment
  })
}

function RankingRow({
  item,
  index,
  maxAbsAmount,
  isCompact,
}: {
  item: RankingItem
  index: number
  maxAbsAmount: number
  isCompact: boolean
}) {
  const percent = clampPercent((item.absAmount / maxAbsAmount) * 100)
  const fillWidth = Math.max(6, percent)

  return (
    <div style={isCompact ? compactRowStyle : rowStyle}>
      <div style={rankStyle}>{String(index + 1).padStart(2, '0')}</div>

      <div style={middleStyle}>
        <div style={nameStyle}>{item.name}</div>
        <div style={trackStyle}>
          <div
            style={{
              ...fillStyle,
              width: `${fillWidth}%`,
              borderRadius: percent < 12 ? 2 : 999,
              background: item.color,
              opacity: 0.9,
            }}
          />
        </div>
      </div>

      <div style={{ ...amountStyle, color: item.kind === 'income' ? GREEN : RED }}>
        {formatMoney(item.amount)}
      </div>
    </div>
  )
}

export default function CategoryRankingsWidget({
  rect,
  transactions,
  selectedMonth,
  excludedMonthsSet,
  categoriesById,
  getSignedAmountForTransaction,
}: CategoryRankingsWidgetProps) {
  const existingDays = getExistingDaysInMonth(selectedMonth)
  const isCompact = rect.width < 520

  if (excludedMonthsSet.has(selectedMonth)) {
    return <div style={emptyStyle}>Ten miesiąc jest wyłączony ze statystyk.</div>
  }

  if (existingDays === 0) {
    return <div style={emptyStyle}>Przyszły miesiąc — brak istniejących kategorii do policzenia.</div>
  }

  const totalsByCategoryId = new Map<string, number>()

  transactions.forEach((transaction) => {
    if (transaction.is_deleted || !transaction.date.startsWith(selectedMonth)) {
      return
    }

    const day = getDayFromDate(transaction.date)

    if (day < 1 || day > existingDays) {
      return
    }

    const amount = getSignedAmountForTransaction(transaction)
    const previous = totalsByCategoryId.get(transaction.category_id) ?? 0

    totalsByCategoryId.set(transaction.category_id, previous + amount)
  })

  const ranking: RankingItem[] = Array.from(totalsByCategoryId.entries())
    .map(([categoryId, amount]) => ({
      categoryId,
      name: getDisplayCategory(categoryId, categoriesById),
      amount,
      absAmount: Math.abs(amount),
      kind: amount >= 0 ? ('income' as const) : ('expense' as const),
      color: amount >= 0 ? GREEN : RED,
    }))
    .filter((item) => item.absAmount > 0)
    .sort((left, right) => right.absAmount - left.absAmount)
    .map((item, index) => ({
      ...item,
      color: DONUT_COLORS[index % DONUT_COLORS.length],
    }))

  if (ranking.length === 0) {
    return <div style={emptyStyle}>Brak kategorii do pokazania w tym miesiącu.</div>
  }

  const visibleItems = ranking.slice(0, isCompact ? 7 : 5)
  const maxAbsAmount = Math.max(1, ...visibleItems.map((item) => item.absAmount))
  const donutSegments = buildDonutSegments(visibleItems)

  return (
    <div style={rootStyle}>
      {isCompact ? (
        <div style={compactListStyle}>
          {visibleItems.map((item, index) => (
            <RankingRow
              key={item.categoryId}
              item={item}
              index={index}
              maxAbsAmount={maxAbsAmount}
              isCompact
            />
          ))}
        </div>
      ) : (
        <div style={wideLayoutStyle}>
          <div style={wideListStyle}>
            {visibleItems.map((item, index) => (
              <RankingRow
                key={item.categoryId}
                item={item}
                index={index}
                maxAbsAmount={maxAbsAmount}
                isCompact={false}
              />
            ))}
          </div>

          <div style={chartPanelStyle}>
            <div>
              <div style={chartTitleStyle}>Udział w TOP 5</div>
              <div style={chartSubtitleStyle}>proporcja największych kategorii</div>
            </div>

            <div style={donutAreaStyle}>
              <div style={donutWrapStyle}>
                <svg width="100%" height="100%" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="36"
                    fill="none"
                    stroke="rgba(226,232,240,0.9)"
                    strokeWidth="14"
                  />

                  {donutSegments.map((segment) => (
                    <circle
                      key={segment.item.categoryId}
                      cx="60"
                      cy="60"
                      r="36"
                      fill="none"
                      stroke={segment.item.color}
                      strokeWidth="14"
                      strokeLinecap="round"
                      strokeDasharray={`${segment.dash} ${100 - segment.dash}`}
                      strokeDashoffset={segment.offset}
                      pathLength="100"
                      transform="rotate(-90 60 60)"
                    />
                  ))}

                  <text
                    x="60"
                    y="57"
                    textAnchor="middle"
                    fill="#172033"
                    fontSize="12"
                    fontWeight="700"
                  >
                    TOP 5
                  </text>
                  <text
                    x="60"
                    y="73"
                    textAnchor="middle"
                    fill="rgba(100,116,139,0.72)"
                    fontSize="9"
                    fontWeight="560"
                  >
                    udział
                  </text>
                </svg>
              </div>

              <div style={legendStyle}>
                {visibleItems.map((item) => {
                  const total = visibleItems.reduce((sum, current) => sum + current.absAmount, 0)
                  const percent = total > 0 ? (item.absAmount / total) * 100 : 0

                  return (
                    <div key={item.categoryId} style={legendRowStyle}>
                      <span style={{ ...dotStyle, background: item.color }} />
                      <span style={legendNameStyle}>{item.name}</span>
                      <span style={legendPercentStyle}>{Math.round(percent)}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}