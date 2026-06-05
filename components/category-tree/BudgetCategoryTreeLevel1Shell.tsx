import { CSSProperties, ReactNode } from 'react'
import { closestCenter, DndContext, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import BudgetLimitIndicator, { BudgetLimitView } from '../BudgetLimitIndicator'
import { SortableLevel1Card, StaticLevel1Card } from '../Level1Cards'
import { Category } from '../../lib/budgetPageTypes'
import { getNearestDndSwapTargetId } from '../../lib/getNearestDndSwapTargetId'

type Props = {
  sortedLevel1: Category[]
  openLevel1Ids: string[]
  openLevel1CalendarIds: string[]
  isMobileViewport: boolean
  isLevel1DndBlocked: boolean
  isLevel1Sortable: boolean
  dndSensors: Parameters<typeof DndContext>[0]['sensors']
  expenseLevel1Id: string | null
  styles: Record<string, CSSProperties>
  onOpenLevel1Entries: (id: string) => void
  handleLevel1DragStart: () => void
  handleReorderLevel1: (activeId: string, overId: string) => Promise<void>
  getLevel1Kind: (level1Category: Category) => 'income' | 'expense'
  getLevel1Summary: (level1Category: Category) => {
    amount: number
    transactionCount: number
    childCount: number
  }
  getBudgetLimitView?: (categoryId: string | null) => BudgetLimitView | null
  renderBlockedLevel1DragHandle: (level1Category: Category, isSortable: boolean) => ReactNode
  renderLevel1Actions: (level1Category: Category, isLevel1CalendarOpen: boolean) => ReactNode
  renderLevel1Content: (level1Category: Category) => ReactNode
}

export default function BudgetCategoryTreeLevel1Shell({
  sortedLevel1,
  openLevel1Ids,
  openLevel1CalendarIds,
  isMobileViewport,
  isLevel1DndBlocked,
  isLevel1Sortable,
  dndSensors,
  expenseLevel1Id,
  styles,
  onOpenLevel1Entries,
  handleLevel1DragStart,
  handleReorderLevel1,
  getLevel1Kind,
  getLevel1Summary,
  getBudgetLimitView,
  renderBlockedLevel1DragHandle,
  renderLevel1Actions,
  renderLevel1Content,
}: Props) {
  const renderLimitIndicator = (level1Category: Category) =>
    level1Category.id === expenseLevel1Id && getBudgetLimitView ? (
      <BudgetLimitIndicator view={getBudgetLimitView?.(null) ?? null} variant="level1" />
    ) : null

  const handleDragEnd = async (event: DragEndEvent, useMobileTarget: boolean) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const level1Ids = sortedLevel1.map((category) => category.id)
    await handleReorderLevel1(
      String(active.id),
      getNearestDndSwapTargetId(level1Ids, String(active.id), String(over.id), useMobileTarget)
    )
  }

  if (isMobileViewport) {
    return (
      <div data-level1-tree-shell="true" data-level1-mobile-flow="true">
        <DndContext
          sensors={dndSensors}
          collisionDetection={closestCenter}
          onDragStart={handleLevel1DragStart}
          onDragEnd={(event) => void handleDragEnd(event, true)}
        >
          <SortableContext
            items={sortedLevel1.map((category) => category.id)}
            strategy={verticalListSortingStrategy}
          >
            {sortedLevel1.map((level1Category) => {
              const isLevel1Open = openLevel1Ids.includes(level1Category.id)
              const isLevel1CalendarOpen = openLevel1CalendarIds.includes(level1Category.id)

              return (
                <SortableLevel1Card
                  key={level1Category.id}
                  level1Category={level1Category}
                  isOpen={isLevel1Open}
                  onToggle={() => onOpenLevel1Entries(level1Category.id)}
                  isSortable={isLevel1Sortable}
                  styles={styles}
                  kind={getLevel1Kind(level1Category)}
                  summary={getLevel1Summary(level1Category)}
                  extraActions={renderLevel1Actions(level1Category, isLevel1CalendarOpen)}
                  limitIndicator={renderLimitIndicator(level1Category)}
                >
                  {renderLevel1Content(level1Category)}
                </SortableLevel1Card>
              )
          })}
          </SortableContext>
        </DndContext>
      </div>
    )
  }

  if (isLevel1DndBlocked) {
    return (
      <div data-level1-tree-shell="true">
        <div data-level1-header-grid="true">
          {sortedLevel1.map((level1Category) => {
            const isLevel1Open = openLevel1Ids.includes(level1Category.id)
            const isLevel1CalendarOpen = openLevel1CalendarIds.includes(level1Category.id)

            return (
              <StaticLevel1Card
                key={level1Category.id}
                level1Category={level1Category}
                isOpen={isLevel1Open}
                onToggle={() => onOpenLevel1Entries(level1Category.id)}
                styles={styles}
                kind={getLevel1Kind(level1Category)}
                summary={getLevel1Summary(level1Category)}
                dragHandle={renderBlockedLevel1DragHandle(level1Category, isLevel1Sortable)}
                extraActions={renderLevel1Actions(level1Category, isLevel1CalendarOpen)}
                limitIndicator={renderLimitIndicator(level1Category)}
              />
            )
            })}
        </div>
        <div data-level1-content-stack="true">
          {sortedLevel1.map((level1Category) => renderLevel1Content(level1Category))}
        </div>
      </div>
    )
  }

  return (
    <div data-level1-tree-shell="true">
      <DndContext
        sensors={dndSensors}
        collisionDetection={closestCenter}
        onDragStart={handleLevel1DragStart}
        onDragEnd={(event) => void handleDragEnd(event, isMobileViewport)}
      >
        <SortableContext
          items={sortedLevel1.map((category) => category.id)}
          strategy={verticalListSortingStrategy}
        >
          <div data-level1-header-grid="true">
            {sortedLevel1.map((level1Category) => {
              const isLevel1Open = openLevel1Ids.includes(level1Category.id)
              const isLevel1CalendarOpen = openLevel1CalendarIds.includes(level1Category.id)

              return (
                <SortableLevel1Card
                  key={level1Category.id}
                  level1Category={level1Category}
                  isOpen={isLevel1Open}
                  onToggle={() => onOpenLevel1Entries(level1Category.id)}
                  isSortable={isLevel1Sortable}
                  styles={styles}
                  kind={getLevel1Kind(level1Category)}
                  summary={getLevel1Summary(level1Category)}
                  extraActions={renderLevel1Actions(level1Category, isLevel1CalendarOpen)}
                  limitIndicator={renderLimitIndicator(level1Category)}
                />
              )
            })}
          </div>
        </SortableContext>
      </DndContext>
      <div data-level1-content-stack="true">
        {sortedLevel1.map((level1Category) => renderLevel1Content(level1Category))}
      </div>
    </div>
  )
}
