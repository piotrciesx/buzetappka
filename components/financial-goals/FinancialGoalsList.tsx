import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { closestCenter, DndContext, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { FinancialGoal, FinancialGoalAllocationMode } from '../../lib/budgetPageTypes'
import CategoryIcon from '../CategoryIcon'
import { DangerAction, SecondaryAction, SectionHeader } from '../ui/FoundationPrimitives'
import { SortableGoalCard, StaticGoalCard } from './FinancialGoalCard'

type ProgressByGoalId = Record<
  string,
  {
    collectedAmount: number
    remainingAmount: number
    percentage: number
    statusLabel: string
    completionMonth: string | null
    deadlineMonth: string | null
    waitingForLockedMonth?: boolean
  }
>

type Props = {
  activeGoals: FinancialGoal[]
  allocationGoals: FinancialGoal[]
  archivedGoals: FinancialGoal[]
  effectiveMode: FinancialGoalAllocationMode
  progressByGoalId: ProgressByGoalId
  pendingAllocationByGoalId: Record<string, number>
  lockedAllocationGoalIds: Set<string>
  lockedMonthsSet: Set<string>
  sensors: Parameters<typeof DndContext>[0]['sensors']
  handleDragEnd: (event: DragEndEvent) => void
  handleAllocationChange: (goalId: string, nextValue: number) => void
  handleAllocationDragStart: () => void
  handleAllocationCommit: () => void
  handleToggleAllocationLock: (goalId: string) => void
  totalPercent: number
  monthSurplus: number
  isAllocationSaving: boolean
  openEditModal: (goal: FinancialGoal) => void
  onDeleteGoal: (goalId: string) => Promise<void>
  onSetGoalStatus: (goalId: string, status: NonNullable<FinancialGoal['status']>) => Promise<void>
}

const formatAmount = (value: number) => `${value.toFixed(2)} zł`

const getProgressProps = (
  goal: FinancialGoal,
  progressByGoalId: ProgressByGoalId,
  lockedMonthsSet: Set<string>
) => {
  const progress = progressByGoalId[goal.id]

  return {
    collectedAmount: progress?.collectedAmount || 0,
    remainingAmount: progress?.remainingAmount || goal.target_amount,
    percentage: progress?.percentage || 0,
    statusLabel: progress?.statusLabel || 'w trakcie',
    completionMonth: progress?.completionMonth || null,
    deadlineMonth: progress?.deadlineMonth || goal.deadline_month || null,
    waitingForLockedMonth:
      progress?.waitingForLockedMonth === true ||
      Boolean(progress?.completionMonth) &&
      progress?.statusLabel === 'w trakcie' &&
      !lockedMonthsSet.has(progress.completionMonth as string),
  }
}

export default function FinancialGoalsList({
  activeGoals,
  allocationGoals,
  archivedGoals,
  effectiveMode,
  progressByGoalId,
  pendingAllocationByGoalId,
  lockedAllocationGoalIds,
  lockedMonthsSet,
  sensors,
  handleDragEnd,
  handleAllocationChange,
  handleAllocationDragStart,
  handleAllocationCommit,
  handleToggleAllocationLock,
  totalPercent,
  monthSurplus,
  isAllocationSaving,
  openEditModal,
  onDeleteGoal,
  onSetGoalStatus,
}: Props) {
  const [activeList, setActiveList] = useState<'current' | 'archived'>('current')
  const [isAllocationMenuOpen, setIsAllocationMenuOpen] = useState(false)
  const [archiveFilter, setArchiveFilter] = useState<'all' | 'completed' | 'not_completed'>('all')
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const allocationMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isAllocationMenuOpen) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      if (!allocationMenuRef.current?.contains(target)) {
        setIsAllocationMenuOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [isAllocationMenuOpen])

  const visibleGoals = activeList === 'current'
    ? activeGoals
    : archivedGoals.filter((goal) =>
        archiveFilter === 'all' ||
        (archiveFilter === 'completed'
          ? goal.status === 'archived_completed' || progressByGoalId[goal.id]?.statusLabel === 'zrealizowany'
          : goal.status === 'archived_not_completed' || progressByGoalId[goal.id]?.statusLabel === 'niezrealizowany'))
  const isCurrentList = activeList === 'current'
  const selectedGoal = visibleGoals.find((goal) => goal.id === selectedGoalId) || null

  useEffect(() => {
    setSelectedGoalId(null)
  }, [activeList, archiveFilter, effectiveMode])

  const renderAllocationManager = () => {
    if (effectiveMode !== 'allocation' || !isCurrentList || allocationGoals.length === 0) {
      return null
    }

    return (
      <div
        ref={allocationMenuRef}
        data-financial-goals-allocation-control="true"
        data-open={isAllocationMenuOpen ? 'true' : 'false'}
      >
        <button
          type="button"
          className="ui-button--utility"
          data-financial-goals-allocation-trigger="true"
          aria-expanded={isAllocationMenuOpen}
          onClick={() => setIsAllocationMenuOpen((value) => !value)}
        >
          <CategoryIcon iconKey="allocation" size="small" />
          Ustaw alokację
          <span data-ui-picker-chevron="true" aria-hidden="true" />
        </button>

        {isAllocationMenuOpen && (
          <div data-financial-goals-allocation-menu="true">
            <header data-financial-goals-allocation-menu-header="true">
              <span>
                <strong>Suma alokacji:</strong> {totalPercent.toFixed(0)}%
              </span>
              <span>
                <strong>Nadwyżka:</strong> {formatAmount(monthSurplus)}
              </span>
              {isAllocationSaving && <small>Zapisywanie...</small>}
            </header>

            <div data-financial-goals-allocation-rows="true">
              {allocationGoals.map((goal) => {
                const value = pendingAllocationByGoalId[goal.id] ?? 0
                const isLocked = lockedAllocationGoalIds.has(goal.id)

                return (
                  <div key={goal.id} data-financial-goals-allocation-row="true">
                    <strong>{goal.name}</strong>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={value}
                      disabled={isLocked}
                      onPointerDown={handleAllocationDragStart}
                      onPointerUp={handleAllocationCommit}
                      onMouseUp={handleAllocationCommit}
                      onTouchEnd={handleAllocationCommit}
                      onKeyUp={handleAllocationCommit}
                      onChange={(event) => handleAllocationChange(goal.id, Number(event.target.value))}
                    />
                    <span>{value}%</span>
                    <button
                      type="button"
                      className="ui-button--icon"
                      data-financial-goals-lock-action="true"
                      data-active={isLocked ? 'true' : 'false'}
                      aria-label={isLocked ? 'Odblokuj alokację' : 'Zablokuj alokację'}
                      title={isLocked ? 'Odblokuj alokację' : 'Zablokuj alokację'}
                      onClick={() => handleToggleAllocationLock(goal.id)}
                    >
                      <CategoryIcon iconKey={isLocked ? 'lock' : 'unlock'} size="small" />
                    </button>
                  </div>
                )
              })}
            </div>

            <footer data-financial-goals-allocation-menu-footer="true">
              <span data-state={totalPercent === 100 ? 'valid' : 'invalid'}>
                {totalPercent === 100 ? 'Alokacja gotowa do zapisu.' : 'Suma musi wynosić 100%.'}
              </span>
            </footer>
          </div>
        )}
      </div>
    )
  }

  const renderGoalList = () => {
    if (visibleGoals.length === 0) {
      return (
        <div data-ui-empty-block="true">
          {isCurrentList ? 'Brak aktywnych celów.' : 'Brak celów historycznych.'}
        </div>
      )
    }

    if (selectedGoal) {
      const progress = getProgressProps(selectedGoal, progressByGoalId, lockedMonthsSet)
      const allocationPercent = pendingAllocationByGoalId[selectedGoal.id] ?? null

      return (
        <div data-ui-management-split="true">
          <div data-ui-management-split-list="true">
            {visibleGoals.map((goal, index) => (
              <StaticGoalCard
                key={goal.id}
                goal={goal}
                {...getProgressProps(goal, progressByGoalId, lockedMonthsSet)}
                allocationPercent={pendingAllocationByGoalId[goal.id] ?? null}
                isAllocationMode={isCurrentList && effectiveMode === 'allocation'}
                priorityPosition={index + 1}
                isSelected={goal.id === selectedGoal.id}
                isCompact
                onOpen={(goal) => setSelectedGoalId(goal.id)}
                onEdit={openEditModal}
                onDelete={(goalId) => void onDeleteGoal(goalId)}
                onSetStatus={(goalId, status) => void onSetGoalStatus(goalId, status)}
              />
            ))}
          </div>

          <section data-ui-management-details-panel="true">
            <header data-ui-management-details-header="true">
              <div data-ui-large-record-identity="true">
                <span data-ui-icon-tile="true" data-ui-icon-role="large-record-hero" data-ui-tone="blue" aria-hidden="true">
                  <CategoryIcon iconKey="system-goals" size="large" />
                </span>
                <div data-ui-large-record-identity-copy="true">
                  <strong data-ui-large-record-title="true">{selectedGoal.name}</strong>
                  <span data-ui-record-meta="true">{progress.deadlineMonth ? `do ${progress.deadlineMonth}` : 'bez terminu'} · {isCurrentList ? 'cel bieżący' : 'cel historyczny'}</span>
                  <span data-ui-status-pill="true" data-ui-tone={progress.statusLabel === 'zrealizowany' ? 'success' : progress.statusLabel === 'niezrealizowany' ? 'danger' : selectedGoal.status === 'paused' ? 'warning' : 'neutral-blue'}>{progress.statusLabel}</span>
                </div>
              </div>
              <button type="button" data-ui-management-details-close="true" aria-label="Zamknij szczegóły" onClick={() => setSelectedGoalId(null)}>
                <CategoryIcon iconKey="close" size="small" />
              </button>
            </header>

            <div data-ui-management-details-metrics="true">
              <div data-ui-metric-card="true"><span data-ui-metric-card-label="true">Cel</span><strong data-ui-metric-card-value="true">{formatAmount(selectedGoal.target_amount)}</strong></div>
              <div data-ui-metric-card="true" data-ui-tone="success"><span data-ui-metric-card-label="true">Uzbierano</span><strong data-ui-metric-card-value="true">{formatAmount(progress.collectedAmount)}</strong></div>
              <div data-ui-metric-card="true" data-ui-tone="danger"><span data-ui-metric-card-label="true">Brakuje</span><strong data-ui-metric-card-value="true">{formatAmount(progress.remainingAmount)}</strong></div>
              <div data-ui-metric-card="true"><span data-ui-metric-card-label="true">{effectiveMode === 'allocation' ? 'Alokacja' : 'Priorytet'}</span><strong data-ui-metric-card-value="true">{effectiveMode === 'allocation' ? `${allocationPercent ?? 0}%` : '—'}</strong></div>
            </div>

            <section data-ui-management-details-section="true">
              <h4>Postęp celu</h4>
              <div data-ui-large-record-progress="true" style={{ '--ui-goal-progress': `${Math.min(progress.percentage, 100)}%` } as CSSProperties}>
                <div data-ui-large-record-progress-header="true"><span>Realizacja</span><strong>{progress.percentage.toFixed(0)}%</strong></div>
                <span data-ui-large-record-progress-track="true" aria-hidden="true"><span data-ui-large-record-progress-fill="true" /></span>
              </div>
            </section>

            <section data-ui-management-details-section="true">
              <h4>Historia / momentum</h4>
              <p>Tu moduł lokalnie pokaże historię celu, momentum oraz operacje związane z celem.</p>
            </section>

            <footer data-ui-action-group="true" data-ui-details-action-bar="true">
              <SecondaryAction onClick={() => openEditModal(selectedGoal)}>Edytuj</SecondaryAction>
              {(selectedGoal.status === 'active' || !selectedGoal.status) && <SecondaryAction onClick={() => void onSetGoalStatus(selectedGoal.id, 'paused')}>Wstrzymaj</SecondaryAction>}
              {selectedGoal.status === 'paused' && <SecondaryAction onClick={() => void onSetGoalStatus(selectedGoal.id, 'active')}>Wznów</SecondaryAction>}
              {(selectedGoal.status === 'active' || selectedGoal.status === 'paused' || !selectedGoal.status) && <SecondaryAction onClick={() => void onSetGoalStatus(selectedGoal.id, 'archived_completed')}>Zrealizuj</SecondaryAction>}
              {(selectedGoal.status === 'active' || selectedGoal.status === 'paused' || !selectedGoal.status) && <DangerAction onClick={() => void onSetGoalStatus(selectedGoal.id, 'archived_not_completed')}>Archiwizuj bez realizacji</DangerAction>}
            </footer>
          </section>
        </div>
      )
    }

    if (isCurrentList && effectiveMode === 'priority') {
      return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={allocationGoals.map((goal) => goal.id)} strategy={verticalListSortingStrategy}>
            <div
              data-ui-large-record-list="true"
              data-financial-goals-list-viewport="true"
            >
              {allocationGoals.map((goal, index) => (
                <SortableGoalCard
                  key={goal.id}
                  goal={goal}
                  {...getProgressProps(goal, progressByGoalId, lockedMonthsSet)}
                  allocationPercent={pendingAllocationByGoalId[goal.id] ?? null}
                  isAllocationMode={false}
                  priorityPosition={index + 1}
                  onOpen={(goal) => setSelectedGoalId(goal.id)}
                  isSelected={goal.id === selectedGoalId}
                  onEdit={openEditModal}
                  onDelete={(goalId) => void onDeleteGoal(goalId)}
                  onSetStatus={(goalId, status) => void onSetGoalStatus(goalId, status)}
                />
              ))}
              {activeGoals.filter((goal) => goal.status === 'paused').map((goal) => (
                <StaticGoalCard
                  key={goal.id}
                  goal={goal}
                  {...getProgressProps(goal, progressByGoalId, lockedMonthsSet)}
                  allocationPercent={null}
                  isAllocationMode={false}
                  onOpen={(goal) => setSelectedGoalId(goal.id)}
                  isSelected={goal.id === selectedGoalId}
                  onEdit={openEditModal}
                  onDelete={(goalId) => void onDeleteGoal(goalId)}
                  onSetStatus={(goalId, status) => void onSetGoalStatus(goalId, status)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )
    }

    return (
      <div
        data-ui-large-record-list="true"
        data-financial-goals-list-viewport="true"
      >
        {visibleGoals.map((goal, index) => (
          <StaticGoalCard
            key={goal.id}
            goal={goal}
            {...getProgressProps(goal, progressByGoalId, lockedMonthsSet)}
            allocationPercent={pendingAllocationByGoalId[goal.id] ?? null}
            isAllocationMode={isCurrentList && effectiveMode === 'allocation'}
            priorityPosition={index + 1}
            showInactiveDragHandle={isCurrentList && effectiveMode === 'allocation'}
            onOpen={(goal) => setSelectedGoalId(goal.id)}
            isSelected={goal.id === selectedGoalId}
            onEdit={openEditModal}
            onDelete={(goalId) => void onDeleteGoal(goalId)}
            onSetStatus={(goalId, status) => void onSetGoalStatus(goalId, status)}
          />
        ))}
      </div>
    )
  }

  return (
    <section data-ui-section="true" data-ui-large-section="true" data-financial-goals-current-list="true">
      <SectionHeader
        tone="neutral-blue"
        icon={<CategoryIcon iconKey={isCurrentList ? 'system-goals' : 'calendar'} size="small" />}
        title={isCurrentList ? 'Cele aktualne' : 'Cele historyczne'}
        description={`${visibleGoals.length} ${isCurrentList ? 'aktywnych' : 'historycznych'}`}
        trailing={
          <>
            {renderAllocationManager()}

            <div data-ui-list-switch="true" data-ui-management-switch="true" role="group" aria-label="Zakres celów">
              <button
                type="button"
                data-active={activeList === 'current' ? 'true' : undefined}
                onClick={() => {
                  setActiveList('current')
                  setIsAllocationMenuOpen(false)
                }}
              >
                Cele aktualne
              </button>
              <button
                type="button"
                data-active={activeList === 'archived' ? 'true' : undefined}
                onClick={() => {
                  setActiveList('archived')
                  setIsAllocationMenuOpen(false)
                }}
              >
                Cele historyczne
              </button>
            </div>
          </>
        }
      />

      {renderGoalList()}
      {activeList === 'archived' && (
        <div data-ui-list-switch="true" data-ui-management-switch="true" role="group" aria-label="Wynik archiwizacji">
          <button type="button" data-active={archiveFilter === 'all' ? 'true' : undefined} onClick={() => setArchiveFilter('all')}>Wszystkie archiwalne</button>
          <button type="button" data-active={archiveFilter === 'completed' ? 'true' : undefined} onClick={() => setArchiveFilter('completed')}>Zrealizowane</button>
          <button type="button" data-active={archiveFilter === 'not_completed' ? 'true' : undefined} onClick={() => setArchiveFilter('not_completed')}>Niezrealizowane</button>
        </div>
      )}
    </section>
  )
}
