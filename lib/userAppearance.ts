export type UserPublicProfile = {
  user_id: string
  display_name: string | null
  avatar_key: string | null
}

export const USER_AVATARS = [
  { key: 'dog', label: 'Pies', color: 'var(--ui-color-primary-blue)' },
  { key: 'cat', label: 'Kot', color: 'var(--ui-color-primary-navy)' },
  { key: 'fox', label: 'Lis', color: 'var(--ui-color-warning)' },
  { key: 'owl', label: 'Sowa', color: 'var(--ui-color-income)' },
  { key: 'rocket', label: 'Rakieta', color: 'var(--ui-color-expense)' },
  { key: 'robot', label: 'Robot', color: 'var(--ui-color-secondary-text)' },
  { key: 'planet', label: 'Planeta', color: 'var(--ui-color-primary-blue)' },
  { key: 'coffee', label: 'Kawa', color: 'var(--ui-color-warning)' },
  { key: 'pixel', label: 'Pixel', color: 'var(--ui-color-income)' },
  { key: 'spark', label: 'Iskra', color: 'var(--ui-color-warning)' },
  { key: 'aura', label: 'Aura', color: 'var(--ui-color-primary-blue)' },
  { key: 'mint', label: 'Mięta', color: 'var(--ui-color-income)' },
  { key: 'rose', label: 'Róża', color: 'var(--ui-color-expense)' },
  { key: 'sun', label: 'Słońce', color: 'var(--ui-color-warning)' },
  { key: 'violet', label: 'Violet', color: 'var(--ui-color-primary-navy)' },
  { key: 'graphite', label: 'Grafit', color: 'var(--ui-color-secondary-text)' },
]

export type UiColorKey =
  | 'blue'
  | 'sky'
  | 'navy'
  | 'cyan'
  | 'yellow'
  | 'amber'
  | 'orange'
  | 'peach'
  | 'green'
  | 'mint'
  | 'lime'
  | 'olive'
  | 'violet'
  | 'purple'
  | 'indigo'
  | 'pink'
  | 'rose'
  | 'red'
  | 'brown'
  | 'graphite'
  | 'neutral'

export const UI_COLOR_OPTIONS: Array<{ tone: UiColorKey; label: string }> = [
  { tone: 'blue', label: 'Niebieski' },
  { tone: 'sky', label: 'Błękitny' },
  { tone: 'navy', label: 'Granatowy' },
  { tone: 'cyan', label: 'Turkusowy' },
  { tone: 'yellow', label: 'Żółty' },
  { tone: 'amber', label: 'Bursztynowy' },
  { tone: 'orange', label: 'Pomarańczowy' },
  { tone: 'peach', label: 'Brzoskwiniowy' },
  { tone: 'green', label: 'Zielony' },
  { tone: 'mint', label: 'Miętowy' },
  { tone: 'lime', label: 'Limonkowy' },
  { tone: 'olive', label: 'Oliwkowy' },
  { tone: 'violet', label: 'Fioletowy' },
  { tone: 'purple', label: 'Purpurowy' },
  { tone: 'indigo', label: 'Indygo' },
  { tone: 'pink', label: 'Różowy' },
  { tone: 'rose', label: 'Różany' },
  { tone: 'red', label: 'Czerwony' },
  { tone: 'brown', label: 'Brązowy' },
  { tone: 'graphite', label: 'Grafitowy' },
  { tone: 'neutral', label: 'Szary' },
]

export type UiIconKey =
  | 'note'
  | 'exchange'
  | 'home'
  | 'food'
  | 'shopping'
  | 'basket'
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
  | 'bill'
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
  | 'warning'
  | 'idea'
  | 'heart'
  | 'calendar'
  | 'more'
  | 'plus'
  | 'edit'
  | 'trash'
  | 'close'
  | 'expand'
  | 'info'

export type ModuleActionIconKey =
  | 'user'
  | 'settings'
  | 'dashboard'
  | 'bell'
  | 'search'
  | 'star'
  | 'goals'
  | 'payments'
  | 'backup'
  | 'import'
  | 'drafts'

const USER_ICON_REGISTRY_V1: UiIconKey[] = [
  'note',
  'home',
  'shopping',
  'food',
  'coffee',
  'car',
  'transport',
  'plane',
  'fuel',
  'health',
  'pharmacy',
  'work',
  'salary',
  'bills',
  'electricity',
  'internet',
  'phone',
  'education',
  'books',
  'sport',
  'gym',
  'gaming',
  'cinema',
  'gift',
  'clothes',
  'child',
  'pets',
  'cash',
  'card',
  'bank',
  'investments',
  'calendar',
  'warning',
  'idea',
  'heart',
  'sun',
  'exchange',
  'more',
  'plus',
  'edit',
  'trash',
  'close',
  'expand',
  'info',
]

