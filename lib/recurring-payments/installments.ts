import {
  addGrosze,
  compareGrosze,
  grosze,
  subtractGrosze,
  sumGrosze,
  zeroGrosze,
  type Grosze,
} from './money'

export type InstallmentPricingMode = 'zero_percent' | 'with_cost'

export type InstallmentPurchaseInput = {
  purchaseAmountGrosze: Grosze
  downPaymentAmountGrosze: Grosze
  installmentCount?: number | null
  installmentAmountGrosze?: Grosze | null
  pricingMode: InstallmentPricingMode
}

export type InstallmentPurchaseCalculation = {
  purchaseAmountGrosze: Grosze
  downPaymentAmountGrosze: Grosze
  financedAmountGrosze: Grosze
  installmentCount: number
  installmentAmountGrosze: Grosze
  installmentsGrosze: Grosze[]
  installmentsTotalGrosze: Grosze
  installmentCostGrosze: Grosze
  isZeroPercentValid: boolean
}

export const calculateFinancedAmount = (
  purchaseAmountGrosze: Grosze,
  downPaymentAmountGrosze: Grosze
) => {
  if (compareGrosze(purchaseAmountGrosze, zeroGrosze) < 0) {
    throw new Error('Purchase amount cannot be negative.')
  }
  if (compareGrosze(downPaymentAmountGrosze, zeroGrosze) < 0) {
    throw new Error('Down payment cannot be negative.')
  }
  if (compareGrosze(downPaymentAmountGrosze, purchaseAmountGrosze) > 0) {
    throw new Error('Down payment cannot exceed purchase amount.')
  }

  return subtractGrosze(purchaseAmountGrosze, downPaymentAmountGrosze)
}

const assertInstallmentCount = (count: number) => {
  if (!Number.isSafeInteger(count) || count <= 0) {
    throw new Error('Installment count must be a positive integer.')
  }
}

const buildBalancedInstallments = (total: Grosze, count: number) => {
  assertInstallmentCount(count)
  const base = Math.floor(total / count)
  const installments = Array.from({ length: count }, () => grosze(base))
  const sumBeforeLast = grosze(base * Math.max(count - 1, 0))
  installments[count - 1] = subtractGrosze(total, sumBeforeLast)
  return installments
}

export const validateZeroPercentInstallments = ({
  purchaseAmountGrosze,
  downPaymentAmountGrosze,
  installmentsGrosze,
}: {
  purchaseAmountGrosze: Grosze
  downPaymentAmountGrosze: Grosze
  installmentsGrosze: readonly Grosze[]
}) => {
  return (
    compareGrosze(
      addGrosze(downPaymentAmountGrosze, sumGrosze(installmentsGrosze)),
      purchaseAmountGrosze
    ) === 0
  )
}

export const calculateInstallmentPurchase = (
  input: InstallmentPurchaseInput
): InstallmentPurchaseCalculation => {
  const financedAmountGrosze = calculateFinancedAmount(
    input.purchaseAmountGrosze,
    input.downPaymentAmountGrosze
  )
  const explicitCount = input.installmentCount || null
  const explicitAmount = input.installmentAmountGrosze ?? null

  if (explicitCount !== null) assertInstallmentCount(explicitCount)
  if (explicitAmount !== null && compareGrosze(explicitAmount, zeroGrosze) <= 0) {
    throw new Error('Installment amount must be greater than zero.')
  }
  if (explicitCount === null && explicitAmount === null) {
    throw new Error('Installment count or installment amount is required.')
  }

  const installmentCount =
    explicitCount ?? Math.max(Math.ceil(financedAmountGrosze / (explicitAmount as Grosze)), 1)

  let installmentsGrosze: Grosze[]
  if (input.pricingMode === 'zero_percent') {
    if (explicitAmount !== null) {
      const beforeLast = grosze(explicitAmount * Math.max(installmentCount - 1, 0))
      const last = subtractGrosze(financedAmountGrosze, beforeLast)
      if (compareGrosze(last, zeroGrosze) < 0) {
        throw new Error('Installment amount and count exceed the financed amount.')
      }
      installmentsGrosze = [
        ...Array.from({ length: Math.max(installmentCount - 1, 0) }, () => explicitAmount),
        last,
      ]
    } else {
      installmentsGrosze = buildBalancedInstallments(financedAmountGrosze, installmentCount)
    }
  } else if (explicitAmount !== null) {
    installmentsGrosze = Array.from({ length: installmentCount }, () => explicitAmount)
  } else {
    installmentsGrosze = buildBalancedInstallments(financedAmountGrosze, installmentCount)
  }

  const installmentsTotalGrosze = sumGrosze(installmentsGrosze)
  const installmentCostGrosze = subtractGrosze(
    addGrosze(input.downPaymentAmountGrosze, installmentsTotalGrosze),
    input.purchaseAmountGrosze
  )

  return {
    purchaseAmountGrosze: input.purchaseAmountGrosze,
    downPaymentAmountGrosze: input.downPaymentAmountGrosze,
    financedAmountGrosze,
    installmentCount,
    installmentAmountGrosze: installmentsGrosze[0] ?? zeroGrosze,
    installmentsGrosze,
    installmentsTotalGrosze,
    installmentCostGrosze,
    isZeroPercentValid:
      input.pricingMode !== 'zero_percent' ||
      validateZeroPercentInstallments({
        purchaseAmountGrosze: input.purchaseAmountGrosze,
        downPaymentAmountGrosze: input.downPaymentAmountGrosze,
        installmentsGrosze,
      }),
  }
}

