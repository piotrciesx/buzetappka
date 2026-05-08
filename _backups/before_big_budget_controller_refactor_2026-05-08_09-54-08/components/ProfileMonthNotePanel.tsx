'use client'

import { CSSProperties, useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type ProfileMonthNoteRow = {
  id: string
  note: string | null
}

type ProfileMonthNotePanelProps = {
  profileId: string
  userId: string
  selectedMonth: string
  styles: Record<string, CSSProperties>
}

export default function ProfileMonthNotePanel({
  profileId,
  userId,
  selectedMonth,
  styles,
}: ProfileMonthNotePanelProps) {
  const [noteId, setNoteId] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [savedNoteText, setSavedNoteText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [errorText, setErrorText] = useState('')

  const loadNote = useCallback(async () => {
    if (!profileId || !selectedMonth) {
      setNoteId(null)
      setNoteText('')
      setSavedNoteText('')
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
      const nextNoteText = noteRow?.note || ''

      setNoteId(noteRow?.id || null)
      setNoteText(nextNoteText)
      setSavedNoteText(nextNoteText)
    } catch (error) {
      setNoteId(null)
      setNoteText('')
      setSavedNoteText('')
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

  const saveNote = useCallback(
    async (nextNoteText: string) => {
      if (!profileId || !selectedMonth) {
        setErrorText('Nie udało się zapisać notatki: brak aktywnego profilu lub miesiąca.')
        return
      }

      setIsSaving(true)
      setStatusText('')
      setErrorText('')

      try {
        const payload = {
          note: nextNoteText,
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

          setNoteText(nextNoteText)
          setSavedNoteText(nextNoteText)
          setStatusText(nextNoteText ? 'Zapisano notatkę.' : 'Wyczyszczono notatkę.')
          return
        }

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
        setNoteText(nextNoteText)
        setSavedNoteText(nextNoteText)
        setStatusText(nextNoteText ? 'Zapisano notatkę.' : 'Wyczyszczono notatkę.')
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

  const hasUnsavedChanges = noteText !== savedNoteText

  return (
    <section style={{ ...styles.topPanel, display: 'grid', gap: 10 }}>
      <div>
        <div style={styles.sectionTitle}>Notatka miesiąca</div>
        <div style={styles.smallMutedText}>Wspólna notatka profilu dla miesiąca {selectedMonth}.</div>
      </div>

      <textarea
        value={noteText}
        onChange={(event) => {
          setNoteText(event.target.value)
          setStatusText('')
          setErrorText('')
        }}
        placeholder="Notatka do tego miesiąca..."
        disabled={isLoading || isSaving}
        rows={4}
        style={{
          width: '100%',
          minHeight: 110,
          resize: 'vertical',
          border: '1px solid #d1d5db',
          borderRadius: 10,
          padding: 12,
          fontSize: 14,
          fontFamily: 'inherit',
          outline: 'none',
          background: '#ffffff',
        }}
      />

      <div style={styles.actions}>
        <button
          type="button"
          style={styles.primaryButton}
          disabled={isLoading || isSaving || !hasUnsavedChanges}
          onClick={() => void saveNote(noteText)}
        >
          {isSaving ? 'Zapisywanie...' : 'Zapisz notatkę'}
        </button>
        <button
          type="button"
          style={styles.secondaryButton}
          disabled={isLoading || isSaving || (!noteText && !savedNoteText)}
          onClick={() => void saveNote('')}
        >
          Wyczyść notatkę
        </button>
      </div>

      {isLoading && <div style={styles.smallMutedText}>Ładowanie notatki...</div>}
      {statusText && <div style={styles.smallMutedText}>{statusText}</div>}
      {errorText && <div style={styles.infoBox}>{errorText}</div>}
    </section>
  )
}