const INTERNAL_ICON_OPTIONS: Array<{ key: UiIconKey; label: string }> = [
  { key: 'note', label: 'Notatka' },
  { key: 'exchange', label: 'Wymiana' },
  { key: 'home', label: 'Dom' },
  { key: 'food', label: 'Jedzenie' },
  { key: 'shopping', label: 'Zakupy' },
  { key: 'basket', label: 'Koszyk' },
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
  { key: 'bill', label: 'Paragon' },
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
  { key: 'warning', label: 'Ważne' },
  { key: 'idea', label: 'Pomysł' },
  { key: 'heart', label: 'Osobiste' },
  { key: 'calendar', label: 'Kalendarz' },
  { key: 'more', label: 'Pozostałe' },
  { key: 'plus', label: 'Dodaj' },
  { key: 'edit', label: 'Edytuj' },
  { key: 'trash', label: 'Usu\u0144' },
  { key: 'close', label: 'Zamknij' },
  { key: 'expand', label: 'Rozwi\u0144' },
  { key: 'info', label: 'Informacja' },
]

export type CategoryIconKey = UiIconKey

// APP_ICONS = ikony wybierane przez użytkownika.
export const APP_ICONS: Array<{ key: UiIconKey; label: string }> = USER_ICON_REGISTRY_V1.map(
  (key) => INTERNAL_ICON_OPTIONS.find((icon) => icon.key === key)
).filter((icon): icon is { key: UiIconKey; label: string } => Boolean(icon))

export const CATEGORY_ICONS = APP_ICONS


export const APP_ICON_ALIASES: Record<UiIconKey, string[]> = {
  note: ['notatka', 'notatki', 'nota', 'zapis', 'tekst', 'opis'],
  exchange: ['wymiana', 'transfer', 'przelew', 'zamiana', 'wymienić'],
  home: ['dom', 'mieszkanie', 'domowe'],
  food: ['jedzenie', 'posiłek', 'gastronomia', 'restauracja', 'widelec', 'nóż', 'lunch', 'obiad', 'kolacja'],
  shopping: ['zakupy', 'koszyk', 'zakupy spożywcze', 'sklep', 'market'],
  basket: ['koszyk', 'zakupy', 'sklep', 'market'],
  car: ['auto', 'samochód', 'samochod', 'pojazd', 'samochód osobowy'],
  transport: ['transport', 'komunikacja', 'komunikacja miejska', 'tramwaj', 'autobus', 'metro', 'pociąg'],
  plane: ['samolot', 'lot', 'loty', 'podróż', 'podróże', 'wakacje', 'urlop', 'wyjazd', 'wyjazdy', 'lotniczy'],
  holiday: ['wakacje', 'urlop', 'podróż', 'podróże', 'samolot', 'wyjazd'],
  sun: ['słońce', 'pogoda', 'lato', 'wakacje', 'słoneczny'],
  health: ['zdrowie', 'medyczne', 'lekarz'],
  doctor: ['lekarz', 'doktor', 'wizyta', 'medycyna', 'zdrowie'],
  pharmacy: ['apteka', 'leki', 'farmacja', 'lekarstwa', 'lekarz'],
  work: ['praca', 'firma', 'biuro'],
  salary: ['pensja', 'wynagrodzenie', 'płaca', 'wypłata', 'portfel'],
  bills: ['rachunki', 'rachunek', 'faktura', 'faktury', 'opłaty', 'paragon', 'paragon fiskalny'],
  bill: ['paragon', 'rachunki', 'rachunek', 'faktura', 'opłaty'],
  electricity: ['prąd', 'energia', 'elektryczność', 'energia elektryczna', 'rachunek za prąd'],
  internet: ['internet', 'wifi', 'wi-fi', 'sieć', 'online', 'łącze', 'broadband'],
  phone: ['telefon', 'telefon komórkowy', 'komórka', 'rozmowy', 'abonament'],
  education: ['edukacja', 'nauka', 'szkoła', 'studia', 'kurs', 'kursy', 'szkolenie'],
  books: ['książki', 'książka', 'czytanie', 'lektura'],
  sport: ['sport', 'piłka', 'aktywność', 'piłka nożna', 'koszykówka', 'piłka do kosza'],
  gym: ['siłownia', 'sztanga', 'trening', 'trening siłowy', 'ćwiczenia', 'fitness', 'gym'],
  gaming: ['gaming', 'komputer', 'gry', 'granie', 'gra', 'pc', 'konsola'],
  entertainment: ['rozrywka', 'kino', 'film', 'filmy', 'seriale'],
  cinema: ['kino', 'film', 'filmy', 'seans', 'movie', 'ekran', 'projekcja'],
  gift: ['prezent', 'upominek', 'podarunek', 'prezent dla kogoś'],
  clothes: ['ubrania', 'odzież', 'ciuchy', 'garderoba', 'zakupy odzieżowe'],
  pets: ['zwierzęta', 'zwierzę', 'pies', 'kot', 'pupile', 'zwierzak', 'zwierzaki'],
  child: ['dziecko', 'dzieci', 'potomstwo', 'syn', 'córka'],
  savings: ['oszczędności', 'oszczędzanie', 'bank', 'konto', 'konto oszczędnościowe', 'lokata'],
  cash: ['gotówka', 'pieniądze', 'banknot', 'cash'],
  card: ['karta', 'płatność', 'płatności', 'karta płatnicza'],
  bank: ['bank', 'oszczędności', 'konto', 'konto oszczędnościowe', 'oszczędzanie', 'lokata'],
  investments: ['inwestycje', 'inwestycja', 'lokowanie', 'giełda', 'kapitał', 'akcje', 'wzrost', 'zysk'],
  restaurant: ['restauracja', 'jedzenie', 'posiłek', 'gastronomia', 'widelec', 'nóż'],
  coffee: ['kawa', 'napój', 'kawiarnia'],
  fuel: ['paliwo', 'benzyna', 'diesel', 'tankowanie', 'stacja paliw'],
  travel: ['podróż', 'podróże', 'wakacje', 'urlop', 'samolot', 'wyjazd'],
  warning: ['ważne', 'istotne', 'priorytet', 'alert', 'uwaga'],
  idea: ['pomysł', 'idea', 'żarówka', 'inspiracja', 'koncepcja'],
  heart: ['osobiste', 'prywatne', 'dla mnie', 'serce'],
  calendar: ['kalendarz', 'termin', 'data', 'wydarzenie', 'plan'],
  more: ['pozostałe', 'inne', 'różne', 'nieskończoność', 'dodatkowe', 'misc'],
  plus: ['dodaj', 'plus', 'nowe'],
  edit: ['edytuj', 'zmień', 'ołówek', 'edycja'],
  trash: ['usuń', 'kosz', 'śmieci'],
  close: ['zamknij', 'x'],
  expand: ['rozwiń', 'więcej', 'pokaż więcej'],
  info: ['informacja', 'info', 'pomoc', 'szczegóły'],
}

