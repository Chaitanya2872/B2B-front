import { useEffect, useState } from 'react'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Package,
  Pencil,
  Search,
  Trash2,
  Users,
  X,
  Plus,
} from 'lucide-react'
import { QueryState } from '../components/ui/QueryState'
import { AddProductModal } from '../features/products/AddProductModal'
import {
  categoryIcon,
  getVisiblePages,
  vendorAvatarColor,
  vendorInitials,
} from '../features/products/productDisplay'
import { useCurrentUser } from '../hooks/useAuth'
import {
  useDeleteProduct,
  useProducts,
  useProductSummary,
  useUpdateProduct,
} from '../hooks/useCrm'
import { getApiErrorMessage } from '../services/api/client'
import { getPipelineActionPermissions } from '../services/auth/permissions'
import type { ProductCatalogItem } from '../types'
import { getQueryStateCopy } from '../utils/queryState'
import './Products.css'

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

const PAGE_SIZE = 8

export function Products() {
  const [categoryFilter, setCategoryFilter] = useState('')
  const [vendorFilter, setVendorFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editState, setEditState] = useState<ProductFormState>(EMPTY_FORM)

  const { data: currentUser } = useCurrentUser()
  const { canManageProducts } = getPipelineActionPermissions(currentUser)
  const { data: summary } = useProductSummary()
  const { data: allProducts = [] } = useProducts()
  const {
    data: products = [],
    isLoading,
    isError,
    error,
  } = useProducts(categoryFilter, vendorFilter)
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()

  const errorState = getQueryStateCopy(error, {
    title: 'Products unavailable',
    detail: 'The CRM API could not be reached. Start the backend and refresh.',
  })

  const query = searchQuery.trim().toLowerCase()
  const filteredProducts = query
    ? products.filter((product) =>
        [product.name, product.sku, product.vendor, product.category].some(
          (field) => field.toLowerCase().includes(query),
        ),
      )
    : products

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE))

  useEffect(() => {
    setCurrentPage(1)
  }, [categoryFilter, vendorFilter, searchQuery])

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages))
  }, [totalPages])

  const safePage = Math.min(currentPage, totalPages)
  const pageStart = (safePage - 1) * PAGE_SIZE
  const pageProducts = filteredProducts.slice(pageStart, pageStart + PAGE_SIZE)

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
    if (
      !editState.name.trim() ||
      !editState.category.trim() ||
      !editState.vendor.trim() ||
      !editState.sku.trim()
    ) {
      return
    }
    try {
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
    } catch {
      // React Query keeps the error for the inline state below.
    }
  }

  async function handleDelete(product: ProductCatalogItem) {
    const confirmed = window.confirm(
      `Remove "${product.name}" from the catalog?`,
    )
    if (!confirmed) {
      return
    }
    try {
      await deleteProduct.mutateAsync(product.id)
    } catch {
      // React Query keeps the error for the inline state below.
    }
  }

  return (
    <div className="products-page">
      <div className="products-header">
        <div>
          <h2>Product Catalog</h2>
          <p>
            Manage product master data by category and vendor for deal creation
            and reporting.
          </p>
        </div>
        {canManageProducts && (
          <button
            type="button"
            className="btn btn-primary products-add-btn"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus size={15} strokeWidth={2.4} />
            Add product
          </button>
        )}
      </div>

      <div className="products-stats-grid">
        <div className="products-stat-tile">
          <div className="products-stat-head">
            <span className="products-stat-label">Total Products</span>
            <span className="products-stat-icon">
              <Package size={16} strokeWidth={2} />
            </span>
          </div>
          <div className="products-stat-value">{allProducts.length}</div>
        </div>

        <div className="products-stat-tile">
          <div className="products-stat-head">
            <span className="products-stat-label">Active Vendors</span>
            <span className="products-stat-icon products-stat-icon--blue">
              <Users size={16} strokeWidth={2} />
            </span>
          </div>
          <div className="products-stat-value">
            {summary?.vendors.length ?? '...'}
          </div>
        </div>

        <div className="products-stat-tile">
          <div className="products-stat-head">
            <span className="products-stat-label">Categories</span>
            <span className="products-stat-icon products-stat-icon--amber">
              <LayoutGrid size={16} strokeWidth={2} />
            </span>
          </div>
          <div className="products-stat-value">
            {summary?.categories.length ?? '...'}
          </div>
        </div>

        <div className="products-stat-tile">
          <div className="products-stat-head">
            <span className="products-stat-label">Matching Filters</span>
            <span className="products-stat-icon products-stat-icon--neutral">
              <Search size={16} strokeWidth={2} />
            </span>
          </div>
          <div className="products-stat-value">
            {isLoading ? '...' : filteredProducts.length}
          </div>
        </div>
      </div>

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

        <label className="field">
          <span>Search catalog</span>
          <div className="products-search-box">
            <Search size={14} strokeWidth={2} />
            <input
              type="text"
              placeholder="Search product, SKU or vendor..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </label>
      </div>

      <div className="products-chip-row">
        <div className="products-chips">
          <button
            type="button"
            className={`products-chip${
              categoryFilter === '' ? ' products-chip--active' : ''
            }`}
            onClick={() => setCategoryFilter('')}
          >
            All Products
            <span className="products-chip-count">{allProducts.length}</span>
          </button>
          {summary?.categories.map((category) => {
            const count = allProducts.filter(
              (product) => product.category === category,
            ).length
            return (
              <button
                key={category}
                type="button"
                className={`products-chip${
                  categoryFilter === category ? ' products-chip--active' : ''
                }`}
                onClick={() => setCategoryFilter(category)}
              >
                {category}
                <span className="products-chip-count">{count}</span>
              </button>
            )
          })}
        </div>
        <span className="products-chip-row-hint">
          {filteredProducts.length} result
          {filteredProducts.length === 1 ? '' : 's'}
        </span>
      </div>

      {(updateProduct.isError || deleteProduct.isError) && (
        <p className="products-error">
          {getApiErrorMessage(
            updateProduct.error ?? deleteProduct.error,
            'Unable to update the product catalog right now.',
          )}
        </p>
      )}

      {isLoading ? (
        <QueryState
          title="Loading products"
          detail="Fetching category and vendor-wise product catalog from the CRM API."
        />
      ) : isError ? (
        <QueryState
          title={errorState.title}
          detail={errorState.detail}
          tone="danger"
        />
      ) : (
        <>
          <div className="products-table-wrap card">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Vendor</th>
                  <th>SKU</th>
                  {canManageProducts && (
                    <th className="products-actions-col">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {pageProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan={canManageProducts ? 5 : 4}
                      className="products-empty"
                    >
                      No products match these filters yet.
                    </td>
                  </tr>
                )}
                {pageProducts.map((product) => {
                  if (canManageProducts && editingId === product.id) {
                    return (
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
                        {canManageProducts && (
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
                        )}
                      </tr>
                    )
                  }

                  const CategoryIcon = categoryIcon(product.category)

                  return (
                    <tr key={product.id}>
                      <td className="products-name-cell">
                        <span className="products-name-icon">
                          <CategoryIcon size={15} strokeWidth={2} />
                        </span>
                        <span className="products-name">{product.name}</span>
                      </td>
                      <td>
                        <span className="products-pill">
                          {product.category}
                        </span>
                      </td>
                      <td>
                        <div className="products-vendor-cell">
                          <span
                            className="products-vendor-avatar"
                            style={{
                              background: vendorAvatarColor(product.vendor),
                            }}
                          >
                            {vendorInitials(product.vendor)}
                          </span>
                          {product.vendor}
                        </div>
                      </td>
                      <td>
                        <span className="products-sku-pill">
                          {product.sku}
                        </span>
                      </td>
                      {canManageProducts && (
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
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="products-pagination">
            <span className="products-pagination-info">
              Showing {filteredProducts.length === 0 ? 0 : pageStart + 1} to{' '}
              {Math.min(pageStart + PAGE_SIZE, filteredProducts.length)} of{' '}
              {filteredProducts.length} entries
            </span>
            <div className="products-pagination-controls">
              <button
                type="button"
                className="products-page-btn"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safePage <= 1}
                aria-label="Previous page"
              >
                <ChevronLeft size={14} strokeWidth={2.2} />
              </button>
              {getVisiblePages(safePage, totalPages).map((page, index) =>
                page === 'ellipsis' ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="products-page-ellipsis"
                  >
                    &hellip;
                  </span>
                ) : (
                  <button
                    key={page}
                    type="button"
                    className={`products-page-btn${
                      page === safePage ? ' products-page-btn--active' : ''
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                type="button"
                className="products-page-btn"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={safePage >= totalPages}
                aria-label="Next page"
              >
                <ChevronRight size={14} strokeWidth={2.2} />
              </button>
            </div>
          </div>
        </>
      )}

      {isAddOpen && canManageProducts && (
        <AddProductModal onClose={() => setIsAddOpen(false)} />
      )}

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
