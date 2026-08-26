type Props = {
  priceLine: string
  pricePrefix: string
  loading: boolean
  tone?: 'dark' | 'light'
  className?: string
}

/** Second line of the homepage promo title — skeleton while the catalog price loads. */
export default function HomePromoPriceLine({
  priceLine,
  pricePrefix,
  loading,
  tone = 'dark',
  className = '',
}: Props) {
  if (loading) {
    const skeletonClass = tone === 'dark' ? 'bg-white/35' : 'bg-neutral-200'
    return (
      <span
        className={`inline-flex items-center gap-2 ${className}`}
        aria-busy="true"
        aria-label="Loading price"
      >
        <span>{pricePrefix}</span>
        <span
          className={`inline-block h-[0.85em] w-[8.5rem] max-w-[65vw] animate-pulse rounded motion-reduce:animate-none ${skeletonClass}`}
          aria-hidden
        />
      </span>
    )
  }

  return <span className={className}>{priceLine}</span>
}
