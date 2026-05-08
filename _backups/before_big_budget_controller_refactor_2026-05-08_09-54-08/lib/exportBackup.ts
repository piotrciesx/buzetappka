'use client'

import { SupabaseClient } from '@supabase/supabase-js'
import { getCategoryPathLabel } from './budgetPageHelpers'
import { Category } from './budgetPageTypes'
import { triggerTextDownload } from './importExportUtils'
import { isTransactionInBudgetRange } from './transactionScope'

type BackupRow = Record<string, unknown>

type ProfileBackup = {
  exported_at: string
  profile: BackupRow | null
  categories: BackupRow[]
  transactions: BackupRow[]
  tags: BackupRow[]
  transaction_tags: BackupRow[]
  transaction_payment_splits: BackupRow[]
  payment_sources: BackupRow[]
  profile_finance_settings: BackupRow[]
  financial_goals: BackupRow[]
  financial_goal_month_priorities: BackupRow[]
  financial_goal_month_configs: BackupRow[]
  recurring_transactions: BackupRow[]
  recurring_transaction_executions: BackupRow[]
  recurring_reminder_month_statuses: BackupRow[]
  notes: BackupRow[]
  profile_month_navigation_settings: BackupRow[]
  profile_excluded_months: BackupRow[]
  profile_locked_months: BackupRow[]
  user_profile_settings: BackupRow[]
  budget_limits: BackupRow[]
  drafts: BackupRow[]
}

const getBackupDateText = () => new Date().toISOString().slice(0, 10)

const emptyUuid = '00000000-0000-0000-0000-000000000000'

const isMissingTableError = (error: { message?: string; code?: string }) => {
  const message = (error.message || '').toLowerCase()

  return (
    error.code === '42P01' ||
    message.includes('does not exist') ||
    message.includes('could not find') ||
    message.includes('schema cache')
  )
}

const fetchProfileRows = async (
  supabase: SupabaseClient,
  tableName: string,
  profileId: string,
  { optional = false }: { optional?: boolean } = {}
) => {
  const { data, error } = await supabase.from(tableName).select('*').eq('profile_id', profileId)

  if (error) {
    if (optional && isMissingTableError(error)) {
      return []
    }

    throw new Error(error.message)
  }

  return (data || []) as BackupRow[]
}

const fetchProfile = async (supabase: SupabaseClient, profileId: string) => {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', profileId).maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return (data || null) as BackupRow | null
}

const fetchTransactionTags = async (supabase: SupabaseClient, transactionIds: string[]) => {
  const { data, error } = await supabase
    .from('transaction_tags')
    .select('*')
    .in('transaction_id', transactionIds.length > 0 ? transactionIds : [emptyUuid])

  if (error) {
    throw new Error(error.message)
  }

  return (data || []) as BackupRow[]
}

const fetchRowsByIds = async (
  supabase: SupabaseClient,
  tableName: string,
  columnName: string,
  ids: string[],
  { optional = false }: { optional?: boolean } = {}
) => {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .in(columnName, ids.length > 0 ? ids : [emptyUuid])

  if (error) {
    if (optional && isMissingTableError(error)) {
      return []
    }

    throw new Error(error.message)
  }

  return (data || []) as BackupRow[]
}

const getTextValue = (value: unknown) => (value === null || value === undefined ? '' : String(value))

