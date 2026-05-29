import { SupabaseClient } from '@supabase/supabase-js'
import { Tag } from '../budgetPageTypes'
import { buildPaymentSplitPayload, PaymentSplitInput } from '../paymentSplitUtils'
import { setTransactionTags } from '../tagUtils'

export const syncTransactionTags = async (
  supabase: SupabaseClient,
  profileId: string,
  transactionId: string,
  rawTagNames: string[],
  currentTags: Tag[]
) => {
  await setTransactionTags(supabase, profileId, transactionId, rawTagNames, currentTags)
}

export const syncTransactionPaymentSplits = async (
  supabase: SupabaseClient,
  profileId: string,
  transactionId: string,
  amountText: string,
  paymentSourceIdValue: string,
  paymentSplitItemsValue: PaymentSplitInput[]
) => {
  const normalizedPaymentSplit = buildPaymentSplitPayload({
    totalAmountText: amountText,
    selectedPaymentSourceId: paymentSourceIdValue,
    splitItems: paymentSplitItemsValue,
  })

  if (normalizedPaymentSplit.errors.length > 0) {
    throw new Error('invalid-payment-split-total')
  }

  const { data: scopedTransaction, error: scopedTransactionError } = await supabase
    .from('transactions')
    .select('id')
    .eq('id', transactionId)
    .eq('profile_id', profileId)
    .maybeSingle()

  if (scopedTransactionError) {
    throw scopedTransactionError
  }

  if (!scopedTransaction) {
    throw new Error('transaction-not-in-active-profile')
  }

  const { error: deleteError } = await supabase
    .from('transaction_payment_splits')
    .delete()
    .eq('transaction_id', transactionId)

  if (deleteError) {
    throw deleteError
  }

  if (normalizedPaymentSplit.splitRows.length === 0) {
    return
  }

  const { error: insertError } = await supabase.from('transaction_payment_splits').insert(
    normalizedPaymentSplit.splitRows.map((item) => ({
      transaction_id: transactionId,
      payment_source_id: item.payment_source_id,
      amount: item.amount,
    }))
  )

  if (insertError) {
    throw insertError
  }
}
