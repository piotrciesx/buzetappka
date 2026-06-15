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
  | 'car_2'
  | 'car_3'
  | 'car_4'
  | 'car_5'
  | 'car_6'
  | 'car_7'
  | 'car_8'
  | 'car_9'
  | 'car_10'
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
  | 'salary_2'
  | 'salary_3'
  | 'salary_4'
  | 'salary_5'
  | 'salary_6'
  | 'salary_7'
  | 'salary_8'
  | 'salary_9'
  | 'salary_10'
  | 'bills'
  | 'bills_2'
  | 'bills_3'
  | 'bills_4'
  | 'bills_5'
  | 'bills_6'
  | 'bills_7'
  | 'bills_8'
  | 'bills_9'
  | 'bills_10'
  | 'bill'
  | 'electricity'
  | 'electricity_2'
  | 'electricity_3'
  | 'electricity_4'
  | 'electricity_5'
  | 'electricity_6'
  | 'electricity_7'
  | 'electricity_8'
  | 'electricity_9'
  | 'electricity_10'
  | 'internet'
  | 'internet_2'
  | 'internet_3'
  | 'internet_4'
  | 'internet_5'
  | 'internet_6'
  | 'internet_7'
  | 'internet_8'
  | 'internet_9'
  | 'internet_10'
  | 'phone'
  | 'phone_2'
  | 'phone_3'
  | 'phone_4'
  | 'phone_5'
  | 'phone_6'
  | 'phone_7'
  | 'phone_8'
  | 'phone_9'
  | 'phone_10'
  | 'education'
  | 'education_2'
  | 'education_3'
  | 'education_4'
  | 'education_5'
  | 'education_6'
  | 'education_7'
  | 'education_8'
  | 'education_9'
  | 'education_10'
  | 'books'
  | 'books_2'
  | 'books_3'
  | 'books_4'
  | 'books_5'
  | 'books_6'
  | 'books_7'
  | 'books_8'
  | 'books_9'
  | 'books_10'
  | 'sport'
  | 'sport_2'
  | 'sport_3'
  | 'sport_4'
  | 'sport_5'
  | 'sport_6'
  | 'sport_7'
  | 'sport_8'
  | 'sport_9'
  | 'sport_10'
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
  'car_2',
  'car_3',
  'car_4',
  'car_5',
  'car_6',
  'car_7',
  'car_8',
  'car_9',
  'car_10',
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
  'salary_2',
  'salary_3',
  'salary_4',
  'salary_5',
  'salary_6',
  'salary_7',
  'salary_8',
  'salary_9',
  'salary_10',
  'bills',
  'bills_2',
  'bills_3',
  'bills_4',
  'bills_5',
  'bills_6',
  'bills_7',
  'bills_8',
  'bills_9',
  'bills_10',
  'electricity',
  'electricity_2',
  'electricity_3',
  'electricity_4',
  'electricity_5',
  'electricity_6',
  'electricity_7',
  'electricity_8',
  'electricity_9',
  'electricity_10',
  'internet',
  'internet_2',
  'internet_3',
  'internet_4',
  'internet_5',
  'internet_6',
  'internet_7',
  'internet_8',
  'internet_9',
  'internet_10',
  'phone',
  'phone_2',
  'phone_3',
  'phone_4',
  'phone_5',
  'phone_6',
  'phone_7',
  'phone_8',
  'phone_9',
  'phone_10',
  'education',
  'education_2',
  'education_3',
  'education_4',
  'education_5',
  'education_6',
  'education_7',
  'education_8',
  'education_9',
  'education_10',
  'books',
  'books_2',
  'books_3',
  'books_4',
  'books_5',
  'books_6',
  'books_7',
  'books_8',
  'books_9',
  'books_10',
  'sport',
  'sport_2',
  'sport_3',
  'sport_4',
  'sport_5',
  'sport_6',
  'sport_7',
  'sport_8',
  'sport_9',
  'sport_10',
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
  { key: 'car_2', label: 'Auto 2' },
  { key: 'car_3', label: 'Auto 3' },
  { key: 'car_4', label: 'Auto 4' },
  { key: 'car_5', label: 'Auto 5' },
  { key: 'car_6', label: 'Auto 6' },
  { key: 'car_7', label: 'Auto 7' },
  { key: 'car_8', label: 'Auto 8' },
  { key: 'car_9', label: 'Auto 9' },
  { key: 'car_10', label: 'Auto 10' },
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
  { key: 'salary_2', label: 'Pensja 2' },
  { key: 'salary_3', label: 'Pensja 3' },
  { key: 'salary_4', label: 'Pensja 4' },
  { key: 'salary_5', label: 'Pensja 5' },
  { key: 'salary_6', label: 'Pensja 6' },
  { key: 'salary_7', label: 'Pensja 7' },
  { key: 'salary_8', label: 'Pensja 8' },
  { key: 'salary_9', label: 'Pensja 9' },
  { key: 'salary_10', label: 'Pensja 10' },
  { key: 'bills', label: 'Rachunki' },
  { key: 'bills_2', label: 'Rachunki 2' },
  { key: 'bills_3', label: 'Rachunki 3' },
  { key: 'bills_4', label: 'Rachunki 4' },
  { key: 'bills_5', label: 'Rachunki 5' },
  { key: 'bills_6', label: 'Rachunki 6' },
  { key: 'bills_7', label: 'Rachunki 7' },
  { key: 'bills_8', label: 'Rachunki 8' },
  { key: 'bills_9', label: 'Rachunki 9' },
  { key: 'bills_10', label: 'Rachunki 10' },
  { key: 'bill', label: 'Paragon' },
  { key: 'electricity', label: 'Prąd' },
  { key: 'electricity_2', label: 'Prąd 2' },
  { key: 'electricity_3', label: 'Prąd 3' },
  { key: 'electricity_4', label: 'Prąd 4' },
  { key: 'electricity_5', label: 'Prąd 5' },
  { key: 'electricity_6', label: 'Prąd 6' },
  { key: 'electricity_7', label: 'Prąd 7' },
  { key: 'electricity_8', label: 'Prąd 8' },
  { key: 'electricity_9', label: 'Prąd 9' },
  { key: 'electricity_10', label: 'Prąd 10' },
  { key: 'internet', label: 'Internet' },
  { key: 'internet_2', label: 'Internet 2' },
  { key: 'internet_3', label: 'Internet 3' },
  { key: 'internet_4', label: 'Internet 4' },
  { key: 'internet_5', label: 'Internet 5' },
  { key: 'internet_6', label: 'Internet 6' },
  { key: 'internet_7', label: 'Internet 7' },
  { key: 'internet_8', label: 'Internet 8' },
  { key: 'internet_9', label: 'Internet 9' },
  { key: 'internet_10', label: 'Internet 10' },
  { key: 'phone', label: 'Telefon' },
  { key: 'phone_2', label: 'Telefon 2' },
  { key: 'phone_3', label: 'Telefon 3' },
  { key: 'phone_4', label: 'Telefon 4' },
  { key: 'phone_5', label: 'Telefon 5' },
  { key: 'phone_6', label: 'Telefon 6' },
  { key: 'phone_7', label: 'Telefon 7' },
  { key: 'phone_8', label: 'Telefon 8' },
  { key: 'phone_9', label: 'Telefon 9' },
  { key: 'phone_10', label: 'Telefon 10' },
  { key: 'education', label: 'Edukacja' },
  { key: 'education_2', label: 'Edukacja 2' },
  { key: 'education_3', label: 'Edukacja 3' },
  { key: 'education_4', label: 'Edukacja 4' },
  { key: 'education_5', label: 'Edukacja 5' },
  { key: 'education_6', label: 'Edukacja 6' },
  { key: 'education_7', label: 'Edukacja 7' },
  { key: 'education_8', label: 'Edukacja 8' },
  { key: 'education_9', label: 'Edukacja 9' },
  { key: 'education_10', label: 'Edukacja 10' },
  { key: 'books', label: 'Książki' },
  { key: 'books_2', label: 'Książki 2' },
  { key: 'books_3', label: 'Książki 3' },
  { key: 'books_4', label: 'Książki 4' },
  { key: 'books_5', label: 'Książki 5' },
  { key: 'books_6', label: 'Książki 6' },
  { key: 'books_7', label: 'Książki 7' },
  { key: 'books_8', label: 'Książki 8' },
  { key: 'books_9', label: 'Książki 9' },
  { key: 'books_10', label: 'Książki 10' },
  { key: 'sport', label: 'Sport' },
  { key: 'sport_2', label: 'Sport 2' },
  { key: 'sport_3', label: 'Sport 3' },
  { key: 'sport_4', label: 'Sport 4' },
  { key: 'sport_5', label: 'Sport 5' },
  { key: 'sport_6', label: 'Sport 6' },
  { key: 'sport_7', label: 'Sport 7' },
  { key: 'sport_8', label: 'Sport 8' },
  { key: 'sport_9', label: 'Sport 9' },
  { key: 'sport_10', label: 'Sport 10' },
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
  note: ['notatka', 'notatki', 'nota', 'zapis', 'zapiski', 'uwagi', 'tekst', 'opis'],
  exchange: ['wymiana', 'transfer', 'przelew', 'zamiana', 'kurs', 'waluty', 'przewalutowanie'],
  home: ['dom', 'mieszkanie', 'nieruchomość', 'czynsz', 'mieszkalne', 'domowe'],
  food: ['jedzenie', 'restauracja', 'gastronomia', 'widelec', 'nóż', 'posiłek', 'śniadanie', 'obiad', 'kolacja', 'lunch'],
  shopping: ['zakupy', 'koszyk', 'sklep', 'market', 'supermarket', 'galeria handlowa', 'zakupy spożywcze'],
  basket: ['koszyk', 'zakupy', 'sklep', 'market', 'supermarket'],
  car: ['auto', 'samochód', 'samochod', 'pojazd', 'motoryzacja', 'suv'],
  car_2: [],
  car_3: [],
  car_4: [],
  car_5: [],
  car_6: [],
  car_7: [],
  car_8: [],
  car_9: [],
  car_10: [],
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
  salary_2: [],
  salary_3: [],
  salary_4: [],
  salary_5: [],
  salary_6: [],
  salary_7: [],
  salary_8: [],
  salary_9: [],
  salary_10: [],
  bills: ['rachunki', 'rachunek', 'paragon', 'faktura', 'faktury', 'opłaty', 'opłata', 'rozliczenie'],
  bills_2: [],
  bills_3: [],
  bills_4: [],
  bills_5: [],
  bills_6: [],
  bills_7: [],
  bills_8: [],
  bills_9: [],
  bills_10: [],
  bill: ['paragon', 'rachunki', 'rachunek', 'faktura', 'opłaty'],
  electricity: ['prąd', 'energia', 'elektryczność', 'elektryka', 'rachunek za prąd'],
  electricity_2: [],
  electricity_3: [],
  electricity_4: [],
  electricity_5: [],
  electricity_6: [],
  electricity_7: [],
  electricity_8: [],
  electricity_9: [],
  electricity_10: [],
  internet: ['internet', 'wifi', 'wi-fi', 'sieć', 'router', 'online', 'łącze'],
  internet_2: [],
  internet_3: [],
  internet_4: [],
  internet_5: [],
  internet_6: [],
  internet_7: [],
  internet_8: [],
  internet_9: [],
  internet_10: [],
  phone: ['telefon', 'smartfon', 'komórka', 'telefon komórkowy', 'rozmowy', 'abonament'],
  phone_2: [],
  phone_3: [],
  phone_4: [],
  phone_5: [],
  phone_6: [],
  phone_7: [],
  phone_8: [],
  phone_9: [],
  phone_10: [],
  education: ['edukacja', 'nauka', 'szkoła', 'studia', 'kurs', 'kursy', 'szkolenie'],
  education_2: [],
  education_3: [],
  education_4: [],
  education_5: [],
  education_6: [],
  education_7: [],
  education_8: [],
  education_9: [],
  education_10: [],
  books: ['książka', 'książki', 'czytanie', 'biblioteka', 'księgarnia', 'lektura', 'powieść', 'podręcznik', 'literatura'],
  books_2: [],
  books_3: [],
  books_4: [],
  books_5: [],
  books_6: [],
  books_7: [],
  books_8: [],
  books_9: [],
  books_10: [],
  sport: ['sport', 'aktywność', 'piłka', 'piłka nożna', 'koszykówka', 'piłka do kosza', 'trening', 'zawody'],
  sport_2: [],
  sport_3: [],
  sport_4: [],
  sport_5: [],
  sport_6: [],
  sport_7: [],
  sport_8: [],
  sport_9: [],
  sport_10: [],
  gym: ['siłownia', 'sztanga', 'hantle', 'fitness', 'ćwiczenia', 'trening', 'trening siłowy', 'gym'],
  gaming: ['gaming', 'komputer', 'gry', 'gracz', 'granie', 'gra', 'pc', 'konsola', 'e-sport', 'esport'],
  entertainment: ['rozrywka', 'kino', 'film', 'filmy', 'seriale', 'telewizja'],
  cinema: ['kino', 'film', 'filmy', 'serial', 'seriale', 'telewizja', 'seans', 'ekran', 'projekcja'],
  gift: ['prezent', 'upominek', 'podarunek', 'niespodzianka'],
  clothes: ['ubrania', 'odzież', 'ciuchy', 'moda', 'garderoba'],
  pets: ['zwierzęta', 'zwierzę', 'pupil', 'pies', 'kot', 'weterynarz', 'karma', 'łapka'],
  child: ['dziecko', 'dzieci', 'niemowlę', 'rodzicielstwo', 'syn', 'córka'],
  savings: ['oszczędności', 'oszczędzanie', 'bank', 'konto', 'konto oszczędnościowe', 'lokata', 'skarbonka', 'fundusz'],
  cash: ['gotówka', 'pieniądze', 'banknot', 'banknoty', 'kasa', 'cash'],
  card: ['karta', 'płatność', 'płatności', 'karta płatnicza', 'debetowa', 'kredytowa'],
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
