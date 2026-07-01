export type PriceCalcChannel = 'full' | 'direct' | 'installer' | 'distributor'
export type PriceCalcMode = 'rrp' | 'profit'

export type PriceCalcInputs = {
  rrp: number
  map: number
  vat: number
  landed: number
  profit: number
  cushion: number
  dinst: number
  ddist: number
  fx: number
}

export type PriceCalcResolved = {
  vat: number
  landed: number
  di: number
  dd: number
  rrpInc: number
  rrpEx: number
  inst: number
  dist: number
  profit: number
  map: number
  floor: number
  fx: number
}

export type PriceCalcSlice = {
  key: string
  nm: string
  sub: string
  v: number
  c: string
}

export type PriceCalcBannerKind = 'ok' | 'bad'

export const PRICE_CALC_COLORS = {
  cost: '#64748b',
  cush: '#2a5bff',
  dist: '#14b8a6',
  inst: '#f5a524',
} as const

export const DEFAULT_PRICE_CALC_INPUTS: PriceCalcInputs = {
  rrp: 11300,
  map: 10500,
  vat: 21,
  landed: 4873,
  profit: 1477,
  cushion: 1400,
  dinst: 22,
  ddist: 32,
  fx: 5.24,
}

export function nf(n: number): string {
  return Math.round(n).toLocaleString('en-US')
}

export function ron(n: number): string {
  return `${nf(n)} RON`
}

export function eur(n: number, fx: number): string {
  return `€${nf(n / fx)}`
}

export function resolvePriceCalc(
  inputs: PriceCalcInputs,
  mode: PriceCalcMode,
): { resolved: PriceCalcResolved; computedRrp: number; computedProfit: number } {
  const vat = inputs.vat / 100
  const landed = inputs.landed
  const di = inputs.dinst / 100
  const dd = inputs.ddist / 100

  let rrpEx: number
  let inst: number
  let dist: number
  let rrpInc: number
  let profit: number

  if (mode === 'profit') {
    profit = inputs.profit
    dist = landed + profit
    rrpEx = dd < 1 ? dist / (1 - dd) : dist
    rrpInc = rrpEx * (1 + vat)
    inst = rrpEx * (1 - di)
  } else {
    rrpInc = inputs.rrp
    rrpEx = rrpInc / (1 + vat)
    dist = rrpEx * (1 - dd)
    inst = rrpEx * (1 - di)
    profit = dist - landed
  }

  return {
    resolved: {
      vat,
      landed,
      di,
      dd,
      rrpInc,
      rrpEx,
      inst,
      dist,
      profit,
      map: inputs.map,
      floor: inputs.cushion,
      fx: inputs.fx,
    },
    computedRrp: Math.round(rrpInc),
    computedProfit: Math.round(profit),
  }
}

export function priceCalcSlices(d: PriceCalcResolved, ch: PriceCalcChannel): PriceCalcSlice[] {
  const { rrpEx, inst, dist, landed } = d
  const slices: PriceCalcSlice[] = [
    {
      key: 'cost',
      nm: 'Landed cost',
      sub: 'your cost',
      v: landed,
      c: PRICE_CALC_COLORS.cost,
    },
  ]

  if (ch === 'direct') {
    slices.push({
      key: 'cush',
      nm: 'Baterino profit',
      sub: 'whole markup',
      v: rrpEx - landed,
      c: PRICE_CALC_COLORS.cush,
    })
  } else if (ch === 'installer') {
    slices.push(
      {
        key: 'cush',
        nm: 'Baterino profit',
        sub: 'vs installer price',
        v: inst - landed,
        c: PRICE_CALC_COLORS.cush,
      },
      {
        key: 'inst',
        nm: 'Installer margin',
        sub: 'sells to client',
        v: rrpEx - inst,
        c: PRICE_CALC_COLORS.inst,
      },
    )
  } else if (ch === 'distributor') {
    slices.push(
      {
        key: 'cush',
        nm: 'Baterino profit',
        sub: 'vs distributor price',
        v: dist - landed,
        c: PRICE_CALC_COLORS.cush,
      },
      {
        key: 'dist',
        nm: 'Distributor margin',
        sub: 'sells to client',
        v: rrpEx - dist,
        c: PRICE_CALC_COLORS.dist,
      },
    )
  } else {
    slices.push(
      {
        key: 'cush',
        nm: 'Baterino profit',
        sub: 'vs distributor price',
        v: dist - landed,
        c: PRICE_CALC_COLORS.cush,
      },
      {
        key: 'dist',
        nm: 'Distributor margin',
        sub: 'resells to installer',
        v: inst - dist,
        c: PRICE_CALC_COLORS.dist,
      },
      {
        key: 'inst',
        nm: 'Installer margin',
        sub: 'sells to client',
        v: rrpEx - inst,
        c: PRICE_CALC_COLORS.inst,
      },
    )
  }

  return slices
}

const CX = 123
const CY = 123
const RO = 110
const RI = 66

