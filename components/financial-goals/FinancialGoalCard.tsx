"use client";

import type { CSSProperties, ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getGoalProgressBarColor } from "../../lib/financialGoals";
import CategoryIcon from "../CategoryIcon";
import {
  DangerAction,
  IconAction,
  SecondaryAction,
} from "../ui/FoundationPrimitives";
import type { GoalCardBaseProps } from "./financialGoalsPanelTypes";

const formatAmount = (value: number) => `${value.toFixed(2)} zł`;


const formatMonthShortLabel = (value: string) => {
  if (!value) return "bieżący";

  const [year, month] = value.split("-").map(Number);

  if (!year || !month) return value;

  return `${String(month).padStart(2, "0")}-${String(year).slice(-2)}`;
};

const getGoalPeriodLabel = (startMonth: string, deadlineMonth: string | null) => {
  const startLabel = formatMonthShortLabel(startMonth);

  if (!deadlineMonth) {
    return `od ${startLabel}`;
  }

  return `${startLabel} → ${formatMonthShortLabel(deadlineMonth)}`;
};

const getStatusTone = (statusLabel: string) => {
  if (statusLabel === "zrealizowany") return "success";
  if (statusLabel === "niezrealizowany") return "danger";
  return "record";
};

const getGoalIconKey = (goal: GoalCardBaseProps["goal"]) => {
  const goalWithAppearance = goal as GoalCardBaseProps["goal"] & {
    icon?: string | null;
    icon_key?: string | null;
    category_icon?: string | null;
  };

  return (
    goalWithAppearance.icon_key ||
    goalWithAppearance.category_icon ||
    goalWithAppearance.icon ||
    "system-goals"
  );
};

const getGoalTone = (goal: GoalCardBaseProps["goal"]) => {
  const goalWithAppearance = goal as GoalCardBaseProps["goal"] & {
    color?: string | null;
    color_tone?: string | null;
  };

  return goalWithAppearance.color_tone || goalWithAppearance.color || "blue";
};

type GoalCardExtraProps = {
  dragHandle?: ReactNode;
  priorityPosition?: number;
};

