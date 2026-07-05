# Limity budżetowe — funkcjonalne domknięcie v1

## Zakres domknięcia

V1 dostarcza samodzielny moduł zarządzania limitami. Pozycja „Budżety i limity” otwiera listę planów, kreator i szczegóły. Warunkiem działania jest zastosowanie addytywnej migracji `sql/budget_limits_stage_2.sql`.

Legacy tabela `budget_limits`, edytor limitu w drzewie kategorii, istniejące dane i wskaźniki pozostają zachowane. Migracja wykonuje bezpieczny backfill legacy planów, wersji i miesięcznych okresów bez kasowania źródłowych rekordów.

## Typy limitów działające w v1

- miesięczny limit kategorii L2, obejmujący L2 i bezpośrednie L3;
- miesięczny limit kategorii L3;
- miesięczny globalny limit wszystkich wydatków.

Grupa wielu kategorii pozostaje w domenie i schemacie, ale nie w kreatorze v1. Wymaga osobnego modelu wielokrotnego wyboru i wersjonowania członkostwa.

## Działające akcje

- otwarcie modułu z nawigacji bocznej;
- lista aktywnych i archiwalnych limitów;
- dodanie limitu;
- edycja limitu przez utworzenie/aktualizację wersji od wybranego miesiąca;
- kliknięcie karty i otwarcie szczegółów;
- archiwizacja bez usuwania wersji, okresów, alertów i historii;
- oznaczenie alertu jako przeczytanego;
- wyciszenie alertu dla konkretnego okresu;
- podgląd kwalifikowanych transakcji;
- podgląd historii miesiąc po miesiącu.

## Pola kreatora

- nazwa;
- typ: L2, L3, globalny Wydatki;
- kategoria odpowiedniego poziomu dla L2/L3;
- kwota większa od zera;
- miesiąc obowiązywania wersji;
- progi alertów jako uporządkowana lista wartości 1–99;
- włączenie alertu ryzyka prognozy;
- status aktywny/archiwalny.

## Alerty v1

- `threshold_reached` dla każdego skonfigurowanego progu;
- `limit_exceeded` po osiągnięciu 100%;
- `projected_exceeded`, jeżeli bezpieczna prognoza domenowa wskazuje przekroczenie;
- stan nieprzeczytany/przeczytany;
- trwałe wyciszenie dla okresu.

Alerty są informacyjne i nie blokują dodawania ani edycji transakcji.

## Dane karty

- nazwa i zakres;
- miesiąc;
- limit, wydano i pozostało;
- procent oraz status `safe | warning | exceeded`;
- prognoza końca miesiąca;
- wartość paska wykorzystania.

## Dane szczegółów

- wszystkie dane karty;
- progi;
- alerty i ich stan;
- transakcje wchodzące do limitu;
- liczba oraz wartość wykorzystania;
- prognoza;
- historia miesięczna: limit, wydano, pozostało, procent, status i alerty.

## Zasady transakcji

- liczą się tylko wydatki rozpoznane przez centralny signed/root contract;
- przychody i wpisy usunięte nie zużywają limitu;
- zakres L2/L3 jest liczony przez `lib/budget-limits`;
- wpis bez dnia wchodzi do pełnego miesiąca jako `month_only`, bez udawania pierwszego dnia;
- kalkulacje używają groszy;
- nakładające się plany liczą wyniki niezależnie.

## Historia i wersje

Zmiana limitu nie nadpisuje zamkniętej historii. Plan ma wersje obowiązujące w czasie, a miesiąc ma osobną instancję okresu. Migracja materializuje okresy legacy. Nowe okresy są materializowane przy pracy z danym miesiącem.

Kolumny snapshotów zamkniętego miesiąca są przygotowane. Automatyczne zamykanie miesiąca i utrwalanie snapshotu wyniku pozostaje świadomie poza v1; do czasu snapshotu historia jest przeliczana z aktualnego centralnego scope transakcji.

## Poza v1

- limit jawnej grupy wielu kategorii w kreatorze;
- zakresy jednorazowe i niestandardowe cykle;
- rekomendowanie kwoty limitu;
- zaawansowane predykcje;
- automatyczne rozwiązywanie alertów po cofnięciu wydatku;
- automatyczne snapshotowanie przy zamknięciu miesiąca;
- pełny dual-write między legacy edytorem drzewa i nowym modelem;
- finalny projekt wizualny.

## Backlog zaawansowany

- snapshot hierarchii kategorii i członkostwa grupy dla zamkniętych okresów;
- przeliczenia audytowe po odblokowaniu historii;
- niestandardowe okresy rozliczeniowe;
- polityki refundów i transferów po wprowadzeniu jawnej semantyki transakcji;
- agregacja wielu nakładających się alertów.

## Niezbywalne zasady dla późniejszego UI

- limit nigdy nie blokuje transakcji;
- `safe/warning/exceeded`, `read/muted` i `active/archived` są osobnymi osiami;
- karta i szczegóły muszą używać tego samego kalkulatora i scope;
- nie wolno filtrować transakcji ponownie lokalnie w komponencie;
- `category_id = null` nie może być jedynym sposobem rozpoznania globalnego limitu;
- archiwizacja nie usuwa historii;
- nie usuwać legacy do czasu kontrolowanej migracji i dual-write;
- wejście z drzewa docelowo przekazuje stabilne `planId`, nie tylko `categoryId`.
