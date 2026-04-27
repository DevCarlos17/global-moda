import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserBody {
  email: string
  password: string
  full_name: string
  role: 'seller' | 'admin'
  phone: string
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // 1. Verificar que el llamador está autenticado (anon client con JWT del usuario)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ error: 'No autorizado' }, 401)
    }

    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )

    // 2. Verificar que el usuario autenticado es admin
    const { data: { user }, error: userError } = await anonClient.auth.getUser()
    if (userError || !user) {
      return json({ error: 'No autorizado' }, 401)
    }

    const { data: profile, error: profileError } = await anonClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      return json({ error: 'Acceso denegado. Solo admins pueden crear usuarios.' }, 403)
    }

    // 3. Parsear y validar body
    const body = await req.json() as CreateUserBody

    if (!body.email || !body.password || !body.full_name || !body.phone) {
      return json({ error: 'email, password, full_name y phone son requeridos' }, 400)
    }

    if (!/^\d{7,15}$/.test(body.phone)) {
      return json({ error: 'El teléfono debe ser solo dígitos en formato internacional (ej: 584141641502)' }, 400)
    }

    if (!['seller', 'admin'].includes(body.role)) {
      return json({ error: 'role debe ser "seller" o "admin"' }, 400)
    }

    if (body.password.length < 6) {
      return json({ error: 'La contraseña debe tener al menos 6 caracteres' }, 400)
    }

    // 4. Crear el usuario usando service_role (privilegios de admin)
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data, error: createError } = await adminClient.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true, // confirmar email automáticamente
      user_metadata: {
        full_name: body.full_name,
        role: body.role,
        phone: body.phone ?? null,
      },
    })

    if (createError) {
      // Mensaje amigable para email duplicado
      if (createError.message.includes('already registered')) {
        return json({ error: 'Ya existe un usuario con ese email.' }, 409)
      }
      throw createError
    }

    return json({ user: data.user }, 201)
  } catch (err) {
    console.error('create-user error:', err)
    return json({ error: String(err) }, 500)
  }
})

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