function GoalCardContent(props: GoalCardBaseProps & GoalCardExtraProps) {
  const {
    goal,
    collectedAmount,
    remainingAmount,
    percentage,
    statusLabel,
    deadlineMonth,
    waitingForLockedMonth,
    allocationPercent,
    isAllocationMode,
    onEdit,
    onDelete,
    dragHandle,
    priorityPosition,
  } = props;

  const isUnsuccessful = statusLabel === "niezrealizowany";
  const progressPercent = isUnsuccessful ? 100 : Math.min(percentage, 100);
  const progressColor = isUnsuccessful
    ? getGoalProgressBarColor(0)
    : getGoalProgressBarColor(percentage);
  const allocationLabel =
    allocationPercent === null ? "0%" : `${allocationPercent}%`;
  const modeLabel = isAllocationMode ? "Alokacja" : "Priorytet";
  const modeValue = isAllocationMode
    ? allocationLabel
    : String(priorityPosition || "—");
  const goalTone = getGoalTone(goal);

  return (
    <>
      <div data-ui-large-record-identity="true" data-ui-record-kind="goal">
        {dragHandle && (
          <span
            data-ui-record-drag-handle="true"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            {dragHandle}
          </span>
        )}

        <span
          data-ui-icon-tile="true"
          data-ui-icon-role="large-record-hero"
          data-ui-tone={goalTone}
          aria-hidden="true"
        >
          <CategoryIcon iconKey={getGoalIconKey(goal)} size="large" />
        </span>

        <div data-ui-large-record-identity-copy="true">
          <strong data-ui-large-record-title="true">{goal.name}</strong>

          <span data-ui-record-meta="true">
            <span
              data-ui-status-inline="true"
              data-ui-tone={getStatusTone(statusLabel)}
            >
              <span aria-hidden="true" />
              {statusLabel}
            </span>

            <span data-ui-record-meta-separator="true" aria-hidden="true">•</span>

            <span data-ui-record-period="true">
              <CategoryIcon iconKey="calendar" size="small" />
              <span>{getGoalPeriodLabel(goal.start_month, deadlineMonth)}</span>
            </span>
          </span>

          {waitingForLockedMonth && (
            <span data-ui-status-inline="true" data-ui-tone="warning">
              <span aria-hidden="true" />
              Oczekuje na zamknięcie miesiąca
            </span>
          )}
        </div>
      </div>

      <div
        data-ui-metric-group="true"
        data-ui-metric-columns="4"
        data-ui-metric-variant="goal-card"
      >
        <div data-ui-metric-card="true" data-ui-tone="neutral-accent-1">
          <span data-ui-metric-card-label="true">
            <CategoryIcon iconKey="system-goals" size="small" />
            Docelowa
          </span>
          <strong data-ui-metric-card-value="true">
            {formatAmount(goal.target_amount)}
          </strong>
          <span data-ui-metric-card-detail="true">Kwota celu</span>
        </div>

        <div
          data-ui-metric-card="true"
          data-ui-tone={isUnsuccessful ? "danger" : "success"}
        >
          <span data-ui-metric-card-label="true">
            <CategoryIcon iconKey="system-income" size="small" />
            Uzbierano
          </span>
          <strong data-ui-metric-card-value="true">
            {formatAmount(collectedAmount)}
          </strong>
          <span data-ui-metric-card-detail="true">
            {percentage.toFixed(0)}% celu
          </span>
        </div>

        <div data-ui-metric-card="true" data-ui-tone="danger">
          <span data-ui-metric-card-label="true">
            <CategoryIcon iconKey="system-expense" size="small" />
            Brakuje
          </span>
          <strong data-ui-metric-card-value="true">
            {formatAmount(remainingAmount)}
          </strong>
          <span data-ui-metric-card-detail="true">Do realizacji</span>
        </div>

        <div data-ui-metric-card="true" data-ui-tone="neutral-accent-2">
          <span data-ui-metric-card-label="true">
            <CategoryIcon iconKey="allocation" size="small" />
            {modeLabel}
          </span>
          <strong data-ui-metric-card-value="true">{modeValue}</strong>
          <span data-ui-metric-card-detail="true">Tryb miesiąca</span>
        </div>
      </div>

      <div
        data-ui-action-group="true"
        data-ui-action-stack="record"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <SecondaryAction onClick={() => onEdit(goal)}>Edytuj</SecondaryAction>
        <DangerAction onClick={() => onDelete(goal.id)}>Usuń</DangerAction>
      </div>

      <div
        data-ui-large-record-progress="true"
        style={
          {
            "--ui-goal-progress": `${progressPercent}%`,
            "--ui-goal-progress-color": progressColor,
          } as CSSProperties
        }
      >
        <div data-ui-large-record-progress-header="true">
          <span>Postęp celu</span>
          <strong>{percentage.toFixed(0)}%</strong>
        </div>
        <span data-ui-large-record-progress-track="true" aria-hidden="true">
          <span data-ui-large-record-progress-fill="true" />
        </span>
      </div>
    </>
  );
}

export function SortableGoalCard(
  props: GoalCardBaseProps & { priorityPosition?: number },
) {
  const { goal } = props;
  const goalTone = getGoalTone(goal);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: goal.id,
  });

  return (
    <article
      ref={setNodeRef}
      data-ui-large-record="true"
      data-ui-record-card="true"
      data-ui-record-type="goal"
      data-ui-record-surface="white"
      data-ui-record-interactive="true"
      data-ui-tone={goalTone}
      data-dragging={isDragging ? "true" : "false"}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <GoalCardContent
        {...props}
        dragHandle={
          <IconAction
            ariaLabel="Przeciągnij, aby zmienić priorytet"
            title="Przeciągnij, aby zmienić priorytet"
            density="compact"
            {...attributes}
            {...listeners}
          >
            <CategoryIcon iconKey="system-drag-handle" size="small" />
          </IconAction>
        }
      />
    </article>
  );
}

export function StaticGoalCard(
  props: GoalCardBaseProps & {
    priorityPosition?: number;
    showInactiveDragHandle?: boolean;
  },
) {
  const goalTone = getGoalTone(props.goal);

  return (
    <article
      data-ui-large-record="true"
      data-ui-record-card="true"
      data-ui-record-type="goal"
      data-ui-record-surface="white"
      data-ui-record-interactive="true"
      data-ui-tone={goalTone}
    >
      <GoalCardContent
        {...props}
        dragHandle={
          props.showInactiveDragHandle ? (
            <IconAction
              ariaLabel="Kolejność w alokacji wynika z procentów"
              title="Kolejność w alokacji wynika z procentów"
              density="compact"
              disabled
            >
              <CategoryIcon iconKey="system-drag-handle" size="small" />
            </IconAction>
          ) : undefined
        }
      />
    </article>
  );
}
