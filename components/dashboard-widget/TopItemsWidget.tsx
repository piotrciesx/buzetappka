'use client'

import type { CSSProperties } from 'react'
import type { Category, Tag, Transaction } from '../../lib/budgetPageTypes'
import type { DashboardStats, TopCategory } from '../../lib/dashboardStats'
import type { DashboardWidgetLayoutItem } from '../../lib/dashboardTypes'
import { getUniqueCategoryLabel } from '../../lib/categoryUtils'
import { getExistingDaysInMonth } from '../../lib/dateUtils'
import type { DashboardWidgetPixelRect } from './dashboardWidgetTileTypes'
import { GREEN, MUTED, RED, SOFT_BORDER, SOFT_TEXT } from './dashboardWidgetTileStyles'
import { formatMoney } from './dashboardWidgetTileUtils'

type TopItemsWidgetProps = {
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

type TopEntry = {
  id: string
  date: string
  description: string
  categoryName: string
  amount: number
}

const FONT =
  'var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

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
  gridTemplateColumns: '1fr 1fr 0.98fr',
  gap: 14,
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

const wideMainSectionStyle: CSSProperties = {
  ...sectionStyle,
  gridTemplateRows: 'auto minmax(0, 1fr)',
  borderRight: '1px solid rgba(203,213,225,0.48)',
  paddingRight: 14,
}

const wideSideSectionStyle: CSSProperties = {
  ...sectionStyle,
  gridTemplateRows: 'auto minmax(0, 1fr)',
}

const sectionHeaderStyle: CSSProperties = {
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  overflow: 'hidden',
}

const sectionTitleStyle: CSSProperties = {
  minWidth: 0,
  fontSize: 11.4,
  lineHeight: 1,
  fontWeight: 690,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const sectionMetaStyle: CSSProperties = {
  flexShrink: 0,
  color: MUTED,
  fontSize: 10,
  lineHeight: 1,
  fontWeight: 620,
  whiteSpace: 'nowrap',
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

const sideListStyle: CSSProperties = {
  ...listStyle,
  gridAutoRows: 'minmax(40px, auto)',
  rowGap: 7,
  alignContent: 'center',
  paddingTop: 6,
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

const rankingRowStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  gridTemplateColumns: '18px minmax(0, 1fr)',
  alignItems: 'start',
  gap: 8,
  overflow: 'hidden',
}

const sideRowStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  gridTemplateColumns: '18px minmax(0, 1fr)',
  alignItems: 'start',
  gap: 8,
  overflow: 'hidden',
}

const dateStyle: CSSProperties = {
  minWidth: 0,
  color: MUTED,
  fontSize: 10.2,
  lineHeight: 1,
  fontWeight: 610,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const indexStyle: CSSProperties = {
  minWidth: 0,
  color: MUTED,
  fontSize: 10,
  lineHeight: 1.15,
  fontWeight: 720,
  textAlign: 'right',
  whiteSpace: 'nowrap',
  paddingTop: 1,
}

const descriptionStyle: CSSProperties = {
  minWidth: 0,
  color: '#172033',
  fontSize: 10.8,
  lineHeight: 1.15,
  fontWeight: 640,
  whiteSpace: 'normal',
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 1,
  WebkitBoxOrient: 'vertical',
}

const categoryStyle: CSSProperties = {
  minWidth: 0,
  color: SOFT_TEXT,
  fontSize: 10.2,
  lineHeight: 1.15,
  fontWeight: 520,
  whiteSpace: 'normal',
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 1,
  WebkitBoxOrient: 'vertical',
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
  lineHeight: 1,
  fontWeight: 700,
  textAlign: 'right',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const rankingAmountLineStyle: CSSProperties = {
  minWidth: 0,
  marginTop: 2,
  fontSize: 10.5,
  lineHeight: 1,
  fontWeight: 700,
  textAlign: 'left',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const sideAmountLineStyle: CSSProperties = {
  ...rankingAmountLineStyle,
  marginTop: 1,
}

const highlightCardStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  overflow: 'hidden',
  borderRadius: 16,
  border: `1px solid ${SOFT_BORDER}`,
  background: 'rgba(255,255,255,0.5)',
  padding: '12px 12px 10px',
  display: 'grid',
  gridTemplateRows: 'auto auto auto minmax(0, 1fr)',
  gap: 8,
}

const highlightTopStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  alignItems: 'baseline',
  gap: 10,
  overflow: 'hidden',
}

const highlightAmountStyle: CSSProperties = {
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: 22,
  lineHeight: 1.04,
  fontWeight: 720,
  letterSpacing: -0.45,
}

const highlightDateStyle: CSSProperties = {
  flexShrink: 0,
  color: MUTED,
  fontSize: 10.5,
  lineHeight: 1,
  fontWeight: 620,
  whiteSpace: 'nowrap',
}

const highlightDescriptionStyle: CSSProperties = {
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: 12,
  lineHeight: 1.15,
  fontWeight: 690,
  color: '#172033',
}

const highlightCategoryStyle: CSSProperties = {
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: 10.5,
  lineHeight: 1.2,
  color: SOFT_TEXT,
  fontWeight: 520,
}

const secondaryListStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  alignSelf: 'start',
  display: 'grid',
  gridAutoRows: 'minmax(38px, auto)',
  rowGap: 8,
  alignContent: 'start',
  overflow: 'hidden',
  paddingTop: 20,
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

function getDayFromDate(date: string) {
  const day = Number(date.slice(8, 10))

  return Number.isFinite(day) ? day : 0
}

function formatShortDate(date: string) {
  return `${date.slice(8, 10)}.${date.slice(5, 7)}`
}

function getDescription(transaction: Transaction) {
  const value = String(
    (transaction as Transaction & { description?: string | null }).description ?? ''
  ).trim()

  return value.length > 0 ? value : 'Bez opisu'
}

function getCategoryName(transaction: Transaction, categoriesById: Record<string, Category>) {
  return getUniqueCategoryLabel(transaction.category_id, categoriesById) || 'Bez kategorii'
}

function sortByAbsoluteAmount(left: TopEntry, right: TopEntry) {
  const amountCompare = Math.abs(right.amount) - Math.abs(left.amount)

  if (amountCompare !== 0) {
    return amountCompare
  }

  const dateCompare = right.date.localeCompare(left.date)

  if (dateCompare !== 0) {
    return dateCompare
  }

  return String(right.id).localeCompare(String(left.id))
}

function buildTopEntries({
  transactions,
  selectedMonth,
  existingDays,
  categoriesById,
  getSignedAmountForTransaction,
}: {
  transactions: Transaction[]
  selectedMonth: string
  existingDays: number
  categoriesById: Record<string, Category>
  getSignedAmountForTransaction: (transaction: Transaction) => number
}) {
  return transactions
    .filter((transaction) => {
      if (transaction.is_deleted || !transaction.date.startsWith(selectedMonth)) {
        return false
      }

      const day = getDayFromDate(transaction.date)

      return day >= 1 && day <= existingDays
    })
    .map<TopEntry>((transaction) => ({
      id: transaction.id,
      date: transaction.date,
      description: getDescription(transaction),
      categoryName: getCategoryName(transaction, categoriesById),
      amount: getSignedAmountForTransaction(transaction),
    }))
    .filter((entry) => entry.amount !== 0)
}

function EntryRow({
  entry,
  color,
  isCompact,
}: {
  entry: TopEntry
  color: string
  isCompact: boolean
}) {
  if (isCompact) {
    return (
      <div style={compactRowStyle}>
        <div style={dateStyle}>{formatShortDate(entry.date)}</div>

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
      <div style={dateStyle}>{formatShortDate(entry.date)}</div>
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
  entries: TopEntry[]
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
        <div style={compactListStyle}>
          {entries.map((entry) => (
            <EntryRow key={entry.id} entry={entry} color={color} isCompact={isCompact} />
          ))}
        </div>
      )}
    </section>
  )
}

function RankingRow({
  entry,
  index,
  color,
}: {
  entry: TopEntry
  index: number
  color: string
}) {
  return (
    <div style={rankingRowStyle}>
      <div style={indexStyle}>{index + 2}</div>

      <div style={compactMiddleStyle}>
        <div style={descriptionStyle}>{entry.description}</div>
        <div style={categoryStyle}>
          {entry.date} · {entry.categoryName}
        </div>
        <div style={{ ...rankingAmountLineStyle, color }}>{formatMoney(entry.amount)}</div>
      </div>
    </div>
  )
}

function HighlightCard({
  entries,
  color,
  emptyText,
}: {
  entries: TopEntry[]
  color: string
  emptyText: string
}) {
  const mainEntry = entries[0] || null
  const secondaryEntries = entries.slice(1, 4)

  if (!mainEntry) {
    return <div style={emptySectionStyle}>{emptyText}</div>
  }

  return (
    <div style={highlightCardStyle}>
      <div style={highlightTopStyle}>
        <div style={{ ...highlightAmountStyle, color }}>{formatMoney(mainEntry.amount)}</div>
        <div style={highlightDateStyle}>{mainEntry.date}</div>
      </div>

      <div style={highlightDescriptionStyle}>{mainEntry.description}</div>
      <div style={highlightCategoryStyle}>{mainEntry.categoryName}</div>

      {secondaryEntries.length === 0 ? (
        <div style={emptySectionStyle}>Brak kolejnych pozycji.</div>
      ) : (
        <div style={secondaryListStyle}>
          {secondaryEntries.map((entry, index) => (
            <RankingRow key={entry.id} entry={entry} index={index} color={color} />
          ))}
        </div>
      )}
    </div>
  )
}

function MixedRankingRow({ entry, index }: { entry: TopEntry; index: number }) {
  const color = entry.amount >= 0 ? GREEN : RED

  return (
    <div style={sideRowStyle}>
      <div style={indexStyle}>{index + 1}</div>

      <div style={compactMiddleStyle}>
        <div style={descriptionStyle}>{entry.description}</div>
        <div style={categoryStyle}>
          {entry.date} · {entry.categoryName}
        </div>
        <div style={{ ...sideAmountLineStyle, color }}>{formatMoney(entry.amount)}</div>
      </div>
    </div>
  )
}

function HighlightSection({
  title,
  meta,
  color,
  entries,
  emptyText,
}: {
  title: string
  meta: string
  color: string
  entries: TopEntry[]
  emptyText: string
}) {
  return (
    <section style={wideMainSectionStyle}>
      <div style={sectionHeaderStyle}>
        <div style={{ ...sectionTitleStyle, color }}>{title}</div>
        <div style={sectionMetaStyle}>{meta}</div>
      </div>

      <HighlightCard entries={entries} color={color} emptyText={emptyText} />
    </section>
  )
}

export default function TopItemsWidget({
  rect,
  transactions,
  selectedMonth,
  excludedMonthsSet,
  categoriesById,
  getSignedAmountForTransaction,
}: TopItemsWidgetProps) {
  const existingDays = getExistingDaysInMonth(selectedMonth)
  const isCompact = rect.width < 520

  if (excludedMonthsSet.has(selectedMonth)) {
    return <div style={emptyStyle}>Ten miesiąc jest wyłączony ze statystyk.</div>
  }

  if (existingDays === 0) {
    return <div style={emptyStyle}>Przyszły miesiąc — brak istniejących wpisów do pokazania.</div>
  }

  const allEntries = buildTopEntries({
    transactions,
    selectedMonth,
    existingDays,
    categoriesById,
    getSignedAmountForTransaction,
  })

  const incomeEntries = allEntries
    .filter((entry) => entry.amount > 0)
    .sort(sortByAbsoluteAmount)

  const expenseEntries = allEntries
    .filter((entry) => entry.amount < 0)
    .sort(sortByAbsoluteAmount)

  const mixedEntries = [...allEntries].sort(sortByAbsoluteAmount)

  if (incomeEntries.length === 0 && expenseEntries.length === 0) {
    return <div style={emptyStyle}>Brak wpisów w tym miesiącu.</div>
  }

  if (isCompact) {
    return (
      <div style={rootStyle}>
        <div style={compactLayoutStyle}>
          <EntrySection
            title="Top przychody"
            color={GREEN}
            entries={incomeEntries.slice(0, 3)}
            isCompact
          />

          <EntrySection
            title="Top wydatki"
            color={RED}
            entries={expenseEntries.slice(0, 3)}
            isCompact
          />
        </div>
      </div>
    )
  }

  return (
    <div style={rootStyle}>
      <div style={wideLayoutStyle}>
        <HighlightSection
          title="Największy przychód"
          meta="TOP 1–4"
          color={GREEN}
          entries={incomeEntries.slice(0, 4)}
          emptyText="Brak przychodów w tym miesiącu."
        />

        <HighlightSection
          title="Największy wydatek"
          meta="TOP 1–4"
          color={RED}
          entries={expenseEntries.slice(0, 4)}
          emptyText="Brak wydatków w tym miesiącu."
        />

        <section style={wideSideSectionStyle}>
          <div style={sectionHeaderStyle}>
            <div style={sectionTitleStyle}>Pozostałe duże ruchy</div>
            <div style={sectionMetaStyle}>TOP 5</div>
          </div>

          {mixedEntries.length === 0 ? (
            <div style={emptySectionStyle}>Brak pozycji do pokazania.</div>
          ) : (
            <div style={sideListStyle}>
              {mixedEntries.slice(0, 5).map((entry, index) => (
                <MixedRankingRow key={entry.id} entry={entry} index={index} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}