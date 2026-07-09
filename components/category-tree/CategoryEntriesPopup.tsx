'use client'

import type { ReactNode } from 'react'
import { FoundationIconButton } from '../ui/FoundationPrimitives'

type CategoryEntriesPopupProps = {
  title: string
  subtitle?: string
  children: ReactNode
  onClose: () => void
}

export default function CategoryEntriesPopup({
  title,
  subtitle,
  children,
  onClose,
}: CategoryEntriesPopupProps) {
  return (
    <div data-category-entries-popup-backdrop="true" onClick={onClose}>
      <section
        data-category-entries-popup="true"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <header data-category-entries-popup-header="true">
          <div>
            <strong>{title}</strong>
            {subtitle && <span>{subtitle}</span>}
          </div>
          <FoundationIconButton
            ariaLabel="Zamknij listę wpisów"
            title="Zamknij"
            density="compact"
            onClick={onClose}
            icon={
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6 6 18"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
              </svg>
            }
          />
        </header>
        <div data-category-entries-popup-body="true">{children}</div>
      </section>
    </div>
  )
}
