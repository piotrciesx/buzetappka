const getMonthDate = (monthText: string) => `${monthText}-01`

export const loadLockedMonths = async (supabase: any, profileId: string) => {
  const { data, error } = await supabase
    .from('profile_locked_months')
    .select('month_date')
    .eq('profile_id', profileId)
    .order('month_date', { ascending: false })

  if (error) {
    throw error
  }

  return (data || [])
    .map((item: { month_date: string | null }) => item.month_date?.slice(0, 7) || '')
    .filter(Boolean)
}

export const lockMonth = async (supabase: any, profileId: string, monthText: string) => {
  const { error } = await supabase.from('profile_locked_months').upsert(
    {
      profile_id: profileId,
      month_date: getMonthDate(monthText),
    },
    {
      onConflict: 'profile_id,month_date',
      ignoreDuplicates: true,
    }
  )

  if (error) {
    throw error
  }
}

export const unlockMonth = async (supabase: any, profileId: string, monthText: string) => {
  const { error } = await supabase
    .from('profile_locked_months')
    .delete()
    .eq('profile_id', profileId)
    .eq('month_date', getMonthDate(monthText))

  if (error) {
    throw error
  }
}

export const isMonthLocked = (monthText: string, lockedMonths: Set<string>) => {
  return lockedMonths.has(monthText)
}
