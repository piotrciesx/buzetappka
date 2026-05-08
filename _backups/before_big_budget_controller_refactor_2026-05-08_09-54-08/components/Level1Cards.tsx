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

const moneyFormatter = new Intl.NumberFormat('pl-PL', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function getTrendPath(kind: 'income' | 'expense' | 'neutral') {
  if (kind === 'expense') return 'M7 7h10v10M17 7 7 17'
  if (kind === 'income') return 'M7 17h10V7M17 17 7 7'
  return 'M12 5v14M5 12h14'
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
        data-level1-card="true"
        data-level1-kind={kind}
        data-level1-open={isOpen ? 'true' : 'false'}
        style={styles.l1Header}
        onClick={onToggle}
        {...headerDragProps}
      >
        <div data-level1-card-content="true">
          <div data-level1-card-top="true">
            {dragHandle}

            <button
              type="button"
              data-level1-toggle-icon="true"
              aria-label={isOpen ? `Zwiń ${level1Category.name}` : `Rozwiń ${level1Category.name}`}
              onClick={(event) => {
                event.stopPropagation()
                onToggle()
              }}
            >
              <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
                <path
                  d={isOpen ? 'm7 10 5 5 5-5' : 'm10 7 5 5-5 5'}
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </button>

            <div data-level1-trend-icon="true" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path
                  d={getTrendPath(kind)}
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>

          <div data-level1-title-block="true">
            <div>{level1Category.name}</div>

            {summary && (
              <div data-level1-summary="true">
                <strong>{moneyFormatter.format(summary.amount)} zł</strong>
              </div>
            )}

            {limitIndicator}
          </div>
        </div>

        {extraActions && (
          <div
            data-category-actions="true"
            style={styles.actions}
            onClick={(event) => event.stopPropagation()}
          >
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
    <div style={props.styles.l1Card} data-level1-card-shell="true">
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
    <div ref={setNodeRef} style={wrapStyle} data-level1-card-shell="true">
      <Level1CardBase
        level1Category={level1Category}
        isOpen={isOpen}
        onToggle={() => {
          if (!isDragging) onToggle()
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