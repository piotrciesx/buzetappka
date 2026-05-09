export type UserPublicProfile = {
  user_id: string
  display_name: string | null
  avatar_key: string | null
}

export const USER_AVATARS = [
  { key: 'dog', label: 'Pies', color: '#2563eb' },
  { key: 'cat', label: 'Kot', color: '#7c3aed' },
  { key: 'fox', label: 'Lis', color: '#ea580c' },
  { key: 'owl', label: 'Sowa', color: '#0f766e' },
  { key: 'rocket', label: 'Rakieta', color: '#dc2626' },
  { key: 'robot', label: 'Robot', color: '#475569' },
  { key: 'planet', label: 'Planeta', color: '#0891b2' },
  { key: 'coffee', label: 'Kawa', color: '#92400e' },
  { key: 'pixel', label: 'Pixel', color: '#16a34a' },
  { key: 'spark', label: 'Iskra', color: '#d97706' },
  { key: 'aura', label: 'Aura', color: '#2563eb' },
  { key: 'mint', label: 'Mięta', color: '#059669' },
  { key: 'rose', label: 'Róża', color: '#be123c' },
  { key: 'sun', label: 'Słońce', color: '#d97706' },
  { key: 'violet', label: 'Violet', color: '#7c3aed' },
  { key: 'graphite', label: 'Grafit', color: '#334155' },
]

export type CategoryIconKey =
  | 'home'
  | 'food'
  | 'shopping'
  | 'car'
  | 'transport'
  | 'plane'
  | 'holiday'
  | 'sun'
  | 'health'
  | 'doctor'
  | 'pharmacy'
  | 'work'
  | 'salary'
  | 'bills'
  | 'electricity'
  | 'internet'
  | 'phone'
  | 'education'
  | 'books'
  | 'sport'
  | 'gym'
  | 'gaming'
  | 'entertainment'
  | 'cinema'
  | 'gift'
  | 'clothes'
  | 'pets'
  | 'child'
  | 'savings'
  | 'cash'
  | 'card'
  | 'bank'
  | 'investments'
  | 'restaurant'
  | 'coffee'
  | 'fuel'
  | 'travel'

export const CATEGORY_ICONS: Array<{ key: CategoryIconKey; label: string }> = [
  { key: 'home', label: 'Dom' },
  { key: 'food', label: 'Jedzenie' },
  { key: 'shopping', label: 'Zakupy' },
  { key: 'car', label: 'Auto' },
  { key: 'transport', label: 'Transport' },
  { key: 'plane', label: 'Samolot' },
  { key: 'holiday', label: 'Wakacje' },
  { key: 'sun', label: 'Słońce' },
  { key: 'health', label: 'Zdrowie' },
  { key: 'doctor', label: 'Lekarz' },
  { key: 'pharmacy', label: 'Apteka' },
  { key: 'work', label: 'Praca' },
  { key: 'salary', label: 'Pensja' },
  { key: 'bills', label: 'Rachunki' },
  { key: 'electricity', label: 'Prąd' },
  { key: 'internet', label: 'Internet' },
  { key: 'phone', label: 'Telefon' },
  { key: 'education', label: 'Edukacja' },
  { key: 'books', label: 'Książki' },
  { key: 'sport', label: 'Sport' },
  { key: 'gym', label: 'Siłownia' },
  { key: 'gaming', label: 'Gaming' },
  { key: 'entertainment', label: 'Rozrywka' },
  { key: 'cinema', label: 'Kino' },
  { key: 'gift', label: 'Prezent' },
  { key: 'clothes', label: 'Ubrania' },
  { key: 'pets', label: 'Zwierzęta' },
  { key: 'child', label: 'Dziecko' },
  { key: 'savings', label: 'Oszczędności' },
  { key: 'cash', label: 'Gotówka' },
  { key: 'card', label: 'Karta' },
  { key: 'bank', label: 'Bank' },
  { key: 'investments', label: 'Inwestycje' },
  { key: 'restaurant', label: 'Restauracja' },
  { key: 'coffee', label: 'Kawa' },
  { key: 'fuel', label: 'Paliwo' },
  { key: 'travel', label: 'Podróże' },
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
