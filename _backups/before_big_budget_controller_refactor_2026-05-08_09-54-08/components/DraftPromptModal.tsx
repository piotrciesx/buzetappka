import { CSSProperties } from 'react'
import { DraftPromptState } from '../lib/draftUtils'

const draftPromptOverlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(17, 24, 39, 0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  zIndex: 1100,
} as const

const draftPromptCardStyle = {
  width: '100%',
  maxWidth: 380,
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: 16,
  padding: 20,
  boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
} as const

type Props = {
  draftPromptState: DraftPromptState | null
  setDraftPromptState: (value: DraftPromptState | null) => void
  applyDraftToTransactionCreator: (draft: DraftPromptState['draft'], level1Id: string) => void
  deleteDraft: (type: DraftPromptState['type']) => Promise<void>
  openBlankFloatingTransactionCreator: (level1Id: string | null) => void
  styles: Record<string, CSSProperties>
}

export default function DraftPromptModal(props: Props) {
  const {
    draftPromptState,
    setDraftPromptState,
    applyDraftToTransactionCreator,
    deleteDraft,
    openBlankFloatingTransactionCreator,
    styles,
  } = props

  if (!draftPromptState) {
    return null
  }

  return (
    <div
      style={draftPromptOverlayStyle}
      onClick={() => {
        setDraftPromptState(null)
      }}
    >
      <div style={draftPromptCardStyle} onClick={(event) => event.stopPropagation()}>
        <div style={styles.sectionTitle}>Masz niedokończony wpis</div>
        <div style={{ ...styles.pageSubtitle, marginTop: 8 }}>
          Możesz wrócić do wersji roboczej albo ją usunąć i zacząć od pustego formularza.
        </div>
        <div style={{ ...styles.actions, marginTop: 16 }}>
          <button
            type="button"
            style={styles.primaryButton}
            onClick={() => {
              applyDraftToTransactionCreator(draftPromptState.draft, draftPromptState.level1Id)
              setDraftPromptState(null)
            }}
          >
            Kontynuuj
          </button>
          <button
            type="button"
            style={styles.secondaryButton}
            onClick={() => {
              const { level1Id, type } = draftPromptState

              void (async () => {
                await deleteDraft(type)
                setDraftPromptState(null)
                openBlankFloatingTransactionCreator(level1Id)
              })().catch(() => {})
            }}
          >
            Usuń
          </button>
        </div>
      </div>
    </div>
  )
}
