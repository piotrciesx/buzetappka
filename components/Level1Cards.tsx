'use client'

import { CSSProperties } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Level1CardBaseProps, SortableLevel1CardProps } from '../lib/budgetPageTypes'

function Level1CardBase(props: Level1CardBaseProps) {
  const { level1Category, isOpen, onToggle, children, styles, dragHandle } = props

  return (
    <>
      <div style={styles.l1Header} onClick={onToggle}>
        <div style={styles.l2Left}>
          {dragHandle}
          <div style={styles.arrow}>{isOpen ? '▼' : '▶'}</div>
          <div>{level1Category.name}</div>
        </div>
      </div>

      {children}
    </>
  )
}

export function StaticLevel1Card(props: Level1CardBaseProps) {
  return (
    <div style={props.styles.l1Card}>
      <Level1CardBase {...props} />
    </div>
  )
}

export function SortableLevel1Card(props: SortableLevel1CardProps) {
  const { level1Category, isSortable, isOpen, onToggle, children, styles } = props
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: level1Category.id,
    disabled: !isSortable,
  })
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
        dragHandle={
          isSortable ? (
            <button
              type="button"
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
