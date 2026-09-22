// TEMP: visual QA harness entry, not part of the app build. Deleted after review.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PreviewDeals } from './PreviewDeals'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PreviewDeals />
  </StrictMode>,
)
