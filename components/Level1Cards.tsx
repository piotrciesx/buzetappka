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
    summary,
  } = props

  return (
    <>
      <div
        data-category-drag-row="true"
        style={styles.l1Header}
        onClick={onToggle}
        {...headerDragProps}
      >
        <div style={styles.l2Left}>
          {dragHandle}
          <div style={styles.arrow}>{isOpen ? '▼' : '▶'}</div>
          <div data-level1-title-block="true">
            <div>{level1Category.name}</div>
            {summary && (
              <div data-level1-summary="true">
                <strong>{summary.amount.toLocaleString('pl-PL')} zl</strong>
                <span>{summary.transactionCount} wpisy</span>
                <span>{summary.childCount} podkategorie</span>
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
              ::
            </button>
          ) : undefined
        }
      >
        {children}
      </Level1CardBase>
    </div>
  )
}
