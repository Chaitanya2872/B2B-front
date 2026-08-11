import { ShieldCheck } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { QueryState } from '../components/ui/QueryState'
import { useWarrantyItems } from '../hooks/useCrm'
import { formatDate } from '../utils/helpers'
import { getQueryStateCopy } from '../utils/queryState'
import type { AmcStatus, WarrantyStatus } from '../types'
import './WarrantyAmc.css'

const STATUS_TONE: Record<WarrantyStatus, 'success' | 'warning' | 'danger'> = {
  active: 'success',
  expiring: 'warning',
  expired: 'danger',
}

const STATUS_LABEL: Record<WarrantyStatus, string> = {
  active: 'Active',
  expiring: 'Expiring soon',
  expired: 'Expired',
}

const AMC_TONE: Record<AmcStatus, 'success' | 'warning' | 'neutral'> = {
  active: 'success',
  due: 'warning',
  none: 'neutral',
}

const AMC_LABEL: Record<AmcStatus, string> = {
  active: 'AMC active',
  due: 'Renewal due',
  none: 'No AMC',
}

export function WarrantyAmc() {
  const { data: items = [], isLoading, isError, error } = useWarrantyItems()
  const errorState = getQueryStateCopy(error, {
    title: 'Warranty records unavailable',
    detail: 'The CRM API could not be reached. Start the backend and refresh.',
  })

  return (
    <div className="warranty-page">
      <div className="warranty-header">
        <h2>Warranty &amp; AMC</h2>
        <p>
          Serial capture, OEM registration and renewal tracking for delivered
          items.
        </p>
      </div>

      {isLoading ? (
        <QueryState
          title="Loading warranty records"
          detail="Fetching delivered serials and AMC renewals from the CRM API."
        />
      ) : isError ? (
        <QueryState
          title={errorState.title}
          detail={errorState.detail}
          tone="danger"
        />
      ) : items.length === 0 ? (
        <QueryState
          title="No warranty records"
          detail="Delivered serials and AMC renewals will appear here."
        />
      ) : (
        <div className="warranty-table-wrap card">
          <table className="warranty-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Product</th>
                <th>Serial number</th>
                <th>Warranty period</th>
                <th>Status</th>
                <th>AMC</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="warranty-company">{item.company}</td>
                  <td>{item.product}</td>
                  <td className="warranty-serial">{item.serialNumber}</td>
                  <td className="warranty-period">
                    {formatDate(item.startDate)} &rarr;{' '}
                    {formatDate(item.endDate)}
                  </td>
                  <td>
                    <Badge
                      tone={STATUS_TONE[item.status]}
                      icon={<ShieldCheck size={11} strokeWidth={2.5} />}
                    >
                      {STATUS_LABEL[item.status]}
                    </Badge>
                  </td>
                  <td>
                    <Badge tone={AMC_TONE[item.amcStatus]}>
                      {AMC_LABEL[item.amcStatus]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