export const getUiIconSearchText = (icon: { key: UiIconKey; label: string }) =>
  [icon.label, icon.key, ...(APP_ICON_ALIASES[icon.key] || [])].join(' ').toLocaleLowerCase('pl-PL')


// MODULE_ACTION_ICONS = ikony systemowe/modułowe, nie do pickerów użytkownika.
export const MODULE_ACTION_ICONS: Array<{ key: ModuleActionIconKey; label: string }> = [
  { key: 'user', label: 'U\u017cytkownik' },
  { key: 'settings', label: 'Ustawienia' },
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'bell', label: 'Przypomnienia' },
  { key: 'search', label: 'Szukaj' },
  { key: 'star', label: 'Przypi\u0119te' },
  { key: 'goals', label: 'Cele' },
  { key: 'payments', label: 'P\u0142atno\u015bci' },
  { key: 'backup', label: 'Backup' },
  { key: 'import', label: 'Import' },
  { key: 'drafts', label: 'Szkice' },
]

export const getAvatar = (avatarKey?: string | null) =>
  USER_AVATARS.find((avatar) => avatar.key === avatarKey) || USER_AVATARS[0]

export const getUiIcon = (iconKey?: string | null) =>
  INTERNAL_ICON_OPTIONS.find((icon) => icon.key === iconKey) || null

export const getCategoryIcon = getUiIcon

export const getUiColor = (tone?: string | null) =>
  UI_COLOR_OPTIONS.find((color) => color.tone === tone) || UI_COLOR_OPTIONS[0]

export const isUiIconKey = (value: string | null | undefined): value is UiIconKey =>
  Boolean(value && INTERNAL_ICON_OPTIONS.some((icon) => icon.key === value))

export const isUiColorKey = (value: string | null | undefined): value is UiColorKey =>
  Boolean(value && UI_COLOR_OPTIONS.some((color) => color.tone === value))

export const getUserDisplayName = (
  profile: UserPublicProfile | null | undefined,
  fallbackEmail?: string,
  fallbackLabel?: string
) => profile?.display_name?.trim() || fallbackEmail || fallbackLabel || 'Użytkownik'
