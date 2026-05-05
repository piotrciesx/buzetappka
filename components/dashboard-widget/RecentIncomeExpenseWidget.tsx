'use client'

import type { CSSProperties } from 'react'
import type { Category, Tag, Transaction } from '../../lib/budgetPageTypes'
import { getUniqueCategoryLabel } from '../../lib/categoryUtils'
import type { DashboardStats, TopCategory } from '../../lib/dashboardStats'
import type { DashboardWidgetLayoutItem } from '../../lib/dashboardTypes'
import { getExistingDaysInMonth } from '../../lib/dateUtils'
import type { DashboardWidgetPixelRect } from './dashboardWidgetTileTypes'
import { GREEN, MUTED, RED, SOFT_TEXT } from './dashboardWidgetTileStyles'
import { formatMoney } from './dashboardWidgetTileUtils'

type RecentIncomeExpenseWidgetProps = {
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

type RecentEntry = {
  id: string
  date: string
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

const compactLayoutStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  gridTemplateRows: '1fr 1fr',
  gap: 8,
  overflow: 'hidden',
}

const wideLayoutStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 20,
  overflow: 'hidden',
}

const sectionStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  gridTemplateRows: 'auto 1fr',
  gap: 8,
  overflow: 'hidden',
}

const compactSectionStyle: CSSProperties = {
  ...sectionStyle,
  gap: 4,
}

const sectionHeaderStyle: CSSProperties = {
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  overflow: 'hidden',
}

const sectionTitleStyle: CSSProperties = {
  minWidth: 0,
  fontSize: 11.4,
  lineHeight: 1.2,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  overflow: 'visible',
  textOverflow: 'ellipsis',
}

const listStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  overflow: 'hidden',
}

const compactListStyle: CSSProperties = {
  ...listStyle,
  gridTemplateRows: 'repeat(3, minmax(0, 1fr))',
}

const wideListStyle: CSSProperties = {
  ...listStyle,
  gridAutoRows: '24px',
  rowGap: 7,
  alignContent: 'start',
}

const rowStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  gridTemplateColumns: '43px minmax(0, 1fr) minmax(0, 0.72fr) 82px',
  alignItems: 'center',
  gap: 8,
  overflow: 'hidden',
}

const compactRowStyle: CSSProperties = {
  ...rowStyle,
  gridTemplateColumns: '39px minmax(0, 1fr) 74px',
  gap: 7,
}