function arc(a0: number, a1: number): string {
  const p = (r: number, a: number) => {
    const rad = ((a - 90) * Math.PI) / 180
    return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)]
  }
  const large = a1 - a0 > 180 ? 1 : 0
  const o0 = p(RO, a0)
  const o1 = p(RO, a1)
  const i1 = p(RI, a1)
  const i0 = p(RI, a0)
  return (
    `M${o0[0].toFixed(2)} ${o0[1].toFixed(2)}` +
    `A${RO} ${RO} 0 ${large} 1 ${o1[0].toFixed(2)} ${o1[1].toFixed(2)}` +
    `L${i1[0].toFixed(2)} ${i1[1].toFixed(2)}` +
    `A${RI} ${RI} 0 ${large} 0 ${i0[0].toFixed(2)} ${i0[1].toFixed(2)}Z`
  )
}

export type DonutSegment = {
  d: string
  fill: string
  label?: { x: number; y: number; text: string }
}

export function buildDonutSegments(
  slices: PriceCalcSlice[],
  total: number,
): { segments: DonutSegment[]; invalid: boolean } {
  if (slices.some((x) => x.v < 0) || total <= 0) {
    return { segments: [], invalid: true }
  }

  const segments: DonutSegment[] = []
  let ang = 0

  for (const x of slices) {
    const sw = (x.v / total) * 360
    const a1 = ang + sw
    const seg: DonutSegment = { d: arc(ang, a1), fill: x.c }
    if (sw > 22) {
      const mid = (ang + a1) / 2
      const rr = (RO + RI) / 2
      const rad = ((mid - 90) * Math.PI) / 180
      seg.label = {
        x: CX + rr * Math.cos(rad),
        y: CY + rr * Math.sin(rad),
        text: `${((x.v / total) * 100).toFixed(1)}%`,
      }
    }
    segments.push(seg)
    ang = a1
  }

  return { segments, invalid: false }
}

export function priceCalcBanner(
  d: PriceCalcResolved,
  _ch: PriceCalcChannel,
  mode: PriceCalcMode,
): { kind: PriceCalcBannerKind; html: string } {
  const distCush = d.dist - d.landed
  const deepest = (1 - (d.landed + d.floor) / d.rrpEx) * 100

  if (d.dist < d.landed) {
    return {
      kind: 'bad',
      html:
        `<b>Loss.</b> Landed cost (${ron(d.landed)}) is above the distributor price (${ron(d.dist)}). ` +
        (mode === 'profit'
          ? 'Profit can’t be negative — raise it.'
          : 'Raise RRP or cut the distributor discount.'),
    }
  }

  if (mode === 'profit') {
    if (d.profit < d.floor) {
      return {
        kind: 'bad',
        html: `<b>Below floor.</b> Target profit ${ron(d.profit)} is under your ${ron(d.floor)} minimum. Raise the profit target.`,
      }
    }
    return {
      kind: 'ok',
      html:
        `<b>Profit locked at ${ron(d.profit)}</b> (${eur(d.profit, d.fx)}). To hold it at a ${(d.dd * 100).toFixed(0)}% distributor discount, set <b>RRP ${ron(d.rrpInc)} incl VAT</b>. Installer pays ${ron(d.inst)}, distributor ${ron(d.dist)}.`,
    }
  }

  if (distCush < d.floor) {
    return {
      kind: 'bad',
      html: `<b>Below floor by ${ron(d.floor - distCush)}.</b> Profit on a distributor sale is ${ron(distCush)}, under your ${ron(d.floor)} floor. Deepest safe distributor discount is ${deepest.toFixed(1)}% — you’re at ${(d.dd * 100).toFixed(0)}%.`,
    }
  }

  return {
    kind: 'ok',
    html: `<b>Clears the floor by ${ron(distCush - d.floor)}.</b> Profit on a distributor sale ${ron(distCush)} vs ${ron(d.floor)} floor. You can discount distributors to ${deepest.toFixed(1)}% before breaching (${(d.dd * 100).toFixed(0)}% now).`,
  }
}

export function priceCalcNote(
  d: PriceCalcResolved,
  _ch: PriceCalcChannel,
  mode: PriceCalcMode,
): string {
  const msgs: string[] = []
  if (d.dd <= d.di) {
    msgs.push('Distributor discount isn’t deeper than installer’s — distributors would have no resale margin.')
  }
  if (d.map >= d.rrpInc) {
    msgs.push('MAP is at or above RRP — no room to advertise below retail.')
  }
  if (d.dd > d.di * 2 + 0.0001) {
    msgs.push(
      'Distributor discount now exceeds 2× the installer rate, so in the full chain the distributor finally out-earns the installer per unit.',
    )
  }

  if (msgs.length) return `Note — ${msgs.join(' ')}`

  if (mode === 'profit') {
    return 'Build-from-profit: landed + your profit = distributor price, and RRP is computed up from it. Change the distributor discount and watch the required RRP move.'
  }

  return `In the full chain the installer’s slice (${(((d.rrpEx - d.inst) / d.rrpEx) * 100).toFixed(0)}%) tops the distributor’s (${(((d.inst - d.dist) / d.rrpEx) * 100).toFixed(0)}%) because the distributor passes the retail margin down. Switch to “Via distributor” for its real earning selling direct.`
}

export function priceCalcStats(d: PriceCalcResolved, ch: PriceCalcChannel) {
  const distCush = d.dist - d.landed
  const myCush =
    ch === 'direct'
      ? d.rrpEx - d.landed
      : ch === 'installer'
        ? d.inst - d.landed
        : distCush
  const deepest = (1 - (d.landed + d.floor) / d.rrpEx) * 100

  return {
    margin: myCush,
    deepest,
    tight: distCush,
  }
}
