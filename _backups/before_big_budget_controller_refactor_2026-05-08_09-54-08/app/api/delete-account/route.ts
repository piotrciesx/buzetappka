import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

type ProfileMembershipRow = {
  profile_id: string
  role: string | null
}

type DeleteAccountRequestBody = {
  activeProfileId?: unknown
  confirmationText?: unknown
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const getBearerToken = (request: Request) => {
  const authorizationHeader = request.headers.get('authorization') || ''
  const [scheme, token] = authorizationHeader.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return null
  }

  return token
}

const createJsonResponse = (body: Record<string, unknown>, status: number) =>
  Response.json(body, { status })

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return createJsonResponse(
      {
        error:
          'Usuwanie konta wymaga konfiguracji po stronie serwera. Dodaj do .env.local: SUPABASE_SERVICE_ROLE_KEY=... i uruchom aplikację ponownie.',
      },
      501
    )
  }

  const token = getBearerToken(request)

  if (!token) {
    return createJsonResponse({ error: 'Brak tokenu autoryzacji.' }, 401)
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey)
  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const { data: userData, error: userError } = await authClient.auth.getUser(token)

  if (userError || !userData.user) {
    return createJsonResponse({ error: userError?.message || 'Nieprawidłowa sesja.' }, 401)
  }

  const body = (await request.json().catch(() => ({}))) as DeleteAccountRequestBody
  const activeProfileId =
    typeof body.activeProfileId === 'string' && body.activeProfileId ? body.activeProfileId : null
  const confirmationText =
    typeof body.confirmationText === 'string' ? body.confirmationText.trim() : ''
  const userId = userData.user.id

  const { data: membershipsData, error: membershipsError } = await adminClient
    .from('profile_users')
    .select('profile_id, role')
    .eq('user_id', userId)

  if (membershipsError) {
    return createJsonResponse({ error: membershipsError.message }, 500)
  }

  const memberships = (membershipsData as ProfileMembershipRow[] | null) || []
  const profileIds = memberships.map((membership) => membership.profile_id)

  if (activeProfileId && !profileIds.includes(activeProfileId)) {
    return createJsonResponse({ error: 'Użytkownik nie należy do aktywnego profilu.' }, 403)
  }

  const ownerMemberships = memberships.filter((membership) => membership.role === 'owner')
  const soleOwnerProfileIds: string[] = []

  for (const membership of ownerMemberships) {
    const { count, error } = await adminClient
      .from('profile_users')
      .select('user_id', { count: 'exact', head: true })
      .eq('profile_id', membership.profile_id)

    if (error) {
      return createJsonResponse({ error: error.message }, 500)
    }

    if ((count || 0) > 1) {
      return createJsonResponse(
        {
          error: 'Przed usunięciem konta przekaż rolę ownera innemu członkowi profilu.',
        },
        409
      )
    }

    soleOwnerProfileIds.push(membership.profile_id)
  }

  if (soleOwnerProfileIds.length > 0 && confirmationText !== 'USUŃ KONTO') {
    return createJsonResponse({ error: 'Aby usunąć konto i profil, wpisz: USUŃ KONTO' }, 400)
  }

  const memberProfileIds = memberships
    .filter((membership) => membership.role !== 'owner')
    .map((membership) => membership.profile_id)

  if (memberProfileIds.length > 0) {
    const { error } = await adminClient
      .from('profile_users')
      .delete()
      .eq('user_id', userId)
      .in('profile_id', memberProfileIds)

    if (error) {
      return createJsonResponse({ error: error.message }, 500)
    }
  }

  if (soleOwnerProfileIds.length > 0) {
    const { error } = await adminClient.from('profiles').delete().in('id', soleOwnerProfileIds)

    if (error) {
      return createJsonResponse({ error: error.message }, 500)
    }
  }

  const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(userId)

  if (deleteUserError) {
    return createJsonResponse({ error: deleteUserError.message }, 500)
  }

  return Response.json({ ok: true })
}
