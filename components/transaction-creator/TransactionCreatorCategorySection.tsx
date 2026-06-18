import { CSSProperties, ReactNode, useMemo, useState } from "react";
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
};

const shortcutBarStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "var(--ui-space-5)",
};

const shortcutMenuWrapStyle: CSSProperties = {
  position: "relative",
  minWidth: 0,
};

const emptyMenuStyle: CSSProperties = {
  padding: "var(--ui-space-5)",
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
  return (
    categoryWithAppearance.color_tone ||
    categoryWithAppearance.color ||
    undefined
  );
};

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
  recentShortcutCategories,
  handleShortcutClick,
  handleLevel1Click,
  handleLevel2Click,
  handleLevel3Click,
}: Props) {
  const [activeShortcutMenu, setActiveShortcutMenu] =
    useState<ShortcutMenuKey>(null);

  const activeLevel1Id = selectedLevel1Id || lockedLevel1Id;
  const activeAvailableLevel2Categories = activeLevel1Id
    ? level2ByParentId[activeLevel1Id] || availableLevel2Categories
    : availableLevel2Categories;
  const selectedLevel1 = activeLevel1Id
    ? categoriesById[activeLevel1Id] || null
    : null;
  const selectedLevel2 = selectedLevel2Id
    ? categoriesById[selectedLevel2Id] || null
    : null;
  const effectiveCategory = effectiveCategoryId
    ? categoriesById[effectiveCategoryId] || null
    : null;

  const shortcutMenus = useMemo(
    () => [
      {
        key: "recent" as const,
        label: "Ostatnie",
        items: recentShortcutCategories,
        empty: "Brak ostatnich kategorii.",
      },
      {
        key: "frequent" as const,
        label: "Najczęstsze",
        items: topShortcutCategories,
        empty: "Brak najczęstszych kategorii.",
      },
      {
        key: "pinned" as const,
        label: "Przypięte",
        items: pinnedShortcutCategories,
        empty: "Brak przypiętych kategorii.",
      },
    ],
    [pinnedShortcutCategories, recentShortcutCategories, topShortcutCategories],
  );

  const getLevel3ButtonLabel = (category: Category) => {
    const parent = getParentCategory(category, categoriesById);

    if (!parent) {
      return category.name;
    }

    return getUniqueCategoryLabel(category.id, categoriesById, parent.id);
  };

  const closeShortcutMenu = () => {
    setActiveShortcutMenu(null);
  };

  const renderCategoryIcon = (category?: Category | null) => {
    const iconKey = getCategoryIconKey(category);

    if (!iconKey) {
      return (
        <span
          data-ui-dropdown-list-icon="true"
          data-empty="true"
          aria-hidden="true"
        />
      );
    }

    return (
      <span
        data-ui-dropdown-list-icon="true"
        data-ui-tone={getCategoryTone(category)}
      >
        <CategoryIcon iconKey={iconKey} level={category?.level === 3 ? 3 : 2} />
      </span>
    );
  };

  const renderChevron = () => (
    <span data-ui-dropdown-list-trailing="true" aria-hidden="true">
      <span data-ui-chevron="right" />
    </span>
  );

  const renderShortcutRow = (shortcut: TransactionShortcut) => {
    const shortcutCategory = categoriesById[shortcut.id] || null;

    return (
      <button
        key={shortcut.id}
        type="button"
        data-ui-dropdown-list-row="true"
        data-transaction-shortcut-row="true"
        data-active={effectiveCategoryId === shortcut.id ? "true" : "false"}
        onClick={() => {
          closeShortcutMenu();
          handleShortcutClick(shortcut.id);
        }}
      >
        {renderCategoryIcon(shortcutCategory)}
        <span data-ui-dropdown-list-content="true">
          <span data-ui-dropdown-list-title="true">{shortcut.label}</span>
        </span>
      </button>
    );
  };

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
      <div
        key={key}
        style={shortcutMenuWrapStyle}
        data-transaction-shortcut-menu="true"
        data-open={isOpen ? "true" : "false"}
      >
        <button
          type="button"
          className="ui-button--utility"
          data-transaction-shortcut-trigger="true"
          aria-expanded={isOpen}
          onClick={() => setActiveShortcutMenu(isOpen ? null : key)}
        >
          <span>{label}</span>
          <span data-ui-picker-chevron="true" aria-hidden="true" />
        </button>

        {isOpen && (
          <div data-transaction-shortcut-dropdown="true">
            {items.length === 0 ? (
              <div style={emptyMenuStyle}>{empty}</div>
            ) : (
              <div data-ui-dropdown-list="true" data-density="compact">
                {items.map(renderShortcutRow)}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderShortcutSection = () => (
    <section
      data-ui-section="true"
      data-transaction-shortcut-section="true"
    >
      <header data-transaction-shortcut-header="true">
        <strong data-ui-section-title="true">Szybki wybór</strong>
        <HelpHint label="Rozwiń, żeby szybko wybrać ostatnią, najczęstszą albo przypiętą kategorię." />
      </header>

      <div style={shortcutBarStyle} data-transaction-shortcut-bar="true">
        {shortcutMenus.map(renderShortcutMenu)}
      </div>
    </section>
  );

  const renderStageHeader = ({
    title,
    helper,
  }: {
    title: string;
    helper: string;
  }) => (
    <header data-transaction-stage-header="true">
      <span data-transaction-stage-copy="true">
        <strong>{title}</strong>
        <small>{helper}</small>
      </span>
    </header>
  );

  const renderTrailButton = ({
    category,
    onClick,
    isFirst,
  }: {
    category: Category;
    onClick: () => void;
    isFirst?: boolean;
  }) => (
    <button
      type="button"
      data-transaction-trail-link="true"
      onClick={() => {
        closeShortcutMenu();
        onClick();
      }}
    >
      {isFirst && <span aria-hidden="true">←</span>}
      <span>{category.name}</span>
    </button>
  );

  const renderTrailSeparator = () => (
    <span data-transaction-trail-separator="true" aria-hidden="true">
      ›
    </span>
  );

  const renderCategoryTrail = ({
    includeCurrent,
    helper,
  }: {
    includeCurrent?: boolean;
    helper?: string;
  }) => {
    const hasLevel1 = Boolean(selectedLevel1);
    const hasLevel2 = Boolean(selectedLevel2);
    const hasCurrent = Boolean(includeCurrent && effectiveCategory);

    if (!hasLevel1 && !hasLevel2 && !hasCurrent) {
      return null;
    }

    return (
      <header data-transaction-trail-header="true">
        <div data-transaction-category-trail="true">
          {selectedLevel1 &&
            renderTrailButton({
              category: selectedLevel1,
              onClick: () => handleLevel1Click(selectedLevel1),
              isFirst: true,
            })}

          {selectedLevel1 && selectedLevel2 && renderTrailSeparator()}

          {selectedLevel2 &&
            renderTrailButton({
              category: selectedLevel2,
              onClick: () => handleLevel2Click(selectedLevel2),
            })}

          {(selectedLevel1 || selectedLevel2) && hasCurrent && renderTrailSeparator()}

          {hasCurrent && (
            <strong data-transaction-trail-current="true">
              {effectiveCategory?.name || effectiveCategoryLabel}
            </strong>
          )}
        </div>

        {helper && <small data-transaction-trail-helper="true">{helper}</small>}
      </header>
    );
  };

  const renderCategoryRow = ({
    category,
    label,
    helper,
    isSelected,
    onClick,
  }: {
    category?: Category | null;
    label: string;
    helper?: string;
    isSelected?: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      data-ui-dropdown-list-row="true"
      data-transaction-category-row="true"
      data-active={isSelected ? "true" : "false"}
      onClick={() => {
        closeShortcutMenu();
        onClick();
      }}
    >
      {renderCategoryIcon(category)}
      <span data-ui-dropdown-list-content="true">
        <span data-ui-dropdown-list-title="true">{label}</span>
        {helper && <span data-ui-dropdown-list-helper="true">{helper}</span>}
      </span>
      {renderChevron()}
    </button>
  );

  const renderCategoryList = (children: ReactNode) => (
    <div data-transaction-category-list-frame="true">
      <div data-ui-dropdown-list="true" data-density="large">
        {children}
      </div>
    </div>
  );

  const renderFinalContext = () => (
    <section data-transaction-final-context="true">
      {renderCategoryTrail({ includeCurrent: true })}
    </section>
  );

  if (effectiveCategoryId) {
    return (
      <section
        style={flowShellStyle}
        data-ui-section="true"
        data-transaction-category-flow="true"
        data-flow-step="final"
      >
        {renderShortcutSection()}
        <div data-ui-section-separator="true" />
        {renderFinalContext()}
      </section>
    );
  }

  return (
    <section
      style={flowShellStyle}
      data-ui-section="true"
      data-transaction-category-flow="true"
    >
      {renderShortcutSection()}
      <div data-ui-section-separator="true" />

      {!activeLevel1Id && level1Categories.length > 0 && (
        <section data-ui-section="true" data-transaction-entry-section="true">
          {renderStageHeader({
            title: "Typ wpisu",
            helper: "Wybierz przychód albo wydatek",
          })}

          {renderCategoryList(
            level1Categories.map((level1Category) =>
              renderCategoryRow({
                category: level1Category,
                label: level1Category.name,
                helper: "wybierz kategorię",
                isSelected: selectedLevel1Id === level1Category.id,
                onClick: () => handleLevel1Click(level1Category),
              }),
            ),
          )}
        </section>
      )}

      {activeLevel1Id &&
        activeAvailableLevel2Categories.length > 0 &&
        !selectedLevel2Id && (
          <section data-ui-section="true" data-transaction-entry-section="true">
            {renderStageHeader({
              title: selectedLevel1?.name || "Wybrany typ",
              helper: "Wybierz kategorię",
            })}

            {renderCategoryList(
              activeAvailableLevel2Categories.map((level2Category) => {
                const level3Children = level3ByParentId[level2Category.id] || [];
                const isFinalHere = level3Children.length === 0;

                return renderCategoryRow({
                  category: level2Category,
                  label: level2Category.name,
                  helper: isFinalHere ? "kategoria końcowa" : "wybierz podkategorię",
                  isSelected: selectedLevel2Id === level2Category.id,
                  onClick: () => handleLevel2Click(level2Category),
                });
              }),
            )}
          </section>
        )}

      {activeLevel1Id && activeAvailableLevel2Categories.length === 0 && (
        <section data-ui-section="true" data-transaction-entry-section="true">
          {renderStageHeader({
            title: selectedLevel1?.name || "Wybrany typ",
            helper: "Ten typ nie ma niższych kategorii",
          })}
        </section>
      )}

      {selectedLevel2Id && availableLevel3Categories.length > 0 && (
        <section data-ui-section="true" data-transaction-subcategory-section="true">
          {renderCategoryTrail({ helper: "Wybierz podkategorię" })}

          {renderCategoryList(
            availableLevel3Categories.map((level3Category) =>
              renderCategoryRow({
                category: level3Category,
                label: getLevel3ButtonLabel(level3Category),
                helper: "kategoria końcowa",
                isSelected: effectiveCategoryId === level3Category.id,
                onClick: () => handleLevel3Click(level3Category),
              }),
            ),
          )}
        </section>
      )}

      {selectedLevel2Id && availableLevel3Categories.length === 0 && (
        <section data-ui-section="true" data-transaction-entry-section="true">
          {renderCategoryTrail({
            includeCurrent: true,
            helper: "Ta kategoria nie ma podkategorii",
          })}
        </section>
      )}
    </section>
  );
}
