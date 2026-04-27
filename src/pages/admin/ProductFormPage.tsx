import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useProductDetail } from '@/features/catalog/hooks/useProductDetail'
import { ProductForm } from '@/features/admin/components/ProductForm'
import { PageLoader } from '@/components/feedback/Loader'
import { ErrorState } from '@/components/feedback/ErrorState'

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const { data: product, isLoading, error, refetch } = useProductDetail(id ?? '')

  if (isEditing && isLoading) return <PageLoader />
  if (isEditing && error) return <ErrorState onRetry={refetch} />

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        <span className="text-sm">Volver a productos</span>
      </button>

      <h1 className="text-2xl font-semibold text-white mb-6">
        {isEditing ? 'Editar producto' : 'Nuevo producto'}
      </h1>

      <ProductForm product={isEditing ? product : undefined} />
    </div>
  )
}
