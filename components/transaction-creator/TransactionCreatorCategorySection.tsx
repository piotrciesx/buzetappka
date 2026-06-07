import { CSSProperties } from "react";
import { getUniqueCategoryLabel } from "../../lib/categoryUtils";
import { Category, TransactionShortcut } from "./transactionCreatorTypes";

type Props = {
  level1Categories: Category[];
  availableLevel2Categories: Category[];
  availableLevel3Categories: Category[];
  level2ByParentId: Record<string, Category[]>;
  level3ByParentId: Record<string, Category[]>;
  categoriesById: Record<string, Category>;
  lockedLevel1Id: string | null;
  selectedLevel1Id: string | null;
  selectedLevel2Id: string | null;
  effectiveCategoryId: string | null;
  effectiveCategoryLabel: string;
  topShortcutCategories: TransactionShortcut[];
  pinnedShortcutCategories: TransactionShortcut[];
  pinnedCategoryIds: string[];
  recentShortcutCategories: TransactionShortcut[];
  styles: Record<string, CSSProperties>;
  handleShortcutClick: (categoryId: string) => void;
  handleLevel1Click: (category: Category) => void;
  handleLevel2Click: (category: Category) => void;
  handleLevel3Click: (category: Category) => void;
  onTogglePinnedCategory: (categoryId: string) => void;
};

const creatorShellStyle: CSSProperties = {
  display: "grid",
  gap: "var(--ui-space-7)",
  marginTop: "var(--ui-space-7)",
};

const creatorPanelStyle: CSSProperties = {
  display: "grid",
  gap: "var(--ui-space-6)",
  padding: "var(--ui-space-7)",
  border: "1px solid var(--ui-border-divider)",
  borderRadius: "var(--ui-radius-xl)",
  background: "var(--ui-surface-card)",
};

const creatorHeaderStyle: CSSProperties = {
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--ui-space-6)",
};

const creatorTitleStyle: CSSProperties = {
  minWidth: 0,
  display: "grid",
  gap: "var(--ui-space-2)",
};

const creatorTitleStrongStyle: CSSProperties = {
  color: "var(--ui-color-primary-navy)",
  fontSize: "var(--ui-type-t3)",
  fontWeight: "var(--ui-font-weight-bold)",
  lineHeight: "var(--ui-line-height-heading)",
};

const creatorTitleMetaStyle: CSSProperties = {
  color: "var(--ui-text-secondary)",
  fontSize: "var(--ui-type-helper)",
  fontWeight: "var(--ui-font-weight-medium)",
  lineHeight: "var(--ui-line-height-body)",
};

const shortcutGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: "var(--ui-space-5)",
};

const shortcutChipStyle: CSSProperties = {
  minWidth: 0,
  width: "100%",
  display: "grid",
  gridTemplateColumns: "32px minmax(0, 1fr)",
  alignItems: "center",
  gap: "var(--ui-space-5)",
  minHeight: 46,
  padding: "var(--ui-space-4) var(--ui-space-5)",
  border: "1px solid var(--ui-border-divider)",
  borderRadius: "var(--ui-radius-lg)",
  background: "var(--ui-surface-card)",
  color: "var(--ui-text-primary)",
  textAlign: "left",
  cursor: "pointer",
};

const selectedShortcutChipStyle: CSSProperties = {
  borderColor: "rgba(8, 44, 122, 0.32)",
  background: "var(--ui-color-soft-blue)",
};

const categoryIconStyle: CSSProperties = {
  width: 32,
  minWidth: 32,
  height: 32,
  display: "grid",
  placeItems: "center",
  borderRadius: 999,
  background: "var(--ui-tone-surface, #eaf2ff)",
  color: "var(--ui-tone-text, var(--ui-color-primary-navy))",
  fontSize: "var(--ui-type-helper)",
  fontWeight: "var(--ui-font-weight-bold)",
};

const chipCopyStyle: CSSProperties = {
  minWidth: 0,
  display: "grid",
  gap: 2,
};

