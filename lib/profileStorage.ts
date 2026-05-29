export const getProfileStorageKey = ({
  userId,
  profileId,
  featureKey,
}: {
  userId: string
  profileId: string
  featureKey: string
}) => `${userId}:${profileId}:${featureKey}`

export const readProfileStorageValue = ({
  storageKey,
  legacyStorageKeys = [],
}: {
  storageKey: string
  legacyStorageKeys?: string[]
}) => {
  if (typeof window === 'undefined') {
    return null
  }

  if (!storageKey) {
    return null
  }

  const storedValue = window.localStorage.getItem(storageKey)

  if (storedValue !== null) {
    return storedValue
  }

  for (const legacyStorageKey of legacyStorageKeys) {
    const legacyValue = window.localStorage.getItem(legacyStorageKey)

    if (legacyValue !== null) {
      window.localStorage.setItem(storageKey, legacyValue)
      return legacyValue
    }
  }

  return null
}
