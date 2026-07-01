import { useCallback, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { getPartnerDashboardTranslations } from '../../i18n/partner/dashboard'
import { openPartnerContractPreview } from '../../lib/api'
import { PartnerContractSigningCallout } from './PartnerContractSigningCallout'
import { PartnerContractSigningModal } from './PartnerContractSigningModal'

type Props = {
  subtitle: string
  className?: string
  onSigned?: () => void
}

/** Blocks partner features until the partnership contract is signed digitally. */
export function PartnerContractRequiredPanel({ subtitle, className = '', onSigned }: Props) {
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
      <div className={`flex w-full min-w-0 justify-center ${className}`.trim()}>
        <div className="w-full max-w-md">
          <PartnerContractSigningCallout
            variant="sidebar"
            className="mt-0"
            title={trDash.contractSigningCalloutTitle}
            subtitle={subtitle}
            signButtonLabel={trDash.contractSigningCalloutButton}
            readPdfLabel={trDash.contractSigningCalloutReadPdf}
            onSignClick={() => setModalOpen(true)}
            onReadPdfClick={() => void handleReadPdf()}
            readingPdf={readingPdf}
          />
        </div>
      </div>

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
