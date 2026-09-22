import { useState, type FormEvent } from 'react'
import { Plus, X } from 'lucide-react'
import { useCreateProduct } from '../../hooks/useCrm'
import { getApiErrorMessage } from '../../services/api/client'
import '../pipeline/AddDealModal.css'

interface AddProductModalProps {
  onClose: () => void
}

type ProductFormState = {
  name: string
  category: string
  vendor: string
  sku: string
}

const EMPTY_FORM: ProductFormState = {
  name: '',
  category: '',
  vendor: '',
  sku: '',
}

export function AddProductModal({ onClose }: AddProductModalProps) {
  const [formState, setFormState] = useState<ProductFormState>(EMPTY_FORM)
  const createProduct = useCreateProduct()

  const canSubmit =
    formState.name.trim().length > 0 &&
    formState.category.trim().length > 0 &&
    formState.vendor.trim().length > 0 &&
    formState.sku.trim().length > 0

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) {
      return
    }
    try {
      await createProduct.mutateAsync({
        name: formState.name.trim(),
        category: formState.category.trim(),
        vendor: formState.vendor.trim(),
        sku: formState.sku.trim(),
      })
      onClose()
    } catch {
      // React Query keeps the error for the inline state below.
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-product-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="add-product-title">Add product</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <form
          className="deal-form"
          onSubmit={handleSubmit}
          style={{ padding: 20 }}
        >
          <label className="field">
            <span>Product name</span>
            <input
              value={formState.name}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              autoFocus
            />
          </label>

          <label className="field">
            <span>Category</span>
            <input
              list="product-categories"
              value={formState.category}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  category: event.target.value,
                }))
              }
            />
          </label>

          <label className="field">
            <span>Vendor</span>
            <input
              list="product-vendors"
              value={formState.vendor}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  vendor: event.target.value,
                }))
              }
            />
          </label>

          <label className="field">
            <span>SKU / code</span>
            <input
              value={formState.sku}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  sku: event.target.value,
                }))
              }
            />
          </label>

          {createProduct.isError && (
            <p className="form-error">
              {getApiErrorMessage(
                createProduct.error,
                'Unable to save product right now.',
              )}
            </p>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!canSubmit || createProduct.isPending}
            >
              <Plus size={15} strokeWidth={2.4} />
              {createProduct.isPending ? 'Adding...' : 'Add product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
