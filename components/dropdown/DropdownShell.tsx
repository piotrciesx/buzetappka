'use client'

import {
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'

type DropdownSize = 'content' | 'action' | 'utility' | 'search'
type DropdownAlign = 'start' | 'end'

type TriggerProps = {
  ref: (node: HTMLElement | null) => void
  id: string
  'aria-controls': string
  'aria-expanded': boolean
  'aria-haspopup': 'menu'
  'data-active': 'true' | 'false'
  onClick: (event: MouseEvent<HTMLElement>) => void
}

type DropdownShellProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger: (props: TriggerProps) => ReactNode
  children: ReactNode
  align?: DropdownAlign
  size?: DropdownSize
  className?: string
  panelAttributes?: Record<string, string>
}

const VIEWPORT_PADDING = 12
const GAP = 6

const sizeTokens: Record<DropdownSize, { minWidth: string; maxWidth: string }> = {
  content: {
    minWidth: 'max-content',
    maxWidth: 'var(--ui-dropdown-max-width)',
  },
  action: {
    minWidth: 'var(--ui-dropdown-width-action)',
    maxWidth: 'var(--ui-dropdown-max-width-action)',
  },
  utility: {
    minWidth: 'var(--ui-popover-min-width)',
    maxWidth: 'var(--ui-dropdown-max-width-utility)',
  },
  search: {
    minWidth: 'var(--ui-dropdown-width-searchable)',
    maxWidth: 'var(--ui-dropdown-max-width-searchable)',
  },
}

export default function DropdownShell({
  open,
  onOpenChange,
  trigger,
  children,
  align = 'end',
  size = 'content',
  className = '',
  panelAttributes,
}: DropdownShellProps) {
  const id = useId()
  const triggerRef = useRef<HTMLElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({
    position: 'fixed',
    top: 0,
    left: 0,
    visibility: 'hidden',
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const positionPanel = useCallback(() => {
    const triggerNode = triggerRef.current
    const panelNode = panelRef.current

    if (!triggerNode || !panelNode) {
      return
    }

    const triggerRect = triggerNode.getBoundingClientRect()
    const panelRect = panelNode.getBoundingClientRect()
    const panelWidth = Math.min(
      Math.max(panelRect.width || triggerRect.width, triggerRect.width),
      window.innerWidth - VIEWPORT_PADDING * 2
    )
    const panelHeight = Math.min(panelRect.height || 160, window.innerHeight - VIEWPORT_PADDING * 2)
    const spaceBelow = window.innerHeight - triggerRect.bottom - VIEWPORT_PADDING
    const spaceAbove = triggerRect.top - VIEWPORT_PADDING
    const opensUp = panelHeight > spaceBelow && spaceAbove > spaceBelow
    const top = opensUp
      ? Math.max(VIEWPORT_PADDING, triggerRect.top - panelHeight - GAP)
      : Math.min(triggerRect.bottom + GAP, window.innerHeight - panelHeight - VIEWPORT_PADDING)
    const desiredLeft = align === 'end' ? triggerRect.right - panelWidth : triggerRect.left
    const left = Math.min(
      Math.max(VIEWPORT_PADDING, desiredLeft),
      window.innerWidth - panelWidth - VIEWPORT_PADDING
    )

    setPanelStyle({
      position: 'fixed',
      top,
      left,
      maxWidth: `calc(100vw - ${VIEWPORT_PADDING * 2}px)`,
      maxHeight: `calc(100dvh - ${VIEWPORT_PADDING * 2}px)`,
      visibility: 'visible',
    })
  }, [align])

  useLayoutEffect(() => {
    if (!open) {
      return
    }

    setPanelStyle((currentStyle) => ({
      ...currentStyle,
      visibility: 'hidden',
    }))
    positionPanel()
    const frame = window.requestAnimationFrame(positionPanel)

    return () => window.cancelAnimationFrame(frame)
  }, [open, positionPanel, children])

  useEffect(() => {
    if (!open) {
      return
    }

    const close = () => onOpenChange(false)
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target instanceof Node ? event.target : null

      if (!target) {
        close()
        return
      }

      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return
      }

      close()
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close()
      }
    }
    const handleGlobalClose = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.source === id) {
        return
      }

      close()
    }

    document.addEventListener('pointerdown', handlePointerDown, true)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('budget-close-floating-ui', handleGlobalClose)
    window.addEventListener('resize', positionPanel)
    window.addEventListener('scroll', positionPanel, true)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('budget-close-floating-ui', handleGlobalClose)
      window.removeEventListener('resize', positionPanel)
      window.removeEventListener('scroll', positionPanel, true)
    }
  }, [id, onOpenChange, open, positionPanel])

  const triggerProps: TriggerProps = {
    ref: (node) => {
      triggerRef.current = node
    },
    id: `${id}-trigger`,
    'aria-controls': `${id}-panel`,
    'aria-expanded': open,
    'aria-haspopup': 'menu',
    'data-active': open ? 'true' : 'false',
    onClick: (event) => {
      event.stopPropagation()
      const nextOpen = !open

      if (nextOpen) {
        window.dispatchEvent(
          new CustomEvent('budget-close-floating-ui', {
            detail: { source: id },
          })
        )
      }

      onOpenChange(nextOpen)
    },
  }

  const shell = open ? (
    <div
      {...panelAttributes}
      ref={panelRef}
      id={`${id}-panel`}
      role="menu"
      className={`ui-dropdown ui-dropdown--${size} ${className}`.trim()}
      data-dropdown-shell="true"
      data-dropdown-size={size}
      data-dropdown-align={align}
      style={{
        ...panelStyle,
        minWidth: sizeTokens[size].minWidth,
        maxWidth: sizeTokens[size].maxWidth,
      }}
    >
      {children}
    </div>
  ) : null

  return (
    <>
      {trigger(triggerProps)}
      {mounted && shell ? createPortal(shell, document.body) : null}
    </>
  )
}
