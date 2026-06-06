"use client";

import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { supabase } from "../lib/supabaseClient";
import { StatusBox } from "./utility-panels/utilityPanelPrimitives";

type ProfileMonthNoteRow = {
  id: string;
  note: string | null;
};

type MonthNoteTone =
  | "blue"
  | "sky"
  | "yellow"
  | "orange"
  | "green"
  | "mint"
  | "violet"
  | "pink"
  | "red"
  | "neutral";
type MonthNoteIcon =
  | "exchange"
  | "car"
  | "health"
  | "basket"
  | "food"
  | "home"
  | "work"
  | "travel"
  | "card"
  | "cash"
  | "gift"
  | "phone"
  | "bill"
  | "warning"
  | "idea"
  | "heart"
  | "calendar"
  | "more"
  | "note";
type MonthNoteCategory = "Notatka" | "Przypomnienie" | "Informacja";

type MonthNoteItem = {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  tone: MonthNoteTone;
  icon: MonthNoteIcon;
  category: MonthNoteCategory;
};

type ProfileMonthNotePanelProps = {
  profileId: string;
  userId: string;
  selectedMonth: string;
  styles: Record<string, CSSProperties>;
};

type NoteIconName =
  | MonthNoteIcon
  | "plus"
  | "edit"
  | "trash"
  | "close"
  | "expand"
  | "info";

const NOTE_LIST_FORMAT = "budget-month-notes:v1";
const NOTE_PREVIEW_LIMIT = 4;
const NOTE_TEXT_LIMIT = 150;
const NOTE_DRAFT_LIMIT = 1000;

const NOTE_COLOR_OPTIONS: Array<{
  tone: MonthNoteTone;
  label: string;
}> = [
  { tone: "blue", label: "Niebieski" },
  { tone: "sky", label: "Błękitny" },
  { tone: "yellow", label: "Żółty" },
  { tone: "orange", label: "Pomarańczowy" },
  { tone: "green", label: "Zielony" },
  { tone: "mint", label: "Miętowy" },
  { tone: "violet", label: "Fioletowy" },
  { tone: "pink", label: "Różowy" },
  { tone: "red", label: "Czerwony" },
  { tone: "neutral", label: "Szary" },
];

const NOTE_ICON_OPTIONS: Array<{
  icon: MonthNoteIcon;
  label: string;
}> = [
  { icon: "note", label: "Notatka" },
  { icon: "exchange", label: "Wymiana" },
  { icon: "car", label: "Auto" },
  { icon: "health", label: "Zdrowie" },
  { icon: "basket", label: "Zakupy" },
  { icon: "food", label: "Jedzenie" },
  { icon: "home", label: "Dom" },
  { icon: "work", label: "Praca" },
  { icon: "travel", label: "Podróż" },
  { icon: "card", label: "Karta" },
  { icon: "cash", label: "Gotówka" },
  { icon: "gift", label: "Prezent" },
  { icon: "phone", label: "Telefon" },
  { icon: "bill", label: "Rachunek" },
  { icon: "warning", label: "Ważne" },
  { icon: "idea", label: "Pomysł" },
  { icon: "heart", label: "Osobiste" },
  { icon: "calendar", label: "Termin" },
  { icon: "more", label: "Inne" },
];

const CATEGORY_OPTIONS: MonthNoteCategory[] = [
  "Notatka",
  "Przypomnienie",
  "Informacja",
];

