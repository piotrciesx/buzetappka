import { SupabaseClient } from '@supabase/supabase-js'
import { Tag, TransactionTag } from './budgetPageTypes'

type TagRow = {
  id: string
  profile_id: string
  name: string
  normalized_name: string
  created_at?: string
}

type TransactionTagRow = {
  id: string
  transaction_id: string
  tag_id: string
  created_at?: string
}

const normalizeTagName = (value: string) => {
  return value.trim().replace(/\s+/g, ' ')
}

export const getNormalizedTagKey = (value: string) => {
  return normalizeTagName(value).toLocaleLowerCase('pl-PL')
}

export const splitTagInput = (value: string) => {
  return value
    .split(',')
    .map((part) => normalizeTagName(part))
    .filter(Boolean)
}

export const mapTagRowToTag = (row: TagRow): Tag => {
  return {
    id: row.id,
    name: row.name,
    profile_id: row.profile_id,
    created_at: row.created_at,
  }
}

export const fetchProfileTags = async (
  supabase: SupabaseClient,
  profileId: string
): Promise<Tag[]> => {
  const { data, error } = await supabase
    .from('tags')
    .select('id, profile_id, name, normalized_name, created_at')
    .eq('profile_id', profileId)
    .order('name', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data || []).map((row) => mapTagRowToTag(row as TagRow))
}

export const findExistingTagByName = async (
  supabase: SupabaseClient,
  profileId: string,
  tagName: string
): Promise<Tag | null> => {
  const normalizedName = getNormalizedTagKey(tagName)

  if (!normalizedName) {
    return null
  }

  const { data, error } = await supabase
    .from('tags')
    .select('id, profile_id, name, normalized_name, created_at')
    .eq('profile_id', profileId)
    .eq('normalized_name', normalizedName)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    return null
  }

  return mapTagRowToTag(data as TagRow)
}

export const createTag = async (
  supabase: SupabaseClient,
  profileId: string,
  rawTagName: string
): Promise<Tag> => {
  const name = normalizeTagName(rawTagName)
  const normalizedName = getNormalizedTagKey(rawTagName)

  if (!name || !normalizedName) {
    throw new Error('Nazwa taga nie może być pusta.')
  }

  const existingTag = await findExistingTagByName(supabase, profileId, name)

  if (existingTag) {
    return existingTag
  }

  const { data, error } = await supabase
    .from('tags')
    .insert({
      profile_id: profileId,
      name,
      normalized_name: normalizedName,
    })
    .select('id, profile_id, name, normalized_name, created_at')
    .single()

  if (error) {
    const fallbackExistingTag = await findExistingTagByName(supabase, profileId, name)

    if (fallbackExistingTag) {
      return fallbackExistingTag
    }

    throw new Error(error.message)
  }

  return mapTagRowToTag(data as TagRow)
}

export const getOrCreateTags = async (
  supabase: SupabaseClient,
  profileId: string,
  rawTagNames: string[]
): Promise<Tag[]> => {
  const uniqueNames = Array.from(
    new Set(
      rawTagNames
        .map((name) => normalizeTagName(name))
        .filter(Boolean)
    )
  )

  const tags: Tag[] = []

  for (const name of uniqueNames) {
    const tag = await createTag(supabase, profileId, name)
    tags.push(tag)
  }

  return tags
}

export const attachTagToTransaction = async (
  supabase: SupabaseClient,
  transactionId: string,
  tagId: string
): Promise<TransactionTag | null> => {
  const { data, error } = await supabase
    .from('transaction_tags')
    .insert({
      transaction_id: transactionId,
      tag_id: tagId,
    })
    .select('id, transaction_id, tag_id, created_at')
    .maybeSingle()

  if (error) {
    const message = error.message.toLowerCase()

    if (message.includes('duplicate') || message.includes('unique')) {
      return null
    }

    throw new Error(error.message)
  }

  if (!data) {
    return null
  }

  const row = data as TransactionTagRow

  return {
    id: row.id,
    transaction_id: row.transaction_id,
    tag_id: row.tag_id,
    created_at: row.created_at,
  }
}

export const detachTagFromTransaction = async (
  supabase: SupabaseClient,
  transactionId: string,
  tagId: string
) => {
  const { error } = await supabase
    .from('transaction_tags')
    .delete()
    .eq('transaction_id', transactionId)
    .eq('tag_id', tagId)

  if (error) {
    throw new Error(error.message)
  }
}

export const fetchTransactionTagLinks = async (
  supabase: SupabaseClient,
  transactionIds: string[]
): Promise<TransactionTag[]> => {
  if (transactionIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('transaction_tags')
    .select('id, transaction_id, tag_id, created_at')
    .in('transaction_id', transactionIds)

  if (error) {
    throw new Error(error.message)
  }

  return (data || []).map((row) => {
    const typedRow = row as TransactionTagRow

    return {
      id: typedRow.id,
      transaction_id: typedRow.transaction_id,
      tag_id: typedRow.tag_id,
      created_at: typedRow.created_at,
    }
  })
}

export const fetchTagsByIds = async (
  supabase: SupabaseClient,
  tagIds: string[]
): Promise<Tag[]> => {
  if (tagIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('tags')
    .select('id, profile_id, name, normalized_name, created_at')
    .in('id', tagIds)

  if (error) {
    throw new Error(error.message)
  }

  return (data || []).map((row) => mapTagRowToTag(row as TagRow))
}

export const fetchTransactionTagsMap = async (
  supabase: SupabaseClient,
  transactionIds: string[]
): Promise<Record<string, Tag[]>> => {
  if (transactionIds.length === 0) {
    return {}
  }

  const transactionTagLinks = await fetchTransactionTagLinks(supabase, transactionIds)

  if (transactionTagLinks.length === 0) {
    return {}
  }

  const uniqueTagIds = Array.from(new Set(transactionTagLinks.map((link) => link.tag_id)))
  const tags = await fetchTagsByIds(supabase, uniqueTagIds)
  const tagsById = Object.fromEntries(tags.map((tag) => [tag.id, tag]))

  const result: Record<string, Tag[]> = {}

  transactionTagLinks.forEach((link) => {
    const tag = tagsById[link.tag_id]

    if (!tag) {
      return
    }

    if (!result[link.transaction_id]) {
      result[link.transaction_id] = []
    }

    result[link.transaction_id].push(tag)
  })

  Object.values(result).forEach((tagList) => {
    tagList.sort((left, right) => left.name.localeCompare(right.name, 'pl', { sensitivity: 'base' }))
  })

  return result
}

export const setTransactionTags = async (
  supabase: SupabaseClient,
  profileId: string,
  transactionId: string,
  rawTagNames: string[],
  currentTags: Tag[] = []
): Promise<Tag[]> => {
  const nextTags = await getOrCreateTags(supabase, profileId, rawTagNames)

  const currentTagIds = new Set(currentTags.map((tag) => tag.id))
  const nextTagIds = new Set(nextTags.map((tag) => tag.id))

  const tagsToAttach = nextTags.filter((tag) => !currentTagIds.has(tag.id))
  const tagsToDetach = currentTags.filter((tag) => !nextTagIds.has(tag.id))

  for (const tag of tagsToAttach) {
    await attachTagToTransaction(supabase, transactionId, tag.id)
  }

  for (const tag of tagsToDetach) {
    await detachTagFromTransaction(supabase, transactionId, tag.id)
  }

  return nextTags
}