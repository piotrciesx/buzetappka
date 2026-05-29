import type { CSSProperties } from 'react'
import { getCategoryPathLabel } from '../lib/budgetPageHelpers'
import { Category, Transaction } from '../lib/budgetPageTypes'
import {
  ActionRow,
  EmptyState,
  ListRow,
  MetadataGrid,
  StatusBox,
  UtilityPanel,
} from './utility-panels/utilityPanelPrimitives'

type Props = {
  transactions: Transaction[]
  categoriesById: Record<string, Category>
  getAmountNumber: (value: unknown) => number
  onRestoreTransaction: (transactionId: string) => Promise<void>
  onPermanentDeleteTransaction: (transactionId: string) => Promise<void>
  onEmptyTrash: () => Promise<void>
  styles: Record<string, CSSProperties>
}

const panelStyle: CSSProperties = {
  display: 'grid',
  gap: 12,
  border: '1px solid rgba(203, 213, 225, 0.78)',
  borderRadius: 16,
  padding: 12,
  background: 'rgba(255, 255, 255, 0.72)',
  boxShadow: '0 10px 28px rgba(15, 23, 42, 0.045)',
}

const headerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 12,
  flexWrap: 'wrap',
  alignItems: 'center',
  padding: '0 2px 10px',
  borderBottom: '1px solid rgba(226, 232, 240, 0.86)',
}

const hintStyle: CSSProperties = {
  border: '1px solid rgba(226, 232, 240, 0.86)',
  borderRadius: 12,
  padding: '9px 11px',
  background: 'rgba(248, 250, 252, 0.74)',
  color: 'var(--ui-color-secondary-text)',
  fontSize: 12,
  lineHeight: 1.4,
}

const listStyle: CSSProperties = {
  display: 'grid',
  gap: 8,
}

const rowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  alignItems: 'center',
  gap: 12,
  minHeight: 74,
  border: '1px solid rgba(226, 232, 240, 0.92)',
  borderRadius: 12,
  padding: '10px 12px',
  background: 'rgba(248, 250, 252, 0.72)',
}

const mainStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gap: 7,
}

const topLineStyle: CSSProperties = {
  minWidth: 0,
  display: 'flex',
  alignItems: 'baseline',
  gap: 9,
}

const amountStyle: CSSProperties = {
  flex: '0 0 auto',
  color: 'var(--ui-color-expense)',
  fontSize: 14,
  fontWeight: 780,
  fontVariantNumeric: 'tabular-nums',
}

const descriptionStyle: CSSProperties = {
  minWidth: 0,
  overflow: 'hidden',
  color: 'var(--ui-color-primary-text)',
  fontSize: 13,
  fontWeight: 680,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

const detailsStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
  gap: 6,
}

const fieldStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gap: 2,
  color: 'var(--ui-color-secondary-text)',
  fontSize: 12,
}

const labelStyle: CSSProperties = {
  color: 'var(--ui-color-muted-text)',
  fontSize: 10,
  fontWeight: 720,
  textTransform: 'uppercase',
  letterSpacing: 0,
}

const valueStyle: CSSProperties = {
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

const actionsStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 6,
  flexWrap: 'wrap',
}

const lightButtonStyle: CSSProperties = {
  minHeight: 30,
  borderRadius: 999,
  padding: '0 11px',
  fontSize: 12,
  fontWeight: 680,
  boxShadow: 'none',
}

const lightDangerButtonStyle: CSSProperties = {
  ...lightButtonStyle,
  borderColor: 'rgba(254, 205, 211, 0.9)',
  background: 'rgba(255, 241, 242, 0.7)',
  color: 'var(--ui-color-expense)',
}

export default function TrashPanel(props: Props) {
  const {
    transactions,
    categoriesById,
    getAmountNumber,
    onRestoreTransaction,
    onPermanentDeleteTransaction,
    onEmptyTrash,
    styles,
  } = props

  return (
    <UtilityPanel style={panelStyle} aria-label="Kosz">
      <ActionRow style={headerStyle}>
        {transactions.length > 0 && (
          <button
            type="button"
            style={{ ...styles.secondaryButton, ...lightDangerButtonStyle }}
            onClick={async () => {
              await onEmptyTrash()
            }}
          >
            Opróżnij kosz
          </button>
        )}
      </ActionRow>

      <StatusBox style={hintStyle}>
        {transactions.length === 0
          ? 'Brak usuniętych wpisów.'
          : `Usunięte wpisy: ${transactions.length}. Przywrócenie zwraca wpis do zwykłego widoku.`}
      </StatusBox>

      {transactions.length === 0 ? (
        <EmptyState style={hintStyle}>Kosz jest pusty.</EmptyState>
      ) : (
        <div style={listStyle}>
          {transactions.map((transaction) => {
            const categoryLabel = categoriesById[transaction.category_id]
              ? getCategoryPathLabel(transaction.category_id, categoriesById)
              : 'Kategoria niedostępna'
            const deletedAtLabel = transaction.deleted_at ? transaction.deleted_at.slice(0, 16) : '-'

            return (
              <ListRow key={transaction.id} style={rowStyle}>
                <div style={mainStyle}>
                  <div style={topLineStyle}>
                    <strong style={amountStyle}>{getAmountNumber(transaction.amount)} zł</strong>
                    <span style={descriptionStyle}>{transaction.description || 'Bez opisu'}</span>
                  </div>

                  <MetadataGrid style={detailsStyle}>
                    <div style={fieldStyle}>
                      <span style={labelStyle}>Data</span>
                      <span style={valueStyle}>{transaction.date}</span>
                    </div>
                    <div style={fieldStyle}>
                      <span style={labelStyle}>Kategoria</span>
                      <span style={valueStyle}>{categoryLabel}</span>
                    </div>
                    <div style={fieldStyle}>
                      <span style={labelStyle}>Usunięto</span>
                      <span style={valueStyle}>{deletedAtLabel}</span>
                    </div>
                  </MetadataGrid>
                </div>

                <ActionRow style={actionsStyle}>
                  <button
                    type="button"
                    style={{ ...styles.secondaryButton, ...lightButtonStyle }}
                    onClick={async () => {
                      await onRestoreTransaction(transaction.id)
                    }}
                  >
                    Przywróć
                  </button>

                  <button
                    type="button"
                    style={{ ...styles.secondaryButton, ...lightDangerButtonStyle }}
                    onClick={async () => {
                      await onPermanentDeleteTransaction(transaction.id)
                    }}
                  >
                    Usuń na stałe
                  </button>
                </ActionRow>
              </ListRow>
            )
          })}
        </div>
      )}
    </UtilityPanel>
  )
}
