'use client'

import { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useIsMobileViewport } from '../lib/useIsMobileViewport'

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

type BaseProps = {
  level1Category: Category
  isOpen: boolean
  onToggle: () => void
  children?: ReactNode
  styles: Record<string, CSSProperties>
  dragHandle?: ReactNode
  headerDragProps?: HTMLAttributes<HTMLDivElement>
  extraActions?: ReactNode
  limitIndicator?: ReactNode
  kind?: 'income' | 'expense' | 'neutral'
  summary?: {
    amount: number
    transactionCount: number
    childCount: number
  }
}

type SortableProps = BaseProps & {
  isSortable: boolean
}

function Level1CardBase(props: BaseProps) {
  const {
    level1Category,
    isOpen,
    onToggle,
    children,
    styles,
    dragHandle,
    headerDragProps,
    extraActions,
    limitIndicator,
    kind = 'neutral',
    summary,
  } = props

  return (
    <>
      <div
        data-category-drag-row="true"
        data-level1-kind={kind}
        style={styles.l1Header}
        onClick={onToggle}
        {...headerDragProps}
      >
        <div style={styles.l2Left}>
          {dragHandle}
          <div style={styles.arrow} data-level1-toggle-icon="true" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                d={isOpen ? 'm7 10 5 5 5-5' : 'm10 7 5 5-5 5'}
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </div>
          <div data-level1-title-block="true">
            <div>{level1Category.name}</div>
            {summary && (
              <div data-level1-summary="true">
                <strong>{summary.amount.toLocaleString('pl-PL')} zł</strong>
              </div>
            )}
            {limitIndicator}
          </div>
        </div>

        {extraActions && (
          <div data-category-actions="true" style={styles.actions} onClick={(event) => event.stopPropagation()}>
            {extraActions}
          </div>
        )}
      </div>

      {children}
    </>
  )
}

export function StaticLevel1Card(props: BaseProps) {
  return (
    <div style={props.styles.l1Card}>
      <Level1CardBase {...props} />
    </div>
  )
}

export function SortableLevel1Card(props: SortableProps) {
  const {
    level1Category,
    isSortable,
    isOpen,
    onToggle,
    children,
    styles,
    extraActions,
    limitIndicator,
    kind,
    summary,
  } = props

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: level1Category.id,
    disabled: !isSortable,
  })
  const isMobileViewport = useIsMobileViewport()

  const wrapStyle: CSSProperties = {
    ...styles.l1Card,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    position: 'relative',
    zIndex: isDragging ? 1 : 'auto',
  }

  const dragHandleStyle: CSSProperties = {
    ...(styles.dragHandle || {}),
    cursor: 'grab',
  }

  return (
    <div ref={setNodeRef} style={wrapStyle}>
      <Level1CardBase
        level1Category={level1Category}
        isOpen={isOpen}
        onToggle={() => {
          if (!isDragging) {
            onToggle()
          }
        }}
        styles={styles}
        headerDragProps={
          isSortable && isMobileViewport
            ? ({
                ...attributes,
                ...listeners,
              } as HTMLAttributes<HTMLDivElement>)
            : undefined
        }
        extraActions={extraActions}
        limitIndicator={limitIndicator}
        kind={kind}
        summary={summary}
        dragHandle={
          isSortable && !isMobileViewport ? (
            <button
              type="button"
              data-category-drag-handle="true"
              aria-label={`Przeciągnij kategorię ${level1Category.name}`}
              style={dragHandleStyle}
              onMouseDown={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
              {...attributes}
              {...listeners}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path
                  d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                />
              </svg>
            </button>
          ) : undefined
        }
      >
        {children}
      </Level1CardBase>
    </div>
  )
}
