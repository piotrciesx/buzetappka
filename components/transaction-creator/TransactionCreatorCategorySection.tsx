import { CSSProperties, useMemo, useState } from "react";
import { getUniqueCategoryLabel } from "../../lib/categoryUtils";
import CategoryIcon from "../CategoryIcon";
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

type ShortcutMenuKey = "recent" | "frequent" | "pinned" | null;

type CategoryWithAppearance = Category & {
  icon?: string | null;
  icon_key?: string | null;
  category_icon?: string | null;
  color?: string | null;
  color_tone?: string | null;
};

const flowShellStyle: CSSProperties = {
  display: "grid",
  gap: "var(--ui-space-6)",
  marginTop: "var(--ui-space-7)",
};

const panelStyle: CSSProperties = {
  display: "grid",
  gap: "var(--ui-space-5)",
  padding: "var(--ui-space-7)",
  border: "1px solid rgba(8, 44, 122, 0.24)",
  borderRadius: "var(--ui-radius-2xl)",
  background: "linear-gradient(180deg, #ffffff 0%, var(--ui-color-extra-light-blue) 100%)",
  boxShadow: "inset 0 0 0 1px rgba(8, 44, 122, 0.05)",
};

const compactHeaderStyle: CSSProperties = {
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--ui-space-6)",
};

const titleWrapStyle: CSSProperties = {
  minWidth: 0,
  display: "grid",
  gap: "var(--ui-space-2)",
};

const titleStyle: CSSProperties = {
  color: "var(--ui-color-primary-navy)",
  fontSize: "var(--ui-type-t3)",
  fontWeight: "var(--ui-font-weight-bold)",
  lineHeight: "var(--ui-line-height-heading)",
};

const metaStyle: CSSProperties = {
  color: "var(--ui-text-secondary)",
  fontSize: "var(--ui-type-helper)",
  fontWeight: "var(--ui-font-weight-medium)",
  lineHeight: "var(--ui-line-height-body)",
};

const shortcutBarStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "var(--ui-space-4)",
};

const shortcutMenuWrapStyle: CSSProperties = {
  position: "relative",
  minWidth: 0,
};

const shortcutTriggerStyle: CSSProperties = {
  width: "100%",
  minHeight: 34,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--ui-space-3)",
  padding: "0 var(--ui-space-5)",
  border: "1px solid rgba(8, 44, 122, 0.24)",
  borderRadius: "var(--ui-radius-lg)",
  background: "var(--ui-surface-card)",
  color: "var(--ui-color-primary-navy)",
  fontSize: "var(--ui-type-helper)",
  fontWeight: "var(--ui-font-weight-bold)",
  cursor: "pointer",
};

const shortcutMenuStyle: CSSProperties = {
  position: "absolute",
  top: "calc(100% + var(--ui-space-3))",
  left: 0,
  right: 0,
  zIndex: 2200,
  display: "grid",
  gap: "var(--ui-space-2)",
  padding: "var(--ui-space-3)",
  border: "1px solid rgba(8, 44, 122, 0.24)",
  borderRadius: "var(--ui-radius-xl)",
  background: "var(--ui-surface-dropdown)",
  boxShadow: "var(--ui-shadow-dropdown)",
};

const categoryGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
  gap: "var(--ui-space-5)",
};

const categoryButtonStyle: CSSProperties = {
  minWidth: 0,
  width: "100%",
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--ui-space-5)",
  minHeight: 42,
  padding: "var(--ui-space-4) var(--ui-space-5)",
  border: "1px solid rgba(8, 44, 122, 0.24)",
  borderRadius: "var(--ui-radius-lg)",
  background: "var(--ui-surface-card)",
  color: "var(--ui-text-primary)",
  textAlign: "left",
  cursor: "pointer",
};

const selectedCategoryButtonStyle: CSSProperties = {
  borderColor: "rgba(8, 44, 122, 0.32)",
  background: "var(--ui-color-soft-blue)",
};

