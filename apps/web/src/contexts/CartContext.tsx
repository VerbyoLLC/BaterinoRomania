import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'baterino-cart-v1'

/** Procent reducere pe linie (0 dacă fără program). */
export function cartLineDiscountPercent(line: Pick<CartLine, 'reducereDiscountPercent'>): number {
  const rawD = line.reducereDiscountPercent
  return rawD != null && rawD > 0 ? Math.min(100, rawD) : 0
}

/**
 * Identificator stabil pentru o linie din coș: același produs cu / fără program
 * (sau programe diferite) = linii distincte.
 */
export function cartLineMergeKey(
  line: Pick<CartLine, 'productId' | 'slug' | 'reducereProgramId' | 'reducereDiscountPercent'>,
): string {
  const d = cartLineDiscountPercent(line)
  const prog =
    line.reducereProgramId != null && String(line.reducereProgramId).trim()
      ? String(line.reducereProgramId).trim()
      : ''
  const slug = line.slug?.trim() || ''
  return `${line.productId}\x1e${slug}\x1e${prog}\x1e${d}`
}

/** Cu program de reducere (procent pe linie), maximum 1 bucată per produs. */
export function cartLineMaxQty(line: Pick<CartLine, 'reducereDiscountPercent'>): number {
  return line.reducereDiscountPercent != null && line.reducereDiscountPercent > 0 ? 1 : 99
}

/** Cantitatea e fixă (1) — UI pas cu pas / input trebuie dezactivate. */
export function cartLineQtyLocked(line: Pick<CartLine, 'reducereDiscountPercent'>): boolean {
  return cartLineMaxQty(line) === 1
}

export type CartLine = {
  productId: string
  slug: string
  title: string
  qty: number
  /** Card / first gallery image URL when added from product page */
  imageUrl?: string
  /** ID program reducere (API), fără prefix local- */
  reducereProgramId?: string
  /** Procent 1–100 — folosit la afișare; la checkout se validează prin program */
  reducereDiscountPercent?: number
}

type CartContextValue = {
  lines: CartLine[]
  itemCount: number
  addLine: (line: Omit<CartLine, 'qty'> & { qty?: number }) => void
  /** `lineKey` = `cartLineMergeKey(line)` */
  setLineQty: (lineKey: string, qty: number) => void
  /** `lineKey` = `cartLineMergeKey(line)` */
  removeLine: (lineKey: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function readStorage(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (x): x is CartLine =>
          x &&
          typeof x === 'object' &&
          typeof (x as CartLine).productId === 'string' &&
          typeof (x as CartLine).slug === 'string' &&
          typeof (x as CartLine).title === 'string' &&
          typeof (x as CartLine).qty === 'number' &&
          ((x as CartLine).imageUrl === undefined || typeof (x as CartLine).imageUrl === 'string') &&
          ((x as CartLine).reducereProgramId === undefined || typeof (x as CartLine).reducereProgramId === 'string') &&
          ((x as CartLine).reducereDiscountPercent === undefined || typeof (x as CartLine).reducereDiscountPercent === 'number'),
      )
      .map((x) => {
        const line: CartLine = {
          productId: x.productId,
          slug: x.slug,
          title: x.title,
          qty: 1,
        }
        if (typeof x.imageUrl === 'string' && x.imageUrl.trim()) line.imageUrl = x.imageUrl.trim()
        if (typeof x.reducereProgramId === 'string' && x.reducereProgramId.trim()) {
          line.reducereProgramId = x.reducereProgramId.trim()
        }
        if (typeof x.reducereDiscountPercent === 'number' && x.reducereDiscountPercent > 0) {
          line.reducereDiscountPercent = Math.min(100, x.reducereDiscountPercent)
        }
        const maxQ = cartLineMaxQty(line)
        line.qty = Math.min(maxQ, Math.max(1, Math.floor(x.qty)))
        return line
      })
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() =>
    typeof window !== 'undefined' ? readStorage() : [],
  )

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    } catch {
      /* ignore */
    }
  }, [lines])

  const addLine = useCallback((line: Omit<CartLine, 'qty'> & { qty?: number }) => {
    const incomingDisc = line.reducereDiscountPercent != null && line.reducereDiscountPercent > 0
    const maxNew = incomingDisc ? 1 : 99
    const q = line.qty != null ? Math.min(maxNew, Math.max(1, Math.floor(line.qty))) : 1
    setLines((prev) => {
      const incomingKey = cartLineMergeKey(line)
      const i = prev.findIndex((x) => cartLineMergeKey(x) === incomingKey)
      if (i >= 0) {
        const next = [...prev]
        const row = { ...next[i] }
        const img = line.imageUrl?.trim()
        if (img) row.imageUrl = img
        if (line.reducereDiscountPercent != null && line.reducereDiscountPercent > 0) {
          row.reducereDiscountPercent = Math.min(100, line.reducereDiscountPercent)
          row.reducereProgramId =
            line.reducereProgramId != null && String(line.reducereProgramId).trim()
              ? String(line.reducereProgramId).trim()
              : undefined
        } else {
          delete row.reducereProgramId
          delete row.reducereDiscountPercent
        }
        const maxRow = cartLineMaxQty(row)
        row.qty = Math.min(maxRow, row.qty + q)
        next[i] = row
        return next
      }
      const img = line.imageUrl?.trim()
      const out: CartLine = {
        productId: line.productId,
        slug: line.slug,
        title: line.title,
        qty: q,
      }
      if (img) out.imageUrl = img
      if (line.reducereDiscountPercent != null && line.reducereDiscountPercent > 0) {
        out.reducereDiscountPercent = Math.min(100, line.reducereDiscountPercent)
        if (line.reducereProgramId != null && String(line.reducereProgramId).trim()) {
          out.reducereProgramId = String(line.reducereProgramId).trim()
        }
      }
      return [...prev, out]
    })
  }, [])

  const setLineQty = useCallback((lineKey: string, qty: number) => {
    setLines((prev) =>
      prev.map((x) => {
        if (cartLineMergeKey(x) !== lineKey) return x
        const maxQ = cartLineMaxQty(x)
        const q = Math.min(maxQ, Math.max(1, Math.floor(qty)))
        return { ...x, qty: q }
      }),
    )
  }, [])

  const removeLine = useCallback((lineKey: string) => {
    setLines((prev) => prev.filter((x) => cartLineMergeKey(x) !== lineKey))
  }, [])

  const clearCart = useCallback(() => setLines([]), [])

  const itemCount = useMemo(() => lines.reduce((s, x) => s + x.qty, 0), [lines])

  const value = useMemo(
    () => ({ lines, itemCount, addLine, setLineQty, removeLine, clearCart }),
    [lines, itemCount, addLine, setLineQty, removeLine, clearCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