const chipTitleStyle: CSSProperties = {
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  color: "var(--ui-color-primary-navy)",
  fontSize: "var(--ui-type-t4)",
  fontWeight: "var(--ui-font-weight-bold)",
  lineHeight: "var(--ui-line-height-compact)",
};

const chipMetaStyle: CSSProperties = {
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  color: "var(--ui-text-secondary)",
  fontSize: "var(--ui-type-helper)",
  fontWeight: "var(--ui-font-weight-medium)",
  lineHeight: "var(--ui-line-height-compact)",
};

const backButtonStyle: CSSProperties = {
  minHeight: 32,
  padding: "0 var(--ui-space-5)",
  border: "1px solid var(--ui-border-divider)",
  borderRadius: "var(--ui-radius-lg)",
  background: "var(--ui-surface-card)",
  color: "var(--ui-color-primary-navy)",
  fontSize: "var(--ui-type-helper)",
  fontWeight: "var(--ui-font-weight-bold)",
  cursor: "pointer",
};

const finalCardStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "42px minmax(0, 1fr) auto",
  alignItems: "center",
  gap: "var(--ui-space-6)",
  padding: "var(--ui-space-6)",
  border: "1px solid rgba(8, 44, 122, 0.18)",
  borderRadius: "var(--ui-radius-xl)",
  background:
    "linear-gradient(180deg, #ffffff 0%, var(--ui-color-soft-blue) 100%)",
};

const finalIconStyle: CSSProperties = {
  ...categoryIconStyle,
  width: 42,
  minWidth: 42,
  height: 42,
  fontSize: "var(--ui-type-t3)",
};

const helperStyle: CSSProperties = {
  color: "var(--ui-text-secondary)",
  fontSize: "var(--ui-type-helper)",
  lineHeight: "var(--ui-line-height-body)",
};

const getInitial = (label: string) =>
  label.trim().slice(0, 1).toLocaleUpperCase("pl-PL") || "•";

