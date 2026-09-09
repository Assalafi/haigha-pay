import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Loader2, Search, ChevronLeft, ChevronRight, Inbox, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { cn } from '../../lib/cn'
import { initials } from '../../lib/format'
import type { TxStatus, UserStatus } from '../../types'

/* ---------------------------------- Button --------------------------------- */

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'soft' | 'dark'
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-dark active:bg-brand-dark shadow-sm',
  secondary: 'bg-white text-ink border border-line-soft hover:bg-canvas hover:border-line',
  outline: 'bg-transparent text-brand border border-brand/40 hover:bg-brand-soft',
  ghost: 'bg-transparent text-ink-soft hover:bg-canvas hover:text-ink',
  danger: 'bg-status-danger text-white hover:bg-[#b91c1c]',
  soft: 'bg-brand-soft text-brand hover:bg-brand-line',
  dark: 'bg-ink text-white hover:bg-black',
}

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-[13px] gap-1.5 rounded-lg',
  md: 'h-11 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-[15px] gap-2 rounded-xl',
  icon: 'h-10 w-10 rounded-xl',
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium whitespace-nowrap select-none transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-1 disabled:opacity-55 disabled:cursor-not-allowed',
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  )
}

/* ---------------------------------- Card ----------------------------------- */

export function Card({ className, children, onClick }: { className?: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl border border-line-soft bg-white shadow-card',
        onClick && 'cursor-pointer transition-all duration-200 hover:shadow-pop hover:-translate-y-0.5',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-start justify-between gap-3 px-5 pt-5', className)}>
      <div>
        <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[13px] text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

/* --------------------------------- Badge ----------------------------------- */

type BadgeTone = 'green' | 'amber' | 'red' | 'blue' | 'gray' | 'brand' | 'purple'

const badgeTones: Record<BadgeTone, string> = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/25',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  gray: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  brand: 'bg-brand-soft text-brand ring-brand/20',
  purple: 'bg-violet-50 text-violet-700 ring-violet-600/20',
}

export function Badge({
  tone = 'gray',
  className,
  children,
  dot,
}: {
  tone?: BadgeTone
  className?: string
  children: React.ReactNode
  dot?: boolean
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap',
        badgeTones[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

export const txStatusMeta: Record<TxStatus, { label: string; tone: BadgeTone }> = {
  successful: { label: 'Successful', tone: 'green' },
  pending: { label: 'Pending', tone: 'amber' },
  failed: { label: 'Failed', tone: 'red' },
  reversed: { label: 'Reversed', tone: 'blue' },
}

export function StatusBadge({ status }: { status: TxStatus | UserStatus | string }) {
  const s = status as TxStatus
  if (s in txStatusMeta) {
    const meta = txStatusMeta[s]
    return <Badge tone={meta.tone}>{meta.label}</Badge>
  }
  const userMeta: Record<string, BadgeTone> = {
    active: 'green',
    restricted: 'amber',
    suspended: 'red',
    verified: 'green',
    in_review: 'amber',
    not_started: 'gray',
    rejected: 'red',
    approved: 'green',
    successful: 'green',
  }
  return (
    <Badge tone={userMeta[status] ?? 'gray'}>
      {status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
    </Badge>
  )
}

/* ------------------------------- Form fields ------------------------------- */

export function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <label className="mb-1.5 block text-[13px] font-medium text-ink">
      {children}
      {hint && <span className="ml-1 font-normal text-ink-faint">{hint}</span>}
    </label>
  )
}

const fieldBase =
  'w-full h-11 rounded-xl border border-line bg-white px-3.5 text-[15px] text-ink placeholder:text-ink-faint/80 outline-none transition-all duration-150 focus:border-brand focus:ring-4 focus:ring-brand/15 disabled:bg-canvas disabled:text-ink-faint'

export function Input({ className, invalid, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      className={cn(fieldBase, invalid && 'border-status-danger focus:border-status-danger focus:ring-status-danger/10', className)}
      {...props}
    />
  )
}

export function Textarea({ className, invalid, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return <textarea className={cn(fieldBase, 'h-auto min-h-[96px] py-2.5', invalid && 'border-status-danger', className)} {...props} />
}

export function Select({ className, children, invalid, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select className={cn(fieldBase, 'appearance-none bg-no-repeat pr-9', invalid && 'border-status-danger', className)} {...props}>
      {children}
    </select>
  )
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10"
      />
    </div>
  )
}

export function AmountInput({
  value,
  onChange,
  placeholder,
  invalid,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  invalid?: boolean
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-ink-soft">₦</span>
      <input
        inputMode="decimal"
        value={value}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^\d.]/g, '')
          onChange(raw)
        }}
        placeholder={placeholder ?? '0.00'}
        className={cn(
          'h-14 w-full rounded-xl border border-line bg-white pl-9 pr-4 text-right text-2xl font-bold tabular text-ink outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/15',
          invalid && 'border-status-danger focus:border-status-danger',
        )}
      />
    </div>
  )
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-status-danger">
      <AlertTriangle className="h-3.5 w-3.5" />
      {children}
    </p>
  )
}