const iconTileStyle: CSSProperties = {
  width: 42,
  minWidth: 42,
  height: 42,
  display: "grid",
  placeItems: "center",
  borderRadius: 999,
  background: "var(--ui-tone-surface, #eaf2ff)",
  color: "var(--ui-tone-text, var(--ui-color-primary-navy))",
};

const copyStyle: CSSProperties = {
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
  border: "1px solid rgba(8, 44, 122, 0.24)",
  borderRadius: "var(--ui-radius-lg)",
  background: "var(--ui-surface-card)",
  color: "var(--ui-color-primary-navy)",
  fontSize: "var(--ui-type-helper)",
  fontWeight: "var(--ui-font-weight-bold)",
  cursor: "pointer",
};

const finalCategoryRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--ui-space-4)",
  flexWrap: "wrap",
  justifyContent: "space-between",
};

const finalCardStyle: CSSProperties = {
  width: "auto",
  flex: "1 1 520px",
  minWidth: 280,
  maxWidth: "min(640px, 100%)",
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--ui-space-5)",
  padding: "var(--ui-space-5) var(--ui-space-6)",
  border: "1px solid rgba(8, 44, 122, 0.24)",
  borderRadius: "var(--ui-radius-2xl)",
  background: "linear-gradient(180deg, #ffffff 0%, var(--ui-color-soft-blue) 100%)",
};

const finalActionStyle: CSSProperties = {
  ...backButtonStyle,
  minHeight: 36,
  padding: "0 var(--ui-space-6)",
  border: "1px solid rgba(8, 44, 122, 0.24)",
};

const finalMainStyle: CSSProperties = {
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  gap: "var(--ui-space-5)",
};

const emptyMenuStyle: CSSProperties = {
  padding: "var(--ui-space-4)",
  color: "var(--ui-text-secondary)",
  fontSize: "var(--ui-type-helper)",
  lineHeight: "var(--ui-line-height-body)",
};

const getCategoryIconKey = (category?: Category | null) => {
  if (!category) {
    return null;
  }

  const categoryWithAppearance = category as CategoryWithAppearance;
  return (
    categoryWithAppearance.icon_key ||
    categoryWithAppearance.category_icon ||
    categoryWithAppearance.icon ||
    null
  );
};

const getCategoryTone = (category?: Category | null) => {
  if (!category) {
    return undefined;
  }

  const categoryWithAppearance = category as CategoryWithAppearance;
  return categoryWithAppearance.color_tone || categoryWithAppearance.color || undefined;
};

const hasChildrenLabel = (hasChildren: boolean) =>
  hasChildren ? "wybierz podkategorię" : "kategoria końcowa";


const HelpHint = ({ label }: { label: string }) => (
  <span
    data-ui-help="true"
    tabIndex={0}
    aria-label={label}
    data-tooltip={label}
  />
);

