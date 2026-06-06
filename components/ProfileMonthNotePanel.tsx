'use client'

import { CSSProperties, useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { StatusBox } from './utility-panels/utilityPanelPrimitives'

type ProfileMonthNoteRow = {
  id: string
  note: string | null
}

type MonthNoteTone = 'blue' | 'yellow' | 'green' | 'violet' | 'neutral'
type MonthNoteIcon = 'exchange' | 'car' | 'health' | 'basket' | 'more' | 'note'
type MonthNoteCategory = 'Notatka' | 'Przypomnienie' | 'Informacja'

type MonthNoteItem = {
  id: string
  text: string
  createdAt: string
  updatedAt: string
  tone: MonthNoteTone
  icon: MonthNoteIcon
  category: MonthNoteCategory
}

type ProfileMonthNotePanelProps = {
  profileId: string
  userId: string
  selectedMonth: string
  styles: Record<string, CSSProperties>
}

type NoteIconName = MonthNoteIcon | 'plus' | 'edit' | 'trash' | 'close' | 'expand' | 'info'

const NOTE_LIST_FORMAT = 'budget-month-notes:v1'
const NOTE_PREVIEW_LIMIT = 4
const NOTE_TEXT_LIMIT = 140
const NOTE_DRAFT_LIMIT = 1000

const NOTE_TONE_OPTIONS: Array<{ tone: MonthNoteTone; label: string; icon: MonthNoteIcon }> = [
  { tone: 'blue', label: 'Wymiana', icon: 'exchange' },
  { tone: 'yellow', label: 'Auto', icon: 'car' },
  { tone: 'green', label: 'Zdrowie', icon: 'health' },
  { tone: 'violet', label: 'Zakupy', icon: 'basket' },
  { tone: 'neutral', label: 'Inne', icon: 'more' },
]

const CATEGORY_OPTIONS: MonthNoteCategory[] = ['Notatka', 'Przypomnienie', 'Informacja']

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
      {name === 'exchange' && (
        <>
          <path d="M7 7h10l-3-3" {...common} />
          <path d="M17 17H7l3 3" {...common} />
          <path d="M17 7l-3 3M7 17l3-3" {...common} />
        </>
      )}
      {name === 'car' && (
        <>
          <path d="M5 12l2-5h10l2 5" {...common} />
          <path d="M4 12h16v6H4z" {...common} />
          <path d="M7 18v2M17 18v2" {...common} />
          <circle cx="8" cy="15" r="1" {...common} />
          <circle cx="16" cy="15" r="1" {...common} />
        </>
      )}
      {name === 'health' && (
        <>
          <path d="M8 4v6a4 4 0 0 0 8 0V4" {...common} />
          <path d="M6 4h4M14 4h4" {...common} />
          <path d="M12 14v2a4 4 0 0 0 8 0v-1" {...common} />
          <circle cx="20" cy="13" r="1.6" {...common} />
        </>
      )}
      {name === 'basket' && (
        <>
          <path d="M6 9h12l-1.2 10H7.2z" {...common} />
          <path d="M9 9a3 3 0 0 1 6 0" {...common} />
          <path d="M9 13h6M10 16h4" {...common} />
        </>
      )}
      {name === 'more' && (
        <>
          <circle cx="6" cy="12" r="1.2" {...common} />
          <circle cx="12" cy="12" r="1.2" {...common} />
          <circle cx="18" cy="12" r="1.2" {...common} />
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
      {name === 'info' && (
        <>
          <circle cx="12" cy="12" r="9" {...common} />
          <path d="M12 11v5M12 8h.01" {...common} />
        </>
      )}
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
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))

const resolveToneOption = (tone?: string) =>
  NOTE_TONE_OPTIONS.find((option) => option.tone === tone) || NOTE_TONE_OPTIONS[0]

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
        .map((note) => {
          const toneOption = resolveToneOption(note.tone)

          return {
            id: typeof note.id === 'string' ? note.id : createNoteId(),
            text: note.text?.trim() || '',
            createdAt: typeof note.createdAt === 'string' ? note.createdAt : new Date().toISOString(),
            updatedAt: typeof note.updatedAt === 'string' ? note.updatedAt : new Date().toISOString(),
            tone: toneOption.tone,
            icon: NOTE_TONE_OPTIONS.some((option) => option.icon === note.icon)
              ? (note.icon as MonthNoteIcon)
              : toneOption.icon,
            category: CATEGORY_OPTIONS.includes(note.category as MonthNoteCategory)
              ? (note.category as MonthNoteCategory)
              : 'Notatka',
          }
        })
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
      tone: 'blue',
      icon: 'note',
      category: 'Notatka',
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

const createEmptyDraft = () => ({
  text: '',
  tone: 'blue' as MonthNoteTone,
  icon: 'exchange' as MonthNoteIcon,
  category: 'Notatka' as MonthNoteCategory,
})

export default function ProfileMonthNotePanel({
  profileId,
  userId,
  selectedMonth,
  styles: _styles,
}: ProfileMonthNotePanelProps) {
  void _styles

  const [noteId, setNoteId] = useState<string | null>(null)
  const [draft, setDraft] = useState(createEmptyDraft)
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
      setDraft(createEmptyDraft())
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
      setDraft(createEmptyDraft())
      setSavedNotes(parseSavedNotes(noteRow?.note || ''))
      setEditingNoteId(null)
      setExpandedNoteIds([])
      setIsFormOpen(false)
    } catch (error) {
      setNoteId(null)
      setDraft(createEmptyDraft())
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
        setDraft(createEmptyDraft())
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

  const updateDraftTone = (tone: MonthNoteTone) => {
    const toneOption = resolveToneOption(tone)
    setDraft((previousValue) => ({ ...previousValue, tone: toneOption.tone, icon: toneOption.icon }))
  }

  const startAddingNote = () => {
    setEditingNoteId(null)
    setDraft(createEmptyDraft())
    setIsFormOpen(true)
    setStatusText('')
    setErrorText('')
  }

  const editNote = (note: MonthNoteItem) => {
    setEditingNoteId(note.id)
    setDraft({
      text: note.text,
      tone: note.tone,
      icon: note.icon,
      category: note.category,
    })
    setIsFormOpen(true)
    setStatusText('')
    setErrorText('')
  }

  const cancelForm = () => {
    setEditingNoteId(null)
    setDraft(createEmptyDraft())
    setIsFormOpen(false)
    setStatusText('')
    setErrorText('')
  }

  const saveDraft = () => {
    const nextText = draft.text.trim()

    if (!nextText) {
      setErrorText('Wpisz treść notatki przed zapisem.')
      return
    }

    const now = new Date().toISOString()
    const nextNotes = editingNote
      ? savedNotes.map((note) =>
          note.id === editingNote.id
            ? {
                ...note,
                text: nextText,
                tone: draft.tone,
                icon: draft.icon,
                category: draft.category,
                updatedAt: now,
              }
            : note
        )
      : [
          {
            id: createNoteId(),
            text: nextText,
            tone: draft.tone,
            icon: draft.icon,
            category: draft.category,
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
      <article
        key={note.id}
        data-ui-utility-list-card="true"
        data-ui-note-card="true"
        data-ui-note-tone={note.tone}
        data-month-note-item="true"
      >
        <div data-ui-utility-list-card-main="true">
          <span data-ui-utility-list-card-icon="true" data-ui-note-icon="true">
            <NoteIcon name={note.icon} />
          </span>
          <div data-ui-utility-list-card-copy="true">
            <strong data-ui-note-card-title="true">{displayedText}</strong>
            {variant === 'detail' && <p>{note.text}</p>}
            <small>
              {variant === 'preview'
                ? formatNoteDate(note.updatedAt)
                : `Dodano: ${formatNoteDate(note.createdAt)} · Edytowano: ${formatNoteDate(note.updatedAt)}`}
            </small>
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

  const noteCountLabel = `${savedNotes.length} ${savedNotes.length === 1 ? 'notatka' : 'notatki'}`
  const draftLength = draft.text.trim().length

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
              <small>{isLoading ? 'Ładowanie...' : noteCountLabel}</small>
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

        {isLoading && <StatusBox>Ładowanie notatek...</StatusBox>}

        {!isLoading && previewNotes.length === 0 && (
          <div data-ui-empty-compact="true">
            <span data-ui-panel-title-icon="true">
              <NoteIcon name="note" />
            </span>
            <strong>Brak notatek</strong>
            <span>Dodaj krótką informację do zapamiętania w tym miesiącu.</span>
          </div>
        )}

        {previewNotes.length > 0 && (
          <div data-ui-utility-list="true" data-ui-utility-list-density="compact" data-month-note-list="true">
            {previewNotes.map((note) => renderNoteCard(note, 'preview'))}
          </div>
        )}

        <footer data-ui-mini-popup-footer="true">
          <button
            type="button"
            data-ui-utility-ghost-action="true"
            onClick={() => setIsDetailsOpen(true)}
          >
            Pokaż szczegóły
            <NoteIcon name="expand" />
          </button>
        </footer>

        {statusText && <StatusBox tone="success">{statusText}</StatusBox>}
        {errorText && <StatusBox tone="danger">{errorText}</StatusBox>}
      </section>

      {isDetailsOpen && (
        <div data-ui-utility-modal-backdrop="true" onClick={() => setIsDetailsOpen(false)}>
          <section
            data-ui-utility-modal="true"
            data-ui-utility-modal-size="wide"
            data-month-note-details="true"
            onClick={(event) => event.stopPropagation()}
          >
            <header data-ui-utility-modal-header="true">
              <div data-ui-panel-title="true">
                <span data-ui-panel-title-icon="true">
                  <NoteIcon name="note" />
                </span>
                <div>
                  <strong>Notatki miesiąca {selectedMonth}</strong>
                  <small>Wspólne notatki profilu dla bieżącego miesiąca.</small>
                </div>
              </div>
              <div data-ui-utility-modal-actions="true">
                <button type="button" className="ui-button--standard" onClick={startAddingNote}>
                  <NoteIcon name="plus" />
                  Dodaj notatkę
                </button>
                <button
                  type="button"
                  data-ui-icon-button="true"
                  aria-label="Zamknij"
                  title="Zamknij"
                  onClick={() => setIsDetailsOpen(false)}
                >
                  <NoteIcon name="close" />
                </button>
              </div>
            </header>

            <div data-ui-filter-pills="true">
              <span data-ui-filter-pill="true" data-active="true">Wszystkie {savedNotes.length}</span>
              <span data-ui-filter-pill="true">Notatki {savedNotes.filter((note) => note.category === 'Notatka').length}</span>
              <span data-ui-filter-pill="true">Przypomnienia {savedNotes.filter((note) => note.category === 'Przypomnienie').length}</span>
              <span data-ui-filter-pill="true">Informacje {savedNotes.filter((note) => note.category === 'Informacja').length}</span>
            </div>

            {!isLoading && savedNotes.length === 0 && (
              <div data-ui-empty-state="true">
                <span data-ui-panel-title-icon="true">
                  <NoteIcon name="note" />
                </span>
                <strong>Brak notatek dla tego miesiąca.</strong>
                <p>Dodaj krótką informację, do której chcesz wrócić przy rozliczaniu miesiąca.</p>
                <button type="button" className="ui-button--standard" onClick={startAddingNote}>
                  Dodaj notatkę
                </button>
              </div>
            )}

            {savedNotes.length > 0 && (
              <div data-ui-utility-list="true" data-month-note-list="true">
                {savedNotes.map((note) => renderNoteCard(note, 'detail'))}
              </div>
            )}

            <footer data-ui-utility-modal-footer="true">
              <span data-ui-inline-info="true">
                <NoteIcon name="info" />
                Notatki są widoczne tylko dla Ciebie i zapisywane dla tego miesiąca.
              </span>
            </footer>

            {statusText && <StatusBox tone="success">{statusText}</StatusBox>}
            {errorText && <StatusBox tone="danger">{errorText}</StatusBox>}
          </section>
        </div>
      )}

      {isFormOpen && (
        <div data-ui-utility-modal-backdrop="true" onClick={cancelForm}>
          <section
            data-ui-utility-modal="true"
            data-ui-utility-modal-size="form"
            data-month-note-form-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <header data-ui-utility-modal-header="true">
              <div data-ui-panel-title="true">
                <span data-ui-panel-title-icon="true" data-ui-note-tone={draft.tone}>
                  <NoteIcon name={draft.icon} />
                </span>
                <div>
                  <strong>{editingNote ? 'Edytuj notatkę' : 'Nowa notatka'}</strong>
                  <small>Notatka będzie widoczna tylko w miesiącu {selectedMonth}.</small>
                </div>
              </div>
              <button
                type="button"
                data-ui-icon-button="true"
                aria-label="Zamknij"
                title="Zamknij"
                onClick={cancelForm}
              >
                <NoteIcon name="close" />
              </button>
            </header>

            <div data-ui-form-card="true" data-month-note-form="true">
              <textarea
                value={draft.text}
                maxLength={NOTE_DRAFT_LIMIT}
                onChange={(event) => {
                  setDraft((previousValue) => ({ ...previousValue, text: event.target.value }))
                  setStatusText('')
                  setErrorText('')
                }}
                placeholder="Wpisz treść notatki..."
                disabled={isLoading || isSaving}
                rows={7}
                className="ui-textarea"
                data-input-width="full"
              />

              <div data-ui-form-meta-row="true">
                <span>{draftLength} / {NOTE_DRAFT_LIMIT} znaków</span>
              </div>

              <label data-ui-field-label="true">
                Kategoria notatki
                <select
                  className="ui-select"
                  data-input-width="full"
                  value={draft.category}
                  onChange={(event) =>
                    setDraft((previousValue) => ({
                      ...previousValue,
                      category: event.target.value as MonthNoteCategory,
                    }))
                  }
                >
                  {CATEGORY_OPTIONS.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>

              <div data-ui-field-label="true">
                Kolor i ikona
                <div data-ui-tone-picker="true">
                  {NOTE_TONE_OPTIONS.map((option) => (
                    <button
                      key={option.tone}
                      type="button"
                      data-ui-tone-option="true"
                      data-ui-note-tone={option.tone}
                      data-active={draft.tone === option.tone}
                      onClick={() => updateDraftTone(option.tone)}
                    >
                      <span data-ui-utility-list-card-icon="true" data-ui-note-icon="true">
                        <NoteIcon name={option.icon} />
                      </span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <footer data-ui-form-card-footer="true">
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
                  disabled={isLoading || isSaving || !draft.text.trim()}
                  onClick={saveDraft}
                >
                  {isSaving ? 'Zapisywanie...' : editingNote ? 'Zapisz zmiany' : 'Zapisz notatkę'}
                </button>
              </footer>
            </div>

            {errorText && <StatusBox tone="danger">{errorText}</StatusBox>}
          </section>
        </div>
      )}
    </>
  )
}