/* --------------------------------- Toggle ---------------------------------- */

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label?: React.ReactNode
  description?: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn('flex w-full items-center justify-between gap-4 py-1 text-left', disabled && 'opacity-50')}
    >
      {(label || description) && (
        <span>
          {label && <span className="block text-sm font-medium text-ink">{label}</span>}
          {description && <span className="block text-[13px] text-ink-soft">{description}</span>}
        </span>
      )}
      <span
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
          checked ? 'bg-brand' : 'bg-slate-200',
        )}
      >
        <span
          className={cn(
            'inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform h-[18px] w-[18px]',
            checked ? 'translate-x-[22px]' : 'translate-x-[3px]',
          )}
        />
      </span>
    </button>
  )
}

/* ---------------------------------- Modal ---------------------------------- */

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  hideClose,
}: {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  subtitle?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  hideClose?: boolean
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-[2px] animate-fade-up" style={{ animationDuration: '120ms' }} onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative w-full rounded-t-3xl bg-white shadow-pop sm:rounded-2xl animate-scale-in',
          widths[size],
        )}
      >
        {(title || !hideClose) && (
          <div className="flex items-start justify-between gap-4 px-5 pt-5">
            <div>
              {title && <h3 className="text-lg font-semibold text-ink">{title}</h3>}
              {subtitle && <p className="mt-0.5 text-sm text-ink-soft">{subtitle}</p>}
            </div>
            {!hideClose && (
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-ink-faint transition-colors hover:bg-canvas hover:text-ink"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex flex-col-reverse gap-2 border-t border-line-soft px-5 py-4 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

/* ------------------------------ Skeleton loaders ---------------------------- */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />
}

export function SkeletonRows({ rows = 4, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={cn('h-4', c === 0 && 'w-1/4', c === 1 && 'w-1/5', c === 2 && 'w-1/4', c === 3 && 'w-1/5')} />
          ))}
        </div>
      ))}
    </div>
  )
}

/* -------------------------------- Empty state ------------------------------- */

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ElementType
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-canvas">
        <Icon className="h-6 w-6 text-ink-faint" />
      </div>
      <h3 className="mt-4 text-[15px] font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-soft">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/* -------------------------------- Pagination -------------------------------- */

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number
  pageSize: number
  total: number
  onPageChange: (p: number) => void
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  const items = useMemo(() => {
    const arr: (number | '…')[] = []
    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || Math.abs(i - page) <= 1) arr.push(i)
      else if (arr[arr.length - 1] !== '…') arr.push('…')
    }
    return arr
  }, [pages, page])
  if (pages <= 1) return null
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-line-soft px-5 py-3 sm:flex-row">
      <p className="text-[13px] text-ink-soft">
        Showing <span className="font-medium text-ink">{from}</span>–<span className="font-medium text-ink">{to}</span> of{' '}
        <span className="font-medium text-ink">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-canvas disabled:opacity-40"
          aria-label="Previous"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {items.map((it, i) =>
          it === '…' ? (
            <span key={`e${i}`} className="px-1 text-ink-faint">
              …
            </span>
          ) : (
            <button
              key={it}
              onClick={() => onPageChange(it)}
              className={cn(
                'h-8 min-w-8 rounded-lg px-2 text-[13px] font-medium transition-colors',
                it === page ? 'bg-brand text-white' : 'text-ink-soft hover:bg-canvas',
              )}
            >
              {it}
            </button>
          ),
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-canvas disabled:opacity-40"
          aria-label="Next"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

/* ---------------------------------- Avatar ---------------------------------- */

const avatarColors = ['bg-brand', 'bg-status-info', 'bg-violet-600', 'bg-amber-600', 'bg-status-danger', 'bg-sky-600']

export function Avatar({
  firstName,
  lastName,
  color,
  size = 'md',
  className,
}: {
  firstName: string
  lastName?: string
  color?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const letter = initials(firstName, lastName ?? '')
  const sizes = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-[11px]',
    md: 'h-10 w-10 text-[13px]',
    lg: 'h-14 w-14 text-lg',
    xl: 'h-20 w-20 text-2xl',
  }
  const colorClass = color ?? avatarColors[firstName.length % avatarColors.length]
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white', sizes[size], className)}
      style={{ backgroundColor: colorClass }}
    >
      {letter}
    </span>
  )
}

/* -------------------------------- Page header ------------------------------- */

export function PageHeader({
  title,
  subtitle,
  actions,
  back,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  actions?: React.ReactNode
  back?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {back}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-ink-soft">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function BackLink({ to, label = 'Back' }: { to: string; label?: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-brand">
      <ChevronLeft className="h-4 w-4" />
      {label}
    </Link>
  )
}

import { Link } from 'react-router-dom'

/* --------------------------------- Spinner ---------------------------------- */

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-brand', className)} />
}

