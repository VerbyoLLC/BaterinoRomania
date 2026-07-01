import { useCallback, useMemo, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { getPartnerDashboardTranslations } from '../../i18n/partner/dashboard'
import { openPartnerContractPreview } from '../../lib/api'
import { PartnerRfqPriceJourneyModal } from './PartnerRfqPriceJourney'
import { PartnerContractSigningModal } from './PartnerContractSigningModal'
import { PartnerContractSigningCallout } from './PartnerContractSigningCallout'
import {
  CONTRACT_SIGNING_TIMELINE_INDEX,
  PartnerApprovalTimeline,
  PRICE_ALLOCATION_TIMELINE_INDEX,
  type TimelineInteractiveStep,
} from './PartnerApprovalTimeline'

type Props = {
  discountConfigured: boolean
  onContractSigned?: () => void
  className?: string
}

/** Etape aprobare cont + CTA semnare contract (când reducerea e alocată). */
export function PartnerAccountApprovalSection({
  discountConfigured,
  onContractSigned,
  className = 'mb-6',
}: Props) {
  const { language } = useLanguage()
  const tr = getPartnerDashboardTranslations(language.code)
  const [rfqJourneyModalOpen, setRfqJourneyModalOpen] = useState(false)
  const [contractSigningModalOpen, setContractSigningModalOpen] = useState(false)
  const [readingContractPdf, setReadingContractPdf] = useState(false)

  const currentStepIndex = !discountConfigured
    ? PRICE_ALLOCATION_TIMELINE_INDEX
    : CONTRACT_SIGNING_TIMELINE_INDEX

  const handleReadContractPdf = useCallback(async () => {
    setReadingContractPdf(true)
    try {
      await openPartnerContractPreview()
    } catch (err) {
      console.error(err)
    } finally {
      setReadingContractPdf(false)
    }
  }, [])

  const interactiveSteps = useMemo((): TimelineInteractiveStep[] => {
    return [
      {
        stepIndex: PRICE_ALLOCATION_TIMELINE_INDEX,
        ariaLabel: tr.timelinePriceAllocationOpenAria,
        onClick: () => setRfqJourneyModalOpen(true),
      },
      {
        stepIndex: CONTRACT_SIGNING_TIMELINE_INDEX,
        ariaLabel: tr.timelineContractSigningOpenAria,
        onClick: () => setContractSigningModalOpen(true),
      },
    ]
  }, [tr.timelinePriceAllocationOpenAria, tr.timelineContractSigningOpenAria])

  return (
    <>
      <PartnerApprovalTimeline
        steps={tr.approvalTimelineSteps}
        currentStepIndex={currentStepIndex}
        sectionTitle={tr.approvalTimelineAria}
        ariaLabel={tr.approvalTimelineAria}
        timelineComplete={tr.timelineComplete}
        timelineCurrent={tr.timelineCurrent}
        timelineUpcoming={tr.timelineUpcoming}
        interactiveSteps={interactiveSteps}
        className={className}
        footer={
          discountConfigured ? (
            <PartnerContractSigningCallout
              title={tr.contractSigningCalloutTitle}
              subtitle={tr.contractSigningCalloutSubtitle}
              signButtonLabel={tr.contractSigningCalloutButton}
              readPdfLabel={tr.contractSigningCalloutReadPdf}
              onSignClick={() => setContractSigningModalOpen(true)}
              onReadPdfClick={handleReadContractPdf}
              readingPdf={readingContractPdf}
            />
          ) : null
        }
      />

      {rfqJourneyModalOpen ? (
        <PartnerRfqPriceJourneyModal onClose={() => setRfqJourneyModalOpen(false)} />
      ) : null}

      {contractSigningModalOpen ? (
        <PartnerContractSigningModal
          onClose={() => setContractSigningModalOpen(false)}
          onSigned={() => {
            setContractSigningModalOpen(false)
            onContractSigned?.()
          }}
        />
      ) : null}
    </>
  )
}
