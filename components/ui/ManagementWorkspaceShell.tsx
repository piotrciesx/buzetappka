'use client'

import type { ReactNode } from 'react'

type ManagementWorkspaceShellProps = {
  title: string
  description?: string
  onBackToBudget: () => void
  primaryActionLabel?: string | null
  onPrimaryAction?: () => void
  panelKind?: string
  children: ReactNode
}

export default function ManagementWorkspaceShell({
  title,
  description,
  onBackToBudget,
  primaryActionLabel,
  onPrimaryAction,
  panelKind,
  children,
}: ManagementWorkspaceShellProps) {
  return (
    <section
      data-management-workspace-shell="true"
      data-management-workspace-layout="split"
      data-management-workspace-panel={panelKind}
      aria-label={title}
    >
      <header data-management-workspace-header="true">
        <div data-management-workspace-heading="true">
          <button
            type="button"
            data-management-workspace-back="true"
            onClick={onBackToBudget}
          >
            ← Wróć do budżetu
          </button>
          <div data-management-workspace-copy="true">
            <h1>{title}</h1>
            {description && <p>{description}</p>}
          </div>
        </div>

        {primaryActionLabel && onPrimaryAction && (
          <button
            type="button"
            data-management-workspace-primary="true"
            data-management-module-add="true"
            onClick={onPrimaryAction}
          >
            <span aria-hidden="true" data-management-module-add-icon="true">+</span>
            <span>{primaryActionLabel}</span>
          </button>
        )}
      </header>

      <div data-management-workspace-body="true">{children}</div>
    </section>
  )
}
