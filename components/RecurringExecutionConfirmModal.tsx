'use client'

import { CSSProperties } from 'react'
import { RecurringTransaction } from '../lib/budgetPageTypes'
import { uiOverlayPrimitives, uiSurfacePrimitives } from '../lib/uiFoundation'

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: uiOverlayPrimitives.modalRaised.backdrop,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: uiOverlayPrimitives.modalRaised.padding,
  zIndex: uiOverlayPrimitives.modalRaised.layer,
} as const

const modalStyle = {
  width: '100%',
  maxWidth: 'var(--ui-modal-max-width-m)',
  background: uiSurfacePrimitives.modalSurfaceInfoBorder.background,
  border: uiSurfacePrimitives.modalSurfaceInfoBorder.border,
  borderRadius: uiSurfacePrimitives.modalSurfaceInfoBorder.radius,
  boxShadow: uiSurfacePrimitives.modalSurfaceInfoBorder.shadow,
  padding: uiSurfacePrimitives.modalSurfaceInfoBorder.padding,
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
        <div style={styles.sectionTitle}>Czy powiązać wpis z przypomnieniem?</div>
        <div style={styles.pageSubtitle}>
          Wybierz przypomnienie, z którym ten wpis ma być powiązany, albo zostaw wpis bez
          powiązania.
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              style={{
                border: uiSurfacePrimitives.infoBox.border,
                borderRadius: uiSurfacePrimitives.infoBox.radius,
                padding: uiSurfacePrimitives.infoBox.padding,
                background: uiSurfacePrimitives.infoBox.background,
              }}
            >
              <div style={{ fontWeight: 600 }}>{candidate.name}</div>
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
                  Powiąż wpis
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
