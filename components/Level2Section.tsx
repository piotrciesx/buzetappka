'use client'

import { CSSProperties } from 'react'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Level3Section from './Level3Section'

type Category = {
  id: string
  name: string
  parent_id: string | null
  level: number
  default_order?: number | null
  sort_order?: number | null
  active_to?: string | null
  reactivate_from?: string | null
}

type Transaction = {
  id: string
  category_id: string
  amount: number | string
  description: string | null
  date: string
  created_at?: string
  is_deleted?: boolean
  deleted_at?: string | null
}

type MoveTarget = {
  id: string
  label: string
}

type HideMode = 'now' | 'next'
type RestoreMode = 'now' | 'next'
type SortMode = 'default' | 'manual' | 'sum' | 'frequency'
type SortDirection = 'asc' | 'desc'

type Props = {
  l2: Category
  level3Children: Category[]
  selectedMonth: string
  isClosingAfterSelectedMonth: boolean
  openLevel2Ids: string[]
  toggleLevel2: (id: string) => void
  openLevel3Ids: string[]
  toggleLevel3: (id: string) => void
  getSumForLevel2: (id: string) => number
  getCountForLevel2: (id: string) => number
  getSumForCategory: (id: string) => number
  getTransactionsForCategoryAndMonth: (id: string) => Transaction[]
  openAddSubcategoryFor: string | null
  setOpenAddSubcategoryFor: (id: string | null) => void
  newSubcategoryName: string
  setNewSubcategoryName: (value: string) => void
  handleAddSubcategory: (level2Id: string) => Promise<void>
  openTransactionCreator: (suggestedCategoryId: string) => void
  handleInlineSaveTransaction: (
    categoryId: string,
    amountText: string,
    descriptionText: string
  ) => Promise<void>
  handleHideCategory: (id: string, mode?: HideMode) => Promise<void>
  handleRestoreCategory: (id: string, mode?: RestoreMode) => Promise<void>
  handleUndoScheduledHide: (id: string) => Promise<void>
  handleDeleteTransaction: (id: string) => Promise<void>
  handleUpdateTransaction: (id: string, amount: string, description: string) => Promise<void>
  handleMoveTransaction: (id: string, targetCategoryId: string) => Promise<void>
  selectedTransactionIds: string[]
  onToggleTransactionSelection: (transactionId: string) => void
  getMoveTargetsForTransaction: (transaction: Transaction) => MoveTarget[]
  isSortable?: boolean
  isDragDisabled?: boolean
  level3SortMode: SortMode
  level3SortDirection: SortDirection
  handleLevel3DragStart: (activeId: string) => void
  handleReorderLevel3: (level2Id: string, activeId: string, overId: string) => Promise<void>
  isReorderingLevel2: boolean
  isReorderingLevel3: boolean
  getCountForCategory: (id: string) => number
  getAmountNumber: (value: unknown) => number
  styles: Record<string, CSSProperties>
}