const NoteIcon = ({ name }: { name: NoteIconName }) => {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
      {name === "note" && (
        <>
          <path
            d="M7 4h8l3 3v13H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
            {...common}
          />
          <path d="M15 4v4h4M8.5 12h7M8.5 16h5" {...common} />
        </>
      )}
      {name === "exchange" && (
        <>
          <path d="M7 7h10l-3-3" {...common} />
          <path d="M17 17H7l3 3" {...common} />
          <path d="M17 7l-3 3M7 17l3-3" {...common} />
        </>
      )}
      {name === "car" && (
        <>
          <path d="M5 12l2-5h10l2 5" {...common} />
          <path d="M4 12h16v6H4z" {...common} />
          <path d="M7 18v2M17 18v2" {...common} />
          <circle cx="8" cy="15" r="1" {...common} />
          <circle cx="16" cy="15" r="1" {...common} />
        </>
      )}
      {name === "health" && (
        <>
          <path d="M8 4v6a4 4 0 0 0 8 0V4" {...common} />
          <path d="M6 4h4M14 4h4" {...common} />
          <path d="M12 14v2a4 4 0 0 0 8 0v-1" {...common} />
          <circle cx="20" cy="13" r="1.6" {...common} />
        </>
      )}
      {name === "basket" && (
        <>
          <path d="M6 9h12l-1.2 10H7.2z" {...common} />
          <path d="M9 9a3 3 0 0 1 6 0" {...common} />
          <path d="M9 13h6M10 16h4" {...common} />
        </>
      )}
      {name === "food" && (
        <>
          <path d="M7 3v8M10 3v8M7 7h3M8.5 11v10" {...common} />
          <path d="M16 3c2 2.4 2 6.6 0 9v9" {...common} />
        </>
      )}
      {name === "home" && (
        <>
          <path d="M4 11 12 4l8 7" {...common} />
          <path d="M6.5 10.5V20h11v-9.5" {...common} />
          <path d="M10 20v-5h4v5" {...common} />
        </>
      )}
      {name === "work" && (
        <>
          <rect x="4" y="7" width="16" height="12" rx="2" {...common} />
          <path d="M9 7V5h6v2M4 12h16" {...common} />
        </>
      )}
      {name === "travel" && (
        <>
          <path d="M4 16l16-8" {...common} />
          <path d="m14 5 6 3-4 2" {...common} />
          <path d="M8 14 5 9l3-1 4 4" {...common} />
          <path d="M6 19h12" {...common} />
        </>
      )}
      {name === "card" && (
        <>
          <rect x="3.5" y="6" width="17" height="12" rx="2" {...common} />
          <path d="M3.5 10h17M7 15h4" {...common} />
        </>
      )}
      {name === "cash" && (
        <>
          <rect x="3" y="7" width="18" height="10" rx="2" {...common} />
          <circle cx="12" cy="12" r="2.2" {...common} />
          <path d="M6 10v4M18 10v4" {...common} />
        </>
      )}
      {name === "gift" && (
        <>
          <path d="M4 10h16v10H4zM4 10h16V7H4zM12 7v13" {...common} />
          <path d="M12 7c-3 0-4-1-4-2.2C8 3.8 9 3 10 3c1.2 0 2 1.2 2 4Z" {...common} />
          <path d="M12 7c3 0 4-1 4-2.2C16 3.8 15 3 14 3c-1.2 0-2 1.2-2 4Z" {...common} />
        </>
      )}
      {name === "phone" && (
        <>
          <rect x="7" y="3" width="10" height="18" rx="2" {...common} />
          <path d="M11 17h2" {...common} />
        </>
      )}
      {name === "bill" && (
        <>
          <path d="M7 3h10v18l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2z" {...common} />
          <path d="M9.5 8h5M9.5 12h5M9.5 16h3" {...common} />
        </>
      )}
      {name === "warning" && (
        <>
          <path d="M12 3 3 20h18z" {...common} />
          <path d="M12 9v5M12 17h.01" {...common} />
        </>
      )}
      {name === "idea" && (
        <>
          <path d="M9 18h6M10 21h4" {...common} />
          <path d="M8 11a4 4 0 1 1 8 0c0 2-1.2 3-2.2 4H10.2C9.2 14 8 13 8 11Z" {...common} />
        </>
      )}
      {name === "heart" && (
        <path d="M20 8.5c0 5-8 10.5-8 10.5S4 13.5 4 8.5A4.2 4.2 0 0 1 12 6a4.2 4.2 0 0 1 8 2.5Z" {...common} />
      )}
      {name === "calendar" && (
        <>
          <rect x="4" y="5" width="16" height="15" rx="2" {...common} />
          <path d="M8 3v4M16 3v4M4 10h16" {...common} />
        </>
      )}
      {name === "more" && (
        <>
          <circle cx="6" cy="12" r="1.2" {...common} />
          <circle cx="12" cy="12" r="1.2" {...common} />
          <circle cx="18" cy="12" r="1.2" {...common} />
        </>
      )}
      {name === "plus" && <path d="M12 5v14M5 12h14" {...common} />}
      {name === "edit" && (
        <>
          <path d="M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16z" {...common} />
          <path d="M13 6l5 5" {...common} />
        </>
      )}
      {name === "trash" && (
        <>
          <path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14" {...common} />
          <path d="M10 11v6M14 11v6" {...common} />
        </>
      )}
      {name === "close" && <path d="M6 6l12 12M18 6 6 18" {...common} />}
      {name === "expand" && <path d="M8 9l4 4 4-4" {...common} />}
      {name === "info" && (
        <>
          <circle cx="12" cy="12" r="9" {...common} />
          <path d="M12 11v5M12 8h.01" {...common} />
        </>
      )}
    </svg>
  );
};

