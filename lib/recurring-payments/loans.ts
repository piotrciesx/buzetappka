import { addGrosze, subtractGrosze, type Grosze } from './money'

export type LoanCostInput = {
  principalAmountGrosze: Grosze
  paidBeforeTrackingAmountGrosze: Grosze
  paidInAppActualGrosze: Grosze
  plannedRemainingGrosze: Grosze
}

export type LoanCostEstimate = LoanCostInput & {
  paidTotalGrosze: Grosze
  estimatedTotalCostGrosze: Grosze
  isEstimated: true
}

export const calculateLoanCostEstimate = (
  input: LoanCostInput
): LoanCostEstimate => {
  const paidTotalGrosze = addGrosze(
    input.paidBeforeTrackingAmountGrosze,
    input.paidInAppActualGrosze
  )
  const estimatedTotalCostGrosze = subtractGrosze(
    addGrosze(paidTotalGrosze, input.plannedRemainingGrosze),
    input.principalAmountGrosze
  )

  return {
    ...input,
    paidTotalGrosze,
    estimatedTotalCostGrosze,
    isEstimated: true,
  }
}