export default function Level2Section(props: Props) {
  const {
    l2,
    level3Children,
    selectedMonth,
    isClosingAfterSelectedMonth,
    openLevel2Ids,
    toggleLevel2,
    openLevel3Ids,
    toggleLevel3,
    getSumForLevel2,
    getCountForLevel2,
    getSumForCategory,
    getTransactionsForCategoryAndMonth,
    openAddSubcategoryFor,
    setOpenAddSubcategoryFor,
    newSubcategoryName,
    setNewSubcategoryName,
    handleAddSubcategory,
    openTransactionCreator,
    handleInlineSaveTransaction,
    handleHideCategory,
    handleUndoScheduledHide,
    handleDeleteTransaction,
    handleUpdateTransaction,
    handleMoveTransaction,
    selectedTransactionIds,
    onToggleTransactionSelection,
    getMoveTargetsForTransaction,
    isSortable = false,
    isDragDisabled = false,
    level3SortMode,
    level3SortDirection,
    handleLevel3DragStart,
    handleReorderLevel3,
    isReorderingLevel2,
    isReorderingLevel3,
    getCountForCategory,
    getAmountNumber,
    styles,
  } = props

  const isOpen = openLevel2Ids.includes(l2.id)
  const hasChildren = level3Children.length > 0
  const isLevel2DragBlocked = isDragDisabled || isOpen
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  )
  const sortedLevel3Children = [...level3Children].sort((a, b) => {
    if (level3SortMode === 'sum') {
      const difference =
        level3SortDirection === 'asc'
          ? getSumForCategory(a.id) - getSumForCategory(b.id)
          : getSumForCategory(b.id) - getSumForCategory(a.id)

      if (difference !== 0) {
        return difference
      }

      return a.name.localeCompare(b.name)
    }

    if (level3SortMode === 'frequency') {
      const difference =
        level3SortDirection === 'asc'
          ? getCountForCategory(a.id) - getCountForCategory(b.id)
          : getCountForCategory(b.id) - getCountForCategory(a.id)

      if (difference !== 0) {
        return difference
      }

      return a.name.localeCompare(b.name)
    }

    if (level3SortMode === 'default') {
      const aDefaultOrder =
        typeof a.default_order === 'number'
          ? a.default_order
          : typeof a.sort_order === 'number'
            ? a.sort_order
            : Number.MAX_SAFE_INTEGER
      const bDefaultOrder =
        typeof b.default_order === 'number'
          ? b.default_order
          : typeof b.sort_order === 'number'
            ? b.sort_order
            : Number.MAX_SAFE_INTEGER

      if (aDefaultOrder !== bDefaultOrder) {
        return aDefaultOrder - bDefaultOrder
      }

      return a.name.localeCompare(b.name)
    }

    const aSortOrder = typeof a.sort_order === 'number' ? a.sort_order : Number.MAX_SAFE_INTEGER
    const bSortOrder = typeof b.sort_order === 'number' ? b.sort_order : Number.MAX_SAFE_INTEGER

    if (aSortOrder !== bSortOrder) {
      return aSortOrder - bSortOrder
    }

    return a.name.localeCompare(b.name)
  })
  const hasVisibleOpenLevel3 = sortedLevel3Children.some((category) =>
    openLevel3Ids.includes(category.id)
  )
  const isLevel3DndBlocked = isReorderingLevel2 || isReorderingLevel3 || hasVisibleOpenLevel3
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: l2.id,
    disabled: !isSortable || isLevel2DragBlocked,
  })
  const wrapStyle: CSSProperties = {
    ...styles.l2Wrap,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    position: 'relative',
    zIndex: isDragging ? 1 : 'auto',
  }
  const dragHandleStyle: CSSProperties = {
    ...(styles.dragHandle || {}),
    ...(isLevel2DragBlocked ? styles.dragHandleDisabled || {} : {}),
    cursor: isLevel2DragBlocked ? 'not-allowed' : 'grab',
    opacity: isLevel2DragBlocked ? 0.45 : styles.dragHandle?.opacity,
  }
  const dragHandleTitle = isLevel2DragBlocked
    ? 'Aby przenosić, najpierw zwiń kategorię'
    : undefined

  const getMonthNumber = (monthText: string) => {
    const [year, month] = monthText.split('-').map(Number)
    return year * 100 + month
  }

  const getNextMonthText = (monthText: string) => {
    const [year, month] = monthText.split('-').map(Number)
    const date = new Date(year, month, 1)
    const newYear = date.getFullYear()
    const newMonth = String(date.getMonth() + 1).padStart(2, '0')
    return `${newYear}-${newMonth}`
  }

  const isChildClosingAfterSelectedMonth = (category: Category) => {
    if (!category.active_to) {
      return false
    }

    const hiddenFromMonth = category.active_to.slice(0, 7)
    const nextMonth = getNextMonthText(selectedMonth)

    if (getMonthNumber(hiddenFromMonth) !== getMonthNumber(nextMonth)) {
      return false
    }

    if (!category.reactivate_from) {
      return true
    }

    const returnMonth = category.reactivate_from.slice(0, 7)
    return getMonthNumber(returnMonth) > getMonthNumber(nextMonth)
  }

  const handleHideLevel2Click = async (mode: HideMode) => {
    if (hasChildren) {
      const confirmChildren = confirm(
        'Ta kategoria ma podkategorie.\n\nCzy na pewno chcesz ją ukryć?'
      )

      if (!confirmChildren) {
        return
      }
    }

    await handleHideCategory(l2.id, mode)
  }

  const handleLevel3DragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    await handleReorderLevel3(l2.id, String(active.id), String(over.id))
  }

  const renderLevel3List = () => {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(event) => {
          handleLevel3DragStart(String(event.active.id))
        }}
        onDragEnd={handleLevel3DragEnd}
      >
        <SortableContext
          items={sortedLevel3Children.map((category) => category.id)}
          strategy={verticalListSortingStrategy}
        >
          {sortedLevel3Children.map((l3) => (
            <Level3Section
              key={l3.id}
              l3={l3}
              selectedMonth={selectedMonth}
              isClosingAfterSelectedMonth={isChildClosingAfterSelectedMonth(l3)}
              categorySum={getSumForCategory(l3.id)}
              transactions={getTransactionsForCategoryAndMonth(l3.id)}
              canAddHere={true}
              isOpen={openLevel3Ids.includes(l3.id)}
              toggleLevel3={toggleLevel3}
              handleLevel3DragStart={handleLevel3DragStart}
              openTransactionCreator={openTransactionCreator}
              handleInlineSaveTransaction={handleInlineSaveTransaction}
              handleHideCategory={handleHideCategory}
              handleUndoScheduledHide={handleUndoScheduledHide}
              handleDeleteTransaction={handleDeleteTransaction}
              handleUpdateTransaction={handleUpdateTransaction}
              handleMoveTransaction={handleMoveTransaction}
              selectedTransactionIds={selectedTransactionIds}
              onToggleTransactionSelection={onToggleTransactionSelection}
              getMoveTargetsForTransaction={getMoveTargetsForTransaction}
              isSortable={sortedLevel3Children.length > 1}
              isDragDisabled={isLevel3DndBlocked}
              getAmountNumber={getAmountNumber}
              styles={styles}
            />
          ))}
        </SortableContext>
      </DndContext>
    )
  }

  return (
    <div ref={setNodeRef} style={wrapStyle}>
      <div
        style={{
          ...styles.l2Header,
          boxShadow: isDragging ? '0 12px 24px rgba(0, 0, 0, 0.12)' : styles.l2Header.boxShadow,
        }}
        onClick={() => {
          if (!isDragging) {
            toggleLevel2(l2.id)
          }
        }}
      >
        <div style={styles.l2Left}>
          {isSortable && (
            <button
              type="button"
              aria-label={`Przeciągnij kategorię ${l2.name}`}
              title={dragHandleTitle}
              style={dragHandleStyle}
              disabled={isLevel2DragBlocked}
              onMouseDown={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
              {...attributes}
              {...listeners}
            >
              ::
            </button>
          )}

          <div style={styles.arrow}>{isOpen ? '▼' : '▶'}</div>

          <div>
            <div style={styles.l2Name}>{l2.name}</div>

            <div style={styles.l2Meta}>
              Podkategorie: {level3Children.length} • Wpisy: {getCountForLevel2(l2.id)} • Suma:{' '}
              {getSumForLevel2(l2.id)}
            </div>

            {isClosingAfterSelectedMonth && (
              <div style={styles.closingBadge}>
                zamknie się z końcem tego miesiąca
              </div>
            )}
          </div>
        </div>

        <div style={styles.actions} onClick={(event) => event.stopPropagation()}>
          <button
            style={styles.primaryButton}
            onClick={() => {
              setOpenAddSubcategoryFor(l2.id)
              setNewSubcategoryName('')

              if (!isOpen) {
                toggleLevel2(l2.id)
              }
            }}
          >
            + podkategoria
          </button>

          {isClosingAfterSelectedMonth ? (
            <button
              style={styles.secondaryButton}
              onClick={async () => {
                await handleUndoScheduledHide(l2.id)
              }}
            >
              cofnij zamknięcie
            </button>
          ) : (
            <>
              <button
                style={styles.dangerButton}
                onClick={async () => {
                  await handleHideLevel2Click('now')
                }}
              >
                ukryj teraz
              </button>

              <button
                style={styles.dangerButton}
                onClick={async () => {
                  await handleHideLevel2Click('next')
                }}
              >
                ukryj od następnego
              </button>
            </>
          )}
        </div>
      </div>

      {openAddSubcategoryFor === l2.id && (
        <div style={styles.formRow}>
          <input
            style={styles.input}
            placeholder="Nazwa podkategorii"
            value={newSubcategoryName}
            onChange={(e) => setNewSubcategoryName(e.target.value)}
          />

          <button
            style={styles.primaryButton}
            onClick={async () => {
              await handleAddSubcategory(l2.id)
            }}
          >
            zapisz
          </button>

          <button
            style={styles.secondaryButton}
            onClick={() => {
              setOpenAddSubcategoryFor(null)
              setNewSubcategoryName('')
            }}
          >
            anuluj
          </button>
        </div>
      )}

      {isOpen && !hasChildren && (
        <Level3Section
          l3={l2}
          selectedMonth={selectedMonth}
          isClosingAfterSelectedMonth={isClosingAfterSelectedMonth}
          categorySum={getSumForCategory(l2.id)}
          transactions={getTransactionsForCategoryAndMonth(l2.id)}
          canAddHere={false}
          isOpen={openLevel3Ids.includes(l2.id)}
          toggleLevel3={toggleLevel3}
          handleLevel3DragStart={handleLevel3DragStart}
          openTransactionCreator={openTransactionCreator}
          handleInlineSaveTransaction={handleInlineSaveTransaction}
          handleHideCategory={handleHideCategory}
          handleUndoScheduledHide={handleUndoScheduledHide}
          handleDeleteTransaction={handleDeleteTransaction}
          handleUpdateTransaction={handleUpdateTransaction}
          handleMoveTransaction={handleMoveTransaction}
          selectedTransactionIds={selectedTransactionIds}
          onToggleTransactionSelection={onToggleTransactionSelection}
          getMoveTargetsForTransaction={getMoveTargetsForTransaction}
          getAmountNumber={getAmountNumber}
          styles={styles}
        />
      )}

      {isOpen && hasChildren && renderLevel3List()}
    </div>
  )
}