const dateStyle: CSSProperties = {
  minWidth: 0,
  color: MUTED,
  fontSize: 10.2,
  lineHeight: 1.2,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const descriptionStyle: CSSProperties = {
  minWidth: 0,
  color: '#172033',
  fontSize: 10.8,
  lineHeight: 1.2,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const categoryStyle: CSSProperties = {
  minWidth: 0,
  color: SOFT_TEXT,
  fontSize: 10.2,
  lineHeight: 1.2,
  fontWeight: 500,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const compactMiddleStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gap: 1,
  overflow: 'hidden',
}

const amountStyle: CSSProperties = {
  minWidth: 0,
  fontSize: 10.7,
  lineHeight: 1.2,
  fontWeight: 600,
  textAlign: 'right',
  whiteSpace: 'nowrap',
  overflow: 'visible',
  textOverflow: 'ellipsis',
}

const dividerStyle: CSSProperties = {
  minWidth: 0,
  borderLeft: '1px solid rgba(203,213,225,0.48)',
  paddingLeft: 18,
  display: 'grid',
  minHeight: 0,
}

const emptySectionStyle: CSSProperties = {
  minHeight: 0,
  display: 'grid',
  placeItems: 'center',
  color: SOFT_TEXT,
  fontSize: 11,
  lineHeight: 1.25,
  textAlign: 'center',
  padding: 8,
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

function EntryRow({
  entry,
  color,
  isCompact,
}: {
  entry: RecentEntry
  color: string
  isCompact: boolean
}) {
  if (isCompact) {
    return (
      <div style={compactRowStyle}>
        <div style={dateStyle}>{formatDate(entry.date)}</div>

        <div style={compactMiddleStyle}>
          <div style={descriptionStyle}>{entry.description}</div>
          <div style={categoryStyle}>{entry.categoryName}</div>
        </div>

        <div style={{ ...amountStyle, color }}>{formatMoney(entry.amount)}</div>
      </div>
    )
  }

  return (
    <div style={rowStyle}>
      <div style={dateStyle}>{formatDate(entry.date)}</div>
      <div style={descriptionStyle}>{entry.description}</div>
      <div style={categoryStyle}>{entry.categoryName}</div>
      <div style={{ ...amountStyle, color }}>{formatMoney(entry.amount)}</div>
    </div>
  )
}

function EntrySection({
  title,
  color,
  entries,
  isCompact,
}: {
  title: string
  color: string
  entries: RecentEntry[]
  isCompact: boolean
}) {
  return (
    <section style={isCompact ? compactSectionStyle : sectionStyle}>
      <div style={sectionHeaderStyle}>
        <div style={{ ...sectionTitleStyle, color }}>{title}</div>
      </div>

      {entries.length === 0 ? (
        <div style={emptySectionStyle}>Brak wpisów.</div>
      ) : (
        <div style={isCompact ? compactListStyle : wideListStyle}>
          {entries.map((entry) => (
            <EntryRow key={entry.id} entry={entry} color={color} isCompact={isCompact} />
          ))}
        </div>
      )}
    </section>
  )
}

export default function RecentIncomeExpenseWidget({
  rect,
  transactions,
  selectedMonth,
  excludedMonthsSet,
  categoriesById,
  getSignedAmountForTransaction,
}: RecentIncomeExpenseWidgetProps) {
  const existingDays = getExistingDaysInMonth(selectedMonth)
  const isCompact = rect.width < 520

  if (excludedMonthsSet.has(selectedMonth)) {
    return <div style={emptyStyle}>Ten miesiąc jest wyłączony ze statystyk.</div>
  }

  if (existingDays === 0) {
    return <div style={emptyStyle}>Przyszły miesiąc — brak istniejących wpisów do pokazania.</div>
  }

  const allEntries: RecentEntry[] = transactions
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
      description: getDescription(transaction),
      categoryName: getCategoryName(transaction.category_id, categoriesById),
      amount: getSignedAmountForTransaction(transaction),
    }))

  const allIncomeEntries = allEntries.filter((entry) => entry.amount >= 0)
  const allExpenseEntries = allEntries.filter((entry) => entry.amount < 0)

  const incomeEntries = allIncomeEntries.slice(0, isCompact ? 3 : 8)
  const expenseEntries = allExpenseEntries.slice(0, isCompact ? 3 : 8)

  if (allIncomeEntries.length === 0 && allExpenseEntries.length === 0) {
    return <div style={emptyStyle}>Brak wpisów w tym miesiącu.</div>
  }

  if (isCompact) {
    return (
      <div style={rootStyle}>
        <div style={compactLayoutStyle}>
          <EntrySection
            title="Ostatnie przychody"
            color={GREEN}
            entries={incomeEntries}
            isCompact
          />

          <EntrySection
            title="Ostatnie wydatki"
            color={RED}
            entries={expenseEntries}
            isCompact
          />
        </div>
      </div>
    )
  }

  return (
    <div style={rootStyle}>
      <div style={wideLayoutStyle}>
        <EntrySection
          title="Ostatnie przychody"
          color={GREEN}
          entries={incomeEntries}
          isCompact={false}
        />

        <div style={dividerStyle}>
          <EntrySection
            title="Ostatnie wydatki"
            color={RED}
            entries={expenseEntries}
            isCompact={false}
          />
        </div>
      </div>
    </div>
  )
}
