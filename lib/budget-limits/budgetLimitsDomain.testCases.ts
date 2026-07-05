import { buildBudgetLimitAlertStates, markBudgetLimitAlertRead, muteBudgetLimitAlertForPeriod } from './alerts'
import { calculateBudgetLimitUsage, getBudgetLimitUsageStatus } from './calculations'
import { buildMonthlyBudgetLimitHistory, getBudgetLimitVersionForPeriod } from './history'
import { createBudgetLimitPeriodInstance, getTransactionBudgetLimitPeriodMembership } from './periods'
import { getBudgetLimitScopeDecision } from './scopes'
import { parseGrosze } from '../recurring-payments/money'
import type {
  BudgetLimitAlertRule,
  BudgetLimitCategoryNode,
  BudgetLimitPeriodInstance,
  BudgetLimitScope,
  BudgetLimitTransactionCandidate,
  BudgetLimitVersion,
} from './types'

export type BudgetLimitsDomainTestCase = {
  name: string
  run: () => void
}

const assertEqual = (actual: unknown, expected: unknown, message: string) => {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${String(expected)}, received ${String(actual)}`)
  }
}

const assertDeepEqual = (actual: unknown, expected: unknown, message: string) => {
  const actualJson = JSON.stringify(actual)
  const expectedJson = JSON.stringify(expected)
  if (actualJson !== expectedJson) {
    throw new Error(`${message}: expected ${expectedJson}, received ${actualJson}`)
  }
}

const categoriesById: Record<string, BudgetLimitCategoryNode> = {
  expense: { id: 'expense', level: 1, parentId: null },
  food: { id: 'food', level: 2, parentId: 'expense' },
  restaurants: { id: 'restaurants', level: 3, parentId: 'food' },
  groceries: { id: 'groceries', level: 3, parentId: 'food' },
  transport: { id: 'transport', level: 2, parentId: 'expense' },
  salary: { id: 'salary', level: 2, parentId: 'income' },
}

const warningRules: BudgetLimitAlertRule[] = [
  { id: 'warning-80', kind: 'threshold_reached', thresholdPercent: 80, enabled: true },
  { id: 'exceeded', kind: 'limit_exceeded', thresholdPercent: 100, enabled: true },
  { id: 'projected', kind: 'projected_exceeded', enabled: true },
]

const createMonthlyPeriod = (month = '2026-07', id = `period:${month}`) =>
  createBudgetLimitPeriodInstance({
    id,
    planId: 'plan',
    versionId: 'version',
    profileId: 'profile',
    definition: { type: 'monthly', month },
  })

const transaction = ({
  id,
  categoryId,
  amount = '100.00',
  rootType = 'expense',
  date = '2026-07-10',
  isDeleted = false,
}: {
  id: string
  categoryId: string
  amount?: string
  rootType?: BudgetLimitTransactionCandidate['rootType']
  date?: string
  isDeleted?: boolean
}): BudgetLimitTransactionCandidate => ({
  id,
  categoryId,
  amountGrosze: parseGrosze(amount),
  rootType,
  date,
  dateKind: 'exact_day',
  isDeleted,
  semanticType: 'standard',
})

const calculate = ({
  scope,
  transactions,
  limit = '1000.00',
  asOfDate = '2026-07-10',
  period = createMonthlyPeriod(),
}: {
  scope: BudgetLimitScope
  transactions: BudgetLimitTransactionCandidate[]
  limit?: string
  asOfDate?: string
  period?: BudgetLimitPeriodInstance
}) =>
  calculateBudgetLimitUsage({
    planId: 'plan',
    period,
    limitAmountGrosze: parseGrosze(limit),
    scope,
    alertRules: warningRules,
    transactions,
    categoriesById,
    asOfDate,
  })

export const budgetLimitsDomainTestCases: BudgetLimitsDomainTestCase[] = [
  {
    name: 'L3 limit counts only the selected L3 category',
    run: () => {
      const summary = calculate({
        scope: { type: 'category_l3', categoryId: 'restaurants' },
        transactions: [
          transaction({ id: 'restaurant', categoryId: 'restaurants', amount: '120.00' }),
          transaction({ id: 'groceries', categoryId: 'groceries', amount: '80.00' }),
          transaction({ id: 'food', categoryId: 'food', amount: '50.00' }),
        ],
      })
      assertEqual(summary.spentAmountGrosze, 12000, 'L3 spent amount')
      assertEqual(summary.includedTransactionCount, 1, 'L3 transaction count')
    },
  },
  {
    name: 'L2 limit counts the L2 category and direct L3 children',
    run: () => {
      const summary = calculate({
        scope: { type: 'category_l2', categoryId: 'food' },
        transactions: [
          transaction({ id: 'food', categoryId: 'food', amount: '50.00' }),
          transaction({ id: 'restaurant', categoryId: 'restaurants', amount: '120.00' }),
          transaction({ id: 'groceries', categoryId: 'groceries', amount: '80.00' }),
          transaction({ id: 'transport', categoryId: 'transport', amount: '40.00' }),
        ],
      })
      assertEqual(summary.spentAmountGrosze, 25000, 'L2 spent amount')
      assertEqual(summary.includedTransactionCount, 3, 'L2 transaction count')
    },
  },
  {
    name: 'global limit counts all expenses across categories',
    run: () => {
      const summary = calculate({
        scope: { type: 'global_expenses' },
        transactions: [
          transaction({ id: 'food', categoryId: 'food', amount: '50.00' }),
          transaction({ id: 'transport', categoryId: 'transport', amount: '40.00' }),
        ],
      })
      assertEqual(summary.spentAmountGrosze, 9000, 'Global expense amount')
    },
  },
  {
    name: 'income does not consume an expense limit',
    run: () => {
      const summary = calculate({
        scope: { type: 'global_expenses' },
        transactions: [
          transaction({ id: 'salary', categoryId: 'salary', amount: '5000.00', rootType: 'income' }),
        ],
      })
      assertEqual(summary.spentAmountGrosze, 0, 'Income amount')
    },
  },
  {
    name: 'deleted transactions do not consume a limit',
    run: () => {
      const summary = calculate({
        scope: { type: 'global_expenses' },
        transactions: [
          transaction({ id: 'deleted', categoryId: 'food', amount: '300.00', isDeleted: true }),
        ],
      })
      assertEqual(summary.spentAmountGrosze, 0, 'Deleted amount')
    },
  },
  {
    name: 'unstable transfer and refund semantics remain unknown instead of guessed',
    run: () => {
      const base = transaction({ id: 'transfer', categoryId: 'food' })
      const decision = getBudgetLimitScopeDecision({
        transaction: { ...base, semanticType: 'transfer' },
        scope: { type: 'global_expenses' },
        categoriesById,
      })
      assertDeepEqual(
        decision,
        { result: 'unknown', reason: 'unstable_semantic_type' },
        'Transfer decision'
      )
    },
  },
  {
    name: 'usage status resolves safe, warning, and exceeded',
    run: () => {
      const limit = parseGrosze('1000.00')
      assertEqual(
        getBudgetLimitUsageStatus({
          spentAmountGrosze: parseGrosze('500.00'),
          limitAmountGrosze: limit,
          alertRules: warningRules,
        }),
        'safe',
        'Safe status'
      )
      assertEqual(
        getBudgetLimitUsageStatus({
          spentAmountGrosze: parseGrosze('800.00'),
          limitAmountGrosze: limit,
          alertRules: warningRules,
        }),
        'warning',
        'Warning status'
      )
      assertEqual(
        getBudgetLimitUsageStatus({
          spentAmountGrosze: parseGrosze('1000.00'),
          limitAmountGrosze: limit,
          alertRules: warningRules,
        }),
        'exceeded',
        'Exceeded status'
      )
    },
  },
  {
    name: 'limit calculations expose exceeded and remaining amounts',
    run: () => {
      const summary = calculate({
        scope: { type: 'global_expenses' },
        transactions: [transaction({ id: 'expense', categoryId: 'food', amount: '1200.00' })],
      })
      assertEqual(summary.remainingAmountGrosze, -20000, 'Negative remaining amount')
      assertEqual(summary.exceededAmountGrosze, 20000, 'Exceeded amount')
      assertEqual(summary.usagePercent, 120, 'Usage percent')
    },
  },
  {
    name: 'current pace projects an end-of-period limit overrun',
    run: () => {
      const summary = calculate({
        scope: { type: 'global_expenses' },
        transactions: [transaction({ id: 'expense', categoryId: 'food', amount: '500.00' })],
        asOfDate: '2026-07-10',
      })
      assertEqual(summary.currentDailyAverageGrosze, 5000, 'Current daily average')
      assertEqual(summary.projectedSpendGrosze, 155000, 'Projected spend')
      assertEqual(summary.projectedDifferenceGrosze, 55000, 'Projected difference')
    },
  },
  {
    name: 'alerts support unread, read, and period muting',
    run: () => {
      const summary = calculate({
        scope: { type: 'global_expenses' },
        transactions: [transaction({ id: 'expense', categoryId: 'food', amount: '900.00' })],
      })
      const alerts = buildBudgetLimitAlertStates({
        summary,
        rules: warningRules,
        triggeredAt: '2026-07-10T12:00:00Z',
      })
      const warning = alerts.find((alert) => alert.ruleId === 'warning-80')
      if (!warning) throw new Error('Expected warning alert.')
      assertEqual(warning.status, 'unread', 'Initial alert status')
      const read = markBudgetLimitAlertRead(warning, '2026-07-10T13:00:00Z')
      assertEqual(read.status, 'read', 'Read alert status')
      const muted = muteBudgetLimitAlertForPeriod(read)
      assertEqual(muted.status, 'muted', 'Muted alert status')
      assertEqual(muted.mutedForPeriod, true, 'Period mute marker')
    },
  },
  {
    name: 'projected overrun produces a forecast alert',
    run: () => {
      const summary = calculate({
        scope: { type: 'global_expenses' },
        transactions: [transaction({ id: 'expense', categoryId: 'food', amount: '500.00' })],
      })
      const alerts = buildBudgetLimitAlertStates({
        summary,
        rules: warningRules,
        triggeredAt: '2026-07-10T12:00:00Z',
      })
      assertEqual(
        alerts.some((alert) => alert.kind === 'projected_exceeded'),
        true,
        'Projected alert'
      )
    },
  },
  {
    name: 'monthly history resolves different limit versions without overwriting history',
    run: () => {
      const july = createMonthlyPeriod('2026-07', 'july')
      const august = createMonthlyPeriod('2026-08', 'august')
      const versions: BudgetLimitVersion[] = [
        {
          id: 'v1',
          planId: 'plan',
          profileId: 'profile',
          effectiveFrom: '2026-07-01',
          effectiveTo: '2026-07-31',
          limitAmountGrosze: parseGrosze('1000.00'),
          scope: { type: 'global_expenses' },
          period: { type: 'monthly', month: '2026-07' },
          alertRules: warningRules,
        },
        {
          id: 'v2',
          planId: 'plan',
          profileId: 'profile',
          effectiveFrom: '2026-08-01',
          effectiveTo: null,
          limitAmountGrosze: parseGrosze('1200.00'),
          scope: { type: 'global_expenses' },
          period: { type: 'monthly', month: '2026-08' },
          alertRules: warningRules,
        },
      ]
      const history = buildMonthlyBudgetLimitHistory({ periods: [august, july], versions, summaries: [] })
      assertDeepEqual(history.map((entry) => entry.version?.limitAmountGrosze), [100000, 120000], 'History amounts')
      assertEqual(getBudgetLimitVersionForPeriod(versions, '2026-07-01')?.id, 'v1', 'July version')
    },
  },
  {
    name: 'month-only transaction is unknown for a partial date range',
    run: () => {
      const period = createBudgetLimitPeriodInstance({
        id: 'partial',
        planId: 'plan',
        versionId: 'version',
        profileId: 'profile',
        definition: { type: 'date_range', startDate: '2026-07-10', endDate: '2026-07-20' },
      })
      assertEqual(
        getTransactionBudgetLimitPeriodMembership({
          date: '2026-07-01',
          dateKind: 'month_only',
          period,
        }),
        'unknown_day',
        'Partial period membership'
      )
    },
  },
]

export const runBudgetLimitsDomainTestCases = () => {
  budgetLimitsDomainTestCases.forEach((testCase) => testCase.run())
  return budgetLimitsDomainTestCases.length
}
