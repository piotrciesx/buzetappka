'use client'

import type { CSSProperties } from 'react'
import type { Category, Tag, Transaction } from '../../lib/budgetPageTypes'
import { getUniqueCategoryLabel } from '../../lib/categoryUtils'
import type { DashboardStats, TopCategory } from '../../lib/dashboardStats'
import type { DashboardWidgetLayoutItem } from '../../lib/dashboardTypes'
import { getExistingDaysInMonth } from '../../lib/dateUtils'
import type { DashboardWidgetPixelRect } from './dashboardWidgetTileTypes'
import { GREEN, MUTED, RED, SOFT_TEXT } from './dashboardWidgetTileStyles'
import { clampPercent, formatMoney } from './dashboardWidgetTileUtils'

type RecentEventsWidgetProps = {
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

type RecentEvent = {
  id: string
  date: string
  day: number
  description: string
  categoryName: string
  amount: number
}

const FONT =
  'var(--font-app-sans)'

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
  gridTemplateRows: 'repeat(10, minmax(0, 1fr))',
  overflow: 'hidden',
}

const wideLayoutStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) minmax(210px, 0.44fr)',
  gap: 16,
  overflow: 'hidden',
}

const wideListStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  gridTemplateRows: 'repeat(14, minmax(0, 1fr))',
  overflow: 'hidden',
}

const eventRowStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  gridTemplateColumns: '48px minmax(0, 1.05fr) minmax(0, 0.82fr) 86px',
  alignItems: 'center',
  gap: 10,
  overflow: 'hidden',
}

const compactEventRowStyle: CSSProperties = {
  ...eventRowStyle,
  gridTemplateColumns: '44px minmax(0, 1fr) minmax(0, 0.78fr) 82px',
  gap: 8,
}

const dateStyle: CSSProperties = {
  minWidth: 0,
  color: MUTED,
  fontSize: 10.8,
  lineHeight: 1.2,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const descriptionStyle: CSSProperties = {
  minWidth: 0,
  color: '#172033',
  fontSize: 11,
  lineHeight: 1.2,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const categoryStyle: CSSProperties = {
  minWidth: 0,
  color: SOFT_TEXT,
  fontSize: 10.5,
  lineHeight: 1.2,
  fontWeight: 500,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const amountStyle: CSSProperties = {
  minWidth: 0,
  fontSize: 10.9,
  lineHeight: 1.2,
  fontWeight: 600,
  textAlign: 'right',
  whiteSpace: 'nowrap',
  overflow: 'visible',
  textOverflow: 'ellipsis',
}

const chartPanelStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  borderLeft: '1px solid rgba(203,213,225,0.48)',
  paddingLeft: 18,
  display: 'grid',
  gridTemplateRows: 'auto 1fr',
  gap: 10,
  overflow: 'hidden',
}

const chartTitleStyle: CSSProperties = {
  minWidth: 0,
  color: '#172033',
  fontSize: 12,
  lineHeight: 1.2,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  overflow: 'visible',
  textOverflow: 'ellipsis',
}

const chartSubtitleStyle: CSSProperties = {
  minWidth: 0,
  color: SOFT_TEXT,
  fontSize: 10.4,
  lineHeight: 1.2,
  fontWeight: 500,
  whiteSpace: 'nowrap',
  overflow: 'visible',
  textOverflow: 'ellipsis',
  marginTop: 3,
}

const verticalBarsStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  alignItems: 'center',
  gap: 18,
  overflow: 'hidden',
}

const verticalBarItemStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  gridTemplateRows: 'auto auto minmax(0, 1fr)',
  justifyItems: 'center',
  alignItems: 'center',
  gap: 7,
  overflow: 'hidden',
}

const verticalBarLabelStyle: CSSProperties = {
  minWidth: 0,
  fontSize: 11.2,
  lineHeight: 1.2,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  overflow: 'visible',
  textOverflow: 'ellipsis',
}

const verticalBarCountStyle: CSSProperties = {
  minWidth: 0,
  fontSize: 18,
  lineHeight: 1.2,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  overflow: 'visible',
  textOverflow: 'ellipsis',
}

const verticalTrackStyle: CSSProperties = {
  width: 12,
  height: '100%',
  minHeight: 86,
  maxHeight: 168,
  borderRadius: 999,
  background: 'rgba(226,232,240,0.78)',
  display: 'flex',
  alignItems: 'flex-end',
  overflow: 'hidden',
}

