import { Fragment, type ReactNode } from 'react'
import { OFFER_PAYMENT_BOLD_PHRASE } from './commercialOfferDraft'

/** Evidențiază o frază în textul notei (ex. „transfer bancar” bold în PDF). */
export function offerNoteTextWithBoldPhrase(text: string, phrase: string): ReactNode {
  if (!text.trim() || !phrase.trim()) return text
  const pLower = phrase.toLowerCase()
  const nodes: ReactNode[] = []
  let rest = text
  let key = 0
  while (rest.length > 0) {
    const idx = rest.toLowerCase().indexOf(pLower)
    if (idx === -1) {
      nodes.push(rest)
      break
    }
    if (idx > 0) nodes.push(rest.slice(0, idx))
    nodes.push(<strong key={key++}>{rest.slice(idx, idx + phrase.length)}</strong>)
    rest = rest.slice(idx + phrase.length)
  }
  if (nodes.length === 1) return nodes[0]
  return <Fragment>{nodes}</Fragment>
}

export function renderCommercialOfferPaymentNote(text: string): ReactNode {
  return offerNoteTextWithBoldPhrase(text, OFFER_PAYMENT_BOLD_PHRASE)
}
