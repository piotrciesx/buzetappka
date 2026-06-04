import type { CSSProperties } from 'react'
import type { TransactionDraft } from '../lib/draftUtils'
import { uiTypographyTokens } from '../lib/uiFoundation'
import {
  ActionRow,
  EmptyState,
  ListRow,
  MetadataGrid,
  StatusBox,
  UtilityPanel,
} from './utility-panels/utilityPanelPrimitives'

const draftsPanelStyle = {
  display: 'grid',
  gap: 12,
  marginBottom: 20,
  border: '1px solid var(--ui-border-soft)',
  borderRadius: 16,
  padding: 12,
  background: 'var(--ui-glass-surface-soft)',
  boxShadow: 'var(--ui-shadow-card)',
} as const

const draftsHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  flexWrap: 'wrap' as const,
  alignItems: 'center',
  minHeight: 34,
  padding: '0 2px 10px',
  borderBottom: '1px solid var(--ui-border-divider)',
} as const

const draftsListStyle = {
  display: 'grid',
  gap: 8,
} as const

const draftRowStyle = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  alignItems: 'center',
  gap: 12,
  minHeight: 72,
  border: '1px solid var(--ui-border-divider)',
  borderRadius: 12,
  padding: '10px 12px',
  background: 'var(--ui-surface-soft)',
} as const

const draftMainStyle = {
  minWidth: 0,
  display: 'grid',
  gap: 7,
} as const

const draftTopLineStyle = {
  minWidth: 0,
  display: 'flex',
  alignItems: 'baseline',
  gap: 8,
  flexWrap: 'wrap' as const,
} as const

const draftTypeStyle = {
  color: 'var(--ui-text-primary)',
  fontSize: uiTypographyTokens.role.label,
  fontWeight: uiTypographyTokens.weight.bold,
} as const

const draftCategoryStyle = {
  minWidth: 0,
  color: 'var(--ui-text-secondary)',
  fontSize: uiTypographyTokens.role.metadata,
  fontWeight: uiTypographyTokens.weight.semibold,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap' as const,
} as const

const draftDetailsStyle = {
  minWidth: 0,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
  gap: 6,
} as const

const draftFieldStyle = {
  minWidth: 0,
  display: 'grid',
  gap: 2,
  color: 'var(--ui-text-secondary)',
  fontSize: uiTypographyTokens.role.metadata,
} as const

const draftLabelStyle = {
  color: 'var(--ui-text-muted)',
  fontSize: uiTypographyTokens.role.widgetMeta,
  fontWeight: uiTypographyTokens.weight.bold,
  textTransform: 'uppercase' as const,
  letterSpacing: 0,
} as const

const draftValueStyle = {
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap' as const,
} as const

const draftActionsStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 6,
  flexWrap: 'wrap' as const,
} as const

const lightButtonStyle = {
  minHeight: 30,
  borderRadius: 999,
  padding: '0 11px',
  fontSize: uiTypographyTokens.role.metadata,
  fontWeight: uiTypographyTokens.weight.bold,
  boxShadow: 'none',
} as const

const lightDangerButtonStyle = {
  ...lightButtonStyle,
  borderColor: 'var(--ui-financial-expense-soft)',
  background: 'var(--ui-financial-expense-soft)',
  color: 'var(--ui-financial-expense)',
} as const

const compactStatusStyle = {
  border: '1px solid var(--ui-border-divider)',
  borderRadius: 12,
  padding: '10px 12px',
  background: 'var(--ui-surface-soft)',
  color: 'var(--ui-text-secondary)',
  fontSize: uiTypographyTokens.role.metadata,
} as const

type Props = {
  draftsStatusText: string
  isDraftsLoading: boolean
  drafts: TransactionDraft[]
  isCleaningAllDrafts: boolean
  cleanupAllDrafts: () => void
  getDraftLevel1Id: (draft: TransactionDraft) => string | null
  formatDraftUpdatedAt: (value: string | null) => string
  getDraftLocationLabel: (draft: TransactionDraft) => string
  applyDraftToTransactionCreator: (draft: TransactionDraft, level1Id: string) => void
  deleteDraft: (draftType: TransactionDraft['type']) => Promise<void>
  styles: Record<string, CSSProperties>
}

