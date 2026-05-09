export type UserPublicProfile = {
  user_id: string
  display_name: string | null
  avatar_key: string | null
}

export const USER_AVATARS = [
  { key: 'aura', label: 'Aura', initials: 'A', color: '#2563eb' },
  { key: 'mint', label: 'Mięta', initials: 'M', color: '#059669' },
  { key: 'rose', label: 'Róża', initials: 'R', color: '#be123c' },
  { key: 'sun', label: 'Słońce', initials: 'S', color: '#d97706' },
  { key: 'violet', label: 'Violet', initials: 'V', color: '#7c3aed' },
  { key: 'graphite', label: 'Grafit', initials: 'G', color: '#334155' },
]

export const CATEGORY_ICONS = [
  { key: 'home', label: 'Dom', symbol: '⌂' },
  { key: 'food', label: 'Jedzenie', symbol: '○' },
  { key: 'car', label: 'Auto', symbol: '◇' },
  { key: 'plane', label: 'Samolot', symbol: '△' },
  { key: 'holiday', label: 'Wakacje', symbol: '◌' },
  { key: 'health', label: 'Zdrowie', symbol: '+' },
  { key: 'work', label: 'Praca', symbol: '□' },
  { key: 'shopping', label: 'Zakupy', symbol: '▱' },
  { key: 'bills', label: 'Rachunki', symbol: '≡' },
  { key: 'sport', label: 'Sport', symbol: '◎' },
  { key: 'gift', label: 'Prezent', symbol: '◇' },
  { key: 'education', label: 'Edukacja', symbol: '∴' },
  { key: 'pets', label: 'Zwierzęta', symbol: '♡' },
  { key: 'entertainment', label: 'Rozrywka', symbol: '♪' },
  { key: 'savings', label: 'Oszczędności', symbol: '◍' },
  { key: 'travel', label: 'Podróże', symbol: '↗' },
]

export const getAvatar = (avatarKey?: string | null) =>
  USER_AVATARS.find((avatar) => avatar.key === avatarKey) || USER_AVATARS[0]

export const getCategoryIcon = (iconKey?: string | null) =>
  CATEGORY_ICONS.find((icon) => icon.key === iconKey) || null

export const getUserDisplayName = (
  profile: UserPublicProfile | null | undefined,
  fallbackEmail?: string,
  fallbackLabel?: string
) => profile?.display_name?.trim() || fallbackEmail || fallbackLabel || 'Użytkownik'
