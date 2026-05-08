export type TransactionDraftType = 'income' | 'expense'

export type TransactionDraft = {
  id: string
  type: TransactionDraftType
  level1_id: string | null
  level2_id: string | null
  category_id: string | null
  amount: string
  description: string
  date: string
  updated_at: string | null
}

export type DraftRow = {
  id: string
  profile_id: string
  draft_type: TransactionDraftType
  level1_id: string | null
  level2_id: string | null
  category_id: string | null
  amount: string | null
  description: string | null
  date: string | null
  updated_at: string | null
}

type SupabaseLikeError = {
  code?: string
  message?: string
  details?: string
  hint?: string
}

export type DraftPromptState = {
  draft: TransactionDraft
  level1Id: string
  type: TransactionDraftType
}

export const LEGACY_DRAFTS_STORAGE_KEY = 'budget_drafts'
export const DRAFT_SAVE_DELAY_MS = 400
export const OLD_DRAFT_CLEANUP_DAYS = 90

export const createDraftId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `draft-${Date.now()}`
}

export const mapDraftRowToDraft = (row: DraftRow): TransactionDraft => {
  return {
    id: row.id,
    type: row.draft_type,
    level1_id: row.level1_id,
    level2_id: row.level2_id,
    category_id: row.category_id,
    amount: row.amount || '',
    description: row.description || '',
    date: row.date || '',
    updated_at: row.updated_at,
  }
}

const extractSupabaseErrorParts = (error: unknown) => {
  if (error instanceof Error) {
    const extendedError = error as Error & SupabaseLikeError

    return {
      message: extendedError.message || 'Nieznany błąd',
      details: extendedError.details || '',
      hint: extendedError.hint || '',
      code: extendedError.code || '',
    }
  }

  if (error && typeof error === 'object') {
    const candidate = error as SupabaseLikeError

    return {
      message: candidate.message || 'Nieznany błąd',
      details: candidate.details || '',
      hint: candidate.hint || '',
      code: candidate.code || '',
    }
  }

  if (typeof error === 'string') {
    return {
      message: error,
      details: '',
      hint: '',
      code: '',
    }
  }

  return {
    message: 'Nieznany błąd',
    details: '',
    hint: '',
    code: '',
  }
}

export const formatSupabaseErrorForConsole = (error: unknown) => {
  const { message, details, hint, code } = extractSupabaseErrorParts(error)

  return {
    code: code || '(brak kodu)',
    message,
    details: details || '(brak szczegółów)',
    hint: hint || '(brak podpowiedzi)',
    raw: error,
  }
}

export const buildDraftsErrorMessage = (
  error: unknown,
  action: 'load' | 'save' | 'delete' | 'cleanup'
) => {
  const { message, details, hint, code } = extractSupabaseErrorParts(error)
  const normalizedText = `${code} ${message} ${details} ${hint}`.toLowerCase()

  if (
    normalizedText.includes('relation "public.drafts" does not exist') ||
    normalizedText.includes('relation "drafts" does not exist') ||
    normalizedText.includes("could not find the table 'public.drafts'") ||
    normalizedText.includes("could not find the table 'drafts'")
  ) {
    return 'Baza nie ma jeszcze tabeli drafts. Wklej SQL dla drafts w Supabase i odśwież stronę.'
  }

  if (
    normalizedText.includes('there is no unique or exclusion constraint matching the on conflict specification') ||
    normalizedText.includes('42p10') ||
    normalizedText.includes('on conflict')
  ) {
    return 'Baza drafts nie ma unikalności dla profile_id + draft_type. Uruchom SQL tworzący UNIQUE(profile_id, draft_type).'
  }

  if (
    normalizedText.includes('row-level security') ||
    normalizedText.includes('permission denied') ||
    normalizedText.includes('42501') ||
    normalizedText.includes('new row violates row-level security policy')
  ) {
    return 'Baza drafts blokuje dostęp przez RLS lub brak policy. Wgraj policies z SQL dla drafts i zaloguj użytkownika.'
  }

  if (action === 'load') {
    return `Nie udało się pobrać szkiców. ${message}`
  }

  if (action === 'save') {
    return `Nie udało się zapisać szkicu. ${message}`
  }

  if (action === 'delete') {
    return `Nie udało się usunąć szkicu. ${message}`
  }

  return `Nie udało się wyczyścić starych szkiców. ${message}`
}

export const readLegacyTransactionDrafts = () => {
  if (typeof window === 'undefined') {
    return [] as TransactionDraft[]
  }

  try {
    const rawValue = window.localStorage.getItem(LEGACY_DRAFTS_STORAGE_KEY)

    if (!rawValue) {
      return [] as TransactionDraft[]
    }

    const parsedValue = JSON.parse(rawValue)

    if (!Array.isArray(parsedValue)) {
      return [] as TransactionDraft[]
    }

    return parsedValue
      .filter((item): item is Omit<TransactionDraft, 'updated_at'> => {
        return (
          !!item &&
          typeof item.id === 'string' &&
          (item.type === 'income' || item.type === 'expense') &&
          (typeof item.level1_id === 'string' || item.level1_id === null) &&
          (typeof item.level2_id === 'string' || item.level2_id === null) &&
          (typeof item.category_id === 'string' || item.category_id === null) &&
          typeof item.amount === 'string' &&
          typeof item.description === 'string' &&
          typeof item.date === 'string'
        )
      })
      .map((item) => ({
        ...item,
        updated_at: null,
      }))
  } catch {
    return [] as TransactionDraft[]
  }
}

export const clearLegacyTransactionDrafts = () => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(LEGACY_DRAFTS_STORAGE_KEY)
}
