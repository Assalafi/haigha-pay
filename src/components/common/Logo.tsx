import { cn } from '../../lib/cn'

export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`lg${size}`} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#049C47" />
          <stop offset="0.55" stopColor="#086A37" />
          <stop offset="1" stopColor="#05401F" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#lg${size})`} />
      <path d="M20 16v32M44 16v32M20 32h24" stroke="white" strokeWidth="7.5" strokeLinecap="round" fill="none" />
      <circle cx="50" cy="14" r="11" fill="white" />
      <path d="M45 14.5l3.4 3.6 6-6.8" stroke="#E31B23" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export function Logo({
  size = 40,
  showText = true,
  light = false,
  className,
  textClassName,
}: {
  size?: number
  showText?: boolean
  light?: boolean
  className?: string
  textClassName?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark size={size} />
      {showText && (
        <span className={cn('flex flex-col leading-none', textClassName)}>
          <span className={cn('text-lg font-extrabold tracking-tight', light ? 'text-white' : 'text-brand')}>
            Haigha<span className={light ? 'text-white/80' : 'text-ink'}> Pay</span>
          </span>
          {light && <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/60">Secure Payments</span>}
        </span>
      )}
    </span>
  )
}

export function WordmarkLight({ className }: { className?: string }) {
  return (
    <span className={cn('text-lg font-extrabold tracking-tight text-white', className)}>
      Haigha <span className="text-white/70">Pay</span>
    </span>
  )
}
