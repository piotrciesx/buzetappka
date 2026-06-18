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
};

const panelStyle: CSSProperties = {
  display: "grid",
  gap: "var(--ui-space-5)",
  padding: 0,
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
  gridTemplateColumns: "repeat(3, minmax(150px, 1fr))",
  gap: "var(--ui-space-8)",
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

  const renderBackRow = ({
    category,
    label,
    onClick,
  }: {
    category?: Category | null;
    label: string;
    onClick: () => void;
  }) => (
    <button
      type="button"
      data-transaction-back-row="true"
      onClick={() => {
        closeShortcutMenu();
        onClick();
      }}
    >
      <span data-transaction-back-arrow="true" aria-hidden="true">
        ←
      </span>
      {renderCategoryIcon(category)}
      <span data-transaction-back-label="true">{label}</span>
    </button>
  );

  const renderCurrentRow = ({
    category,
    label,
  }: {
    category?: Category | null;
    label: string;
  }) => (
    <div data-transaction-current-row="true">
      {renderCategoryIcon(category)}
      <span data-transaction-current-label="true">{label}</span>
    </div>
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
      style={panelStyle}
      data-ui-section="true"
      data-transaction-shortcut-section="true"
    >
      <header data-transaction-section-header="true">
        <span
          style={{
            ...titleWrapStyle,
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--ui-space-3)",
          }}
        >
          <strong style={titleStyle} data-ui-section-title="true">
            Szybki wybór
          </strong>
          <HelpHint label="Rozwiń tylko wtedy, gdy chcesz pominąć drzewo kategorii i od razu otworzyć formularz dla ostatniej, najczęstszej albo przypiętej kategorii." />
        </span>
      </header>

      <div style={shortcutBarStyle} data-transaction-shortcut-bar="true">
        {shortcutMenus.map(renderShortcutMenu)}
      </div>
    </section>
  );

  const renderLevel1List = () => (
    <section
      style={panelStyle}
      data-ui-section="true"
      data-transaction-entry-section="true"
    >
      <header data-transaction-section-header="true">
        <span style={titleWrapStyle}>
          <strong style={titleStyle} data-ui-section-title="true">
            Wybierz typ wpisu
          </strong>
        </span>
      </header>

      <div data-transaction-selection-list="true">
        <div data-ui-dropdown-list="true" data-density="large">
          {level1Categories.map((level1Category) =>
            renderCategoryRow({
              category: level1Category,
              label: level1Category.name,
              helper: "wybierz kategorię",
              isSelected: selectedLevel1Id === level1Category.id,
              onClick: () => handleLevel1Click(level1Category),
            }),
          )}
        </div>
      </div>
    </section>
  );

  const renderLevel2List = () => (
    <section
      style={panelStyle}
      data-ui-section="true"
      data-transaction-entry-section="true"
    >
      <header data-transaction-section-header="true">
        <span style={titleWrapStyle}>
          <strong style={titleStyle} data-ui-section-title="true">
            {selectedLevel1?.name || "Wybierz kategorię"}
          </strong>
          <small style={metaStyle}>Wybierz kategorię</small>
        </span>
      </header>

      <div data-transaction-selection-list="true">
        <div data-ui-dropdown-list="true" data-density="large">
          {activeAvailableLevel2Categories.map((level2Category) => {
            const level3Children = level3ByParentId[level2Category.id] || [];
            const isFinalHere = level3Children.length === 0;

            return renderCategoryRow({
              category: level2Category,
              label: level2Category.name,
              helper: isFinalHere ? "kategoria końcowa" : "wybierz podkategorię",
              isSelected: selectedLevel2Id === level2Category.id,
              onClick: () => handleLevel2Click(level2Category),
            });
          })}
        </div>
      </div>
    </section>
  );

  const renderLevel3List = () => (
    <section
      style={panelStyle}
      data-ui-section="true"
      data-transaction-subcategory-section="true"
    >
      {selectedLevel2 &&
        renderBackRow({
          category: selectedLevel2,
          label: selectedLevel2.name,
          onClick: selectedLevel1
            ? () => handleLevel1Click(selectedLevel1)
            : closeShortcutMenu,
        })}

      <header data-transaction-section-header="true">
        <span style={titleWrapStyle}>
          <strong style={titleStyle} data-ui-section-title="true">
            Wybierz podkategorię
          </strong>
        </span>
      </header>

      <div data-transaction-selection-list="true">
        <div data-ui-dropdown-list="true" data-density="large">
          {availableLevel3Categories.map((level3Category) =>
            renderCategoryRow({
              category: level3Category,
              label: getLevel3ButtonLabel(level3Category),
              helper: "kategoria końcowa",
              isSelected: effectiveCategoryId === level3Category.id,
              onClick: () => handleLevel3Click(level3Category),
            }),
          )}
        </div>
      </div>
    </section>
  );

  const renderFinalContext = () => (
    <section
      style={panelStyle}
      data-ui-section="true"
      data-transaction-final-context="true"
    >
      {selectedLevel2
        ? renderBackRow({
            category: selectedLevel2,
            label: selectedLevel2.name,
            onClick: () => handleLevel2Click(selectedLevel2),
          })
        : selectedLevel1
          ? renderBackRow({
              category: selectedLevel1,
              label: selectedLevel1.name,
              onClick: () => handleLevel1Click(selectedLevel1),
            })
          : null}

      {renderCurrentRow({
        category: effectiveCategory,
        label: effectiveCategory?.name || effectiveCategoryLabel,
      })}
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

      {!activeLevel1Id && level1Categories.length > 0 && renderLevel1List()}

      {activeLevel1Id &&
        activeAvailableLevel2Categories.length > 0 &&
        !selectedLevel2Id &&
        renderLevel2List()}

      {activeLevel1Id && activeAvailableLevel2Categories.length === 0 && (
        <section
          style={panelStyle}
          data-ui-section="true"
          data-transaction-final-category-placeholder="true"
        >
          <header data-transaction-section-header="true">
            <span style={titleWrapStyle}>
              <strong style={titleStyle} data-ui-section-title="true">
                {selectedLevel1?.name || "Wybrany typ"}
              </strong>
              <small style={metaStyle}>Wpis zapisze się tutaj.</small>
            </span>
          </header>
        </section>
      )}

      {selectedLevel2Id &&
        availableLevel3Categories.length > 0 &&
        renderLevel3List()}

      {selectedLevel2Id && availableLevel3Categories.length === 0 && (
        <section style={panelStyle} data-ui-section="true">
          {selectedLevel1 && selectedLevel2
            ? renderBackRow({
                category: selectedLevel1,
                label: selectedLevel1.name,
                onClick: () => handleLevel1Click(selectedLevel1),
              })
            : null}
          <header data-transaction-section-header="true">
            <span style={titleWrapStyle}>
              <strong style={titleStyle} data-ui-section-title="true">
                {selectedLevel2?.name || "Wybrana kategoria"}
              </strong>
              <small style={metaStyle}>Wpis zapisze się tutaj.</small>
            </span>
          </header>
        </section>
      )}
    </section>
  );
}
