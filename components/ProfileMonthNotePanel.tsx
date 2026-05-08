'use client'

import { CSSProperties, useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

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

const NOTE_LIST_FORMAT = 'budget-month-notes:v1'

const createNoteId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

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
    } catch (error) {
      setNoteId(null)
      setDraftText('')
      setSavedNotes([])
      setErrorText(
        error instanceof Error ? error.message : 'Nie udało się wczytać notatki miesiąca.'
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

  const editNote = (note: MonthNoteItem) => {
    setEditingNoteId(note.id)
    setDraftText(note.text)
    setStatusText('')
    setErrorText('')
  }

  const deleteNote = (noteIdToDelete: string) => {
    const nextNotes = savedNotes.filter((note) => note.id !== noteIdToDelete)
    void persistNotes(nextNotes, 'Usunięto notatkę.')
  }

  return (
    <section data-month-note-panel="true" style={{ ...styles.topPanel, display: 'grid', gap: 10 }}>
      <div>
        <div style={styles.sectionTitle}>Notatka miesiąca</div>
        <div style={styles.smallMutedText}>Wspólne notatki profilu dla miesiąca {selectedMonth}.</div>
      </div>

      <textarea
        value={draftText}
        onChange={(event) => {
          setDraftText(event.target.value)
          setStatusText('')
          setErrorText('')
        }}
        placeholder="Dodaj krótką notatkę do tego miesiąca..."
        disabled={isLoading || isSaving}
        rows={3}
        style={{
          width: '100%',
          minHeight: 78,
          resize: 'vertical',
          border: '1px solid #d1d5db',
          borderRadius: 10,
          padding: 10,
          fontSize: 13,
          fontFamily: 'inherit',
          outline: 'none',
          background: '#ffffff',
        }}
      />

      <div style={styles.actions}>
        <button
          type="button"
          style={styles.primaryButton}
          disabled={isLoading || isSaving || !draftText.trim()}
          onClick={saveDraft}
        >
          {isSaving ? 'Zapisywanie...' : editingNote ? 'Zapisz notatkę' : 'Dodaj notatkę'}
        </button>
        {editingNote && (
          <button
            type="button"
            style={styles.secondaryButton}
            disabled={isLoading || isSaving}
            onClick={() => {
              setEditingNoteId(null)
              setDraftText('')
            }}
          >
            Anuluj
          </button>
        )}
      </div>

      {savedNotes.length > 0 && (
        <div data-month-note-list="true">
          {savedNotes.map((note) => {
            const isExpanded = expandedNoteIds.includes(note.id)
            const shouldTruncate = note.text.length > 130

            return (
              <article key={note.id} data-month-note-item="true">
                <p>{isExpanded || !shouldTruncate ? note.text : `${note.text.slice(0, 130)}...`}</p>
                <div data-month-note-actions="true">
                  {shouldTruncate && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedNoteIds((previousValue) =>
                          previousValue.includes(note.id)
                            ? previousValue.filter((id) => id !== note.id)
                            : [...previousValue, note.id]
                        )
                      }
                    >
                      {isExpanded ? 'Zwiń' : 'Rozwiń'}
                    </button>
                  )}
                  <button type="button" onClick={() => editNote(note)}>
                    Edytuj
                  </button>
                  <button type="button" onClick={() => deleteNote(note.id)} disabled={isSaving}>
                    Usuń
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {isLoading && <div style={styles.smallMutedText}>Ładowanie notatek...</div>}
      {statusText && <div style={styles.smallMutedText}>{statusText}</div>}
      {errorText && <div style={styles.infoBox}>{errorText}</div>}
    </section>
  )
}
