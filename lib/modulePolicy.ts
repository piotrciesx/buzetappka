import type { AppModuleKey, AppModuleVisibility } from './useAppModuleVisibility'

export type EffectiveAppMode = 'simple' | 'full'

export const OPTIONAL_APP_MODULE_KEYS: AppModuleKey[] = [
  'paymentSources',
  'recurringTransactions',
  'financialGoals',
  'budgetLimits',
]

export const getEffectiveAppMode = (simpleMode: boolean): EffectiveAppMode =>
  simpleMode ? 'simple' : 'full'

export const getEffectiveModuleVisibility = ({
  visibleModules,
  simpleMode,
}: {
  visibleModules: AppModuleVisibility
  simpleMode: boolean
}): AppModuleVisibility => {
  const effectiveVisibility = { ...visibleModules }

  if (getEffectiveAppMode(simpleMode) === 'simple') {
    OPTIONAL_APP_MODULE_KEYS.forEach((moduleKey) => {
      effectiveVisibility[moduleKey] = false
    })
  }

  return effectiveVisibility
}

export const isModuleEnabledForLogic = (
  visibleModules: AppModuleVisibility,
  moduleKey: AppModuleKey
) => visibleModules[moduleKey] === true

