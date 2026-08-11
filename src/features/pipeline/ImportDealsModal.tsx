import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { X, Upload, FileSpreadsheet, Download } from 'lucide-react'
import { useImportDeals } from '../../hooks/useCrm'
import { getApiErrorMessage } from '../../services/api/client'
import { downloadDealImportTemplate } from '../../services/api/crm'
import type { PipelineStage } from '../../types'
import './AddDealModal.css'

interface ImportDealsModalProps {
  onClose: () => void
  stages: PipelineStage[]
}

export function ImportDealsModal({ onClose, stages }: ImportDealsModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [defaultStage, setDefaultStage] = useState(stages[0]?.id ?? 'suspect')
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importDeals = useImportDeals()
  const selectedStage = stages.find((stage) => stage.id === defaultStage)

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file) {
      return
    }

    try {
      await importDeals.mutateAsync({ file, defaultStage })
    } catch {
      // React Query keeps the error for the inline state below.
    }
  }

  async function handleTemplateDownload() {
    setIsDownloading(true)
    setDownloadError(null)
    try {
      const workbook = await downloadDealImportTemplate()
      const url = URL.createObjectURL(workbook)
      const link = document.createElement('a')
      link.href = url
      link.download = 'CRM-Deals-Import-Sample.xlsx'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      setDownloadError(
        getApiErrorMessage(error, 'Could not download the sample workbook.'),
      )
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-deals-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="import-deals-title">Import deals from Excel</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <form className="deal-form" onSubmit={handleSubmit}>
          <div className="import-format-guide">
            <div>
              <strong>Use the prepared Excel format</strong>
              <small>
                Required: Prospect and Solution. Contact Person, Current Stage,
                Value (₹ Lakhs), Est. Closure and Probability are mapped
                automatically. Reference and Remarks are retained as extra fields.
              </small>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleTemplateDownload}
              disabled={isDownloading}
            >
              <Download size={14} strokeWidth={2} />
              {isDownloading ? 'Downloading...' : 'Download sample'}
            </button>
          </div>

          {downloadError && <div className="form-error">{downloadError}</div>}

          <label className="field">
            <span>Excel file</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              hidden
            />
            <button
              type="button"
              className="file-drop"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileSpreadsheet size={18} strokeWidth={1.8} />
              <span className="file-drop-text">
                {file ? file.name : 'Choose an .xlsx or .xls workbook'}
              </span>
              <span className="btn btn-ghost btn-sm file-drop-btn">Browse</span>
            </button>
            <small className="field-help">
              Known columns are mapped automatically. Unknown headers are stored
              as dynamic fields in PostgreSQL.
            </small>
          </label>

          <label className="field">
            <span>Default stage for imported rows</span>
            <div className="stage-select">
              <span
                className="stage-dot"
                style={{ background: selectedStage?.color ?? 'var(--accent)' }}
              />
              <select
                value={defaultStage}
                onChange={(event) => setDefaultStage(event.target.value)}
              >
                {stages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </select>
            </div>
            <small className="field-help">
              Rows without a recognized stage column land here.
            </small>
          </label>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!file || importDeals.isPending}
            >
              <Upload size={15} strokeWidth={2.2} />
              {importDeals.isPending ? 'Importing...' : 'Import workbook'}
            </button>
          </div>

          {importDeals.isError && (
            <div className="form-error">
              {getApiErrorMessage(
                importDeals.error,
                'We could not import the workbook. Please check the file and backend.',
              )}
            </div>
          )}

          {importDeals.data && (
            <div
              className="card"
              style={{ padding: '1rem', marginTop: '0.5rem' }}
            >
              <strong style={{ display: 'block', marginBottom: '0.35rem' }}>
                Import complete
              </strong>
              <p style={{ margin: 0 }}>
                Imported {importDeals.data.importedCount} rows and skipped{' '}
                {importDeals.data.skippedRows}.
              </p>
              <p style={{ margin: '0.5rem 0 0' }}>
                Dynamic headers:{' '}
                {importDeals.data.dynamicHeaders.length > 0
                  ? importDeals.data.dynamicHeaders.join(', ')
                  : 'None'}
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
