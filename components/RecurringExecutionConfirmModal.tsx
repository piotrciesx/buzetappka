'use client'

import { CSSProperties } from 'react'
import { RecurringTransaction } from '../lib/budgetPageTypes'

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  zIndex: 1001,
} as const

const modalStyle = {
  width: 'min(560px, 100%)',
  background: '#ffffff',
  border: '1px solid #dbeafe',
  borderRadius: 16,
  boxShadow: '0 20px 40px rgba(15, 23, 42, 0.18)',
  padding: 20,
} as const

type Props = {
  isOpen: boolean
  candidates: RecurringTransaction[]
  onConfirm: (recurring: RecurringTransaction) => void
  onClose: () => void
  styles: Record<string, CSSProperties>
}

export default function RecurringExecutionConfirmModal(props: Props) {
  const { isOpen, candidates, onConfirm, onClose, styles } = props

  if (!isOpen || candidates.length === 0) {
    return null
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(event) => event.stopPropagation()}>
        <div style={styles.sectionTitle}>Czy oznaczyć przypomnienie jako wykonane?</div>
        <div style={styles.pageSubtitle}>
          Nic nie zostanie zamknięte automatycznie. Wybierz ręcznie przypomnienie do oznaczenia
          albo zostaw wpis bez potwierdzenia.
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                padding: 12,
                background: '#f8fafc',
              }}
            >
              <div style={{ fontWeight: 700 }}>{candidate.name}</div>
              <div style={{ ...styles.pageSubtitle, margin: '4px 0 0' }}>
                Kwota domyślna:{' '}
                {candidate.amount === null ? 'brak stałej kwoty' : `${candidate.amount.toFixed(2)} zł`}
              </div>
              <div style={{ ...styles.actions, marginTop: 10 }}>
                <button
                  type="button"
                  style={styles.primaryButton}
                  onClick={() => onConfirm(candidate)}
                >
                  Tak, oznacz
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ ...styles.actions, marginTop: 16 }}>
          <button type="button" style={styles.secondaryButton} onClick={onClose}>
            Nie teraz
          </button>
        </div>
      </div>
    </div>
  )
}
