'use client'

import { CSSProperties } from 'react'
import {
  buildPaymentSplitPayload,
  createPaymentSplitItemsFromSingleSource,
  PaymentSplitInput,
  rebalancePaymentSplitAmounts,
} from '../lib/paymentSplitUtils'

type PaymentSourceOption = {
  id: string
  name: string
  type: string
  optionLabel?: string
}

type Props = {
  amount: string
  isVisible: boolean
  selectedPaymentSourceId: string
  setSelectedPaymentSourceId: (value: string) => void
  paymentSourceOptions: PaymentSourceOption[]
  paymentSplitItems: PaymentSplitInput[]
  setPaymentSplitItems: (
    value: PaymentSplitInput[] | ((prev: PaymentSplitInput[]) => PaymentSplitInput[])
  ) => void
  styles: Record<string, CSSProperties>
}

const splitWrapStyle: CSSProperties = {
  display: 'grid',
  gap: 8,
}

const splitRowStyle: CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
  alignItems: 'center',
}

const splitHelpStyle: CSSProperties = {
  fontSize: 12,
  color: '#64748b',
  lineHeight: 1.45,
}

export default function PaymentSplitEditor({
  amount,
  isVisible,
  selectedPaymentSourceId,
  setSelectedPaymentSourceId,
  paymentSourceOptions,
  paymentSplitItems,
  setPaymentSplitItems,
  styles,
}: Props) {
  if (!isVisible) {
    return null
  }

  const splitState = buildPaymentSplitPayload({
    totalAmountText: amount,
    selectedPaymentSourceId,
    splitItems: paymentSplitItems,
  })
  const isSplitActive = paymentSplitItems.length > 1

  const handleAddPaymentSource = () => {
    if (isSplitActive) {
      setPaymentSplitItems((prev) => [...prev, { paymentSourceId: '', amount: '' }])
      return
    }

    setPaymentSplitItems(createPaymentSplitItemsFromSingleSource(selectedPaymentSourceId, amount))
  }

  const handleSplitSourceChange = (index: number, nextPaymentSourceId: string) => {
    setPaymentSplitItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, paymentSourceId: nextPaymentSourceId } : item
      )
    )

    if (index === 0) {
      setSelectedPaymentSourceId(nextPaymentSourceId)
    }
  }

  const handleSplitAmountChange = (index: number, nextAmount: string) => {
    setPaymentSplitItems((prev) => rebalancePaymentSplitAmounts(prev, index, nextAmount, amount))
  }

  const handleRemoveSplitRow = (index: number) => {
    const nextItems = paymentSplitItems.filter((_, itemIndex) => itemIndex !== index)

    if (nextItems.length <= 1) {
      setSelectedPaymentSourceId(nextItems[0]?.paymentSourceId || selectedPaymentSourceId)
      setPaymentSplitItems([])
      return
    }

    const rebalanceIndex = Math.max(0, Math.min(index, nextItems.length - 1))
    setSelectedPaymentSourceId(nextItems[0]?.paymentSourceId || '')
    setPaymentSplitItems(
      rebalancePaymentSplitAmounts(
        nextItems,
        rebalanceIndex,
        nextItems[rebalanceIndex]?.amount || '',
        amount
      )
    )
  }

  return (
    <div style={splitWrapStyle}>
      {!isSplitActive ? (
        <>
          <select
            style={styles.input}
            value={selectedPaymentSourceId}
            onChange={(event) => setSelectedPaymentSourceId(event.target.value)}
          >
            <option value="">Brak źródła płatności</option>
            {paymentSourceOptions.map((source) => (
              <option key={source.id} value={source.id}>
                {source.optionLabel || `${source.name} (${source.type})`}
              </option>
            ))}
          </select>

          <div style={splitRowStyle}>
            <button type="button" style={styles.secondaryButton} onClick={handleAddPaymentSource}>
              + dodaj źródło
            </button>
          </div>
        </>
      ) : (
        <>
          {paymentSplitItems.map((item, index) => (
            <div key={`split-item-${index}`} style={splitRowStyle}>
              <select
                style={{ ...styles.input, flex: '1 1 220px', minWidth: 220 }}
                value={item.paymentSourceId}
                onChange={(event) => handleSplitSourceChange(index, event.target.value)}
              >
                <option value="">Wybierz źródło</option>
                {paymentSourceOptions.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.optionLabel || `${source.name} (${source.type})`}
                  </option>
                ))}
              </select>

              <input
                style={{ ...styles.smallInput, width: 110 }}
                placeholder="kwota"
                inputMode="decimal"
                value={item.amount}
                onChange={(event) => handleSplitAmountChange(index, event.target.value)}
              />

              <button
                type="button"
                style={styles.secondaryButton}
                onClick={() => handleRemoveSplitRow(index)}
              >
                usuń
              </button>
            </div>
          ))}

          <div style={splitRowStyle}>
            <button type="button" style={styles.secondaryButton} onClick={handleAddPaymentSource}>
              + dodaj źródło
            </button>
          </div>
        </>
      )}

      <div style={splitHelpStyle}>
        Przy kilku źródłach kwoty przeliczają się automatycznie. Zapis jest blokowany, jeśli suma
        nie zgadza się z kwotą transakcji albo któreś pole jest puste.
      </div>

      {splitState.errors.length > 0 && (
        <div style={{ ...splitHelpStyle, color: '#b91c1c' }}>{splitState.errors.join(' • ')}</div>
      )}
    </div>
  )
}
