'use client'

import { useRef, useState } from 'react'
import type { BudgetUtilityPanel } from '../BudgetPageMainPanels'
import { budgetPageStyles } from '../../lib/budgetPageStyles'
import type {
  Category,
  HideMode,
  Tag,
  Transaction,
  TransactionPaymentSplit,
} from '../../lib/budgetPageTypes'
import type { BudgetLimitCreatorRequest } from '../../lib/budget-limits/treeBridge'

export type MigrationPromptState = {
  categoryId: string
  mode: HideMode
  hideMonth: string
  transactionIds: string[]
  targetCategoryId: string
  errorText: string
}

export type SidebarPrimaryPanel = 'profile' | 'settings' | null

export function useBudgetAppCoreState() {
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [activeScopeTransactions, setActiveScopeTransactions] = useState<Transaction[]>([])
  const [trashedTransactions, setTrashedTransactions] = useState<Transaction[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [transactionTagsMap, setTransactionTagsMap] = useState<Record<string, Tag[]>>({})
  const [status, setStatus] = useState('Ładowanie...')
  const [errorText, setErrorText] = useState('')
  const [migrationPromptState, setMigrationPromptState] = useState<MigrationPromptState | null>(
    null
  )
  const [budgetLimitCreatorRequest, setBudgetLimitCreatorRequest] =
    useState<BudgetLimitCreatorRequest | null>(null)

  const [openAddSubcategoryFor, setOpenAddSubcategoryFor] = useState<string | null>(null)
  const [newSubcategoryName, setNewSubcategoryName] = useState('')
  const [newSubcategoryIconKey, setNewSubcategoryIconKey] = useState<string | null>(null)

  const [isSaving, setIsSaving] = useState(false)
  const [showHiddenCategories, setShowHiddenCategories] = useState(false)
  const [transactionPaymentSplitsMap, setTransactionPaymentSplitsMap] = useState<
    Record<string, TransactionPaymentSplit[]>
  >({})
  const amountInputRef = useRef<HTMLInputElement | null>(null)
  const descriptionInputRef = useRef<HTMLInputElement | null>(null)
  const searchPanelRef = useRef<HTMLDivElement | null>(null)

  const [activeSidebarPrimaryPanel, setActiveSidebarPrimaryPanel] =
    useState<SidebarPrimaryPanel>(null)
  const [activeUtilityPanel, setActiveUtilityPanel] = useState<BudgetUtilityPanel>(null)
  const [isDashboardPanelOpen, setIsDashboardPanelOpen] = useState(false)

  return {
    activeSidebarPrimaryPanel,
    activeUtilityPanel,
    activeScopeTransactions,
    amountInputRef,
    budgetLimitCreatorRequest,
    categories,
    descriptionInputRef,
    errorText,
    isDashboardPanelOpen,
    isSaving,
    migrationPromptState,
    newSubcategoryIconKey,
    newSubcategoryName,
    openAddSubcategoryFor,
    searchPanelRef,
    setActiveSidebarPrimaryPanel,
    setActiveUtilityPanel,
    setActiveScopeTransactions,
    setBudgetLimitCreatorRequest,
    setCategories,
    setErrorText,
    setIsDashboardPanelOpen,
    setIsSaving,
    setMigrationPromptState,
    setNewSubcategoryIconKey,
    setNewSubcategoryName,
    setOpenAddSubcategoryFor,
    setShowHiddenCategories,
    setStatus,
    setTags,
    setTransactionPaymentSplitsMap,
    setTransactionTagsMap,
    setTransactions,
    setTrashedTransactions,
    showHiddenCategories,
    status,
    styles: budgetPageStyles,
    tags,
    transactionPaymentSplitsMap,
    transactionTagsMap,
    transactions,
    trashedTransactions,
  }
}