export default function DraftsPanel(props: Props) {
  const {
    draftsStatusText,
    isDraftsLoading,
    drafts,
    isCleaningAllDrafts,
    cleanupAllDrafts,
    getDraftLevel1Id,
    formatDraftUpdatedAt,
    getDraftLocationLabel,
    applyDraftToTransactionCreator,
    deleteDraft,
    styles,
  } = props

  return (
    <UtilityPanel style={draftsPanelStyle} aria-label="Szkice wpisów">
      <ActionRow style={draftsHeaderStyle}>
        <button
          type="button"
          style={{ ...styles.secondaryButton, ...lightButtonStyle }}
          onClick={() => {
            cleanupAllDrafts()
          }}
          disabled={isCleaningAllDrafts || drafts.length === 0}
        >
          {isCleaningAllDrafts ? 'Czyszczenie...' : 'Usuń wszystkie'}
        </button>
      </ActionRow>

      {draftsStatusText && <StatusBox style={compactStatusStyle}>{draftsStatusText}</StatusBox>}

      {isDraftsLoading ? (
        <StatusBox style={compactStatusStyle}>Ładowanie szkiców...</StatusBox>
      ) : drafts.length === 0 ? (
        <EmptyState style={compactStatusStyle}>Nie ma zapisanych szkiców.</EmptyState>
      ) : (
        <div style={draftsListStyle}>
          {drafts.map((draft) => {
            const draftLevel1Id = getDraftLevel1Id(draft)
            const typeLabel = draft.type === 'income' ? 'Przychód' : 'Wydatek'
            const amountLabel = draft.amount.trim() ? `${draft.amount.trim()} zł` : 'brak'
            const descriptionLabel = draft.description.trim() || 'brak'
            const dateLabel = draft.date || 'brak'
            const updatedLabel = formatDraftUpdatedAt(draft.updated_at)

            return (
              <ListRow key={draft.id} style={draftRowStyle}>
                <div style={draftMainStyle}>
                  <div style={draftTopLineStyle}>
                    <strong style={draftTypeStyle}>{typeLabel}</strong>
                    <span style={draftCategoryStyle}>{getDraftLocationLabel(draft)}</span>
                  </div>

                  <MetadataGrid style={draftDetailsStyle}>
                    <div style={draftFieldStyle}>
                      <span style={draftLabelStyle}>Kwota</span>
                      <span style={draftValueStyle}>{amountLabel}</span>
                    </div>
                    <div style={draftFieldStyle}>
                      <span style={draftLabelStyle}>Opis</span>
                      <span style={draftValueStyle}>{descriptionLabel}</span>
                    </div>
                    <div style={draftFieldStyle}>
                      <span style={draftLabelStyle}>Data</span>
                      <span style={draftValueStyle}>{dateLabel}</span>
                    </div>
                    <div style={draftFieldStyle}>
                      <span style={draftLabelStyle}>Ostatnia zmiana</span>
                      <span style={draftValueStyle}>{updatedLabel}</span>
                    </div>
                  </MetadataGrid>
                </div>

                <ActionRow style={draftActionsStyle}>
                  <button
                    type="button"
                    style={{ ...styles.primaryButton, ...lightButtonStyle }}
                    onClick={() => {
                      if (!draftLevel1Id) {
                        return
                      }

                      applyDraftToTransactionCreator(draft, draftLevel1Id)
                    }}
                    disabled={!draftLevel1Id}
                  >
                    Kontynuuj
                  </button>
                  <button
                    type="button"
                    style={{ ...styles.secondaryButton, ...lightDangerButtonStyle }}
                    onClick={() => {
                      void deleteDraft(draft.type).catch(() => {})
                    }}
                  >
                    Usuń
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
