"use client";

import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";
import CategoryIcon from "./CategoryIcon";
import {
  APP_ICONS,
  UI_COLOR_OPTIONS,
  getUiColor,
  getUiIcon,
  type UiColorKey,
  type UiIconKey,
} from "../lib/userAppearance";
import { supabase } from "../lib/supabaseClient";
import { StatusBox } from "./utility-panels/utilityPanelPrimitives";

type ProfileMonthNoteRow = {
  id: string;
  note: string | null;
};

type MonthNoteTone = UiColorKey;
type MonthNoteIcon = UiIconKey;
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

type NoteIconName = "plus" | "edit" | "trash" | "close" | "expand" | "info";

const NOTE_LIST_FORMAT = "budget-month-notes:v1";
const NOTE_PREVIEW_LIMIT = 4;
const NOTE_TEXT_LIMIT = 150;
const NOTE_DRAFT_LIMIT = 1000;

const NOTE_COLOR_OPTIONS = UI_COLOR_OPTIONS;
const NOTE_ICON_OPTIONS = APP_ICONS;
const SUGGESTED_NOTE_ICONS: MonthNoteIcon[] = [
  "note",
  "exchange",
  "calendar",
  "warning",
  "idea",
  "heart",
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


const HelpHint = ({ label }: { label: string }) => (
  <span data-ui-help="true" tabIndex={0} aria-label={label} data-tooltip={label}>
    i
  </span>
)

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
  NOTE_ICON_OPTIONS.find((option) => option.key === icon) ||
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
            icon: resolveIconOption(note.icon).key,
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
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isIconPickerExpanded, setIsIconPickerExpanded] = useState(false);
  const [activePicker, setActivePicker] = useState<'color' | 'icon' | null>(null);
  const [iconSearch, setIconSearch] = useState('');
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
      setSelectedNoteId(null);
      setIsIconPickerExpanded(false);
      setActivePicker(null);
      setIconSearch('');
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

  const selectedNote = useMemo(
    () => savedNotes.find((note) => note.id === selectedNoteId) || null,
    [savedNotes, selectedNoteId],
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
      icon: iconOption.key,
    }));
  };

  const startAddingNote = () => {
    setEditingNoteId(null);
    setDraft(createEmptyDraft());
    setIsIconPickerExpanded(false);
    setActivePicker(null);
    setIconSearch('');
    setIsFormOpen(true);
    setStatusText("");
    setErrorText("");
  };

  const editNote = (note: MonthNoteItem) => {
    setSelectedNoteId(null);
    setEditingNoteId(note.id);
    setDraft({
      text: note.text,
      tone: note.tone,
      icon: note.icon,
      category: note.category,
    });
    setActivePicker(null);
    setIconSearch('');
    setIsFormOpen(true);
    setStatusText("");
    setErrorText("");
  };

  const cancelForm = () => {
    setEditingNoteId(null);
    setDraft(createEmptyDraft());
    setIsIconPickerExpanded(false);
    setActivePicker(null);
    setIconSearch('');
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
    if (selectedNoteId === noteIdToDelete) {
      setSelectedNoteId(null);
    }

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

  const openNotePreview = (note: MonthNoteItem) => {
    setSelectedNoteId(note.id);
    setStatusText("");
    setErrorText("");
  };

  const handleNoteActionClick = (
    event: ReactMouseEvent<HTMLButtonElement>,
    action: () => void,
  ) => {
    event.stopPropagation();
    action();
  };

  const renderNoteCard = (
    note: MonthNoteItem,
    variant: "preview" | "detail",
  ) => {
    const shouldTruncate = note.text.length > NOTE_TEXT_LIMIT;
    const displayedText = shouldTruncate
      ? `${note.text.slice(0, NOTE_TEXT_LIMIT)}...`
      : note.text;

    return (
      <article
        key={note.id}
        data-ui-note-card="true"
        data-ui-tone={note.tone}
        data-ui-clickable="true"
        role="button"
        tabIndex={0}
        onClick={() => openNotePreview(note)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openNotePreview(note);
          }
        }}
      >
        <span data-ui-icon-tile="true">
          <CategoryIcon iconKey={note.icon} />
        </span>
        <div data-ui-note-copy="true">
          <strong>{displayedText}</strong>
          <small>
            {variant === "preview"
              ? formatNoteDate(note.updatedAt)
              : note.createdAt === note.updatedAt
                ? `Dodano: ${formatNoteDate(note.createdAt)}`
                : `Dodano: ${formatNoteDate(note.createdAt)} · Edytowano: ${formatNoteDate(note.updatedAt)}`}
          </small>
        </div>
        {variant === "detail" && (
          <div data-ui-note-actions="true">
            {shouldTruncate && (
              <button
                type="button"
                className="ui-button--utility"
                onClick={(event) => handleNoteActionClick(event, () => openNotePreview(note))}
              >
                Pokaż całość
              </button>
            )}
            <button
              type="button"
              className="ui-button--icon"
              aria-label="Edytuj notatkę"
              title="Edytuj"
              onClick={(event) => handleNoteActionClick(event, () => editNote(note))}
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
              onClick={(event) => handleNoteActionClick(event, () => deleteNote(note.id))}
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

  const renderColorPicker = () => {
    const selectedTone = resolveToneOption(draft.tone);
    const isOpen = activePicker === "color";

    return (
      <div
        data-ui-picker-control="true"
        data-ui-picker-variant="rich"
        data-open={isOpen ? "true" : "false"}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          data-ui-picker-trigger="true"
          aria-expanded={isOpen}
          onClick={() => setActivePicker(isOpen ? null : "color")}
        >
          <span data-ui-picker-value="true">
            <span data-ui-color-swatch="true" data-ui-tone={selectedTone.tone} />
            {selectedTone.label}
          </span>
          <span data-ui-picker-chevron="true">⌄</span>
        </button>
        {isOpen && (
          <div data-ui-picker-menu="true" data-layout="colors">
            {NOTE_COLOR_OPTIONS.map((option) => (
              <button
                key={option.tone}
                type="button"
                data-ui-color-option="true"
                data-ui-tone={option.tone}
                data-active={draft.tone === option.tone}
                aria-label={`Wybierz kolor: ${option.label}`}
                title={option.label}
                onClick={() => {
                  updateDraftTone(option.tone);
                  setActivePicker(null);
                }}
              >
                <span data-ui-color-swatch="true" data-ui-tone={option.tone} />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderIconPicker = () => {
    const selectedIcon = resolveIconOption(draft.icon);
    const isOpen = activePicker === "icon";
    const normalizedSearch = iconSearch.trim().toLocaleLowerCase("pl-PL");
    const baseIcons = isIconPickerExpanded
      ? NOTE_ICON_OPTIONS
      : NOTE_ICON_OPTIONS.filter((option) => SUGGESTED_NOTE_ICONS.includes(option.key));
    const visibleIcons = normalizedSearch
      ? NOTE_ICON_OPTIONS.filter((option) => option.label.toLocaleLowerCase("pl-PL").includes(normalizedSearch))
      : baseIcons;

    return (
      <div
        data-ui-picker-control="true"
        data-ui-picker-variant="rich"
        data-open={isOpen ? "true" : "false"}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          data-ui-picker-trigger="true"
          aria-expanded={isOpen}
          onClick={() => setActivePicker(isOpen ? null : "icon")}
        >
          <span data-ui-picker-value="true">
            <span data-ui-icon-tile="true" data-ui-tone={draft.tone}>
              <CategoryIcon iconKey={draft.icon} />
            </span>
            {selectedIcon.label}
          </span>
          <span data-ui-picker-chevron="true">⌄</span>
        </button>
        {isOpen && (
          <div data-ui-picker-menu="true" data-layout="icons">
            <label data-ui-picker-search="true">
              <input
                type="search"
                value={iconSearch}
                onChange={(event) => setIconSearch(event.target.value)}
                placeholder="Szukaj ikony..."
                autoFocus
              />
            </label>
            <div data-ui-picker-menu-grid="true">
              {visibleIcons.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  data-ui-icon-select-option="true"
                  data-ui-tone={draft.tone}
                  data-active={draft.icon === option.key}
                  aria-label={`Wybierz ikonę: ${option.label}`}
                  title={option.label}
                  onClick={() => {
                    updateDraftIcon(option.key);
                    setActivePicker(null);
                    setIconSearch("");
                  }}
                >
                  <span data-ui-icon-tile="true" data-ui-tone={draft.tone}>
                    <CategoryIcon iconKey={option.key} />
                  </span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
            {!isIconPickerExpanded && !normalizedSearch && (
              <button
                type="button"
                data-ui-picker-more="true"
                onClick={() => setIsIconPickerExpanded(true)}
              >
                Wybierz więcej ikon
              </button>
            )}
            {visibleIcons.length === 0 && (
              <div data-ui-picker-empty="true">Brak ikon dla tej nazwy.</div>
            )}
          </div>
        )}
      </div>
    );
  };

  const notePreviewModal = selectedNote ? (
    <div data-ui-overlay="true" onClick={() => setSelectedNoteId(null)}>
      <section
        data-ui-modal-shell="true"
        data-ui-size="note"
        onClick={(event) => event.stopPropagation()}
      >
        <header data-ui-modal-header="true">
          <div data-ui-title-row="true">
            <span data-ui-icon-tile="true" data-ui-tone={selectedNote.tone}>
              <CategoryIcon iconKey={selectedNote.icon} />
            </span>
            <div data-ui-title-copy="true">
              <strong>Podgląd notatki</strong>
              <span>
                {selectedNote.createdAt === selectedNote.updatedAt
                  ? `Dodano: ${formatNoteDate(selectedNote.createdAt)}`
                  : `Dodano: ${formatNoteDate(selectedNote.createdAt)} · Edytowano: ${formatNoteDate(selectedNote.updatedAt)}`}
              </span>
            </div>
          </div>
          <div data-ui-note-actions="true">
            <button
              type="button"
              className="ui-button--icon"
              aria-label="Edytuj notatkę"
              title="Edytuj"
              onClick={() => editNote(selectedNote)}
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
              onClick={() => deleteNote(selectedNote.id)}
            >
              <NoteIcon name="trash" />
            </button>
            <button
              type="button"
              className="ui-button--icon"
              aria-label="Zamknij"
              onClick={() => setSelectedNoteId(null)}
            >
              <NoteIcon name="close" />
            </button>
          </div>
        </header>

        <div data-ui-note-full="true">{selectedNote.text}</div>
      </section>
    </div>
  ) : null;

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
              <CategoryIcon iconKey="note" />
            </span>
            <div data-ui-title-copy="true">
              <span data-ui-title-with-help="true">
                <strong>Notatki miesiąca {selectedMonth}</strong>
                <HelpHint label="Wspólne notatki dla tego miesiąca. Widoczne są tylko dla Ciebie i tylko w tym miesiącu." />
              </span>
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
              <CategoryIcon iconKey="note" />
            </span>
            <strong data-ui-empty-title="true">Brak notatek dla tego miesiąca.</strong>
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
        onClick={(event) => {
          event.stopPropagation();
          if (activePicker) {
            setActivePicker(null);
          }
        }}
      >
        <header data-ui-modal-header="true">
          <div data-ui-title-row="true">
            <span data-ui-icon-tile="true" data-ui-tone={draft.tone}>
              <CategoryIcon iconKey={draft.icon} />
            </span>
            <div data-ui-title-copy="true">
              <span data-ui-title-with-help="true">
                <strong>{editingNote ? "Edytuj notatkę" : "Nowa notatka"}</strong>
                <HelpHint label={`Notatka będzie widoczna tylko dla Ciebie i tylko w miesiącu ${selectedMonth}.`} />
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
              data-ui-rich-select="true"
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

          <div data-ui-picker-row="true">
            <div data-ui-field="true">
              Kolor
              {renderColorPicker()}
            </div>
            <div data-ui-field="true">
              Ikona
              {renderIconPicker()}
            </div>
          </div>

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
              <CategoryIcon iconKey="note" />
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
              <CategoryIcon iconKey="note" />
            </span>
            <strong data-ui-empty-title="true">Brak notatek</strong>
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

      {hasMounted && notePreviewModal
        ? createPortal(notePreviewModal, document.body)
        : null}
      {hasMounted && detailsModal
        ? createPortal(detailsModal, document.body)
        : null}
      {hasMounted && formModal ? createPortal(formModal, document.body) : null}
    </>
  );
}
