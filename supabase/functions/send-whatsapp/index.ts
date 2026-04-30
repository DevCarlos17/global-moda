import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OrderItem {
  quantity: number
  unit_price: number
  product: { name: string }
}

interface Order {
  id: string
  order_number: string
  store_name: string
  store_address: string | null
  store_contact: string | null
  notes: string | null
  total_amount: number
  status: string
  created_at: string
  items: OrderItem[]
  seller: { full_name: string; email: string } | null
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { orderId } = await req.json() as { orderId: string }

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'orderId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Fetch order with items and seller
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        store_name,
        store_address,
        store_contact,
        notes,
        total_amount,
        status,
        created_at,
        items:order_items!order_id(
          quantity,
          unit_price,
          product:products!product_id(name)
        ),
        seller:profiles!seller_id(full_name, email)
      `)
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const typedOrder = order as Order

    // Build the WhatsApp message
    const message = buildMessage(typedOrder)

    // CallMeBot — https://www.callmebot.com/blog/free-api-whatsapp-messages/
    const phone = Deno.env.get('WHATSAPP_RECIPIENT_NUMBER')
    const apikey = Deno.env.get('WHATSAPP_CALLMEBOT_APIKEY')

    if (!phone || !apikey) {
      console.warn('CallMeBot env vars not configured — message not sent')
      return new Response(
        JSON.stringify({ success: true, warning: 'WhatsApp not configured' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(apikey)}`

    const waResponse = await fetch(url)

    if (!waResponse.ok) {
      const errBody = await waResponse.text()
      throw new Error(`CallMeBot error: ${errBody}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('send-whatsapp error:', err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})

function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

function buildMessage(order: Order): string {
  const lines: string[] = [
    `🛍️ *Nuevo Pedido — Global Moda Imports*`,
    ``,
    `*Pedido:* ${order.order_number}`,
    `*Vendedor:* ${order.seller?.full_name ?? 'N/A'}`,
    `*Email vendedor:* ${order.seller?.email ?? 'N/A'}`,
    ``,
    `*Tienda:* ${order.store_name}`,
  ]

  if (order.store_address) lines.push(`*Dirección:* ${order.store_address}`)
  if (order.store_contact) lines.push(`*Contacto tienda:* ${order.store_contact}`)

  lines.push(``, `*Productos:*`)

  for (const item of order.items) {
    lines.push(`  • ${item.product.name} × ${item.quantity} — ${formatUSD(item.unit_price)}`)
  }

  lines.push(
    ``,
    `*Total: ${formatUSD(order.total_amount)}*`,
  )

  if (order.notes) lines.push(``, `📝 _${order.notes}_`)

  lines.push(
    ``,
    `Fecha: ${new Date(order.created_at).toLocaleString('es-AR')}`,
  )

  return lines.join('\n')
}
