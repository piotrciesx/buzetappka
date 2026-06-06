'use client'

import { CSSProperties, useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { StatusBox } from './utility-panels/utilityPanelPrimitives'

type ProfileMonthNoteRow = {
  id: string
  note: string | null
}

type MonthNoteItem = {
  id: string
  text: string
  createdAt: string
  updatedAt: string
}

type ProfileMonthNotePanelProps = {
  profileId: string
  userId: string
  selectedMonth: string
  styles: Record<string, CSSProperties>
}

type NoteIconName = 'note' | 'plus' | 'edit' | 'trash' | 'close' | 'expand'

const NOTE_LIST_FORMAT = 'budget-month-notes:v1'
const NOTE_PREVIEW_LIMIT = 3
const NOTE_TEXT_LIMIT = 130

const NoteIcon = ({ name }: { name: NoteIconName }) => {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
      {name === 'note' && (
        <>
          <path d="M6 3h9l3 3v15H6z" {...common} />
          <path d="M14 3v4h4M9 12h6M9 16h4" {...common} />
        </>
      )}
      {name === 'plus' && <path d="M12 5v14M5 12h14" {...common} />}
      {name === 'edit' && (
        <>
          <path d="M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16z" {...common} />
          <path d="M13 6l5 5" {...common} />
        </>
      )}
      {name === 'trash' && (
        <>
          <path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14" {...common} />
          <path d="M10 11v6M14 11v6" {...common} />
        </>
      )}
      {name === 'close' && <path d="M6 6l12 12M18 6 6 18" {...common} />}
      {name === 'expand' && <path d="M8 9l4 4 4-4" {...common} />}
    </svg>
  )
}

const createNoteId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const formatNoteDate = (value: string) =>
  new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))

