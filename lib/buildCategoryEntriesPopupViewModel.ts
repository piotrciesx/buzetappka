import type { Category, Transaction } from './budgetPageTypes'

export type SelectedCategoryEntriesPanel =
  | { type: 'level1' | 'level2' | 'level3'; categoryId: string }
  | null

export type CategoryEntriesPopupChildGroup = {
  category: Category
  categoryLevel: 2 | 3
  directEntries: Transaction[]
  children: CategoryEntriesPopupChildGroup[]
}

export type CategoryEntriesPopupViewModel = {
  clickedCategory: Category
  clickedCategoryLevel: 1 | 2 | 3
  parentLevel1: Category
  parentLevel2: Category | null
  hasChildren: boolean
  canInlineAdd: boolean
  inlineAddTargetCategoryId: string | null
  descendantCategoryIds: string[]
  directEntries: Transaction[]
  children: CategoryEntriesPopupChildGroup[]
  groupedChildren: CategoryEntriesPopupChildGroup[]
  title: string
  subtitle: string
}

type BuildCategoryEntriesPopupViewModelParams = {
  selectedPanel: SelectedCategoryEntriesPanel
  sortedLevel1: Category[]
  selectedMonth: string
  getSortedLevel2Children: (level1Id: string) => Category[]
  getSortedLevel3Children: (level2Id: string) => Category[]
  getTransactionsForCategoryAndMonth: (categoryId: string) => Transaction[]
}

const toClickedCategoryLevel = (level: number): 1 | 2 | 3 | null => {
  if (level === 1 || level === 2 || level === 3) {
    return level
  }

  return null
}

export function buildCategoryEntriesPopupViewModel({
  selectedPanel,
  sortedLevel1,
  selectedMonth,
  getSortedLevel2Children,
  getSortedLevel3Children,
  getTransactionsForCategoryAndMonth,
}: BuildCategoryEntriesPopupViewModelParams): CategoryEntriesPopupViewModel | null {
  if (!selectedPanel) {
    return null
  }

  if (selectedPanel.type === 'level1') {
    const level1Category =
      sortedLevel1.find((category) => category.id === selectedPanel.categoryId) || null

    if (!level1Category) {
      return null
    }

    const level2Groups = getSortedLevel2Children(level1Category.id).map((level2Category) => {
      const level3Groups = getSortedLevel3Children(level2Category.id).map((level3Category) => ({
        category: level3Category,
        categoryLevel: 3 as const,
        directEntries: getTransactionsForCategoryAndMonth(level3Category.id),
        children: [],
      }))

      return {
        category: level2Category,
        categoryLevel: 2 as const,
        directEntries: getTransactionsForCategoryAndMonth(level2Category.id),
        children: level3Groups,
      }
    })

    const descendantCategoryIds = [
      level1Category.id,
      ...level2Groups.flatMap((group) => [
        group.category.id,
        ...group.children.map((child) => child.category.id),
      ]),
    ]
    const hasChildren = level2Groups.length > 0

    return {
      clickedCategory: level1Category,
      clickedCategoryLevel: 1,
      parentLevel1: level1Category,
      parentLevel2: null,
      hasChildren,
      canInlineAdd: !hasChildren,
      inlineAddTargetCategoryId: hasChildren ? null : level1Category.id,
      descendantCategoryIds,
      directEntries: getTransactionsForCategoryAndMonth(level1Category.id),
      children: level2Groups,
      groupedChildren: level2Groups,
      title: level1Category.name,
      subtitle: hasChildren ? `Całe drzewo • ${selectedMonth}` : selectedMonth,
    }
  }

  if (selectedPanel.type === 'level2') {
    for (const level1Category of sortedLevel1) {
      const level2Category =
        getSortedLevel2Children(level1Category.id).find(
          (category) => category.id === selectedPanel.categoryId
        ) || null

      if (!level2Category) {
        continue
      }

      const level3Groups = getSortedLevel3Children(level2Category.id).map((level3Category) => ({
        category: level3Category,
        categoryLevel: 3 as const,
        directEntries: getTransactionsForCategoryAndMonth(level3Category.id),
        children: [],
      }))
      const hasChildren = level3Groups.length > 0

      return {
        clickedCategory: level2Category,
        clickedCategoryLevel: 2,
        parentLevel1: level1Category,
        parentLevel2: null,
        hasChildren,
        canInlineAdd: !hasChildren,
        inlineAddTargetCategoryId: hasChildren ? null : level2Category.id,
        descendantCategoryIds: [
          level2Category.id,
          ...level3Groups.map((group) => group.category.id),
        ],
        directEntries: getTransactionsForCategoryAndMonth(level2Category.id),
        children: level3Groups,
        groupedChildren: level3Groups,
        title: level2Category.name,
        subtitle: `${level1Category.name} • ${selectedMonth}`,
      }
    }

    return null
  }

  if (selectedPanel.type === 'level3') {
    for (const level1Category of sortedLevel1) {
      for (const level2Category of getSortedLevel2Children(level1Category.id)) {
        const level3Category =
          getSortedLevel3Children(level2Category.id).find(
            (category) => category.id === selectedPanel.categoryId
          ) || null

        if (!level3Category) {
          continue
        }

        const clickedCategoryLevel = toClickedCategoryLevel(level3Category.level)

        if (!clickedCategoryLevel) {
          return null
        }

        return {
          clickedCategory: level3Category,
          clickedCategoryLevel,
          parentLevel1: level1Category,
          parentLevel2: level2Category,
          hasChildren: false,
          canInlineAdd: true,
          inlineAddTargetCategoryId: level3Category.id,
          descendantCategoryIds: [level3Category.id],
          directEntries: getTransactionsForCategoryAndMonth(level3Category.id),
          children: [],
          groupedChildren: [],
          title: level3Category.name,
          subtitle: `${level1Category.name} • ${level2Category.name} • ${selectedMonth}`,
        }
      }
    }
  }

  return null
}
