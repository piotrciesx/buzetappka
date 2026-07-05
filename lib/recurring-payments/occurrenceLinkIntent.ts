export type RecurringOccurrenceLinkIntent = {
  occurrenceId: string
  planId: string
  plannedAmount: number | null
}

let pendingIntent: RecurringOccurrenceLinkIntent | null = null

export const setRecurringOccurrenceLinkIntent = (intent: RecurringOccurrenceLinkIntent) => {
  pendingIntent = intent
}

export const peekRecurringOccurrenceLinkIntent = () => pendingIntent

export const clearRecurringOccurrenceLinkIntent = () => {
  pendingIntent = null
}

