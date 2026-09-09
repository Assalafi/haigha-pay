import { cn } from '../../lib/cn'

export const HAIGHA_PAY_LOGO = '/brand/haigha-pay-logo.jpeg'

export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <img
      src={HAIGHA_PAY_LOGO}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      className={cn('shrink-0 object-contain', className)}
    />
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
  return <Logo size={36} light className={className} />
}
