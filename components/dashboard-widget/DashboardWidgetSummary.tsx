'use client'

import type { DashboardWidgetLayoutItem } from '../../lib/dashboardTypes'
import type { Category, Transaction } from '../../lib/budgetPageTypes'
import type { DashboardStats, TopCategory } from '../../lib/dashboardStats'
import { getUniqueCategoryLabel } from '../../lib/categoryUtils'
import {
  BLUE,
  GREEN,
  NEUTRAL,
  RED,
  contentStyle,
  listRowStyle,
  listStyle,
  progressTrackStyle,
  smallTextStyle,
  valueStyle,
} from './dashboardWidgetTileStyles'
import {
  clampPercent,
  compareTransactionsByDate,
  formatMoney,
  formatPercent,
  getColorForMoney,
} from './dashboardWidgetTileUtils'
import DashboardWidgetTopCategories from './DashboardWidgetTopCategories'

const getTransactionLabel = (
  transaction: Transaction,
  categoriesById: Record<string, Category>
) => {
  const categoryName = getUniqueCategoryLabel(transaction.category_id, categoriesById) || 'Nieznana'
  const description = transaction.description?.trim()

  return description ? `${description} ? ${categoryName}` : categoryName
}

type DashboardWidgetSummaryProps = {
  widget: DashboardWidgetLayoutItem
  dashboardStats: DashboardStats
  topExpenseCategories: TopCategory[]
  latestTransactions: Transaction[]
  categoriesById: Record<string, Category>
  getSignedAmountForTransaction: (transaction: Transaction) => number
  isTiny: boolean
  isMedium: boolean
  isLarge: boolean
}

export default function DashboardWidgetSummary({
  widget,
  dashboardStats,
  topExpenseCategories,
  latestTransactions,
  categoriesById,
  getSignedAmountForTransaction,
  isTiny,
  isMedium,
  isLarge,
}: DashboardWidgetSummaryProps) {
  if (widget.type === 'income-total') {
    return (
      <div style={contentStyle}>
        <div style={{ ...valueStyle, color: GREEN }}>{formatMoney(dashboardStats.income)}</div>
        {!isTiny && <div style={{ ...smallTextStyle, marginTop: 6 }}>Łączne przychody miesiąca</div>}
      </div>
    )
  }

  if (widget.type === 'expense-total') {
    return (
      <div style={contentStyle}>
        <div style={{ ...valueStyle, color: RED }}>{formatMoney(dashboardStats.expense)}</div>
        {!isTiny && <div style={{ ...smallTextStyle, marginTop: 6 }}>Łączne wydatki miesiąca</div>}
      </div>
    )
  }

  if (widget.type === 'transaction-count') {
    return (
      <div style={contentStyle}>
        <div style={valueStyle}>{dashboardStats.transactionCount}</div>
        {!isTiny && (
          <div style={{ ...smallTextStyle, marginTop: 6 }}>
            Przychody: {dashboardStats.incomeCount} · Wydatki: {dashboardStats.expenseCount}
          </div>
        )}
      </div>
    )
  }

  if (widget.type === 'largest-expense') {
    return (
      <div style={contentStyle}>
        <div style={{ ...valueStyle, color: RED }}>{formatMoney(dashboardStats.biggestExpense)}</div>
        {!isTiny && <div style={{ ...smallTextStyle, marginTop: 6 }}>Największy pojedynczy wydatek</div>}
      </div>
    )
  }

  if (widget.type === 'largest-income') {
    return (
      <div style={contentStyle}>
        <div style={{ ...valueStyle, color: GREEN }}>{formatMoney(dashboardStats.biggestIncome)}</div>
        {!isTiny && <div style={{ ...smallTextStyle, marginTop: 6 }}>Największy pojedynczy przychód</div>}
      </div>
    )
  }

  if (widget.type === 'average-expense') {
    return (
      <div style={contentStyle}>
        <div style={{ ...valueStyle, color: RED }}>{formatMoney(dashboardStats.averageExpense)}</div>
        {!isTiny && <div style={{ ...smallTextStyle, marginTop: 6 }}>Średnia wartość wydatku</div>}
      </div>
    )
  }

  if (widget.type === 'average-income') {
    return (
      <div style={contentStyle}>
        <div style={{ ...valueStyle, color: GREEN }}>{formatMoney(dashboardStats.averageIncome)}</div>
        {!isTiny && <div style={{ ...smallTextStyle, marginTop: 6 }}>Średnia wartość przychodu</div>}
      </div>
    )
  }

  if (widget.type === 'dayless-count') {
    return (
      <div style={contentStyle}>
        <div style={valueStyle}>{dashboardStats.daylessCount}</div>
        {!isTiny && <div style={{ ...smallTextStyle, marginTop: 6 }}>Wpisy bez konkretnego dnia</div>}
      </div>
    )
  }

  if (widget.type === 'expense-share') {
    const percent = clampPercent(dashboardStats.expenseShareOfIncome)

    return (
      <div style={contentStyle}>
        <div style={{ ...valueStyle, color: percent > 100 ? RED : NEUTRAL }}>
          {formatPercent(dashboardStats.expenseShareOfIncome)}
        </div>
        {!isTiny && (
          <>
            <div style={{ ...smallTextStyle, marginTop: 6 }}>Wydatki względem przychodów</div>
            <div style={progressTrackStyle}>
              <div
                style={{
                  width: `${percent}%`,
                  height: '100%',
                  borderRadius: 999,
                  background: percent > 90 ? RED : BLUE,
                }}
              />
            </div>
          </>
        )}
      </div>
    )
  }

  if (widget.type === 'income-expense') {
    return (
      <div style={contentStyle}>
        <div style={listStyle}>
          <div style={listRowStyle}>
            <span>Przychody</span>
            <strong style={{ color: GREEN, fontWeight: 600 }}>{formatMoney(dashboardStats.income)}</strong>
          </div>
          <div style={listRowStyle}>
            <span>Wydatki</span>
            <strong style={{ color: RED, fontWeight: 600 }}>{formatMoney(dashboardStats.expense)}</strong>
          </div>
          {isMedium && (
            <div style={listRowStyle}>
              <span>Bilans</span>
              <strong style={{ color: getColorForMoney(dashboardStats.balance), fontWeight: 600 }}>
                {formatMoney(dashboardStats.balance)}
              </strong>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (widget.type === 'top-categories') {
    const limit = isTiny ? 1 : isLarge ? 5 : 4

    return (
      <div style={contentStyle}>
        <DashboardWidgetTopCategories
          categories={topExpenseCategories}
          total={dashboardStats.expense}
          limit={limit}
          showBars={isLarge}
        />
      </div>
    )
  }

  if (widget.type === 'recent-transactions') {
    const limit = isTiny ? 1 : isLarge ? 8 : 4
    const visibleItems = [...latestTransactions].sort(compareTransactionsByDate).slice(0, limit)

    return (
      <div style={contentStyle}>
        {visibleItems.length === 0 ? (
          <div style={smallTextStyle}>Brak wpisów</div>
        ) : (
          <div style={listStyle}>
            {visibleItems.map((transaction) => {
              const amount = getSignedAmountForTransaction(transaction)

              return (
                <div key={transaction.id} style={listRowStyle}>
                  <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {getTransactionLabel(transaction, categoriesById)}
                  </span>
                  <strong style={{ color: getColorForMoney(amount), fontWeight: 600 }}>
                    {formatMoney(amount)}
                  </strong>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={contentStyle}>
      <div style={smallTextStyle}>Wybierz statystykę dla tego kafla.</div>
    </div>
  )
}
