import { useForm, useWatch } from 'react-hook-form'
import { useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, CalendarClock, Layers, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useCreateDeal, useProducts } from '../../hooks/useCrm'
import { getApiErrorMessage } from '../../services/api/client'
import type { PipelineStage } from '../../types'
import './AddDealModal.css'

const dealFormSchema = z.object({
  company: z.string().min(2, 'Enter a company name'),
  contact: z.string().min(2, 'Enter a contact person'),
  product: z.string().min(2, 'Enter a product or requirement'),
  value: z.coerce.number().positive('Enter a value greater than zero'),
  accountManager: z.string().min(2, 'Enter an account manager'),
  priority: z.enum(['low', 'medium', 'high']),
  stage: z.string().min(1, 'Select a pipeline stage'),
  expectedClosureDate: z.string().optional(),
  nextActivity: z.string().optional(),
  nextActivityDueDate: z.string().optional(),
  oemVendor: z.string().optional(),
})

type DealFormInput = z.input<typeof dealFormSchema>
type DealFormOutput = z.output<typeof dealFormSchema>
type DealFormField = keyof DealFormOutput

interface FormSection {
  id: string
  label: string
  icon: LucideIcon
  fields: DealFormField[]
}

const SECTIONS: FormSection[] = [
  {
    id: 'company',
    label: 'Company & contact',
    icon: Building2,
    fields: ['company', 'contact', 'accountManager'],
  },
  {
    id: 'deal',
    label: 'Deal details',
    icon: Layers,
    fields: ['product', 'stage', 'value', 'priority', 'oemVendor'],
  },
  {
    id: 'schedule',
    label: 'Schedule',
    icon: CalendarClock,
    fields: ['expectedClosureDate', 'nextActivityDueDate', 'nextActivity'],
  },
]

interface AddDealModalProps {
  onClose: () => void
  stages: PipelineStage[]
}

export function AddDealModal({ onClose, stages }: AddDealModalProps) {
  const createDeal = useCreateDeal()
  const { data: products = [] } = useProducts()
  const defaultStage = stages[0]?.id ?? 'suspect'
  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0].id)
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DealFormInput, unknown, DealFormOutput>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: { priority: 'medium', stage: defaultStage },
  })
  const selectedStageId = useWatch({ control, name: 'stage' })
  const selectedProductName = useWatch({ control, name: 'product' })
  const selectedStage = stages.find((stage) => stage.id === selectedStageId)
  const selectedProduct = products.find(
    (product) => product.name === selectedProductName,
  )

  const sectionsWithErrors = useMemo(
    () =>
      new Set(
        SECTIONS.filter((section) =>
          section.fields.some((field) => errors[field]),
        ).map((section) => section.id),
      ),
    [errors],
  )

  useEffect(() => {
    if (selectedProduct?.vendor) {
      setValue('oemVendor', selectedProduct.vendor, { shouldDirty: true })
    }
  }, [selectedProduct, setValue])

  const onSubmit = handleSubmit(
    async (values) => {
      try {
        await createDeal.mutateAsync({
          ...values,
          expectedClosureDate: values.expectedClosureDate
            ? new Date(values.expectedClosureDate).toISOString()
            : '',
          nextActivityDueDate: values.nextActivityDueDate
            ? new Date(values.nextActivityDueDate).toISOString()
            : '',
        })
        onClose()
      } catch {
        // React Query keeps the error for the inline state below.
      }
    },
    (invalidFields) => {
      const firstInvalidSection = SECTIONS.find((section) =>
        section.fields.some((field) => invalidFields[field]),
      )
      if (firstInvalidSection) {
        setActiveSection(firstInvalidSection.id)
      }
    },
  )

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel modal-panel--wide card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-deal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="add-deal-title">Add new pipeline deal</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="deal-modal-body">
          <nav className="deal-modal-nav">
            {SECTIONS.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  type="button"
                  className={`deal-modal-nav-item${
                    activeSection === section.id
                      ? ' deal-modal-nav-item--active'
                      : ''
                  }`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <Icon size={15} strokeWidth={2} />
                  <span>{section.label}</span>
                  {sectionsWithErrors.has(section.id) && (
                    <span
                      className="deal-modal-nav-error"
                      aria-label="Has errors"
                    />
                  )}
                </button>
              )
            })}
          </nav>

          <form className="deal-form" onSubmit={onSubmit} noValidate>
            <div
              hidden={activeSection !== 'company'}
              className="deal-form-section"
            >
              <label className="field">
                <span>Company</span>
                <input
                  {...register('company')}
                  placeholder="e.g. Vindhya Auto Components"
                  autoFocus
                />
                {errors.company && <em>{errors.company.message}</em>}
              </label>

              <label className="field">
                <span>Contact person</span>
                <input
                  {...register('contact')}
                  placeholder="e.g. Ramesh Iyer"
                />
                {errors.contact && <em>{errors.contact.message}</em>}
              </label>

              <label className="field">
                <span>Account manager</span>
                <input
                  {...register('accountManager')}
                  placeholder="e.g. Ravi Teja"
                />
                {errors.accountManager && (
                  <em>{errors.accountManager.message}</em>
                )}
              </label>
            </div>

            <div
              hidden={activeSection !== 'deal'}
              className="deal-form-section"
            >
              <label className="field">
                <span>Product / requirement</span>
                <input
                  {...register('product')}
                  list="catalog-products"
                  placeholder="e.g. Enterprise Wi-Fi Rollout"
                />
                {selectedProduct && (
                  <small className="field-help">
                    {selectedProduct.category} - {selectedProduct.vendor}
                  </small>
                )}
                {errors.product && <em>{errors.product.message}</em>}
              </label>

              <label className="field">
                <span>Pipeline stage</span>
                <select {...register('stage')}>
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
                {errors.stage && <em>{errors.stage.message}</em>}
              </label>

              <div className="field-row">
                <label className="field">
                  <span>Estimated value (Rs)</span>
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    {...register('value')}
                    placeholder="500000"
                  />
                  {errors.value && <em>{errors.value.message}</em>}
                </label>

                <label className="field">
                  <span>Priority</span>
                  <select {...register('priority')}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
              </div>

              <label className="field">
                <span>OEM / vendor</span>
                <input {...register('oemVendor')} placeholder="e.g. Cisco" />
              </label>
            </div>

            <div
              hidden={activeSection !== 'schedule'}
              className="deal-form-section"
            >
              <div className="field-row">
                <label className="field">
                  <span>Expected closure date</span>
                  <input
                    type="datetime-local"
                    {...register('expectedClosureDate')}
                  />
                </label>

                <label className="field">
                  <span>Next activity due</span>
                  <input
                    type="datetime-local"
                    {...register('nextActivityDueDate')}
                  />
                </label>
              </div>

              <label className="field">
                <span>Next activity</span>
                <input
                  {...register('nextActivity')}
                  placeholder="e.g. Technical scope review with customer"
                />
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || createDeal.isPending}
              >
                Add to {selectedStage?.name ?? 'selected'} stage
              </button>
            </div>
            {createDeal.isError && (
              <div className="form-error">
                {getApiErrorMessage(
                  createDeal.error,
                  'We could not save the deal. Please check the backend and try again.',
                )}
              </div>
            )}
          </form>
        </div>
        <datalist id="catalog-products">
          {products.map((product) => (
            <option key={product.id} value={product.name}>
              {product.category} - {product.vendor}
            </option>
          ))}
        </datalist>
      </div>
    </div>
  )
}
