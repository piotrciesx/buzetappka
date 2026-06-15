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
  | 'plane_2'
  | 'plane_3'
  | 'plane_4'
  | 'plane_5'
  | 'plane_6'
  | 'plane_7'
  | 'plane_8'
  | 'plane_9'
  | 'plane_10'
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
  | 'gym_2'
  | 'gym_3'
  | 'gym_4'
  | 'gym_5'
  | 'gym_6'
  | 'gym_7'
  | 'gym_8'
  | 'gym_9'
  | 'gym_10'
  | 'gaming'
  | 'gaming_2'
  | 'gaming_3'
  | 'gaming_4'
  | 'gaming_5'
  | 'gaming_6'
  | 'gaming_7'
  | 'gaming_8'
  | 'gaming_9'
  | 'gaming_10'
  | 'entertainment'
  | 'cinema'
  | 'cinema_2'
  | 'cinema_3'
  | 'cinema_4'
  | 'cinema_5'
  | 'cinema_6'
  | 'cinema_7'
  | 'cinema_8'
  | 'cinema_9'
  | 'cinema_10'
  | 'gift'
  | 'gift_2'
  | 'gift_3'
  | 'gift_4'
  | 'gift_5'
  | 'gift_6'
  | 'gift_7'
  | 'gift_8'
  | 'gift_9'
  | 'gift_10'
  | 'clothes'
  | 'clothes_2'
  | 'clothes_3'
  | 'clothes_4'
  | 'clothes_5'
  | 'clothes_6'
  | 'clothes_7'
  | 'clothes_8'
  | 'clothes_9'
  | 'clothes_10'
  | 'pets'
  | 'pets_2'
  | 'pets_3'
  | 'pets_4'
  | 'pets_5'
  | 'pets_6'
  | 'pets_7'
  | 'pets_8'
  | 'pets_9'
  | 'pets_10'
  | 'child'
  | 'child_2'
  | 'child_3'
  | 'child_4'
  | 'child_5'
  | 'child_6'
  | 'child_7'
  | 'child_8'
  | 'child_9'
  | 'child_10'
  | 'savings'
  | 'cash'
  | 'cash_2'
  | 'cash_3'
  | 'cash_4'
  | 'cash_5'
  | 'cash_6'
  | 'cash_7'
  | 'cash_8'
  | 'cash_9'
  | 'cash_10'
  | 'card'
  | 'card_2'
  | 'card_3'
  | 'card_4'
  | 'card_5'
  | 'card_6'
  | 'card_7'
  | 'card_8'
  | 'card_9'
  | 'card_10'
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
  'plane_2',
  'plane_3',
  'plane_4',
  'plane_5',
  'plane_6',
  'plane_7',
  'plane_8',
  'plane_9',
  'plane_10',
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
  'gym_2',
  'gym_3',
  'gym_4',
  'gym_5',
  'gym_6',
  'gym_7',
  'gym_8',
  'gym_9',
  'gym_10',
  'gaming',
  'gaming_2',
  'gaming_3',
  'gaming_4',
  'gaming_5',
  'gaming_6',
  'gaming_7',
  'gaming_8',
  'gaming_9',
  'gaming_10',
  'cinema',
  'cinema_2',
  'cinema_3',
  'cinema_4',
  'cinema_5',
  'cinema_6',
  'cinema_7',
  'cinema_8',
  'cinema_9',
  'cinema_10',
  'gift',
  'gift_2',
  'gift_3',
  'gift_4',
  'gift_5',
  'gift_6',
  'gift_7',
  'gift_8',
  'gift_9',
  'gift_10',
  'clothes',
  'clothes_2',
  'clothes_3',
  'clothes_4',
  'clothes_5',
  'clothes_6',
  'clothes_7',
  'clothes_8',
  'clothes_9',
  'clothes_10',
  'child',
  'child_2',
  'child_3',
  'child_4',
  'child_5',
  'child_6',
  'child_7',
  'child_8',
  'child_9',
  'child_10',
  'pets',
  'pets_2',
  'pets_3',
  'pets_4',
  'pets_5',
  'pets_6',
  'pets_7',
  'pets_8',
  'pets_9',
  'pets_10',
  'cash',
  'cash_2',
  'cash_3',
  'cash_4',
  'cash_5',
  'cash_6',
  'cash_7',
  'cash_8',
  'cash_9',
  'cash_10',
  'card',
  'card_2',
  'card_3',
  'card_4',
  'card_5',
  'card_6',
  'card_7',
  'card_8',
  'card_9',
  'card_10',
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
  { key: 'plane_2', label: 'Samolot 2' },
  { key: 'plane_3', label: 'Samolot 3' },
  { key: 'plane_4', label: 'Samolot 4' },
  { key: 'plane_5', label: 'Samolot 5' },
  { key: 'plane_6', label: 'Samolot 6' },
  { key: 'plane_7', label: 'Samolot 7' },
  { key: 'plane_8', label: 'Samolot 8' },
  { key: 'plane_9', label: 'Samolot 9' },
  { key: 'plane_10', label: 'Samolot 10' },
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
  { key: 'gym_2', label: 'Siłownia 2' },
  { key: 'gym_3', label: 'Siłownia 3' },
  { key: 'gym_4', label: 'Siłownia 4' },
  { key: 'gym_5', label: 'Siłownia 5' },
  { key: 'gym_6', label: 'Siłownia 6' },
  { key: 'gym_7', label: 'Siłownia 7' },
  { key: 'gym_8', label: 'Siłownia 8' },
  { key: 'gym_9', label: 'Siłownia 9' },
  { key: 'gym_10', label: 'Siłownia 10' },
  { key: 'gaming', label: 'Gaming' },
  { key: 'gaming_2', label: 'Gaming 2' },
  { key: 'gaming_3', label: 'Gaming 3' },
  { key: 'gaming_4', label: 'Gaming 4' },
  { key: 'gaming_5', label: 'Gaming 5' },
  { key: 'gaming_6', label: 'Gaming 6' },
  { key: 'gaming_7', label: 'Gaming 7' },
  { key: 'gaming_8', label: 'Gaming 8' },
  { key: 'gaming_9', label: 'Gaming 9' },
  { key: 'gaming_10', label: 'Gaming 10' },
  { key: 'entertainment', label: 'Rozrywka' },
  { key: 'cinema', label: 'Kino' },
  { key: 'cinema_2', label: 'Kino 2' },
  { key: 'cinema_3', label: 'Kino 3' },
  { key: 'cinema_4', label: 'Kino 4' },
  { key: 'cinema_5', label: 'Kino 5' },
  { key: 'cinema_6', label: 'Kino 6' },
  { key: 'cinema_7', label: 'Kino 7' },
  { key: 'cinema_8', label: 'Kino 8' },
  { key: 'cinema_9', label: 'Kino 9' },
  { key: 'cinema_10', label: 'Kino 10' },
  { key: 'gift', label: 'Prezent' },
  { key: 'gift_2', label: 'Prezent 2' },
  { key: 'gift_3', label: 'Prezent 3' },
  { key: 'gift_4', label: 'Prezent 4' },
  { key: 'gift_5', label: 'Prezent 5' },
  { key: 'gift_6', label: 'Prezent 6' },
  { key: 'gift_7', label: 'Prezent 7' },
  { key: 'gift_8', label: 'Prezent 8' },
  { key: 'gift_9', label: 'Prezent 9' },
  { key: 'gift_10', label: 'Prezent 10' },
  { key: 'clothes', label: 'Ubrania' },
  { key: 'clothes_2', label: 'Ubrania 2' },
  { key: 'clothes_3', label: 'Ubrania 3' },
  { key: 'clothes_4', label: 'Ubrania 4' },
  { key: 'clothes_5', label: 'Ubrania 5' },
  { key: 'clothes_6', label: 'Ubrania 6' },
  { key: 'clothes_7', label: 'Ubrania 7' },
  { key: 'clothes_8', label: 'Ubrania 8' },
  { key: 'clothes_9', label: 'Ubrania 9' },
  { key: 'clothes_10', label: 'Ubrania 10' },
  { key: 'pets', label: 'Zwierzęta' },
  { key: 'pets_2', label: 'Zwierzęta 2' },
  { key: 'pets_3', label: 'Zwierzęta 3' },
  { key: 'pets_4', label: 'Zwierzęta 4' },
  { key: 'pets_5', label: 'Zwierzęta 5' },
  { key: 'pets_6', label: 'Zwierzęta 6' },
  { key: 'pets_7', label: 'Zwierzęta 7' },
  { key: 'pets_8', label: 'Zwierzęta 8' },
  { key: 'pets_9', label: 'Zwierzęta 9' },
  { key: 'pets_10', label: 'Zwierzęta 10' },
  { key: 'child', label: 'Dziecko' },
  { key: 'child_2', label: 'Dziecko 2' },
  { key: 'child_3', label: 'Dziecko 3' },
  { key: 'child_4', label: 'Dziecko 4' },
  { key: 'child_5', label: 'Dziecko 5' },
  { key: 'child_6', label: 'Dziecko 6' },
  { key: 'child_7', label: 'Dziecko 7' },
  { key: 'child_8', label: 'Dziecko 8' },
  { key: 'child_9', label: 'Dziecko 9' },
  { key: 'child_10', label: 'Dziecko 10' },
  { key: 'savings', label: 'Oszczędności' },
  { key: 'cash', label: 'Gotówka' },
  { key: 'cash_2', label: 'Gotówka 2' },
  { key: 'cash_3', label: 'Gotówka 3' },
  { key: 'cash_4', label: 'Gotówka 4' },
  { key: 'cash_5', label: 'Gotówka 5' },
  { key: 'cash_6', label: 'Gotówka 6' },
  { key: 'cash_7', label: 'Gotówka 7' },
  { key: 'cash_8', label: 'Gotówka 8' },
  { key: 'cash_9', label: 'Gotówka 9' },
  { key: 'cash_10', label: 'Gotówka 10' },
  { key: 'card', label: 'Karta' },
  { key: 'card_2', label: 'Karta 2' },
  { key: 'card_3', label: 'Karta 3' },
  { key: 'card_4', label: 'Karta 4' },
  { key: 'card_5', label: 'Karta 5' },
  { key: 'card_6', label: 'Karta 6' },
  { key: 'card_7', label: 'Karta 7' },
  { key: 'card_8', label: 'Karta 8' },
  { key: 'card_9', label: 'Karta 9' },
  { key: 'card_10', label: 'Karta 10' },
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
  note: ['notatka', 'notatki', 'nota', 'zapis', 'zapiski', 'uwagi', 'tekst', 'opis'],
  exchange: ['wymiana', 'transfer', 'przelew', 'zamiana', 'kurs', 'waluty', 'przewalutowanie'],
  home: ['dom', 'mieszkanie', 'nieruchomość', 'czynsz', 'mieszkalne', 'domowe'],
  food: ['jedzenie', 'restauracja', 'gastronomia', 'widelec', 'nóż', 'posiłek', 'śniadanie', 'obiad', 'kolacja', 'lunch'],
  shopping: ['zakupy', 'koszyk', 'sklep', 'market', 'supermarket', 'galeria handlowa', 'zakupy spożywcze'],
  basket: ['koszyk', 'zakupy', 'sklep', 'market', 'supermarket'],
  car: ['auto', 'samochód', 'samochod', 'pojazd', 'motoryzacja', 'suv'],
  transport: ['transport', 'komunikacja', 'komunikacja miejska', 'tramwaj', 'autobus', 'metro', 'pociąg', 'kolej'],
  plane: ['samolot', 'lot', 'loty', 'lotnisko', 'podróż', 'podróże', 'wakacje', 'urlop', 'wyjazd', 'wyjazdy', 'lotniczy'],
  plane_2: [],
  plane_3: [],
  plane_4: [],
  plane_5: [],
  plane_6: [],
  plane_7: [],
  plane_8: [],
  plane_9: [],
  plane_10: [],
  holiday: ['wakacje', 'urlop', 'podróż', 'podróże', 'samolot', 'wyjazd', 'lot'],
  sun: ['słońce', 'pogoda', 'lato', 'wakacje', 'słoneczny'],
  health: ['apteka', 'farmacja', 'leki', 'lekarstwa', 'leczenie', 'zdrowie', 'medycyna', 'medyczne', 'lekarz', 'doktor', 'recepta', 'przychodnia', 'szpital', 'opieka zdrowotna', 'choroba', 'badania', 'terapia', 'badanie', 'wizyta', 'ratunek'],
  doctor: ['lekarz', 'doktor', 'wizyta', 'medycyna', 'zdrowie', 'przychodnia', 'szpital'],
  pharmacy: ['apteka', 'farmacja', 'leki', 'lekarstwa', 'leczenie', 'zdrowie', 'medycyna', 'medyczne', 'lekarz', 'doktor', 'recepta', 'przychodnia', 'szpital', 'opieka zdrowotna', 'choroba', 'badania', 'terapia', 'badanie', 'wizyta', 'ratunek'],
  work: ['praca', 'firma', 'biuro', 'zatrudnienie', 'etat', 'zawód'],
  salary: ['pensja', 'wynagrodzenie', 'płaca', 'wypłata', 'portfel', 'zarobki', 'dochód'],
  bills: ['rachunki', 'rachunek', 'paragon', 'faktura', 'faktury', 'opłaty', 'opłata', 'rozliczenie'],
  bill: ['paragon', 'rachunki', 'rachunek', 'faktura', 'opłaty'],
  electricity: ['prąd', 'energia', 'elektryczność', 'elektryka', 'rachunek za prąd'],
  internet: ['internet', 'wifi', 'wi-fi', 'sieć', 'router', 'online', 'łącze'],
  phone: ['telefon', 'smartfon', 'komórka', 'telefon komórkowy', 'rozmowy', 'abonament'],
  education: ['edukacja', 'nauka', 'szkoła', 'studia', 'kurs', 'kursy', 'szkolenie'],
  books: ['książka', 'książki', 'czytanie', 'biblioteka', 'księgarnia', 'lektura', 'powieść', 'podręcznik', 'literatura'],
  sport: ['sport', 'aktywność', 'piłka', 'piłka nożna', 'koszykówka', 'piłka do kosza', 'trening', 'zawody'],
  gym: ['siłownia', 'sztanga', 'hantle', 'fitness', 'ćwiczenia', 'trening', 'trening siłowy', 'gym'],
  gym_2: [],
  gym_3: [],
  gym_4: [],
  gym_5: [],
  gym_6: [],
  gym_7: [],
  gym_8: [],
  gym_9: [],
  gym_10: [],
  gaming: ['gaming', 'komputer', 'gry', 'gracz', 'granie', 'gra', 'pc', 'konsola', 'e-sport', 'esport'],
  gaming_2: [],
  gaming_3: [],
  gaming_4: [],
  gaming_5: [],
  gaming_6: [],
  gaming_7: [],
  gaming_8: [],
  gaming_9: [],
  gaming_10: [],
  entertainment: ['rozrywka', 'kino', 'film', 'filmy', 'seriale', 'telewizja'],
  cinema: ['kino', 'film', 'filmy', 'serial', 'seriale', 'telewizja', 'seans', 'ekran', 'projekcja'],
  cinema_2: [],
  cinema_3: [],
  cinema_4: [],
  cinema_5: [],
  cinema_6: [],
  cinema_7: [],
  cinema_8: [],
  cinema_9: [],
  cinema_10: [],
  gift: ['prezent', 'upominek', 'podarunek', 'niespodzianka'],
  gift_2: [],
  gift_3: [],
  gift_4: [],
  gift_5: [],
  gift_6: [],
  gift_7: [],
  gift_8: [],
  gift_9: [],
  gift_10: [],
  clothes: ['ubrania', 'odzież', 'ciuchy', 'moda', 'garderoba'],
  clothes_2: [],
  clothes_3: [],
  clothes_4: [],
  clothes_5: [],
  clothes_6: [],
  clothes_7: [],
  clothes_8: [],
  clothes_9: [],
  clothes_10: [],
  pets: ['zwierzęta', 'zwierzę', 'pupil', 'pies', 'kot', 'weterynarz', 'karma', 'łapka'],
  pets_2: [],
  pets_3: [],
  pets_4: [],
  pets_5: [],
  pets_6: [],
  pets_7: [],
  pets_8: [],
  pets_9: [],
  pets_10: [],
  child: ['dziecko', 'dzieci', 'niemowlę', 'rodzicielstwo', 'syn', 'córka'],
  child_2: [],
  child_3: [],
  child_4: [],
  child_5: [],
  child_6: [],
  child_7: [],
  child_8: [],
  child_9: [],
  child_10: [],
  savings: ['oszczędności', 'oszczędzanie', 'bank', 'konto', 'konto oszczędnościowe', 'lokata', 'skarbonka', 'fundusz'],
  cash: ['gotówka', 'pieniądze', 'banknot', 'banknoty', 'kasa', 'cash'],
  cash_2: [],
  cash_3: [],
  cash_4: [],
  cash_5: [],
  cash_6: [],
  cash_7: [],
  cash_8: [],
  cash_9: [],
  cash_10: [],
  card: ['karta', 'płatność', 'płatności', 'karta płatnicza', 'debetowa', 'kredytowa'],
  card_2: [],
  card_3: [],
  card_4: [],
  card_5: [],
  card_6: [],
  card_7: [],
  card_8: [],
  card_9: [],
  card_10: [],
  bank: ['bank', 'oszczędności', 'oszczędzanie', 'konto', 'konto oszczędnościowe', 'lokata', 'skarbonka', 'fundusz'],
  investments: ['inwestycje', 'inwestycja', 'inwestowanie', 'giełda', 'akcje', 'etf', 'ETF', 'obligacje', 'kapitał', 'wzrost', 'zysk'],
  restaurant: ['restauracja', 'jedzenie', 'posiłek', 'gastronomia', 'widelec', 'nóż'],
  coffee: ['kawa', 'herbata', 'kawiarnia', 'napój'],
  fuel: ['paliwo', 'benzyna', 'diesel', 'tankowanie', 'stacja paliw'],
  travel: ['podróż', 'podróże', 'wakacje', 'urlop', 'samolot', 'wyjazd', 'lot'],
  warning: ['ważne', 'istotne', 'priorytet', 'alert', 'uwaga', 'ostrzeżenie', 'pilne'],
  idea: ['pomysł', 'idea', 'żarówka', 'inspiracja', 'projekt', 'koncepcja'],
  heart: ['osobiste', 'prywatne', 'życie prywatne', 'dla mnie', 'serce'],
  calendar: ['kalendarz', 'termin', 'data', 'wydarzenie', 'harmonogram', 'plan'],
  more: ['pozostałe', 'inne', 'różne', 'reszta', 'wszystko', 'nieskończoność', 'dodatkowe'],
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
