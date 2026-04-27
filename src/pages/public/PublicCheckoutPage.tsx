import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { usePublicCartStore } from '@/store/publicCartStore'
import { useCreateCustomerOrder } from '@/features/orders/hooks/useCreateCustomerOrder'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/utils/formatCurrency'

export function PublicCheckoutPage() {
  const navigate = useNavigate()
  const items = usePublicCartStore((s) => s.items)
  const { mutate: createOrder, isPending } = useCreateCustomerOrder()

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    address: '',
    notes: '',
  })

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-4 text-center">
        <ShoppingBag size={48} className="text-white/10" />
        <p className="text-white/50">Tu carrito está vacío</p>
        <Button onClick={() => navigate('/public/catalog')}>Ver catálogo</Button>
      </div>
    )
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    createOrder({
      customerName:  form.customerName,
      customerPhone: form.customerPhone,
      customerEmail: form.customerEmail || undefined,
      address:       form.address || undefined,
      notes:         form.notes || undefined,
      totalAmount:   total,
      items: items.map((i) => ({
        product_id: i.productId,
        quantity:   i.quantity,
        unit_price: i.price,
        subtotal:   i.price * i.quantity,
        name:       i.name,
      })),
    })
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        <span className="text-sm">Volver</span>
      </button>

      <h1 className="text-2xl font-semibold text-white mb-6">Confirmar pedido</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order summary */}
        <div className="bg-surface border border-white/10 rounded-2xl p-5 flex flex-col gap-3 h-fit">
          <p className="text-xs text-white/40 uppercase tracking-wider font-medium">Resumen</p>
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li key={item.productId} className="flex items-center gap-3">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="size-10 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="size-10 rounded-lg bg-white/5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white line-clamp-1">{item.name}</p>
                  <p className="text-xs text-white/40">x{item.quantity}</p>
                </div>
                <span className="text-sm text-gold font-medium">{formatCurrency(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-white/10 pt-3 flex items-center justify-between">
            <span className="text-white/60 text-sm">Total</span>
            <span className="text-white font-bold text-lg">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Customer form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nombre completo *"
            value={form.customerName}
            onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
            placeholder="Tu nombre"
            required
          />
          <Input
            label="WhatsApp *"
            value={form.customerPhone}
            onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
            placeholder="+58 414 000 0000"
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.customerEmail}
            onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))}
            placeholder="tu@email.com"
          />
          <Input
            label="Dirección"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            placeholder="Ciudad, sector..."
          />
          <Input
            label="Notas"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Instrucciones especiales..."
          />

          <Button type="submit" isLoading={isPending} size="lg" className="mt-2">
            Enviar pedido
          </Button>
        </form>
      </div>
    </div>
  )
}
