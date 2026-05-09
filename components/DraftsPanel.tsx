import type { CSSProperties } from 'react'
import type { TransactionDraft } from '../lib/draftUtils'

const draftsPanelStyle = {
  display: 'grid',
  gap: 12,
  marginBottom: 20,
  border: '1px solid rgba(203, 213, 225, 0.78)',
  borderRadius: 16,
  padding: 12,
  background: 'rgba(255, 255, 255, 0.72)',
  boxShadow: '0 10px 28px rgba(15, 23, 42, 0.045)',
} as const

const draftsHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  flexWrap: 'wrap' as const,
  alignItems: 'center',
  minHeight: 34,
  padding: '0 2px 10px',
  borderBottom: '1px solid rgba(226, 232, 240, 0.86)',
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
  border: '1px solid rgba(226, 232, 240, 0.92)',
  borderRadius: 12,
  padding: '10px 12px',
  background: 'rgba(248, 250, 252, 0.72)',
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
  color: '#172033',
  fontSize: 13,
  fontWeight: 760,
} as const

const draftCategoryStyle = {
  minWidth: 0,
  color: '#475569',
  fontSize: 12,
  fontWeight: 650,
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
  color: '#334155',
  fontSize: 12,
} as const

const draftLabelStyle = {
  color: '#94a3b8',
  fontSize: 10,
  fontWeight: 720,
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
  fontSize: 12,
  fontWeight: 680,
  boxShadow: 'none',
} as const

const lightDangerButtonStyle = {
  ...lightButtonStyle,
  borderColor: 'rgba(254, 205, 211, 0.9)',
  background: 'rgba(255, 241, 242, 0.7)',
  color: '#be123c',
} as const

const compactStatusStyle = {
  border: '1px solid rgba(226, 232, 240, 0.86)',
  borderRadius: 12,
  padding: '10px 12px',
  background: 'rgba(248, 250, 252, 0.72)',
  color: '#64748b',
  fontSize: 12,
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
    <section style={draftsPanelStyle} aria-label="Szkice wpisów">
      <div style={draftsHeaderStyle}>
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
      </div>

      {draftsStatusText && <div style={compactStatusStyle}>{draftsStatusText}</div>}

      {isDraftsLoading ? (
        <div style={compactStatusStyle}>Ładowanie szkiców...</div>
      ) : drafts.length === 0 ? (
        <div style={compactStatusStyle}>Nie ma zapisanych szkiców.</div>
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
              <div key={draft.id} style={draftRowStyle}>
                <div style={draftMainStyle}>
                  <div style={draftTopLineStyle}>
                    <strong style={draftTypeStyle}>{typeLabel}</strong>
                    <span style={draftCategoryStyle}>{getDraftLocationLabel(draft)}</span>
                  </div>

                  <div style={draftDetailsStyle}>
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
                  </div>
                </div>

                <div style={draftActionsStyle}>
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
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