export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <Loader2 className="h-7 w-7 animate-spin text-brand" />
      <p className="text-sm text-ink-soft">{label}</p>
    </div>
  )
}

/* -------------------------------- Hideable money ---------------------------- */

export function BalanceText({
  amount,
  hidden,
  className,
  fraction = true,
}: {
  amount: number
  hidden: boolean
  className?: string
  fraction?: boolean
}) {
  const [currency, decimals] = useMemo(() => {
    const f = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
    if (!fraction) return [f.replace(/\.\d+$/, ''), '']
    const idx = f.indexOf('.')
    return [idx >= 0 ? f.slice(0, idx) : f, idx >= 0 ? f.slice(idx) : '']
  }, [amount, fraction])

  if (hidden) {
    return (
      <span className={cn('inline-flex items-center gap-2', className)}>
        <span className="inline-block h-0.6 rounded bg-current opacity-30 h-2 w-24 align-middle" />
      </span>
    )
  }
  return (
    <span className={cn('tabular', className)}>
      {currency}
      {fraction && <span className="font-medium opacity-60">{decimals}</span>}
    </span>
  )
}

export function EyeToggle({ hidden, onToggle }: { hidden: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white" aria-label={hidden ? 'Show balance' : 'Hide balance'}>
      {hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
    </button>
  )
}

/* -------------------------------- Segmented pills ---------------------------- */

export function Tabs<T extends string>({
  value,
  onChange,
  items,
  className,
}: {
  value: T
  onChange: (v: T) => void
  items: { value: T; label: React.ReactNode; count?: number }[]
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {items.map((it) => (
        <button
          key={it.value}
          onClick={() => onChange(it.value)}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors',
            value === it.value ? 'bg-ink text-white' : 'bg-canvas text-ink-soft hover:bg-line/60 hover:text-ink',
          )}
        >
          {it.label}
          {typeof it.count === 'number' && (
            <span className={cn('rounded-full px-1.5 text-[11px] font-semibold', value === it.value ? 'bg-white/20 text-white' : 'bg-brand-soft text-brand')}>
              {it.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

/* ------------------------------- CountUp ------------------------------- */

export function CountUp({ value, className, decimals = 0, prefix = '', duration = 700 }: { value: number; className?: string; decimals?: number; prefix?: string; duration?: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      setDisplay(value * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])
  return (
    <span className={cn('tabular', className)}>
      {prefix}
      {display.toLocaleString('en-NG', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
    </span>
  )
}

/* ------------------------------- Stat card ------------------------------- */

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = 'brand',
  onClick,
}: {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  icon?: React.ElementType
  tone?: 'brand' | 'green' | 'amber' | 'red' | 'blue' | 'gray'
  onClick?: () => void
}) {
  const tones = {
    brand: 'bg-brand text-white',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
    gray: 'bg-slate-100 text-slate-600',
  }
  return (
    <Card onClick={onClick} className={cn('p-5', onClick && 'hover:shadow-pop')}>
      <div className={cn('flex items-start justify-between gap-3')}>
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-ink-soft">{label}</p>
          <div className="mt-1.5 text-2xl font-bold tabular text-ink">{value}</div>
          {sub && <div className="mt-1.5 text-[13px] text-ink-soft">{sub}</div>}
        </div>
        {Icon && (
          <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', tones[tone])}>
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
    </Card>
  )
}

/* --------------------------------- Steps --------------------------------- */

export function Steps({ steps, current, className }: { steps: string[]; current: number; className?: string }) {
  return (
    <ol className={cn('flex items-center', className)}>
      {steps.map((s, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={s} className={cn('flex items-center', i < steps.length - 1 && 'flex-1')}>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold transition-colors',
                  done && 'bg-brand text-white',
                  active && 'bg-brand text-white ring-4 ring-brand/15',
                  !done && !active && 'bg-canvas text-ink-faint',
                )}
              >
                {done ? '✓' : i + 1}
              </span>
              <span className={cn('hidden text-[13px] font-medium sm:block', active || done ? 'text-ink' : 'text-ink-faint')}>{s}</span>
            </div>
            {i < steps.length - 1 && <div className={cn('mx-3 h-px flex-1', done ? 'bg-brand' : 'bg-line')} />}
          </li>
        )
      })}
    </ol>
  )
}
