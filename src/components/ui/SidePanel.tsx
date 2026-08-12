import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import './SidePanel.css'

interface SidePanelProps {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export function SidePanel({
  title,
  subtitle,
  onClose,
  children,
  footer,
}: SidePanelProps) {
  return (
    <div className="side-panel-overlay" onClick={onClose}>
      <aside
        className="side-panel card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="side-panel-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="side-panel-header">
          <div>
            <h3 id="side-panel-title">{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="side-panel-content">{children}</div>

        {footer && <div className="side-panel-footer">{footer}</div>}
      </aside>
    </div>
  )
}
