'use client'

import type { ReactNode } from 'react'

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
          <button type="button" onClick={onClose} aria-label="Zamknij listę wpisów">
            Zamknij
          </button>
        </header>
        <div data-category-entries-popup-body="true">{children}</div>
      </section>
    </div>
  )
}