const createNoteId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const formatNoteDate = (value: string) =>
  new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const resolveToneOption = (tone?: string) =>
  NOTE_COLOR_OPTIONS.find((option) => option.tone === tone) ||
  NOTE_COLOR_OPTIONS[0];

const resolveIconOption = (icon?: string) =>
  NOTE_ICON_OPTIONS.find((option) => option.icon === icon) ||
  NOTE_ICON_OPTIONS[0];

const parseSavedNotes = (rawNote: string): MonthNoteItem[] => {
  const trimmedNote = rawNote.trim();

  if (!trimmedNote) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmedNote) as unknown;
    const parsedObject = parsed as { format?: unknown; notes?: unknown };

    if (
      parsed &&
      typeof parsed === "object" &&
      parsedObject.format === NOTE_LIST_FORMAT &&
      Array.isArray(parsedObject.notes)
    ) {
      return (parsedObject.notes as Array<Partial<MonthNoteItem>>)
        .filter((note) => typeof note.text === "string" && note.text.trim())
        .map((note) => {
          const toneOption = resolveToneOption(note.tone);

          return {
            id: typeof note.id === "string" ? note.id : createNoteId(),
            text: note.text?.trim() || "",
            createdAt:
              typeof note.createdAt === "string"
                ? note.createdAt
                : new Date().toISOString(),
            updatedAt:
              typeof note.updatedAt === "string"
                ? note.updatedAt
                : new Date().toISOString(),
            tone: toneOption.tone,
            icon: resolveIconOption(note.icon).icon,
            category: CATEGORY_OPTIONS.includes(
              note.category as MonthNoteCategory,
            )
              ? (note.category as MonthNoteCategory)
              : "Notatka",
          };
        });
    }
  } catch {
    // Starsze notatki były zwykłym tekstem. Pokazujemy je jako jedną notatkę.
  }

  return [
    {
      id: createNoteId(),
      text: trimmedNote,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tone: "blue",
      icon: "note",
      category: "Notatka",
    },
  ];
};

const serializeNotes = (notes: MonthNoteItem[]) => {
  if (notes.length === 0) {
    return "";
  }

  return JSON.stringify({
    format: NOTE_LIST_FORMAT,
    notes,
  });
};

const createEmptyDraft = () => ({
  text: "",
  tone: "blue" as MonthNoteTone,
  icon: "note" as MonthNoteIcon,
  category: "Notatka" as MonthNoteCategory,
});

