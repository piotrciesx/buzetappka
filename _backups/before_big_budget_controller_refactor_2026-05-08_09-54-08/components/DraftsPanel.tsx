import { CSSProperties } from 'react'
import { TransactionDraft } from '../lib/draftUtils'

const draftsPanelStyle = {
  marginBottom: 20,
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: 14,
  padding: 16,
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
} as const

const draftsListStyle = {
  display: 'grid',
  gap: 12,
} as const

const draftCardStyle = {
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 14,
  background: '#f9fafb',
} as const

const draftMetaGridStyle = {
  display: 'grid',
  gap: 8,
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  marginTop: 12,
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
    <section style={draftsPanelStyle}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={styles.sectionTitle}>Szkice</div>
          <div style={{ ...styles.pageSubtitle, marginBottom: 0 }}>
            Szkic zapisuje się chwilę po wpisaniu kwoty lub opisu albo po zmianie miesiąca. Po finalnym
            zapisie znika automatycznie.
          </div>
        </div>
        <div style={styles.actions}>
          <button
            type="button"
            style={styles.secondaryButton}
            onClick={() => {
              cleanupAllDrafts()
            }}
            disabled={isCleaningAllDrafts}
          >
            {isCleaningAllDrafts ? 'Czyszczenie...' : 'Usuń wszystkie szkice'}
          </button>
        </div>
      </div>

      {draftsStatusText && <div style={{ ...styles.infoBox, marginTop: 12 }}>{draftsStatusText}</div>}

      {isDraftsLoading ? (
        <div style={{ ...styles.infoBox, marginTop: 12 }}>Ładowanie szkiców...</div>
      ) : drafts.length === 0 ? (
        <div style={{ ...styles.emptyStateCard, marginTop: 12 }}>Nie ma zapisanych szkiców.</div>
      ) : (
        <div style={{ ...draftsListStyle, marginTop: 12 }}>
          {drafts.map((draft) => {
            const draftLevel1Id = getDraftLevel1Id(draft)

            return (
              <div key={draft.id} style={draftCardStyle}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 600 }}>
                    {draft.type === 'income' ? 'Przychód' : 'Wydatek'}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: 13 }}>
                    Ostatnia zmiana: {formatDraftUpdatedAt(draft.updated_at)}
                  </div>
                </div>

                <div style={draftMetaGridStyle}>
                  <div style={styles.infoBox}>
                    <b>Kategoria:</b> {getDraftLocationLabel(draft)}
                  </div>
                  <div style={styles.infoBox}>
                    <b>Kwota:</b> {draft.amount.trim() || 'brak'}
                  </div>
                  <div style={styles.infoBox}>
                    <b>Opis:</b> {draft.description.trim() || 'brak'}
                  </div>
                  <div style={styles.infoBox}>
                    <b>Data:</b> {draft.date || 'brak'}
                  </div>
                </div>

                <div style={{ ...styles.actions, marginTop: 12 }}>
                  <button
                    type="button"
                    style={styles.primaryButton}
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
                    style={styles.secondaryButton}
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