const parseSavedNotes = (rawNote: string): MonthNoteItem[] => {
  const trimmedNote = rawNote.trim()

  if (!trimmedNote) {
    return []
  }

  try {
    const parsed = JSON.parse(trimmedNote) as unknown
    const parsedObject = parsed as { format?: unknown; notes?: unknown }

    if (
      parsed &&
      typeof parsed === 'object' &&
      parsedObject.format === NOTE_LIST_FORMAT &&
      Array.isArray(parsedObject.notes)
    ) {
      return (parsedObject.notes as Array<Partial<MonthNoteItem>>)
        .filter((note) => typeof note.text === 'string' && note.text.trim())
        .map((note) => ({
          id: typeof note.id === 'string' ? note.id : createNoteId(),
          text: note.text?.trim() || '',
          createdAt: typeof note.createdAt === 'string' ? note.createdAt : new Date().toISOString(),
          updatedAt: typeof note.updatedAt === 'string' ? note.updatedAt : new Date().toISOString(),
        }))
    }
  } catch {
    // Starsze notatki były zwykłym tekstem. Pokazujemy je jako jedną notatkę.
  }

  return [
    {
      id: createNoteId(),
      text: trimmedNote,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]
}

const serializeNotes = (notes: MonthNoteItem[]) => {
  if (notes.length === 0) {
    return ''
  }

  return JSON.stringify({
    format: NOTE_LIST_FORMAT,
    notes,
  })
}

export default function ProfileMonthNotePanel({
  profileId,
  userId,
  selectedMonth,
  styles,
}: ProfileMonthNotePanelProps) {
  const [noteId, setNoteId] = useState<string | null>(null)
  const [draftText, setDraftText] = useState('')
  const [savedNotes, setSavedNotes] = useState<MonthNoteItem[]>([])
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [expandedNoteIds, setExpandedNoteIds] = useState<string[]>([])
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [errorText, setErrorText] = useState('')

  const loadNote = useCallback(async () => {
    if (!profileId || !selectedMonth) {
      setNoteId(null)
      setDraftText('')
      setSavedNotes([])
      return
    }

    setIsLoading(true)
    setStatusText('')
    setErrorText('')

    try {
      const { data, error } = await supabase
        .from('profile_month_notes')
        .select('id, note')
        .eq('profile_id', profileId)
        .eq('month', selectedMonth)
        .maybeSingle()

      if (error) {
        throw new Error(error.message)
      }

      const noteRow = data as ProfileMonthNoteRow | null

      setNoteId(noteRow?.id || null)
      setDraftText('')
      setSavedNotes(parseSavedNotes(noteRow?.note || ''))
      setEditingNoteId(null)
      setExpandedNoteIds([])
      setIsFormOpen(false)
    } catch (error) {
      setNoteId(null)
      setDraftText('')
      setSavedNotes([])
      setErrorText(
        error instanceof Error ? error.message : 'Nie udało się wczytać notatek miesiąca.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [profileId, selectedMonth])

  useEffect(() => {
    void loadNote()
  }, [loadNote])

  const persistNotes = useCallback(
    async (nextNotes: MonthNoteItem[], successText: string) => {
      if (!profileId || !selectedMonth) {
        setErrorText('Nie udało się zapisać notatki: brak aktywnego profilu lub miesiąca.')
        return
      }

      setIsSaving(true)
      setStatusText('')
      setErrorText('')

      try {
        const payload = {
          note: serializeNotes(nextNotes),
          updated_by: userId || null,
          updated_at: new Date().toISOString(),
        }

        if (noteId) {
          const { error } = await supabase
            .from('profile_month_notes')
            .update(payload)
            .eq('id', noteId)
            .eq('profile_id', profileId)
            .eq('month', selectedMonth)

          if (error) {
            throw new Error(error.message)
          }
        } else {
          const { data, error } = await supabase
            .from('profile_month_notes')
            .insert({
              profile_id: profileId,
              month: selectedMonth,
              ...payload,
            })
            .select('id, note')
            .single()

          if (error) {
            throw new Error(error.message)
          }

          const noteRow = data as ProfileMonthNoteRow | null
          setNoteId(noteRow?.id || null)
        }

        setSavedNotes(nextNotes)
        setDraftText('')
        setEditingNoteId(null)
        setIsFormOpen(false)
        setStatusText(successText)
      } catch (error) {
        setErrorText(
          error instanceof Error ? error.message : 'Nie udało się zapisać notatki miesiąca.'
        )
      } finally {
        setIsSaving(false)
      }
    },
    [noteId, profileId, selectedMonth, userId]
  )

  const editingNote = useMemo(
    () => savedNotes.find((note) => note.id === editingNoteId) || null,
    [editingNoteId, savedNotes]
  )

  const previewNotes = savedNotes.slice(0, NOTE_PREVIEW_LIMIT)

  const startAddingNote = () => {
    setEditingNoteId(null)
    setDraftText('')
    setIsFormOpen(true)
    setIsDetailsOpen(true)
    setStatusText('')
    setErrorText('')
  }

  const editNote = (note: MonthNoteItem) => {
    setEditingNoteId(note.id)
    setDraftText(note.text)
    setIsFormOpen(true)
    setIsDetailsOpen(true)
    setStatusText('')
    setErrorText('')
  }

  const cancelForm = () => {
    setEditingNoteId(null)
    setDraftText('')
    setIsFormOpen(false)
    setStatusText('')
    setErrorText('')
  }

  const saveDraft = () => {
    const nextText = draftText.trim()

    if (!nextText) {
      setErrorText('Wpisz treść notatki przed zapisem.')
      return
    }

    const now = new Date().toISOString()
    const nextNotes = editingNote
      ? savedNotes.map((note) =>
          note.id === editingNote.id ? { ...note, text: nextText, updatedAt: now } : note
        )
      : [
          {
            id: createNoteId(),
            text: nextText,
            createdAt: now,
            updatedAt: now,
          },
          ...savedNotes,
        ]

    void persistNotes(nextNotes, editingNote ? 'Zapisano zmiany notatki.' : 'Dodano notatkę.')
  }

  const deleteNote = (noteIdToDelete: string) => {
    const nextNotes = savedNotes.filter((note) => note.id !== noteIdToDelete)
    void persistNotes(nextNotes, 'Usunięto notatkę.')
  }

  const toggleExpandedNote = (noteIdToToggle: string) => {
    setExpandedNoteIds((previousValue) =>
      previousValue.includes(noteIdToToggle)
        ? previousValue.filter((id) => id !== noteIdToToggle)
        : [...previousValue, noteIdToToggle]
    )
  }

  const renderNoteCard = (note: MonthNoteItem, variant: 'preview' | 'detail') => {
    const isExpanded = expandedNoteIds.includes(note.id)
    const shouldTruncate = note.text.length > NOTE_TEXT_LIMIT
    const displayedText =
      variant === 'detail' && (isExpanded || !shouldTruncate)
        ? note.text
        : shouldTruncate
          ? `${note.text.slice(0, NOTE_TEXT_LIMIT)}...`
          : note.text

    return (
      <article key={note.id} data-ui-utility-list-card="true" data-month-note-item="true">
        <div data-ui-utility-list-card-main="true">
          <span data-ui-utility-list-card-icon="true">
            <NoteIcon name="note" />
          </span>
          <div data-ui-utility-list-card-copy="true">
            <p>{displayedText}</p>
            <small>Aktualizacja: {formatNoteDate(note.updatedAt)}</small>
          </div>
        </div>

        {variant === 'detail' && (
          <div data-ui-utility-list-card-actions="true">
            {shouldTruncate && (
              <button
                type="button"
                data-ui-utility-ghost-action="true"
                onClick={() => toggleExpandedNote(note.id)}
              >
                {isExpanded ? 'Zwiń' : 'Pokaż więcej'}
              </button>
            )}
            <button
              type="button"
              data-ui-icon-button="true"
              aria-label="Edytuj notatkę"
              title="Edytuj"
              onClick={() => editNote(note)}
            >
              <NoteIcon name="edit" />
            </button>
            <button
              type="button"
              data-ui-icon-button="true"
              data-ui-icon-button-tone="danger"
              aria-label="Usuń notatkę"
              title="Usuń"
              disabled={isSaving}
              onClick={() => deleteNote(note.id)}
            >
              <NoteIcon name="trash" />
            </button>
          </div>
        )}
      </article>
    )
  }

  return (
    <>
      <section data-month-note-panel="true" data-ui-mini-popup="true">
        <header data-ui-mini-popup-header="true">
          <div data-ui-panel-title="true">
            <span data-ui-panel-title-icon="true">
              <NoteIcon name="note" />
            </span>
            <div>
              <strong>Notatki miesiąca</strong>
              <small>{selectedMonth}</small>
            </div>
          </div>
          <button
            type="button"
            data-ui-icon-button="true"
            aria-label="Dodaj notatkę"
            title="Dodaj notatkę"
            onClick={startAddingNote}
          >
            <NoteIcon name="plus" />
          </button>
        </header>

        {isLoading && <StatusBox style={styles.smallMutedText}>Ładowanie notatek...</StatusBox>}

        {!isLoading && previewNotes.length === 0 && (
          <div data-ui-empty-compact="true">
            <strong>Brak notatek</strong>
            <span>Dodaj krótką informację do zapamiętania w tym miesiącu.</span>
          </div>
        )}

        {previewNotes.length > 0 && (
          <div data-ui-utility-list="true" data-month-note-list="true">
            {previewNotes.map((note) => renderNoteCard(note, 'preview'))}
          </div>
        )}

        <footer data-ui-mini-popup-footer="true">
          <button
            type="button"
            data-ui-utility-ghost-action="true"
            onClick={() => setIsDetailsOpen(true)}
          >
            Pokaż wszystkie notatki
            <NoteIcon name="expand" />
          </button>
        </footer>

        {statusText && <StatusBox tone="success" style={styles.smallMutedText}>{statusText}</StatusBox>}
        {errorText && <StatusBox tone="danger" style={styles.infoBox}>{errorText}</StatusBox>}
      </section>

      {isDetailsOpen && (
        <div data-ui-utility-modal-backdrop="true" onClick={() => setIsDetailsOpen(false)}>
          <section
            data-ui-utility-modal="true"
            data-month-note-details="true"
            onClick={(event) => event.stopPropagation()}
          >
            <header data-ui-utility-modal-header="true">
              <div data-ui-panel-title="true">
                <span data-ui-panel-title-icon="true">
                  <NoteIcon name="note" />
                </span>
                <div>
                  <strong>Notatki miesiąca</strong>
                  <small>{selectedMonth}</small>
                </div>
              </div>
              <button
                type="button"
                data-ui-icon-button="true"
                aria-label="Zamknij"
                title="Zamknij"
                onClick={() => setIsDetailsOpen(false)}
              >
                <NoteIcon name="close" />
              </button>
            </header>

            <div data-ui-utility-modal-toolbar="true">
              <button
                type="button"
                className="ui-button--standard"
                onClick={startAddingNote}
              >
                <NoteIcon name="plus" />
                Dodaj notatkę
              </button>
            </div>

            {isFormOpen && (
              <div data-ui-form-card="true" data-month-note-form="true">
                <div data-ui-form-card-header="true">
                  <strong>{editingNote ? 'Edytuj notatkę' : 'Dodaj krótką notatkę'}</strong>
                  <small>Notatka będzie widoczna tylko w miesiącu {selectedMonth}.</small>
                </div>

                <textarea
                  value={draftText}
                  onChange={(event) => {
                    setDraftText(event.target.value)
                    setStatusText('')
                    setErrorText('')
                  }}
                  placeholder="Np. Euro wymienione po 4,60 zł, zakup gotówką, ważna informacja do rozliczenia..."
                  disabled={isLoading || isSaving}
                  rows={4}
                  className="ui-textarea"
                  data-input-width="full"
                />

                <div data-ui-form-card-footer="true">
                  <span>{draftText.trim().length} znaków</span>
                  <div>
                    <button
                      type="button"
                      className="ui-button--utility"
                      disabled={isLoading || isSaving}
                      onClick={cancelForm}
                    >
                      Anuluj
                    </button>
                    <button
                      type="button"
                      className="ui-button--standard"
                      disabled={isLoading || isSaving || !draftText.trim()}
                      onClick={saveDraft}
                    >
                      {isSaving ? 'Zapisywanie...' : editingNote ? 'Zapisz zmiany' : 'Dodaj notatkę'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!isLoading && savedNotes.length === 0 && (
              <div data-ui-empty-state="true">
                <span data-ui-panel-title-icon="true">
                  <NoteIcon name="note" />
                </span>
                <strong>Brak notatek w tym miesiącu</strong>
                <p>Dodaj krótką informację, do której chcesz wrócić przy rozliczaniu miesiąca.</p>
              </div>
            )}

            {savedNotes.length > 0 && (
              <div data-ui-utility-list="true" data-month-note-list="true">
                {savedNotes.map((note) => renderNoteCard(note, 'detail'))}
              </div>
            )}

            {statusText && <StatusBox tone="success" style={styles.smallMutedText}>{statusText}</StatusBox>}
            {errorText && <StatusBox tone="danger" style={styles.infoBox}>{errorText}</StatusBox>}
          </section>
        </div>
      )}
    </>
  )
}