const getParentCategory = (
  category: Category | null,
  categoriesById: Record<string, Category>,
) => {
  if (!category?.parent_id) {
    return null;
  }

  return categoriesById[category.parent_id] || null;
};

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
  const [activeShortcutMenu, setActiveShortcutMenu] = useState<ShortcutMenuKey>(null);

  const activeLevel1Id = selectedLevel1Id || lockedLevel1Id;
  const activeAvailableLevel2Categories = activeLevel1Id
    ? level2ByParentId[activeLevel1Id] || availableLevel2Categories
    : availableLevel2Categories;
  const selectedLevel1 = activeLevel1Id ? categoriesById[activeLevel1Id] || null : null;
  const selectedLevel2 = selectedLevel2Id ? categoriesById[selectedLevel2Id] || null : null;
  const effectiveCategory = effectiveCategoryId ? categoriesById[effectiveCategoryId] || null : null;
  const effectiveParentCategory = getParentCategory(effectiveCategory, categoriesById);

  const shortcutMenus = useMemo(
    () => [
      { key: "recent" as const, label: "Ostatnie", items: recentShortcutCategories, empty: "Brak ostatnich kategorii." },
      { key: "frequent" as const, label: "Najczęstsze", items: topShortcutCategories, empty: "Brak najczęstszych kategorii." },
      { key: "pinned" as const, label: "Przypięte", items: pinnedShortcutCategories, empty: "Brak przypiętych kategorii." },
    ],
    [pinnedShortcutCategories, recentShortcutCategories, topShortcutCategories],
  );

  const getLevel3ButtonLabel = (category: Category) => {
    return getUniqueCategoryLabel(
      category.id,
      categoriesById,
      availableLevel3Categories.map((item) => item.id),
    );
  };

  const renderCategoryIcon = (category?: Category | null) => {
    const iconKey = getCategoryIconKey(category);

    if (!iconKey) {
      return null;
    }

    return (
      <span data-ui-icon-tile="true" data-ui-tone={getCategoryTone(category)} style={iconTileStyle}>
        <CategoryIcon iconKey={iconKey} level={category?.level === 3 ? 3 : 2} />
      </span>
    );
  };

  const renderCategoryButton = ({
    category,
    label,
    meta,
    isSelected,
    onClick,
  }: {
    category?: Category | null;
    label: string;
    meta?: string;
    isSelected?: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      className="ui-button--utility"
      data-transaction-category-chip="true"
      data-transaction-category-selected={isSelected ? "true" : "false"}
      data-transaction-category-tile="true"
      style={{
        ...categoryButtonStyle,
        ...(isSelected ? selectedCategoryButtonStyle : {}),
      }}
      onClick={onClick}
    >
      {renderCategoryIcon(category)}
      <span style={copyStyle}>
        <strong style={chipTitleStyle}>{label}</strong>
        {meta && <small style={chipMetaStyle}>{meta}</small>}
      </span>
    </button>
  );

  const renderShortcutMenu = ({
    key,
    label,
    items,
    empty,
  }: {
    key: Exclude<ShortcutMenuKey, null>;
    label: string;
    items: TransactionShortcut[];
    empty: string;
  }) => {
    const isOpen = activeShortcutMenu === key;

    return (
      <div key={key} style={shortcutMenuWrapStyle} data-transaction-shortcut-menu="true">
        <button
          type="button"
          className="ui-button--utility"
          style={shortcutTriggerStyle}
          aria-expanded={isOpen}
          onClick={() => setActiveShortcutMenu(isOpen ? null : key)}
        >
          {label}
          <span data-ui-picker-chevron="true" aria-hidden="true" />
        </button>
        {isOpen && (
          <div style={shortcutMenuStyle} data-transaction-shortcut-dropdown="true">
            {items.length === 0 ? (
              <div style={emptyMenuStyle}>{empty}</div>
            ) : (
              items.map((shortcut) => {
                const shortcutCategory = categoriesById[shortcut.id] || null;

                return renderCategoryButton({
                  category: shortcutCategory,
                  label: shortcut.label,
                  meta: "otwórz formularz",
                  isSelected: effectiveCategoryId === shortcut.id,
                  onClick: () => {
                    setActiveShortcutMenu(null);
                    handleShortcutClick(shortcut.id);
                  },
                });
              })
            )}
          </div>
        )}
      </div>
    );
  };

  if (effectiveCategoryId) {
    const canGoBackToLevel3 = Boolean(selectedLevel2 && availableLevel3Categories.length > 0);
    const canGoBackToLevel2 = Boolean(selectedLevel1 && activeAvailableLevel2Categories.length > 0);

    return (
      <section style={flowShellStyle} data-transaction-category-flow="true" data-flow-step="final">
        <div style={finalCategoryRowStyle} data-transaction-final-category-row="true">
          <div style={finalCardStyle} data-transaction-final-category="true">
            <span style={finalMainStyle}>
              {renderCategoryIcon(effectiveCategory)}
              <span style={copyStyle}>
                <strong style={titleStyle}>{effectiveCategory?.name || effectiveCategoryLabel}</strong>
                {effectiveParentCategory && (
                  <small style={metaStyle}>{effectiveParentCategory.name}</small>
                )}
              </span>
            </span>
          </div>

          <button
            type="button"
            className="ui-button--utility"
            style={finalActionStyle}
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
            ← cofnij
          </button>

          <button
            type="button"
            className="ui-button--utility"
            data-transaction-pin-button="true"
            data-transaction-pinned={pinnedCategoryIds.includes(effectiveCategoryId) ? "true" : "false"}
            aria-label={pinnedCategoryIds.includes(effectiveCategoryId) ? "Odepnij kategorię" : "Przypnij kategorię"}
            title={pinnedCategoryIds.includes(effectiveCategoryId) ? "Odepnij kategorię" : "Przypnij kategorię"}
            style={finalActionStyle}
            onClick={() => onTogglePinnedCategory(effectiveCategoryId)}
          >
            {pinnedCategoryIds.includes(effectiveCategoryId) ? "odepnij" : "przypnij"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section style={flowShellStyle} data-transaction-category-flow="true">
      <section style={panelStyle} data-transaction-shortcut-section="true">
        <header style={compactHeaderStyle}>
          <span style={{ ...titleWrapStyle, display: "inline-flex", alignItems: "center", gap: "var(--ui-space-3)" }}>
            <strong style={titleStyle}>Szybki wybór</strong>
            <HelpHint label="Rozwiń tylko wtedy, gdy chcesz pominąć drzewo kategorii i od razu otworzyć formularz dla ostatniej, najczęstszej albo przypiętej kategorii." />
          </span>
        </header>
        <div style={shortcutBarStyle} data-transaction-shortcut-bar="true">
          {shortcutMenus.map(renderShortcutMenu)}
        </div>
      </section>


      {activeLevel1Id && activeAvailableLevel2Categories.length > 0 && !selectedLevel2Id && (
        <section style={panelStyle} data-transaction-entry-section="true">
          <header style={compactHeaderStyle}>
            <span style={titleWrapStyle}>
              <strong style={titleStyle}>Wybierz kategorię</strong>
              <small style={metaStyle}>{selectedLevel1?.name || "Wybrany typ"}</small>
            </span>
          </header>

          <div style={categoryGridStyle} data-transaction-category-list="true">
            {activeAvailableLevel2Categories.map((level2Category) => {
              const level3Children = level3ByParentId[level2Category.id] || [];
              const isFinalHere = level3Children.length === 0;

              return renderCategoryButton({
                category: level2Category,
                label: level2Category.name,
                meta: hasChildrenLabel(!isFinalHere),
                isSelected: selectedLevel2Id === level2Category.id,
                onClick: () => handleLevel2Click(level2Category),
              });
            })}
          </div>
        </section>
      )}

      {activeLevel1Id && activeAvailableLevel2Categories.length === 0 && (
        <section style={panelStyle} data-transaction-final-category-placeholder="true">
          <strong style={titleStyle}>{selectedLevel1?.name || "Wybrany typ"}</strong>
          <span style={metaStyle}>Ten typ nie ma niższych kategorii — wpis zapisze się bezpośrednio tutaj.</span>
        </section>
      )}

      {selectedLevel2Id && availableLevel3Categories.length > 0 && (
        <section style={panelStyle} data-transaction-subcategory-section="true">
          <header style={compactHeaderStyle}>
            <span style={titleWrapStyle}>
              <strong style={titleStyle}>Wybierz podkategorię</strong>
              <small style={metaStyle}>{selectedLevel2?.name || "Wybrana kategoria"}</small>
            </span>
            {selectedLevel1 && (
              <button type="button" className="ui-button--utility" style={backButtonStyle} onClick={() => handleLevel1Click(selectedLevel1)}>
                ← kategorie
              </button>
            )}
          </header>

          <div style={categoryGridStyle} data-transaction-category-list="true">
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
        <section style={panelStyle}>
          <strong style={titleStyle}>{selectedLevel2?.name || "Wybrana kategoria"}</strong>
          <span style={metaStyle}>Ta kategoria nie ma podkategorii — wpis zapisze się tutaj.</span>
        </section>
      )}
    </section>
  );
}
