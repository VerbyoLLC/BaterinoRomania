import { useCallback, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { getPartnerDashboardTranslations } from '../../i18n/partner/dashboard'
import { openPartnerContractPreview } from '../../lib/api'
import { PartnerContractSigningCallout } from './PartnerContractSigningCallout'
import { PartnerContractSigningModal } from './PartnerContractSigningModal'

type Props = {
  onSigned?: () => void
  className?: string
}

/** Contract signing CTA only — fără etape aprobare cont. */
export function PartnerContractSigningBanner({ onSigned, className = 'mb-5' }: Props) {
  const { language } = useLanguage()
  const trDash = getPartnerDashboardTranslations(language.code)
  const [modalOpen, setModalOpen] = useState(false)
  const [readingPdf, setReadingPdf] = useState(false)

  const handleReadPdf = useCallback(async () => {
    setReadingPdf(true)
    try {
      await openPartnerContractPreview()
    } catch (err) {
      console.error(err)
    } finally {
      setReadingPdf(false)
    }
  }, [])

  return (
    <>
      <PartnerContractSigningCallout
        className={className}
        title={trDash.contractSigningCalloutTitle}
        subtitle={trDash.contractSigningCalloutSubtitle}
        signButtonLabel={trDash.contractSigningCalloutButton}
        readPdfLabel={trDash.contractSigningCalloutReadPdf}
        onSignClick={() => setModalOpen(true)}
        onReadPdfClick={() => void handleReadPdf()}
        readingPdf={readingPdf}
      />

      {modalOpen ? (
        <PartnerContractSigningModal
          onClose={() => setModalOpen(false)}
          onSigned={() => {
            setModalOpen(false)
            onSigned?.()
          }}
        />
      ) : null}
    </>
  )
}
