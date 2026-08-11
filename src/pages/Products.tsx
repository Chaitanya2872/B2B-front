import { useState } from 'react'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { QueryState } from '../components/ui/QueryState'
import {
  useCreateProduct,
  useDeleteProduct,
  useProducts,
  useProductSummary,
  useUpdateProduct,
} from '../hooks/useCrm'
import type { ProductCatalogItem } from '../types'
import './Products.css'

type ProductFormState = {
  name: string
  category: string
  vendor: string
  sku: string
}

const EMPTY_FORM: ProductFormState = { name: '', category: '', vendor: '', sku: '' }

export function Products() {
  const [categoryFilter, setCategoryFilter] = useState('')
  const [vendorFilter, setVendorFilter] = useState('')
  const [formState, setFormState] = useState<ProductFormState>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editState, setEditState] = useState<ProductFormState>(EMPTY_FORM)

  const { data: summary } = useProductSummary()
  const { data: products = [], isLoading, isError } = useProducts(
    categoryFilter,
    vendorFilter,
  )
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()

  const canSubmit = formState.name.trim().length > 0 && formState.category.trim().length > 0

  async function handleCreateProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) {
      return
    }
    await createProduct.mutateAsync({
      name: formState.name.trim(),
      category: formState.category.trim(),
      vendor: formState.vendor.trim(),
      sku: formState.sku.trim(),
    })
    setFormState(EMPTY_FORM)
  }

  function startEdit(product: ProductCatalogItem) {
    setEditingId(product.id)
    setEditState({
      name: product.name,
      category: product.category,
      vendor: product.vendor,
      sku: product.sku,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditState(EMPTY_FORM)
  }

  async function saveEdit(productId: string) {
    if (!editState.name.trim() || !editState.category.trim()) {
      return
    }
    await updateProduct.mutateAsync({
      productId,
      input: {
        name: editState.name.trim(),
        category: editState.category.trim(),
        vendor: editState.vendor.trim(),
        sku: editState.sku.trim(),
      },
    })
    cancelEdit()
  }

  async function handleDelete(product: ProductCatalogItem) {
    const confirmed = window.confirm(`Remove "${product.name}" from the catalog?`)
    if (!confirmed) {
      return
    }
    await deleteProduct.mutateAsync(product.id)
  }

  return (
    <div className="products-page">
      <div className="products-header">
        <div>
          <h2>Product Catalog</h2>
          <p>Manage product master data by category and vendor for deal creation and reporting.</p>
        </div>
      </div>

      <div className="products-layout">
        <section className="products-sidebar card">
          <div className="products-sidebar-header">
            <h3>Add product</h3>
            <p>Create reusable catalog entries instead of typing product names each time.</p>
          </div>

          <form className="deal-form" onSubmit={handleCreateProduct}>
            <label className="field">
              <span>Product name</span>
              <input
                value={formState.name}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, name: event.target.value }))
                }
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
                  setFormState((current) => ({ ...current, sku: event.target.value }))
                }
              />
            </label>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!canSubmit || createProduct.isPending}
            >
              <Plus size={15} strokeWidth={2.4} />
              Add product
            </button>

            {createProduct.isError && (
              <p className="products-error">Unable to save product right now.</p>
            )}
          </form>
        </section>

        <section className="products-main">
          <div className="products-filters card">
            <label className="field">
              <span>Filter by category</span>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="">All categories</option>
                {summary?.categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Filter by vendor</span>
              <select
                value={vendorFilter}
                onChange={(event) => setVendorFilter(event.target.value)}
              >
                <option value="">All vendors</option>
                {summary?.vendors.map((vendor) => (
                  <option key={vendor} value={vendor}>
                    {vendor}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {isLoading ? (
            <QueryState
              title="Loading products"
              detail="Fetching category and vendor-wise product catalog from the CRM API."
            />
          ) : isError ? (
            <QueryState
              title="Products unavailable"
              detail="The CRM API could not be reached. Start the backend and refresh."
              tone="danger"
            />
          ) : (
            <div className="products-table-wrap card">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Vendor</th>
                    <th>SKU</th>
                    <th className="products-actions-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={5} className="products-empty">
                        No products match these filters yet.
                      </td>
                    </tr>
                  )}
                  {products.map((product) =>
                    editingId === product.id ? (
                      <tr key={product.id} className="products-row-editing">
                        <td>
                          <input
                            className="products-inline-input"
                            value={editState.name}
                            onChange={(event) =>
                              setEditState((current) => ({
                                ...current,
                                name: event.target.value,
                              }))
                            }
                            autoFocus
                          />
                        </td>
                        <td>
                          <input
                            className="products-inline-input"
                            list="product-categories"
                            value={editState.category}
                            onChange={(event) =>
                              setEditState((current) => ({
                                ...current,
                                category: event.target.value,
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="products-inline-input"
                            list="product-vendors"
                            value={editState.vendor}
                            onChange={(event) =>
                              setEditState((current) => ({
                                ...current,
                                vendor: event.target.value,
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="products-inline-input"
                            value={editState.sku}
                            onChange={(event) =>
                              setEditState((current) => ({
                                ...current,
                                sku: event.target.value,
                              }))
                            }
                          />
                        </td>
                        <td className="products-actions-col">
                          <div className="products-row-actions">
                            <button
                              type="button"
                              className="products-row-action-btn"
                              title="Save"
                              disabled={updateProduct.isPending}
                              onClick={() => saveEdit(product.id)}
                            >
                              <Check size={14} strokeWidth={2.4} />
                            </button>
                            <button
                              type="button"
                              className="products-row-action-btn"
                              title="Cancel"
                              onClick={cancelEdit}
                            >
                              <X size={14} strokeWidth={2.4} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={product.id}>
                        <td className="products-name">{product.name}</td>
                        <td>{product.category}</td>
                        <td>{product.vendor}</td>
                        <td className="products-sku">{product.sku}</td>
                        <td className="products-actions-col">
                          <div className="products-row-actions">
                            <button
                              type="button"
                              className="products-row-action-btn"
                              title="Edit"
                              onClick={() => startEdit(product)}
                            >
                              <Pencil size={14} strokeWidth={2} />
                            </button>
                            <button
                              type="button"
                              className="products-row-action-btn products-row-action-btn--danger"
                              title="Delete"
                              disabled={deleteProduct.isPending}
                              onClick={() => handleDelete(product)}
                            >
                              <Trash2 size={14} strokeWidth={2} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <datalist id="product-categories">
        {summary?.categories.map((category) => (
          <option key={category} value={category} />
        ))}
      </datalist>

      <datalist id="product-vendors">
        {summary?.vendors.map((vendor) => (
          <option key={vendor} value={vendor} />
        ))}
      </datalist>
    </div>
  )
}
