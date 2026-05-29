import { CSSProperties } from 'react'
import { getUniqueCategoryLabel } from '../../lib/categoryUtils'
import {
  disabledLevel3WrapStyle,
  finalCategoryInfoStyle,
  finalCategoryInfoTitleStyle,
  finalCategoryInfoValueStyle,
  sectionStyle,
  shortcutButtonStyle,
  shortcutListStyle,
  treeLevel2WrapStyle,
  treeLevel3ButtonsStyle,
  treeLevel3WrapStyle,
} from './transactionCreatorModalStyles'
import { Category, TransactionShortcut } from './transactionCreatorTypes'
import { compactCategoryButtonStyle } from './transactionCreatorUtils'

type Props = {
  level1Categories: Category[]
  availableLevel2Categories: Category[]
  availableLevel3Categories: Category[]
  level2ByParentId: Record<string, Category[]>
  level3ByParentId: Record<string, Category[]>
  categoriesById: Record<string, Category>
  lockedLevel1Id: string | null
  selectedLevel1Id: string | null
  selectedLevel2Id: string | null
  effectiveCategoryId: string | null
  effectiveCategoryLabel: string
  topShortcutCategories: TransactionShortcut[]
  pinnedShortcutCategories: TransactionShortcut[]
  pinnedCategoryIds: string[]
  recentShortcutCategories: TransactionShortcut[]
  styles: Record<string, CSSProperties>
  handleShortcutClick: (categoryId: string) => void
  handleLevel1Click: (category: Category) => void
  handleLevel2Click: (category: Category) => void
  handleLevel3Click: (category: Category) => void
  onTogglePinnedCategory: (categoryId: string) => void
}

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
  styles,
  handleShortcutClick,
  handleLevel1Click,
  handleLevel2Click,
  handleLevel3Click,
  onTogglePinnedCategory,
}: Props) {
  const getLevel3ButtonLabel = (category: Category) => {
    return getUniqueCategoryLabel(
      category.id,
      categoriesById,
      availableLevel3Categories.map((item) => item.id)
    )
  }

  const renderShortcutList = (
    title: string,
    label: string,
    shortcuts: TransactionShortcut[],
    isCompact = false
  ) => {
    if (shortcuts.length === 0) {
      return null
    }

    return (
      <div style={sectionStyle} data-transaction-shortcut-section="true">
        <div style={styles.l2Name}>{title}</div>

        <div style={shortcutListStyle} data-transaction-shortcut-list="true">
          {shortcuts.map((shortcut) => {
            const isSelected = effectiveCategoryId === shortcut.id

            return (
              <button
                key={shortcut.id}
                data-transaction-category-chip="true"
                data-transaction-category-selected={isSelected ? 'true' : 'false'}
                style={{
                  ...(isSelected ? styles.primaryButton : styles.secondaryButton),
                  ...shortcutButtonStyle,
                  ...(isCompact ? compactCategoryButtonStyle : {}),
                }}
                onClick={() => handleShortcutClick(shortcut.id)}
              >
                <span>{label}</span>
                <span>{shortcut.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <>
      {renderShortcutList('Przypięte kategorie', 'przypięte', pinnedShortcutCategories, true)}
      {renderShortcutList('Szybkie kategorie', 'najczęstsze', topShortcutCategories)}
      {renderShortcutList('Ostatnio używane', 'ostatnie', recentShortcutCategories)}

      {!lockedLevel1Id && (
        <div style={sectionStyle} data-transaction-type-section="true">
          <div style={styles.l2Name}>Typ</div>

          <div style={{ ...styles.actions, marginTop: 10 }} data-transaction-category-list="true">
            {level1Categories.map((category) => {
              const isSelected = selectedLevel1Id === category.id
              const level2Children = level2ByParentId[category.id] || []
              const isFinalHere = level2Children.length === 0

              return (
                <button
                  key={category.id}
                  data-transaction-category-chip="true"
                  data-transaction-category-selected={isSelected ? 'true' : 'false'}
                  style={{
                    ...(isSelected ? styles.primaryButton : styles.secondaryButton),
                    ...compactCategoryButtonStyle,
                  }}
                  onClick={() => handleLevel1Click(category)}
                >
                  {category.name}
                  {isFinalHere ? ' (końcowy)' : ''}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div style={sectionStyle} data-transaction-entry-section="true">
        <div style={styles.l2Name}>Kategorie</div>

        {!selectedLevel1Id && (
          <div style={styles.emptyText} data-transaction-category-hint="true">
            Najpierw wybierz typ wpisu.
          </div>
        )}

        {selectedLevel1Id && availableLevel2Categories.length > 0 && (
          <div style={treeLevel2WrapStyle} data-transaction-category-list="true">
            {availableLevel2Categories.map((level2Category) => {
              const level3Children = level3ByParentId[level2Category.id] || []
              const isFinalHere = level3Children.length === 0
              const isSelected =
                selectedLevel2Id === level2Category.id ||
                (availableLevel3Categories.length === 0 && effectiveCategoryId === level2Category.id)

              return (
                <button
                  key={level2Category.id}
                  data-transaction-category-chip="true"
                  data-transaction-category-selected={isSelected ? 'true' : 'false'}
                  style={{
                    ...(isSelected ? styles.primaryButton : styles.secondaryButton),
                    ...compactCategoryButtonStyle,
                  }}
                  onClick={() => handleLevel2Click(level2Category)}
                >
                  {level2Category.name}
                  {isFinalHere ? ' (końcowy)' : ''}
                </button>
              )
            })}
          </div>
        )}

        {selectedLevel1Id && availableLevel2Categories.length === 0 && (
          <div style={styles.emptyText} data-transaction-category-hint="true">
            Ten typ nie ma dodatkowych kategorii — wpis zapisze się bezpośrednio tutaj.
          </div>
        )}
      </div>

      <div style={sectionStyle} data-transaction-subcategory-section="true">
        <div style={styles.l2Name}>Podkategorie</div>

        {!selectedLevel2Id && availableLevel2Categories.length > 0 && (
          <div style={disabledLevel3WrapStyle} data-transaction-category-disabled="true">
            <div style={styles.l2Name}>Najpierw wybierz kategorię</div>
            <div style={styles.emptyText} data-transaction-category-hint="true">
              Wybór podkategorii odblokuje się po wskazaniu kategorii.
            </div>
          </div>
        )}

        {selectedLevel1Id && availableLevel2Categories.length === 0 && (
          <div style={treeLevel3WrapStyle} data-transaction-final-category-placeholder="true">
            <div style={styles.l2Name}>Kategoria końcowa</div>
            <div style={styles.emptyText} data-transaction-category-hint="true">
              W tym typie nie ma niższych kategorii — wpis zapisze się tutaj.
            </div>
          </div>
        )}

        {selectedLevel2Id && availableLevel3Categories.length > 0 && (
          <div style={treeLevel3WrapStyle} data-transaction-final-category-placeholder="true">
            <div style={styles.l2Name}>{categoriesById[selectedLevel2Id]?.name || ''}</div>

            <div style={treeLevel3ButtonsStyle} data-transaction-category-list="true">
              {availableLevel3Categories.map((level3Category) => {
                const isSelected = effectiveCategoryId === level3Category.id

                return (
                  <button
                    key={level3Category.id}
                    data-transaction-category-chip="true"
                    data-transaction-category-selected={isSelected ? 'true' : 'false'}
                    style={{
                      ...(isSelected ? styles.primaryButton : styles.secondaryButton),
                      ...compactCategoryButtonStyle,
                    }}
                    onClick={() => handleLevel3Click(level3Category)}
                  >
                    {getLevel3ButtonLabel(level3Category)}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {selectedLevel2Id && availableLevel3Categories.length === 0 && (
          <div style={treeLevel3WrapStyle}>
            <div style={styles.l2Name}>{categoriesById[selectedLevel2Id]?.name || ''}</div>
            <div style={styles.emptyText} data-transaction-category-hint="true">
              Ta kategoria nie ma podkategorii — wpis zapisze się tutaj.
            </div>
          </div>
        )}

        {effectiveCategoryId && (
          <div style={finalCategoryInfoStyle} data-transaction-final-category="true">
            <div style={finalCategoryInfoTitleStyle}>Zapis trafi do</div>
            <div style={finalCategoryInfoValueStyle}>{effectiveCategoryLabel}</div>
            <button
              type="button"
              data-transaction-pin-button="true"
              data-transaction-pinned={
                pinnedCategoryIds.includes(effectiveCategoryId) ? 'true' : 'false'
              }
              aria-label={
                pinnedCategoryIds.includes(effectiveCategoryId)
                  ? 'Odepnij kategorię'
                  : 'Przypnij kategorię'
              }
              title={
                pinnedCategoryIds.includes(effectiveCategoryId)
                  ? 'Odepnij kategorię'
                  : 'Przypnij kategorię'
              }
              style={{ ...styles.secondaryButton, marginTop: 8 }}
              onClick={() => onTogglePinnedCategory(effectiveCategoryId)}
            >
              {pinnedCategoryIds.includes(effectiveCategoryId)
                ? 'odepnij kategorię'
                : 'przypnij kategorię'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
