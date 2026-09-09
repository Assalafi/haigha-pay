import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Copy } from 'lucide-react'
import { BalanceText, EyeToggle } from '../ui'
import { LogoMark } from './Logo'
import { useAppStore } from '../../store/appStore'
import { toast } from 'sonner'

export function WalletBalanceCard({ compact }: { compact?: boolean }) {
  const wallet = useAppStore((s) => s.wallets.find((w) => w.userId === s.activeUserId))
  const hide = useAppStore((s) => s.hideBalance)
  const toggle = useAppStore((s) => s.toggleHideBalance)
  const [copied, setCopied] = useState(false)

  if (!wallet) return null

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-green via-brand to-brand-deep p-6 text-white shadow-card brand-grid">
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/5" />
      <div className="absolute right-6 bottom-5 hidden sm:block">
        <LogoMark size={40} />
      </div>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-wider text-white/70">Available Balance</p>
          <div className="mt-2 flex items-center gap-3">
            <BalanceText amount={wallet.availableBalance} hidden={hide} className="text-3xl font-extrabold" />
            <EyeToggle hidden={hide} onToggle={toggle} />
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        <button
          onClick={() => {
            void navigator.clipboard?.writeText(wallet.id)
            setCopied(true)
            setTimeout(() => setCopied(false), 1400)
            toast.success('Wallet ID copied')
          }}
          className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 font-mono text-[12px] text-white/90 backdrop-blur transition-colors hover:bg-white/20"
        >
          {wallet.id}
          {copied ? <span className="text-[10px] font-bold text-brand-green">COPIED</span> : <Copy className="h-3 w-3 text-white/60" />}
        </button>
        {!compact && (
          <span className="rounded-lg bg-white/10 px-2.5 py-1.5 text-[11px] font-medium text-white/80 backdrop-blur">NGN · Nigeria</span>
        )}
        <Link
          to="/app/wallet/fund"
          className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-brand shadow-sm transition-all hover:bg-brand-soft active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" /> Fund Wallet
        </Link>
      </div>
    </div>
  )
}
