interface ImageCardProps {
  src: string
  alt: string
  label: string
  className?: string
}

/**
 * Full-bleed image card with gradient overlay and bold label.
 * Used in "Aplicații Reale" grids across division pages.
 *
 * Mobile : label text-2xl · Desktop : text-[26px]
 */
export default function ImageCard({ src, alt, label, className = '' }: ImageCardProps) {
  return (
    <div className={`relative h-96 rounded-[10px] overflow-hidden group ${className}`}>
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <span className="absolute left-[22px] right-4 bottom-5 text-white text-2xl lg:text-[26px] font-bold font-['Inter'] leading-8 lg:leading-9">
        {label}
      </span>
    </div>
  )
}