export default function TransactionCreatorCategorySection({
  level1Categories,
  availableLevel2Categories,
  availableLevel3Categories,
  level2ByParentId,
  level3ByParentId,
  categoriesById,
  lockedLevel1Id,
  selectedLevel1Id,
  selectedLevel2Id,
  effectiveCategoryId,
  effectiveCategoryLabel,
  topShortcutCategories,
  pinnedShortcutCategories,
  pinnedCategoryIds,
  recentShortcutCategories,
  handleShortcutClick,
  handleLevel1Click,
  handleLevel2Click,
  handleLevel3Click,
  onTogglePinnedCategory,
}: Props) {
  const selectedLevel1 = selectedLevel1Id
    ? categoriesById[selectedLevel1Id] || null
    : null;
  const selectedLevel2 = selectedLevel2Id
    ? categoriesById[selectedLevel2Id] || null
    : null;
  const effectiveCategory = effectiveCategoryId
    ? categoriesById[effectiveCategoryId] || null
    : null;

  const getLevel3ButtonLabel = (category: Category) => {
    return getUniqueCategoryLabel(
      category.id,
      categoriesById,
      availableLevel3Categories.map((item) => item.id),
    );
  };

  const renderCategoryButton = ({
    category,
    label,
    meta,
    isSelected,
    onClick,
  }: {
    category?: Category;
    label: string;
    meta?: string;
    isSelected?: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      data-transaction-category-chip="true"
      data-transaction-category-selected={isSelected ? "true" : "false"}
      data-transaction-category-tile="true"
      style={{
        ...shortcutChipStyle,
        ...(isSelected ? selectedShortcutChipStyle : {}),
      }}
      onClick={onClick}
    >
      <span data-transaction-category-icon="true" style={categoryIconStyle}>
        {getInitial(category?.name || label)}
      </span>
      <span style={chipCopyStyle}>
        <strong style={chipTitleStyle}>{label}</strong>
        {meta && <small style={chipMetaStyle}>{meta}</small>}
      </span>
    </button>
  );

  const renderShortcutList = (
    title: string,
    meta: string,
    shortcuts: TransactionShortcut[],
    isPriority = false,
  ) => {
    if (shortcuts.length === 0 || effectiveCategoryId || selectedLevel1Id) {
      return null;
    }

    return (
      <section
        style={creatorPanelStyle}
        data-transaction-shortcut-section="true"
      >
        <header style={creatorHeaderStyle}>
          <span style={creatorTitleStyle}>
            <strong style={creatorTitleStrongStyle}>{title}</strong>
            <small style={creatorTitleMetaStyle}>{meta}</small>
          </span>
        </header>
        <div style={shortcutGridStyle} data-transaction-shortcut-list="true">
          {shortcuts.map((shortcut) =>
            renderCategoryButton({
              label: shortcut.label,
              meta: isPriority ? "przypięta kategoria" : "szybki wybór",
              isSelected: effectiveCategoryId === shortcut.id,
              onClick: () => handleShortcutClick(shortcut.id),
            }),
          )}
        </div>
      </section>
    );
  };

  if (effectiveCategoryId) {
    const canGoBackToLevel3 =
      selectedLevel2 && availableLevel3Categories.length > 0;
    const canGoBackToLevel2 =
      selectedLevel1 && availableLevel2Categories.length > 0;

    return (
      <section
        style={creatorShellStyle}
        data-transaction-category-flow="true"
        data-flow-step="final"
      >
        <div style={finalCardStyle} data-transaction-final-category="true">
          <span style={finalIconStyle}>
            {getInitial(effectiveCategory?.name || effectiveCategoryLabel)}
          </span>
          <span style={chipCopyStyle}>
            <strong style={creatorTitleStrongStyle}>
              {effectiveCategory?.name || effectiveCategoryLabel}
            </strong>
            <small style={creatorTitleMetaStyle}>
              {effectiveCategoryLabel}
            </small>
          </span>
          <button
            type="button"
            style={backButtonStyle}
            onClick={() => {
              if (canGoBackToLevel3 && selectedLevel2) {
                handleLevel2Click(selectedLevel2);
                return;
              }

              if (canGoBackToLevel2 && selectedLevel1) {
                handleLevel1Click(selectedLevel1);
              }
            }}
          >
            zmień
          </button>
        </div>

        <button
          type="button"
          data-transaction-pin-button="true"
          data-transaction-pinned={
            pinnedCategoryIds.includes(effectiveCategoryId) ? "true" : "false"
          }
          aria-label={
            pinnedCategoryIds.includes(effectiveCategoryId)
              ? "Odepnij kategorię"
              : "Przypnij kategorię"
          }
          title={
            pinnedCategoryIds.includes(effectiveCategoryId)
              ? "Odepnij kategorię"
              : "Przypnij kategorię"
          }
          style={{ ...backButtonStyle, justifySelf: "start" }}
          onClick={() => onTogglePinnedCategory(effectiveCategoryId)}
        >
          {pinnedCategoryIds.includes(effectiveCategoryId)
            ? "odepnij kategorię"
            : "przypnij kategorię"}
        </button>
      </section>
    );
  }

  return (
    <section style={creatorShellStyle} data-transaction-category-flow="true">
      {renderShortcutList(
        "Przypięte kategorie",
        "Kliknięcie od razu otwiera formularz dla tej kategorii.",
        pinnedShortcutCategories,
        true,
      )}
      {renderShortcutList(
        "Szybkie kategorie",
        "Najczęściej używane kategorie.",
        topShortcutCategories,
      )}
      {renderShortcutList(
        "Ostatnio używane",
        "Ostatnie kategorie wpisów.",
        recentShortcutCategories,
      )}

      {!lockedLevel1Id && !selectedLevel1Id && (
        <section style={creatorPanelStyle} data-transaction-type-section="true">
          <header style={creatorHeaderStyle}>
            <span style={creatorTitleStyle}>
              <strong style={creatorTitleStrongStyle}>Co dodajesz?</strong>
              <small style={creatorTitleMetaStyle}>
                Wybierz przychód albo wydatek.
              </small>
            </span>
          </header>

          <div style={shortcutGridStyle} data-transaction-category-list="true">
            {level1Categories.map((category) => {
              const level2Children = level2ByParentId[category.id] || [];
              const isFinalHere = level2Children.length === 0;

              return renderCategoryButton({
                category,
                label: category.name,
                meta: isFinalHere ? "kategoria końcowa" : "przejdź dalej",
                isSelected: selectedLevel1Id === category.id,
                onClick: () => handleLevel1Click(category),
              });
            })}
          </div>
        </section>
      )}

      {selectedLevel1Id &&
        availableLevel2Categories.length > 0 &&
        !selectedLevel2Id && (
          <section
            style={creatorPanelStyle}
            data-transaction-entry-section="true"
          >
            <header style={creatorHeaderStyle}>
              <span style={creatorTitleStyle}>
                <strong style={creatorTitleStrongStyle}>
                  Wybierz kategorię
                </strong>
                <small style={creatorTitleMetaStyle}>
                  {selectedLevel1?.name || "Wybrany typ"}
                </small>
              </span>
              {!lockedLevel1Id && selectedLevel1 && (
                <button
                  type="button"
                  style={backButtonStyle}
                  onClick={() => handleLevel1Click(selectedLevel1)}
                >
                  odśwież
                </button>
              )}
            </header>

            <div
              style={shortcutGridStyle}
              data-transaction-category-list="true"
            >
              {availableLevel2Categories.map((level2Category) => {
                const level3Children =
                  level3ByParentId[level2Category.id] || [];
                const isFinalHere = level3Children.length === 0;

                return renderCategoryButton({
                  category: level2Category,
                  label: level2Category.name,
                  meta: isFinalHere
                    ? "kategoria końcowa"
                    : "wybierz podkategorię",
                  isSelected: selectedLevel2Id === level2Category.id,
                  onClick: () => handleLevel2Click(level2Category),
                });
              })}
            </div>
          </section>
        )}

      {selectedLevel1Id && availableLevel2Categories.length === 0 && (
        <section
          style={creatorPanelStyle}
          data-transaction-final-category-placeholder="true"
        >
          <strong style={creatorTitleStrongStyle}>
            {selectedLevel1?.name || "Wybrany typ"}
          </strong>
          <span style={helperStyle}>
            Ten typ nie ma niższych kategorii — wpis zapisze się bezpośrednio
            tutaj.
          </span>
        </section>
      )}

      {selectedLevel2Id && availableLevel3Categories.length > 0 && (
        <section
          style={creatorPanelStyle}
          data-transaction-subcategory-section="true"
        >
          <header style={creatorHeaderStyle}>
            <span style={creatorTitleStyle}>
              <strong style={creatorTitleStrongStyle}>
                Wybierz podkategorię
              </strong>
              <small style={creatorTitleMetaStyle}>
                {selectedLevel2?.name || "Wybrana kategoria"}
              </small>
            </span>
            {selectedLevel1 && (
              <button
                type="button"
                style={backButtonStyle}
                onClick={() => handleLevel1Click(selectedLevel1)}
              >
                ← kategorie
              </button>
            )}
          </header>

          <div style={shortcutGridStyle} data-transaction-category-list="true">
            {availableLevel3Categories.map((level3Category) =>
              renderCategoryButton({
                category: level3Category,
                label: getLevel3ButtonLabel(level3Category),
                meta: "kategoria końcowa",
                isSelected: effectiveCategoryId === level3Category.id,
                onClick: () => handleLevel3Click(level3Category),
              }),
            )}
          </div>
        </section>
      )}

      {selectedLevel2Id && availableLevel3Categories.length === 0 && (
        <section style={creatorPanelStyle}>
          <strong style={creatorTitleStrongStyle}>
            {selectedLevel2?.name || "Wybrana kategoria"}
          </strong>
          <span style={helperStyle}>
            Ta kategoria nie ma podkategorii — wpis zapisze się tutaj.
          </span>
        </section>
      )}
    </section>
  );
}
