export const normalizeDuplicateDescription = (value: string | null | undefined) =>
  (value || '')
    .trim()
    .toLocaleLowerCase('pl-PL')
    .replace(/\s+/g, ' ')

export const getDayDistance = (leftDate: string, rightDate: string) => {
  const leftTime = new Date(`${leftDate}T00:00:00`).getTime()
  const rightTime = new Date(`${rightDate}T00:00:00`).getTime()

  if (!Number.isFinite(leftTime) || !Number.isFinite(rightTime)) {
    return Number.POSITIVE_INFINITY
  }

  return Math.abs(leftTime - rightTime) / 86_400_000
}

export const confirmPotentialDuplicateTransaction = (
  activeTransactionsById: Record<string, { category_id: string; is_deleted?: boolean | null; amount: unknown; day_is_null?: boolean | null; date: string; description?: string | null; created_at?: string | null }>,
  categoryId: string,
  amountValue: number,
  descriptionText: string,
  dateText: string,
  dayIsNull = false
) => {
  if (!amountValue || amountValue <= 0) {
    return true
  }

  const normalizedDescription = normalizeDuplicateDescription(descriptionText)

  if (normalizedDescription.length < 3) {
    return true
  }

  const duplicateCandidate = Object.values(activeTransactionsById).find((transaction) => {
    if (transaction.category_id !== categoryId || transaction.is_deleted) {
      return false
    }

    const existingAmount = Number(transaction.amount)
    if (!Number.isFinite(existingAmount) || Math.abs(existingAmount - amountValue) > 0.01) {
      return false
    }

    if (Boolean(transaction.day_is_null) !== dayIsNull) {
      return false
    }

    if (!dayIsNull && getDayDistance(transaction.date, dateText) > 1) {
      return false
    }

    const existingDescription = normalizeDuplicateDescription(transaction.description)
    const hasSimilarDescription =
      existingDescription === normalizedDescription ||
      (existingDescription.length >= 6 &&
        normalizedDescription.length >= 6 &&
        (existingDescription.includes(normalizedDescription) ||
          normalizedDescription.includes(existingDescription)))

    if (!hasSimilarDescription) {
      return false
    }

    if (!transaction.created_at) {
      return transaction.date === dateText
    }

    const createdAtTime = new Date(transaction.created_at).getTime()
    const minutesSinceCreated = (Date.now() - createdAtTime) / 60_000

    return transaction.date === dateText || minutesSinceCreated <= 30
  })

  if (!duplicateCandidate) {
    return true
  }

  return confirm('Podobny wpis istnieje już w tym dniu. Dodać mimo to?')
}