const verticalFillStyle: CSSProperties = {
  width: '100%',
  borderRadius: 999,
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

function getCategoryName(categoryId: string, categoriesById: Record<string, Category>) {
  return getUniqueCategoryLabel(categoryId, categoriesById) || 'Bez kategorii'
}

function getDayFromDate(date: string) {
  const day = Number(date.slice(8, 10))
  return Number.isFinite(day) ? day : 0
}

function formatDate(date: string) {
  return `${date.slice(8, 10)}.${date.slice(5, 7)}`
}

function getDescription(transaction: Transaction) {
  const value = String(
    (transaction as Transaction & { description?: string | null }).description ?? ''
  ).trim()

  return value.length > 0 ? value : 'Bez opisu'
}

function EventRow({ event, isCompact }: { event: RecentEvent; isCompact: boolean }) {
  const isPositive = event.amount >= 0

  return (
    <div style={isCompact ? compactEventRowStyle : eventRowStyle}>
      <div style={dateStyle}>{formatDate(event.date)}</div>
      <div style={descriptionStyle}>{event.description}</div>
      <div style={categoryStyle}>{event.categoryName}</div>
      <div style={{ ...amountStyle, color: isPositive ? GREEN : RED }}>
        {formatMoney(event.amount)}
      </div>
    </div>
  )
}

export default function RecentEventsWidget({
  rect,
  transactions,
  selectedMonth,
  excludedMonthsSet,
  categoriesById,
  getSignedAmountForTransaction,
}: RecentEventsWidgetProps) {
  const existingDays = getExistingDaysInMonth(selectedMonth)
  const isCompact = rect.width < 520

  if (excludedMonthsSet.has(selectedMonth)) {
    return <div style={emptyStyle}>Ten miesiąc jest wyłączony ze statystyk.</div>
  }

  if (existingDays === 0) {
    return <div style={emptyStyle}>Przyszły miesiąc — brak istniejących wpisów do pokazania.</div>
  }

  const events: RecentEvent[] = transactions
    .filter((transaction) => {
      if (transaction.is_deleted || !transaction.date.startsWith(selectedMonth)) {
        return false
      }

      const day = getDayFromDate(transaction.date)
      return day >= 1 && day <= existingDays
    })
    .sort((left, right) => {
      const dateCompare = right.date.localeCompare(left.date)

      if (dateCompare !== 0) {
        return dateCompare
      }

      return String(right.id).localeCompare(String(left.id))
    })
    .map((transaction) => ({
      id: transaction.id,
      date: transaction.date,
      day: getDayFromDate(transaction.date),
      description: getDescription(transaction),
      categoryName: getCategoryName(transaction.category_id, categoriesById),
      amount: getSignedAmountForTransaction(transaction),
    }))

  if (events.length === 0) {
    return <div style={emptyStyle}>Brak wpisów w tym miesiącu.</div>
  }

  const visibleEvents = isCompact ? events.slice(0, 10) : events.slice(0, 14)
  const incomeCount = events.filter((event) => event.amount >= 0).length
  const expenseCount = events.filter((event) => event.amount < 0).length
  const maxCount = Math.max(1, incomeCount, expenseCount)
  const incomePercent = clampPercent((incomeCount / maxCount) * 100)
  const expensePercent = clampPercent((expenseCount / maxCount) * 100)

  return (
    <div style={rootStyle}>
      {isCompact ? (
        <div style={compactListStyle}>
          {visibleEvents.map((event) => (
            <EventRow key={event.id} event={event} isCompact />
          ))}
        </div>
      ) : (
        <div style={wideLayoutStyle}>
          <div style={wideListStyle}>
            {visibleEvents.map((event) => (
              <EventRow key={event.id} event={event} isCompact={false} />
            ))}
          </div>

          <div style={chartPanelStyle}>
            <div>
              <div style={chartTitleStyle}>Struktura wpisów</div>
              <div style={chartSubtitleStyle}>liczba przychodów i wydatków</div>
            </div>

            <div style={verticalBarsStyle}>
              <div style={verticalBarItemStyle}>
                <div style={{ ...verticalBarLabelStyle, color: GREEN }}>Przychody</div>
                <div style={{ ...verticalBarCountStyle, color: GREEN }}>{incomeCount}</div>
                <div style={verticalTrackStyle}>
                  <div
                    style={{
                      ...verticalFillStyle,
                      height: `${Math.max(7, incomePercent)}%`,
                      background: GREEN,
                      opacity: incomeCount === 0 ? 0.22 : 0.88,
                    }}
                  />
                </div>
              </div>

              <div style={verticalBarItemStyle}>
                <div style={{ ...verticalBarLabelStyle, color: RED }}>Wydatki</div>
                <div style={{ ...verticalBarCountStyle, color: RED }}>{expenseCount}</div>
                <div style={verticalTrackStyle}>
                  <div
                    style={{
                      ...verticalFillStyle,
                      height: `${Math.max(7, expensePercent)}%`,
                      background: RED,
                      opacity: expenseCount === 0 ? 0.22 : 0.88,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
