'use client'

import type { Category, Tag, Transaction } from '../../lib/budgetPageTypes'
import type { DashboardStats, TopCategory } from '../../lib/dashboardStats'
import type { DashboardWidgetLayoutItem } from '../../lib/dashboardTypes'
import type { DashboardWidgetPixelRect } from './dashboardWidgetTileTypes'
import BudgetControlWidget from './BudgetControlWidget'
import CategoryRankingsWidget from './CategoryRankingsWidget'
import DailyAveragesWidget from './DailyAveragesWidget'
import WeeklyTrendWidget from './WeeklyTrendWidget'
import DayActivityWidget from './DayActivityWidget'
import DayExtremesWidget from './DayExtremesWidget'
import ExpenseCategoryTrendWidget from './ExpenseCategoryTrendWidget'
import IncomeCategoryTrendWidget from './IncomeCategoryTrendWidget'
import IncomeExpenseTrendWidget from './IncomeExpenseTrendWidget'
import MonthFinanceWidget from './MonthFinanceWidget'
import MonthRhythmWidget from './MonthRhythmWidget'
import RecentEventsWidget from './RecentEventsWidget'
import RecentIncomeExpenseWidget from './RecentIncomeExpenseWidget'
import StabilityLeaksWidget from './StabilityLeaksWidget'
import TopItemsWidget from './TopItemsWidget'

type WidgetContentProps = {
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

export default function DashboardWidgetContent(props: WidgetContentProps) {
  const {
    widget,
    transactions,
    selectedMonth,
    budgetStartDate,
    dashboardStats,
    categoriesById,
    getSignedAmountForTransaction,
  } = props

  if (widget.containerType === 'month-finance') {
    return <MonthFinanceWidget widget={widget} rect={props.rect} dashboardStats={dashboardStats} />
  }

  if (widget.containerType === 'month-rhythm') {
    return (
      <MonthRhythmWidget
        widget={widget}
        transactions={transactions}
        selectedMonth={selectedMonth}
        budgetStartDate={budgetStartDate}
        categoriesById={categoriesById}
        getSignedAmountForTransaction={getSignedAmountForTransaction}
      />
    )
  }

  if (widget.containerType === 'day-activity') {
    return <DayActivityWidget {...props} />
  }

  if (widget.containerType === 'daily-averages') {
    return <DailyAveragesWidget {...props} />
  }

  if (widget.containerType === 'weekly-trend') {
    return <WeeklyTrendWidget {...props} />
  }

  if (widget.containerType === 'day-extremes') {
    return <DayExtremesWidget {...props} />
  }

  if (widget.containerType === 'income-expense-trend') {
    return <IncomeExpenseTrendWidget {...props} />
  }

  if (widget.containerType === 'expense-category-trend') {
    return <ExpenseCategoryTrendWidget {...props} />
  }

  if (widget.containerType === 'income-category-trend') {
    return <IncomeCategoryTrendWidget {...props} />
  }

  if (widget.containerType === 'recent-events') {
    return <RecentEventsWidget {...props} />
  }

  if (widget.containerType === 'recent-income-expense') {
    return <RecentIncomeExpenseWidget {...props} />
  }

  if (widget.containerType === 'category-rankings') {
    return <CategoryRankingsWidget {...props} />
  }

  if (widget.containerType === 'top-items') {
    return <TopItemsWidget {...props} />
  }

  if (widget.containerType === 'budget-control') {
    return <BudgetControlWidget {...props} />
  }

  if (widget.containerType === 'stability-leaks') {
    return <StabilityLeaksWidget {...props} />
  }

  return null
}
