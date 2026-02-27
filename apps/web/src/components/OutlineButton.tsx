import type { ReactNode } from 'react'

interface OutlineButtonProps {
  onClick?: () => void
  children: ReactNode
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export default function OutlineButton({ onClick, children, className = '', type = 'button' }: OutlineButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-72 h-12 px-2.5 py-[5px] rounded-[10px] outline outline-1 outline-offset-[-1px] outline-slate-900 inline-flex justify-center items-center gap-3.5 hover:bg-zinc-100 active:bg-zinc-200 transition-colors ${className}`}
    >
      <span className="text-center text-black text-base font-semibold font-['Inter'] leading-[56px]">
        {children}
      </span>
    </button>
  )
}