const escapeCsvValue = (value: unknown) => {
  const text = getTextValue(value)

  if (!/[",\n\r;]/.test(text)) {
    return text
  }

  return `"${text.replace(/"/g, '""')}"`
}

const joinCsvRows = (rows: unknown[][]) => rows.map((row) => row.map(escapeCsvValue).join(';')).join('\n')

const getPaymentSourceName = (transaction: BackupRow, paymentSourcesById: Record<string, BackupRow>) => {
  const paymentSourceId = getTextValue(transaction.payment_source_id)

  if (!paymentSourceId) {
    return ''
  }

  return getTextValue(paymentSourcesById[paymentSourceId]?.name)
}

const getTransactionTagsText = (
  transaction: BackupRow,
  transactionTagsByTransactionId: Record<string, BackupRow[]>,
  tagsById: Record<string, BackupRow>
) => {
  const transactionId = getTextValue(transaction.id)
  const transactionTags = transactionTagsByTransactionId[transactionId] || []

  return transactionTags
    .map((transactionTag) => getTextValue(tagsById[getTextValue(transactionTag.tag_id)]?.name))
    .filter(Boolean)
    .join(', ')
}

const createBackupCsv = ({
  transactions,
  categoriesById,
  tagsById,
  transactionTagsByTransactionId,
  paymentSourcesById,
}: {
  transactions: BackupRow[]
  categoriesById: Record<string, Category>
  tagsById: Record<string, BackupRow>
  transactionTagsByTransactionId: Record<string, BackupRow[]>
  paymentSourcesById: Record<string, BackupRow>
}) => {
  const rows: unknown[][] = [
    ['date', 'category_name', 'amount', 'description', 'tags', 'payment_source', 'created_at'],
  ]

  transactions.forEach((transaction) => {
    const categoryId = getTextValue(transaction.category_id)
    const categoryName = categoriesById[categoryId]
      ? getCategoryPathLabel(categoryId, categoriesById)
      : ''

    rows.push([
      transaction.date,
      categoryName,
      transaction.amount,
      transaction.description,
      getTransactionTagsText(transaction, transactionTagsByTransactionId, tagsById),
      getPaymentSourceName(transaction, paymentSourcesById),
      transaction.created_at,
    ])
  })

  return joinCsvRows(rows)
}

export const fetchProfileBackup = async (supabase: SupabaseClient, profileId: string) => {
  const profile = await fetchProfile(supabase, profileId)
  const [
    categories,
    transactions,
    tags,
    paymentSources,
    profileFinanceSettings,
    financialGoals,
    financialGoalMonthPriorities,
    financialGoalMonthConfigs,
    recurringTransactions,
    recurringReminderMonthStatuses,
    notes,
    monthNavigationSettings,
    excludedMonths,
    lockedMonths,
    userProfileSettings,
    budgetLimits,
    drafts,
  ] = await Promise.all([
    fetchProfileRows(supabase, 'categories', profileId),
    fetchProfileRows(supabase, 'transactions', profileId),
    fetchProfileRows(supabase, 'tags', profileId),
    fetchProfileRows(supabase, 'payment_sources', profileId),
    fetchProfileRows(supabase, 'profile_finance_settings', profileId, { optional: true }),
    fetchProfileRows(supabase, 'financial_goals', profileId),
    fetchProfileRows(supabase, 'financial_goal_month_priorities', profileId, { optional: true }),
    fetchProfileRows(supabase, 'financial_goal_month_configs', profileId, { optional: true }),
    fetchProfileRows(supabase, 'recurring_transactions', profileId),
    fetchProfileRows(supabase, 'recurring_reminder_month_statuses', profileId, { optional: true }),
    fetchProfileRows(supabase, 'profile_month_notes', profileId, { optional: true }),
    fetchProfileRows(supabase, 'profile_month_navigation_settings', profileId, { optional: true }),
    fetchProfileRows(supabase, 'profile_excluded_months', profileId, { optional: true }),
    fetchProfileRows(supabase, 'profile_locked_months', profileId, { optional: true }),
    fetchProfileRows(supabase, 'user_profile_settings', profileId, { optional: true }),
    fetchProfileRows(supabase, 'budget_limits', profileId, { optional: true }),
    fetchProfileRows(supabase, 'drafts', profileId, { optional: true }),
  ])
  const transactionIds = transactions.map((transaction) => getTextValue(transaction.id)).filter(Boolean)
  const recurringTransactionIds = recurringTransactions
    .map((transaction) => getTextValue(transaction.id))
    .filter(Boolean)
  const [transactionTags, transactionPaymentSplits, recurringTransactionExecutions] = await Promise.all([
    fetchTransactionTags(supabase, transactionIds),
    fetchRowsByIds(supabase, 'transaction_payment_splits', 'transaction_id', transactionIds, {
      optional: true,
    }),
    fetchRowsByIds(
      supabase,
      'recurring_transaction_executions',
      'recurring_transaction_id',
      recurringTransactionIds,
      { optional: true }
    ),
  ])

  return {
    exported_at: new Date().toISOString(),
    profile,
    categories,
    transactions,
    tags,
    transaction_tags: transactionTags,
    transaction_payment_splits: transactionPaymentSplits,
    payment_sources: paymentSources,
    profile_finance_settings: profileFinanceSettings,
    financial_goals: financialGoals,
    financial_goal_month_priorities: financialGoalMonthPriorities,
    financial_goal_month_configs: financialGoalMonthConfigs,
    recurring_transactions: recurringTransactions,
    recurring_transaction_executions: recurringTransactionExecutions,
    recurring_reminder_month_statuses: recurringReminderMonthStatuses,
    notes,
    profile_month_navigation_settings: monthNavigationSettings,
    profile_excluded_months: excludedMonths,
    profile_locked_months: lockedMonths,
    user_profile_settings: userProfileSettings,
    budget_limits: budgetLimits,
    drafts,
  } satisfies ProfileBackup
}

export const downloadProfileBackupJson = async (supabase: SupabaseClient, profileId: string) => {
  const backup = await fetchProfileBackup(supabase, profileId)

  triggerTextDownload({
    filename: `budget-backup-${getBackupDateText()}.json`,
    content: JSON.stringify(backup, null, 2),
    mimeType: 'application/json;charset=utf-8',
  })
}

export const downloadProfileBackupCsv = async (
  supabase: SupabaseClient,
  profileId: string,
  budgetStartDate?: string | null
) => {
  const backup = await fetchProfileBackup(supabase, profileId)
  const categoriesById = Object.fromEntries(
    backup.categories.map((category) => [getTextValue(category.id), category as Category])
  )
  const tagsById = Object.fromEntries(backup.tags.map((tag) => [getTextValue(tag.id), tag]))
  const paymentSourcesById = Object.fromEntries(
    backup.payment_sources.map((paymentSource) => [getTextValue(paymentSource.id), paymentSource])
  )
  const transactionTagsByTransactionId = backup.transaction_tags.reduce<Record<string, BackupRow[]>>(
    (acc, transactionTag) => {
      const transactionId = getTextValue(transactionTag.transaction_id)

      if (!acc[transactionId]) {
        acc[transactionId] = []
      }

      acc[transactionId].push(transactionTag)
      return acc
    },
    {}
  )

  triggerTextDownload({
    filename: `budget-transactions-${getBackupDateText()}.csv`,
    content: createBackupCsv({
      transactions: backup.transactions.filter(
        (transaction) =>
          transaction.is_deleted !== true &&
          isTransactionInBudgetRange(
            { date: getTextValue(transaction.date) },
            budgetStartDate
          )
      ),
      categoriesById,
      tagsById,
      transactionTagsByTransactionId,
      paymentSourcesById,
    }),
    mimeType: 'text/csv;charset=utf-8',
  })
}
