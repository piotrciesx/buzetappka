'use client'

import { CSSProperties, KeyboardEvent, useRef, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const normalizeAmountInput = (value: string) => {
  return value.replace(',', '.')
}

type Category = {
  id: string
  name: string
  parent_id: string | null
  level: number
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

type Props = {
  l3: Category
  selectedMonth: string
  isClosingAfterSelectedMonth: boolean
  categorySum: number
  transactions: Transaction[]
  canAddHere: boolean
  isOpen: boolean
  toggleLevel3: (id: string) => void
  handleLevel3DragStart: (activeId: string) => void
  openTransactionCreator: (suggestedCategoryId: string) => void
  handleInlineSaveTransaction: (
    categoryId: string,
    amountText: string,
    descriptionText: string
  ) => Promise<void>
  handleHideCategory: (id: string, mode?: HideMode) => Promise<void>
  handleUndoScheduledHide: (id: string) => Promise<void>
  handleDeleteTransaction: (id: string) => Promise<void>
  handleUpdateTransaction: (id: string, amount: string, description: string) => Promise<void>
  handleMoveTransaction: (id: string, targetCategoryId: string) => Promise<void>
  selectedTransactionIds: string[]
  onToggleTransactionSelection: (transactionId: string) => void
  getMoveTargetsForTransaction: (transaction: Transaction) => MoveTarget[]
  isSortable?: boolean
  isDragDisabled?: boolean
  getAmountNumber: (value: unknown) => number
  styles: Record<string, CSSProperties>
}

export default function Level3Section(props: Props) {
  const {
    l3,
    selectedMonth,
    isClosingAfterSelectedMonth,
    categorySum,
    transactions,
    canAddHere,
    isOpen,
    toggleLevel3,
    handleLevel3DragStart,
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
    getAmountNumber,
    styles,
  } = props

  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const editAmountInputRef = useRef<HTMLInputElement | null>(null)
  const editDescriptionInputRef = useRef<HTMLInputElement | null>(null)

  const [movingTransactionId, setMovingTransactionId] = useState<string | null>(null)
  const [moveTargetCategoryId, setMoveTargetCategoryId] = useState('')
  const [isMoving, setIsMoving] = useState(false)
  const [isInlineAdding, setIsInlineAdding] = useState(false)
  const [inlineAmount, setInlineAmount] = useState('')
  const [inlineDescription, setInlineDescription] = useState('')
  const [isInlineSaving, setIsInlineSaving] = useState(false)
  const inlineAmountInputRef = useRef<HTMLInputElement | null>(null)
  const inlineDescriptionInputRef = useRef<HTMLInputElement | null>(null)
  const isDragBlocked = isDragDisabled || isOpen
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: l3.id,
    disabled: !isSortable || isDragBlocked,
  })
  const wrapStyle: CSSProperties = {
    ...styles.l3Wrap,
    transform: CSS.Transform.toString(transform),
    transition: 'none',
    opacity: isDragging ? 0.7 : 1,
    position: 'relative',
    zIndex: isDragging ? 1 : 'auto',
  }
  const dragHandleStyle: CSSProperties = {
    ...(styles.dragHandle || {}),
    ...(isDragBlocked ? styles.dragHandleDisabled || {} : {}),
    cursor: isDragBlocked ? 'not-allowed' : 'grab',
    opacity: isDragBlocked ? 0.45 : styles.dragHandle?.opacity,
  }
  const dragHandleTitle = isDragBlocked ? 'Aby przenosić, najpierw zwiń kategorię' : undefined

  const startEditingTransaction = (transaction: Transaction) => {
    setMovingTransactionId(null)
    setMoveTargetCategoryId('')
    setEditingTransactionId(transaction.id)
    setEditAmount(String(getAmountNumber(transaction.amount)))
    setEditDescription(transaction.description || '')
  }

  const cancelEditingTransaction = () => {
    setEditingTransactionId(null)
    setEditAmount('')
    setEditDescription('')
    setIsUpdating(false)
  }

  const saveEditingTransaction = async (transactionId: string) => {
    if (isUpdating) {
      return
    }

    setIsUpdating(true)

    try {
      await handleUpdateTransaction(transactionId, editAmount, editDescription)
      cancelEditingTransaction()
    } catch {
      setIsUpdating(false)
    }
  }

  const handleEditFieldKeyDown = async (
    event: KeyboardEvent<HTMLInputElement>,
    transactionId: string,
    field: 'amount' | 'description'
  ) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      cancelEditingTransaction()
      return
    }

    if (event.key !== 'Enter' || event.shiftKey) {
      return
    }

    event.preventDefault()

    if (field === 'amount') {
      editDescriptionInputRef.current?.focus()
      return
    }

    await saveEditingTransaction(transactionId)
  }

  const startMovingTransaction = (transaction: Transaction) => {
    setEditingTransactionId(null)
    setEditAmount('')
    setEditDescription('')
    setMovingTransactionId(transaction.id)
    setMoveTargetCategoryId('')
  }

  const cancelMovingTransaction = () => {
    setMovingTransactionId(null)
    setMoveTargetCategoryId('')
    setIsMoving(false)
  }

  const saveMovingTransaction = async (transactionId: string) => {
    if (isMoving || !moveTargetCategoryId) {
      return
    }

    setIsMoving(true)

    try {
      await handleMoveTransaction(transactionId, moveTargetCategoryId)
      cancelMovingTransaction()
    } catch {
      setIsMoving(false)
    }
  }

  const openInlineAdd = () => {
    setIsInlineAdding(true)
    setInlineAmount('')
    setInlineDescription('')

    if (!isOpen) {
      toggleLevel3(l3.id)
    }

    window.setTimeout(() => {
      inlineAmountInputRef.current?.focus()
    }, 0)
  }

  const cancelInlineAdd = () => {
    setIsInlineAdding(false)
    setInlineAmount('')
    setInlineDescription('')
    setIsInlineSaving(false)
  }

  const saveInlineAdd = async () => {
    if (isInlineSaving) {
      return
    }

    setIsInlineSaving(true)

    try {
      await handleInlineSaveTransaction(l3.id, inlineAmount, inlineDescription)
      cancelInlineAdd()
    } catch {
      setIsInlineSaving(false)
    }
  }

  return (
    <div ref={setNodeRef} style={wrapStyle}>
      <div
        style={{
          ...styles.l3Header,
          boxShadow: isDragging ? '0 12px 24px rgba(0, 0, 0, 0.12)' : styles.l3Header.boxShadow,
        }}
        onClick={() => {
          if (!isDragging) {
            toggleLevel3(l3.id)
          }
        }}
      >
        <div style={styles.l2Left}>
          {isSortable && (
            <button
              type="button"
              aria-label={`Przeciągnij kategorię ${l3.name}`}
              title={dragHandleTitle}
              style={dragHandleStyle}
              disabled={isDragBlocked}
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
              onMouseDown={(event) => {
                event.stopPropagation()
                handleLevel3DragStart(l3.id)
              }}
              {...attributes}
              {...listeners}
            >
              ::
            </button>
          )}

          <div style={styles.arrow}>{isOpen ? '▼' : '▶'}</div>

          <div>
            <div style={styles.l3Name}>
              {l3.name} • {categorySum}
            </div>

            {isClosingAfterSelectedMonth && (
              <div style={styles.closingBadge}>
                zamknie się z końcem tego miesiąca
              </div>
            )}
          </div>
        </div>

        <div style={styles.actions} onClick={(event) => event.stopPropagation()}>
          {canAddHere && (
            <button
              style={styles.primaryButton}
              onClick={() => {
                openInlineAdd()
              }}
            >
              + wpis
            </button>
          )}

          {isClosingAfterSelectedMonth ? (
            <button
              style={styles.secondaryButton}
              onClick={async () => {
                await handleUndoScheduledHide(l3.id)
              }}
            >
              cofnij zamknięcie
            </button>
          ) : (
            <>
              <button
                style={styles.dangerButton}
                onClick={async () => {
                  await handleHideCategory(l3.id, 'now')
                }}
              >
                ukryj teraz
              </button>

              <button
                style={styles.dangerButton}
                onClick={async () => {
                  await handleHideCategory(l3.id, 'next')
                }}
              >
                ukryj od następnego
              </button>
            </>
          )}
        </div>
      </div>

      {isOpen && (
        <div style={styles.transactionsBox}>
          {isInlineAdding && (
            <div style={styles.formRow}>
              <input
                ref={inlineAmountInputRef}
                style={styles.smallInput}
                value={inlineAmount}
                onChange={(event) => setInlineAmount(normalizeAmountInput(event.target.value))}
                placeholder="kwota"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    inlineDescriptionInputRef.current?.focus()
                  }
                }}
              />

              <input
                ref={inlineDescriptionInputRef}
                style={styles.input}
                value={inlineDescription}
                onChange={(event) => setInlineDescription(event.target.value)}
                placeholder="opis"
                onKeyDown={async (event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    await saveInlineAdd()
                  }
                }}
              />

              <button
                style={styles.primaryButton}
                disabled={isInlineSaving}
                onClick={async () => {
                  await saveInlineAdd()
                }}
              >
                {isInlineSaving ? 'zapisywanie...' : 'zapisz'}
              </button>

              <button
                style={styles.secondaryButton}
                onClick={() => {
                  cancelInlineAdd()
                }}
              >
                anuluj
              </button>
            </div>
          )}

          {transactions.length === 0 && (
            <div style={styles.emptyText}>
              Brak wpisów w tym miesiącu
            </div>
          )}

          {transactions.map((transaction) => {
            const isEditing = editingTransactionId === transaction.id
            const isMovingCurrent = movingTransactionId === transaction.id
            const moveTargets = getMoveTargetsForTransaction(transaction)
            const isSelected = selectedTransactionIds.includes(transaction.id)

            return (
              <div key={transaction.id} style={styles.transactionRow}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {
                      onToggleTransactionSelection(transaction.id)
                    }}
                    onClick={(event) => event.stopPropagation()}
                    style={{ marginTop: 4 }}
                  />

                  <div style={styles.transactionLeft}>
                  {isEditing ? (
                    <>
                      <input
                        ref={editAmountInputRef}
                        style={styles.smallInput}
                        value={editAmount}
                        onChange={(event) => setEditAmount(event.target.value)}
                        placeholder="kwota"
                        onKeyDown={async (event) => {
                          await handleEditFieldKeyDown(event, transaction.id, 'amount')
                        }}
                      />

                      <input
                        ref={editDescriptionInputRef}
                        style={styles.input}
                        value={editDescription}
                        onChange={(event) => setEditDescription(event.target.value)}
                        placeholder="opis"
                        onKeyDown={async (event) => {
                          await handleEditFieldKeyDown(event, transaction.id, 'description')
                        }}
                      />

                      <div style={styles.dateText}>{transaction.date}</div>
                    </>
                  ) : isMovingCurrent ? (
                    <>
                      <div style={styles.amountText}>{getAmountNumber(transaction.amount)}</div>
                      <div>{transaction.description || '(bez opisu)'}</div>
                      <div style={styles.dateText}>{transaction.date}</div>
                      <select
                        style={styles.input}
                        value={moveTargetCategoryId}
                        onChange={(event) => setMoveTargetCategoryId(event.target.value)}
                      >
                        <option value="">Wybierz kategorię</option>
                        {moveTargets.map((target) => (
                          <option key={target.id} value={target.id}>
                            {target.label}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <>
                      <div style={styles.amountText}>{getAmountNumber(transaction.amount)}</div>
                      <div>{transaction.description || '(bez opisu)'}</div>
                      <div style={styles.dateText}>{transaction.date}</div>
                    </>
                  )}
                </div>
                </div>

                <div style={styles.actions}>
                  <div style={styles.dateText}>
                    miesiąc: {selectedMonth}
                  </div>

                  {isEditing ? (
                    <>
                      <button
                        style={styles.primaryButton}
                        disabled={isUpdating}
                        onClick={async () => {
                          await saveEditingTransaction(transaction.id)
                        }}
                      >
                        {isUpdating ? 'zapisywanie...' : 'zapisz'}
                      </button>

                      <button
                        style={styles.secondaryButton}
                        onClick={() => {
                          cancelEditingTransaction()
                        }}
                      >
                        anuluj
                      </button>
                    </>
                  ) : isMovingCurrent ? (
                    <>
                      <button
                        style={styles.primaryButton}
                        disabled={isMoving || !moveTargetCategoryId}
                        onClick={async () => {
                          await saveMovingTransaction(transaction.id)
                        }}
                      >
                        {isMoving ? 'zapisywanie...' : 'zapisz'}
                      </button>

                      <button
                        style={styles.secondaryButton}
                        onClick={() => {
                          cancelMovingTransaction()
                        }}
                      >
                        anuluj
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        style={styles.secondaryButton}
                        onClick={() => {
                          startEditingTransaction(transaction)
                        }}
                      >
                        edytuj
                      </button>

                      <button
                        style={styles.secondaryButton}
                        onClick={() => {
                          startMovingTransaction(transaction)
                        }}
                      >
                        przenieś
                      </button>

                      <button
                        style={styles.secondaryButton}
                        onClick={async () => {
                          await handleDeleteTransaction(transaction.id)
                        }}
                      >
                        usuń
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
