import { buildRecurringDueDates } from './cadence'
import { calculateInstallmentPurchase } from './installments'
import { mapLegacyRecurringCadence, mapLegacyRecurringKind } from './legacyAdapter'
import { calculateLoanCostEstimate } from './loans'
import { parseGrosze } from './money'
import {
  calculateRecurringPlanStatistics,
  getEffectiveOccurrenceAmount,
  getRecurringOccurrenceReminderState,
} from './occurrences'
import type { RecurringPaymentOccurrence } from './types'

export type RecurringPaymentsDomainTestCase = {
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

export const recurringPaymentsDomainTestCases: RecurringPaymentsDomainTestCase[] = [
  {
    name: 'cadence supports days, weeks, months with clamping, and leap years',
    run: () => {
      assertDeepEqual(
        buildRecurringDueDates({
          startDate: '2024-01-31',
          cadence: { unit: 'month', interval: 1 },
          count: 3,
        }),
        ['2024-01-31', '2024-02-29', '2024-03-31'],
        'Monthly cadence'
      )
      assertEqual(
        buildRecurringDueDates({
          startDate: '2024-02-29',
          cadence: { unit: 'year', interval: 1 },
          count: 2,
        })[1],
        '2025-02-28',
        'Year cadence'
      )
      assertEqual(
        buildRecurringDueDates({
          startDate: '2026-07-05',
          cadence: { unit: 'week', interval: 2 },
          count: 2,
        })[1],
        '2026-07-19',
        'Week cadence'
      )
    },
  },
  {
    name: 'occurrence lifecycle keeps skipped separate and derives overdue/snoozed',
    run: () => {
      assertEqual(
        getRecurringOccurrenceReminderState({
          status: 'skipped',
          dueDate: '2026-07-01',
          today: '2026-07-05',
        }),
        'skipped',
        'Skipped state'
      )
      assertEqual(
        getRecurringOccurrenceReminderState({
          status: 'pending',
          dueDate: '2026-07-01',
          today: '2026-07-05',
        }),
        'overdue',
        'Overdue state'
      )
      assertEqual(
        getRecurringOccurrenceReminderState({
          status: 'pending',
          dueDate: '2026-07-01',
          today: '2026-07-05',
          snoozedUntil: '2026-07-08',
        }),
        'snoozed',
        'Snoozed state'
      )
    },
  },
  {
    name: 'effective amount prioritizes transactions over planned amount',
    run: () => {
      assertEqual(
        getEffectiveOccurrenceAmount({
          status: 'completed_without_transaction',
          plannedAmountGrosze: parseGrosze('100.00'),
          transactionAmountsGrosze: [parseGrosze('40.00'), parseGrosze('70.00')],
        }).amountGrosze,
        11000,
        'Transaction total'
      )
      assertEqual(
        getEffectiveOccurrenceAmount({
          status: 'completed_without_transaction',
          plannedAmountGrosze: parseGrosze('100.00'),
        }).amountGrosze,
        10000,
        'Planned fallback'
      )
      assertEqual(
        getEffectiveOccurrenceAmount({
          status: 'skipped',
          plannedAmountGrosze: parseGrosze('100.00'),
          transactionAmountsGrosze: [parseGrosze('120.00')],
        }).amountGrosze,
        0,
        'Skipped amount despite inconsistent transaction data'
      )
    },
  },
  {
    name: 'plan statistics count states and money independently',
    run: () => {
      const occurrences: RecurringPaymentOccurrence[] = [
        {
          id: 'linked',
          planId: 'plan',
          dueDate: '2026-07-01',
          plannedAmountGrosze: parseGrosze('100.00'),
          status: 'completed_with_transaction',
        },
        {
          id: 'without',
          planId: 'plan',
          dueDate: '2026-07-02',
          plannedAmountGrosze: parseGrosze('80.00'),
          status: 'completed_without_transaction',
        },
        {
          id: 'skipped',
          planId: 'plan',
          dueDate: '2026-07-03',
          plannedAmountGrosze: parseGrosze('60.00'),
          status: 'skipped',
        },
        {
          id: 'future',
          planId: 'plan',
          dueDate: '2026-07-10',
          plannedAmountGrosze: parseGrosze('50.00'),
          status: 'pending',
        },
      ]
      const statistics = calculateRecurringPlanStatistics({
        occurrences,
        transactionAmountsByOccurrenceId: { linked: [parseGrosze('120.00')] },
        today: '2026-07-05',
      })
      assertEqual(statistics.paidActualGrosze, 20000, 'Paid actual')
      assertEqual(statistics.plannedRemainingGrosze, 5000, 'Planned remaining')
      assertEqual(statistics.skippedCount, 1, 'Skipped count')
    },
  },
  {
    name: 'zero-percent installments use an exact balancing final installment',
    run: () => {
      const calculation = calculateInstallmentPurchase({
        purchaseAmountGrosze: parseGrosze('1000.00'),
        downPaymentAmountGrosze: parseGrosze('0.00'),
        installmentCount: 3,
        pricingMode: 'zero_percent',
      })
      assertDeepEqual(
        calculation.installmentsGrosze,
        [33333, 33333, 33334],
        'Installments'
      )
      assertEqual(calculation.installmentCostGrosze, 0, 'Zero-percent cost')
      assertEqual(calculation.isZeroPercentValid, true, 'Zero-percent validation')
    },
  },
  {
    name: 'cost-bearing installments expose their surplus cost',
    run: () => {
      const calculation = calculateInstallmentPurchase({
        purchaseAmountGrosze: parseGrosze('1000.00'),
        downPaymentAmountGrosze: parseGrosze('100.00'),
        installmentCount: 10,
        installmentAmountGrosze: parseGrosze('100.00'),
        pricingMode: 'with_cost',
      })
      assertEqual(calculation.financedAmountGrosze, 90000, 'Financed amount')
      assertEqual(calculation.installmentCostGrosze, 10000, 'Installment cost')
    },
  },
  {
    name: 'loan cost is explicitly estimated',
    run: () => {
      const estimate = calculateLoanCostEstimate({
        principalAmountGrosze: parseGrosze('10000.00'),
        paidBeforeTrackingAmountGrosze: parseGrosze('2000.00'),
        paidInAppActualGrosze: parseGrosze('3000.00'),
        plannedRemainingGrosze: parseGrosze('7000.00'),
      })
      assertEqual(estimate.estimatedTotalCostGrosze, 200000, 'Estimated cost')
      assertEqual(estimate.isEstimated, true, 'Estimate marker')
    },
  },
  {
    name: 'legacy adapter maps kinds and month-based cadence without changing data',
    run: () => {
      assertEqual(mapLegacyRecurringKind('open'), 'fixed_payment', 'Open kind')
      assertEqual(
        mapLegacyRecurringKind('installment'),
        'installment_purchase',
        'Installment kind'
      )
      assertDeepEqual(
        mapLegacyRecurringCadence({ frequency: 'custom', custom_interval_months: 3 }),
        { unit: 'month', interval: 3 },
        'Custom cadence'
      )
      assertDeepEqual(
        mapLegacyRecurringCadence({ frequency: 'yearly' }),
        { unit: 'year', interval: 1 },
        'Yearly cadence'
      )
    },
  },
]

export const runRecurringPaymentsDomainTestCases = () => {
  recurringPaymentsDomainTestCases.forEach((testCase) => testCase.run())
  return recurringPaymentsDomainTestCases.length
}