export default function ProfileMonthNotePanel({
  profileId,
  userId,
  selectedMonth,
  styles: _styles,
}: ProfileMonthNotePanelProps) {
  void _styles;

  const [hasMounted, setHasMounted] = useState(false);
  const [noteId, setNoteId] = useState<string | null>(null);
  const [draft, setDraft] = useState(createEmptyDraft);
  const [savedNotes, setSavedNotes] = useState<MonthNoteItem[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [expandedNoteIds, setExpandedNoteIds] = useState<string[]>([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const loadNote = useCallback(async () => {
    if (!profileId || !selectedMonth) {
      setNoteId(null);
      setDraft(createEmptyDraft());
      setSavedNotes([]);
      return;
    }

    setIsLoading(true);
    setStatusText("");
    setErrorText("");

    try {
      const { data, error } = await supabase
        .from("profile_month_notes")
        .select("id, note")
        .eq("profile_id", profileId)
        .eq("month", selectedMonth)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      const noteRow = data as ProfileMonthNoteRow | null;

      setNoteId(noteRow?.id || null);
      setDraft(createEmptyDraft());
      setSavedNotes(parseSavedNotes(noteRow?.note || ""));
      setEditingNoteId(null);
      setExpandedNoteIds([]);
      setIsFormOpen(false);
    } catch (error) {
      setNoteId(null);
      setDraft(createEmptyDraft());
      setSavedNotes([]);
      setErrorText(
        error instanceof Error
          ? error.message
          : "Nie udało się wczytać notatek miesiąca.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [profileId, selectedMonth]);

  useEffect(() => {
    void loadNote();
  }, [loadNote]);

  const persistNotes = useCallback(
    async (nextNotes: MonthNoteItem[], successText: string) => {
      if (!profileId || !selectedMonth) {
        setErrorText(
          "Nie udało się zapisać notatki: brak aktywnego profilu lub miesiąca.",
        );
        return;
      }

      setIsSaving(true);
      setStatusText("");
      setErrorText("");

      try {
        const payload = {
          note: serializeNotes(nextNotes),
          updated_by: userId || null,
          updated_at: new Date().toISOString(),
        };

        if (noteId) {
          const { error } = await supabase
            .from("profile_month_notes")
            .update(payload)
            .eq("id", noteId)
            .eq("profile_id", profileId)
            .eq("month", selectedMonth);

          if (error) {
            throw new Error(error.message);
          }
        } else {
          const { data, error } = await supabase
            .from("profile_month_notes")
            .insert({
              profile_id: profileId,
              month: selectedMonth,
              ...payload,
            })
            .select("id, note")
            .single();

          if (error) {
            throw new Error(error.message);
          }

          const noteRow = data as ProfileMonthNoteRow | null;
          setNoteId(noteRow?.id || null);
        }

        setSavedNotes(nextNotes);
        setDraft(createEmptyDraft());
        setEditingNoteId(null);
        setIsFormOpen(false);
        setStatusText(successText);
      } catch (error) {
        setErrorText(
          error instanceof Error
            ? error.message
            : "Nie udało się zapisać notatki miesiąca.",
        );
      } finally {
        setIsSaving(false);
      }
    },
    [noteId, profileId, selectedMonth, userId],
  );

  const editingNote = useMemo(
    () => savedNotes.find((note) => note.id === editingNoteId) || null,
    [editingNoteId, savedNotes],
  );

  const previewNotes = savedNotes.slice(0, NOTE_PREVIEW_LIMIT);

  const updateDraftTone = (tone: MonthNoteTone) => {
    const toneOption = resolveToneOption(tone);
    setDraft((previousValue) => ({
      ...previousValue,
      tone: toneOption.tone,
    }));
  };

  const updateDraftIcon = (icon: MonthNoteIcon) => {
    const iconOption = resolveIconOption(icon);
    setDraft((previousValue) => ({
      ...previousValue,
      icon: iconOption.icon,
    }));
  };

  const startAddingNote = () => {
    setEditingNoteId(null);
    setDraft(createEmptyDraft());
    setIsFormOpen(true);
    setStatusText("");
    setErrorText("");
  };

  const editNote = (note: MonthNoteItem) => {
    setEditingNoteId(note.id);
    setDraft({
      text: note.text,
      tone: note.tone,
      icon: note.icon,
      category: note.category,
    });
    setIsFormOpen(true);
    setStatusText("");
    setErrorText("");
  };

  const cancelForm = () => {
    setEditingNoteId(null);
    setDraft(createEmptyDraft());
    setIsFormOpen(false);
    setStatusText("");
    setErrorText("");
  };

  const saveDraft = () => {
    const nextText = draft.text.trim();

    if (!nextText) {
      setErrorText("Wpisz treść notatki przed zapisem.");
      return;
    }

    const now = new Date().toISOString();
    const nextNotes = editingNote
      ? savedNotes.map((note) =>
          note.id === editingNote.id
            ? {
                ...note,
                text: nextText,
                tone: draft.tone,
                icon: draft.icon,
                category: draft.category,
                updatedAt: now,
              }
            : note,
        )
      : [
          {
            id: createNoteId(),
            text: nextText,
            tone: draft.tone,
            icon: draft.icon,
            category: draft.category,
            createdAt: now,
            updatedAt: now,
          },
          ...savedNotes,
        ];

    void persistNotes(
      nextNotes,
      editingNote ? "Zapisano zmiany notatki." : "Dodano notatkę.",
    );
  };

  const deleteNote = (noteIdToDelete: string) => {
    const nextNotes = savedNotes.filter((note) => note.id !== noteIdToDelete);
    void persistNotes(nextNotes, "Usunięto notatkę.");
  };

  const toggleExpandedNote = (noteIdToToggle: string) => {
    setExpandedNoteIds((previousValue) =>
      previousValue.includes(noteIdToToggle)
        ? previousValue.filter((id) => id !== noteIdToToggle)
        : [...previousValue, noteIdToToggle],
    );
  };

  const renderNoteCard = (
    note: MonthNoteItem,
    variant: "preview" | "detail",
  ) => {
    const isExpanded = expandedNoteIds.includes(note.id);
    const shouldTruncate = note.text.length > NOTE_TEXT_LIMIT;
    const displayedText =
      variant === "detail" && (isExpanded || !shouldTruncate)
        ? note.text
        : shouldTruncate
          ? `${note.text.slice(0, NOTE_TEXT_LIMIT)}...`
          : note.text;

    return (
      <article key={note.id} data-ui-note-card="true" data-ui-tone={note.tone}>
        <span data-ui-icon-tile="true">
          <NoteIcon name={note.icon} />
        </span>
        <div data-ui-note-copy="true">
          <strong>{displayedText}</strong>
          {variant === "detail" && <p>{note.text}</p>}
          <small>
            {variant === "preview"
              ? formatNoteDate(note.updatedAt)
              : `Dodano: ${formatNoteDate(note.createdAt)} · Edytowano: ${formatNoteDate(note.updatedAt)}`}
          </small>
        </div>
        {variant === "detail" && (
          <div data-ui-note-actions="true">
            {shouldTruncate && (
              <button
                type="button"
                className="ui-button--utility"
                onClick={() => toggleExpandedNote(note.id)}
              >
                {isExpanded ? "Zwiń" : "Pokaż więcej"}
              </button>
            )}
            <button
              type="button"
              className="ui-button--icon"
              aria-label="Edytuj notatkę"
              title="Edytuj"
              onClick={() => editNote(note)}
            >
              <NoteIcon name="edit" />
            </button>
            <button
              type="button"
              className="ui-button--icon"
              data-button-tone="danger"
              aria-label="Usuń notatkę"
              title="Usuń"
              disabled={isSaving}
              onClick={() => deleteNote(note.id)}
            >
              <NoteIcon name="trash" />
            </button>
          </div>
        )}
      </article>
    );
  };

  const noteCountLabel = `${savedNotes.length} ${savedNotes.length === 1 ? "notatka" : "notatki"}`;
  const draftLength = draft.text.trim().length;

  const detailsModal = isDetailsOpen ? (
    <div data-ui-overlay="true" onClick={() => setIsDetailsOpen(false)}>
      <section
        data-ui-modal-shell="true"
        data-ui-size="wide"
        onClick={(event) => event.stopPropagation()}
      >
        <header data-ui-modal-header="true">
          <div data-ui-title-row="true">
            <span data-ui-icon-tile="true" data-ui-tone="blue">
              <NoteIcon name="note" />
            </span>
            <div data-ui-title-copy="true">
              <strong>Notatki miesiąca {selectedMonth}</strong>
              <span>Wspólne notatki profilu dla bieżącego miesiąca.</span>
            </div>
          </div>
          <div data-ui-note-actions="true">
            <button
              type="button"
              className="ui-button--standard"
              onClick={startAddingNote}
            >
              <NoteIcon name="plus" />
              Dodaj notatkę
            </button>
            <button
              type="button"
              className="ui-button--icon"
              aria-label="Zamknij"
              onClick={() => setIsDetailsOpen(false)}
            >
              <NoteIcon name="close" />
            </button>
          </div>
        </header>

        <div data-ui-filter-row="true">
          <span data-ui-filter-pill="true" data-active="true">
            Wszystkie {savedNotes.length}
          </span>
          <span data-ui-filter-pill="true">
            Notatki{" "}
            {savedNotes.filter((note) => note.category === "Notatka").length}
          </span>
          <span data-ui-filter-pill="true">
            Przypomnienia{" "}
            {
              savedNotes.filter((note) => note.category === "Przypomnienie")
                .length
            }
          </span>
          <span data-ui-filter-pill="true">
            Informacje{" "}
            {savedNotes.filter((note) => note.category === "Informacja").length}
          </span>
        </div>

        {!isLoading && savedNotes.length === 0 && (
          <div data-ui-empty-block="true">
            <span data-ui-icon-tile="true" data-ui-tone="neutral">
              <NoteIcon name="note" />
            </span>
            <strong>Brak notatek dla tego miesiąca.</strong>
            <span>
              Dodaj krótką informację, do której chcesz wrócić przy rozliczaniu
              miesiąca.
            </span>
            <button
              type="button"
              className="ui-button--standard"
              onClick={startAddingNote}
            >
              Dodaj notatkę
            </button>
          </div>
        )}

        {savedNotes.length > 0 && (
          <div data-ui-card-list="true">
            {savedNotes.map((note) => renderNoteCard(note, "detail"))}
          </div>
        )}

        <footer data-ui-modal-footer="true">
          <span data-ui-inline-info="true">
            <NoteIcon name="info" />
            Notatki są widoczne tylko dla Ciebie i zapisywane dla tego miesiąca.
          </span>
        </footer>

        {statusText && <StatusBox tone="success">{statusText}</StatusBox>}
        {errorText && <StatusBox tone="danger">{errorText}</StatusBox>}
      </section>
    </div>
  ) : null;

  const formModal = isFormOpen ? (
    <div data-ui-overlay="true" onClick={cancelForm}>
      <section
        data-ui-modal-shell="true"
        data-ui-size="form"
        onClick={(event) => event.stopPropagation()}
      >
        <header data-ui-modal-header="true">
          <div data-ui-title-row="true">
            <span data-ui-icon-tile="true" data-ui-tone={draft.tone}>
              <NoteIcon name={draft.icon} />
            </span>
            <div data-ui-title-copy="true">
              <strong>{editingNote ? "Edytuj notatkę" : "Nowa notatka"}</strong>
              <span>
                Notatka będzie widoczna tylko w miesiącu {selectedMonth}.
              </span>
            </div>
          </div>
          <button
            type="button"
            className="ui-button--icon"
            aria-label="Zamknij"
            onClick={cancelForm}
          >
            <NoteIcon name="close" />
          </button>
        </header>

        <div data-ui-form-shell="true">
          <textarea
            value={draft.text}
            maxLength={NOTE_DRAFT_LIMIT}
            onChange={(event) => {
              setDraft((previousValue) => ({
                ...previousValue,
                text: event.target.value,
              }));
              setStatusText("");
              setErrorText("");
            }}
            placeholder="Wpisz treść notatki..."
            disabled={isLoading || isSaving}
            rows={8}
            className="ui-textarea"
            data-input-width="full"
          />

          <div data-ui-form-meta="true">
            <span>Maksymalnie {NOTE_DRAFT_LIMIT} znaków.</span>
            <span>
              {draftLength} / {NOTE_DRAFT_LIMIT}
            </span>
          </div>

          <label data-ui-field="true">
            Kategoria notatki
            <select
              className="ui-select"
              data-input-width="full"
              value={draft.category}
              onChange={(event) =>
                setDraft((previousValue) => ({
                  ...previousValue,
                  category: event.target.value as MonthNoteCategory,
                }))
              }
            >
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <div data-ui-field="true">
            Kolor ikonki
            <div data-ui-color-picker="true">
              {NOTE_COLOR_OPTIONS.map((option) => (
                <button
                  key={option.tone}
                  type="button"
                  data-ui-color-dot="true"
                  data-ui-tone={option.tone}
                  data-active={draft.tone === option.tone}
                  aria-label={`Wybierz kolor: ${option.label}`}
                  title={option.label}
                  onClick={() => updateDraftTone(option.tone)}
                >
                  <span />
                </button>
              ))}
            </div>
          </div>

          <details data-ui-compact-picker="true">
            <summary>
              <span>Ikona</span>
              <span data-ui-picker-preview="true">
                <span data-ui-icon-tile="true" data-ui-tone={draft.tone}>
                  <NoteIcon name={draft.icon} />
                </span>
                {resolveIconOption(draft.icon).label}
              </span>
            </summary>
            <div data-ui-icon-picker="true">
              {NOTE_ICON_OPTIONS.map((option) => (
                <button
                  key={option.icon}
                  type="button"
                  data-ui-icon-option="true"
                  data-active={draft.icon === option.icon}
                  aria-label={`Wybierz ikonę: ${option.label}`}
                  title={option.label}
                  onClick={() => updateDraftIcon(option.icon)}
                >
                  <span data-ui-icon-tile="true" data-ui-tone={draft.tone}>
                    <NoteIcon name={option.icon} />
                  </span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </details>

          <footer data-ui-form-actions="true">
            <button
              type="button"
              className="ui-button--utility"
              disabled={isLoading || isSaving}
              onClick={cancelForm}
            >
              Anuluj
            </button>
            <button
              type="button"
              className="ui-button--standard"
              disabled={isLoading || isSaving || !draft.text.trim()}
              onClick={saveDraft}
            >
              {isSaving
                ? "Zapisywanie..."
                : editingNote
                  ? "Zapisz zmiany"
                  : "Zapisz notatkę"}
            </button>
          </footer>
        </div>

        {errorText && <StatusBox tone="danger">{errorText}</StatusBox>}
      </section>
    </div>
  ) : null;

  return (
    <>
      <section data-ui-popup-shell="true">
        <header data-ui-popup-header="true">
          <div data-ui-title-row="true">
            <span data-ui-icon-tile="true" data-ui-tone="blue">
              <NoteIcon name="note" />
            </span>
            <div data-ui-title-copy="true">
              <strong>Notatki miesiąca</strong>
              <small>{isLoading ? "Ładowanie..." : noteCountLabel}</small>
            </div>
          </div>
          <button
            type="button"
            className="ui-button--icon"
            aria-label="Dodaj notatkę"
            onClick={startAddingNote}
          >
            <NoteIcon name="plus" />
          </button>
        </header>

        {isLoading && <StatusBox>Ładowanie notatek...</StatusBox>}

        {!isLoading && previewNotes.length === 0 && (
          <div data-ui-empty-block="true">
            <span data-ui-icon-tile="true" data-ui-tone="neutral">
              <NoteIcon name="note" />
            </span>
            <strong>Brak notatek</strong>
            <span>Dodaj krótką informację do zapamiętania w tym miesiącu.</span>
          </div>
        )}

        {previewNotes.length > 0 && (
          <div data-ui-card-list="true" data-ui-density="compact">
            {previewNotes.map((note) => renderNoteCard(note, "preview"))}
          </div>
        )}

        <footer data-ui-popup-footer="true">
          <button
            type="button"
            className="ui-button--utility"
            onClick={() => setIsDetailsOpen(true)}
          >
            Pokaż szczegóły
            <NoteIcon name="expand" />
          </button>
        </footer>

        {statusText && <StatusBox tone="success">{statusText}</StatusBox>}
        {errorText && <StatusBox tone="danger">{errorText}</StatusBox>}
      </section>

      {hasMounted && detailsModal
        ? createPortal(detailsModal, document.body)
        : null}
      {hasMounted && formModal ? createPortal(formModal, document.body) : null}
    </>
  );
}
