import './AppFooter.css'

export function AppFooter() {
  return (
    <footer className="app-footer">
      <span>
        © {new Date().getFullYear()} Fawnix CRM. All rights reserved.
        Enterprise CRM Platform.
      </span>
      <div className="app-footer-links">
        <span>Security &amp; Compliance</span>
        <span>API Docs</span>
        <span>System Status</span>
      </div>
    </footer>
  )
}
