'use client'

/**
 * react-router-dom compatibility shim for components ported from apps/web (Vite SPA).
 * Lets ported files keep their `<Link to=...>` / `useNavigate()` call sites unchanged.
 */
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, type AnchorHTMLAttributes, type ReactNode } from 'react'

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  to: string
  /** SPA navigation state — not supported in Next; accepted and ignored. */
  state?: unknown
  children?: ReactNode
}

export function Link({ to, state: _state, children, ...rest }: LinkProps) {
  return (
    <NextLink href={to} {...rest}>
      {children}
    </NextLink>
  )
}

export function useNavigate(): (to: string, options?: { state?: unknown }) => void {
  const router = useRouter()
  return useCallback((to: string, _options?: { state?: unknown }) => router.push(to), [router])
}
