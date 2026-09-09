import {
  ArrowLeftRight,
  BadgeCheck,
  Banknote,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Landmark,
  Loader2,
  ReceiptText,
  Send,
  Smartphone,
  Tv,
  Wifi,
  XCircle,
  Zap,
  CheckCircle2,
  Globe,
  GraduationCap,
  LayoutGrid,
} from 'lucide-react'
import { cn } from '../../lib/cn'
import type { BillCategory, TxType } from '../../types'

export type IconName =
  | 'wallet'
  | 'transfer'
  | 'airtime'
  | 'data'
  | 'electricity'
  | 'cable_tv'
  | 'internet'
  | 'education'
  | 'other'
  | 'success'
  | 'pending'
  | 'failed'

export function TxTypeIcon({ type, className }: { type: TxType | 'internet' | 'education' | 'other'; className?: string }) {
  const cls = className ?? 'h-4 w-4'
  const common = 'text-white'
  switch (type) {
    case 'wallet_funding':
      return <Banknote className={cls} />
    case 'transfer':
      return <Send className={cls} />
    case 'airtime':
      return <Smartphone className={cls} />
    case 'data':
    case 'internet':
      return <Wifi className={cls} />
    case 'electricity':
      return <Zap className={cls} />
    case 'cable_tv':
      return <Tv className={cls} />
    case 'education':
      return <GraduationCap className={cls} />
    case 'wallet_adjustment':
      return <CircleDollarSign className={cls} />
    default:
      return <LayoutGrid className={cn(cls, common)} />
  }
}

export function txTypeLabel(type: TxType): string {
  switch (type) {
    case 'wallet_funding':
      return 'Wallet Funding'
    case 'transfer':
      return 'Transfer'
    case 'airtime':
      return 'Airtime'
    case 'data':
      return 'Data Bundle'
    case 'electricity':
      return 'Electricity'
    case 'cable_tv':
      return 'Cable TV'
    case 'wallet_adjustment':
      return 'Wallet Adjustment'
  }
}

export const txTypeTone: Record<TxType, string> = {
  wallet_funding: 'bg-brand',
  transfer: 'bg-status-info',
  airtime: 'bg-amber-500',
  data: 'bg-violet-500',
  electricity: 'bg-amber-600',
  cable_tv: 'bg-purple-600',
  wallet_adjustment: 'bg-slate-500',
}

export function TxIconChip({ type, className }: { type: TxType; className?: string }) {
  return (
    <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white', txTypeTone[type], className)}>
      <TxTypeIcon type={type} />
    </span>
  )
}

export function BillCategoryIcon({ category, className }: { category: BillCategory; className?: string }) {
  const map: Record<BillCategory, typeof Smartphone> = {
    airtime: Smartphone,
    data: Globe,
    electricity: Zap,
    cable_tv: Tv,
    internet: Wifi,
    education: GraduationCap,
    betting: LayoutGrid,
    other: LayoutGrid,
  }
  const Icon = map[category] ?? LayoutGrid
  return <Icon className={className ?? 'h-5 w-5'} />
}

export function StatusIcon({ name, className }: { name: 'success' | 'pending' | 'failed'; className?: string }) {
  if (name === 'success')
    return (
      <span className={cn('relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50', className)}>
        <span className="absolute inset-0 rounded-full bg-emerald-100 animate-ping" style={{ animationDuration: '1.8s' }} />
        <svg viewBox="0 0 52 52" className="relative h-20 w-20 animate-pop-check">
          <circle cx="26" cy="26" r="24" fill="#D1FAE5" />
          <path d="M14 27l8 8 16-16" className="success-check" fill="none" stroke="#059669" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  if (name === 'pending')
    return (
      <span className={cn('flex h-20 w-20 items-center justify-center rounded-full bg-amber-50', className)}>
        <Clock3 className="h-10 w-10 text-amber-500" />
      </span>
    )
  return (
    <span className={cn('flex h-20 w-20 items-center justify-center rounded-full bg-red-50', className)}>
      <XCircle className="h-11 w-11 text-status-danger" />
    </span>
  )
}

export function ProcessingIndicator({ className }: { className?: string }) {
  return <Loader2 className={cn('h-8 w-8 animate-spin text-brand', className)} />
}
