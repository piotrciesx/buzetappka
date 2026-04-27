import type { CSSProperties, ReactNode } from 'react'
import type { HeatmapVariant, Transaction } from './monthCalendarTypes'
import {
  calendarDayMetaStyle,
  closeButtonStyle,
  daySummaryCardStyle,
  emptyDayStyle,
  modalHeaderStyle,
  modalStyle,
  modalSubtitleStyle,
  modalTitleStyle,
  overlayStyle,
  primaryButtonStyle,
} from './monthCalendarStyles'
import MonthCalendarTransactionList from './MonthCalendarTransactionList'

type MonthCalendarDayModalProps = {
  selectedDay: string
  selectedMonth: string
  selectedDayTransactions: Transaction[]
  selectedDayPrimaryValue: number
  selectedDayRawSum: number
  heatmapVariant: HeatmapVariant
  isSelectedMonthLocked: boolean
  styles: Record<string, CSSProperties>
  getDayMetricLabel: () => string
  formatAmount: (value: number) => string
  renderTransactionCard: (transaction: Transaction, context: 'day' | 'no-day') => ReactNode
  onAddTransactionForDay?: (dayText: string) => void
  onClose: () => void
}

export default function MonthCalendarDayModal({
  selectedDay,
  selectedMonth,
  selectedDayTransactions,
  selectedDayPrimaryValue,
  selectedDayRawSum,
  heatmapVariant,
  isSelectedMonthLocked,
  styles,
  getDayMetricLabel,
  formatAmount,
  renderTransactionCard,
  onAddTransactionForDay,
  onClose,
}: MonthCalendarDayModalProps) {
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(event) => event.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <div>
            <div style={modalTitleStyle}>
              Wpisy z dnia {selectedDay}.{selectedMonth.slice(5, 7)}.{selectedMonth.slice(0, 4)}
            </div>
            <div style={modalSubtitleStyle}>Podgląd i operacje dla wpisów z wybranego dnia.</div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {!isSelectedMonthLocked && onAddTransactionForDay && (
              <button
                type="button"
                style={primaryButtonStyle}
                onClick={() => {
                  onAddTransactionForDay(selectedDay)
                  onClose()
                }}
              >
                dodaj wpis
              </button>
            )}

            <button type="button" style={closeButtonStyle} onClick={onClose}>
              zamknij
            </button>
          </div>
        </div>

        <div style={daySummaryCardStyle}>
          <div style={styles.l2Name}>Podsumowanie dnia</div>
          <div style={{ ...calendarDayMetaStyle, marginTop: 6 }}>
            {getDayMetricLabel()}:{' '}
            <strong>
              {heatmapVariant === 'balance' && selectedDayPrimaryValue > 0 ? '+' : ''}
              {formatAmount(selectedDayPrimaryValue)} zł
            </strong>
          </div>
          {heatmapVariant === 'balance' && (
            <div style={{ ...calendarDayMetaStyle, marginTop: 4 }}>
              Suma nominalna wpisów: <strong>{formatAmount(selectedDayRawSum)} zł</strong>
            </div>
          )}
          <div style={{ ...calendarDayMetaStyle, marginTop: 4 }}>
            Liczba wpisów: <strong>{selectedDayTransactions.length}</strong>
          </div>
        </div>

        {selectedDayTransactions.length === 0 ? (
          <div style={emptyDayStyle}>
            Brak wpisów w tym dniu.
            {!isSelectedMonthLocked && onAddTransactionForDay && (
              <div style={{ marginTop: 12 }}>
                <button
                  type="button"
                  style={primaryButtonStyle}
                  onClick={() => {
                    onAddTransactionForDay(selectedDay)
                    onClose()
                  }}
                >
                  dodaj pierwszy wpis z tego dnia
                </button>
              </div>
            )}
          </div>
        ) : (
          <MonthCalendarTransactionList
            transactions={selectedDayTransactions}
            context="day"
            renderTransactionCard={renderTransactionCard}
          />
        )}
      </div>
    </div>
  )
}
