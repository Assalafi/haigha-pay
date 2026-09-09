import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDownToLine, ArrowUpFromLine, Copy, Landmark, Lock, ShieldCheck, Wallet as WalletIcon } from 'lucide-react'
import { Badge, Button, Card, CountUp, PageHeader, PageLoader, Skeleton } from '../../components/ui'
import { WalletBalanceCard } from '../../components/common/WalletBalanceCard'
import { TxListItem } from '../../components/common/TxListItem'
import { useCurrentTransactions, useAppStore } from '../../store/appStore'
import { money } from '../../lib/format'
import { useFakeLoading } from '../../hooks/useFakeLoading'
import { toast } from 'sonner'

export default function WalletPage() {
  const wallet = useAppStore((s) => s.wallets.find((w) => w.userId === s.activeUserId))
  const user = useAppStore((s) => s.users.find((u) => u.id === s.activeUserId))
  const txns = useCurrentTransactions()
  const loading = useFakeLoading(500)
  const [virtual, setVirtual] = useState('70012345678')

  const fundings = txns.filter((t) => t.type === 'wallet_funding').slice(0, 5)
  const today = new Date().toISOString().slice(0, 10)
  const inflowToday = txns.filter((t) => t.direction === 'credit' && t.status === 'successful' && t.createdAt.startsWith(today)).reduce((a, b) => a + b.amount, 0)
  const outflowToday = txns.filter((t) => t.direction === 'debit' && t.status === 'successful' && t.createdAt.startsWith(today)).reduce((a, b) => a + b.amount, 0)

  if (loading || !wallet) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-52 w-full rounded-3xl" />
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        title="My Wallet"
        subtitle="Manage your money, balances and funding methods."
        actions={
          <>
            <Link to="/app/transfer"><Button variant="secondary">Send</Button></Link>
            <Link to="/app/wallet/fund"><Button>Fund Wallet</Button></Link>
          </>
        }
      />

      <WalletBalanceCard />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-[13px] font-medium text-ink-soft">Ledger balance</p>
          <p className="mt-1.5 text-xl font-bold tabular text-ink">₦<CountUp value={wallet.ledgerBalance} /></p>
          <p className="mt-1 text-[12px] text-ink-faint">Cleared & settled funds</p>
        </Card>
        <Card className="p-5">
          <p className="text-[13px] font-medium text-ink-soft">Held balance</p>
          <p className="mt-1.5 text-xl font-bold tabular text-ink">₦0.00</p>
          <p className="mt-1 text-[12px] text-ink-faint">Reserved for pending actions</p>
        </Card>
        <Card className="p-5">
          <p className="text-[13px] font-medium text-ink-soft">Wallet status</p>
          <div className="mt-2"><Badge tone={wallet.status === 'active' ? 'green' : 'amber'} dot>{wallet.status === 'active' ? 'Active' : 'Restricted'}</Badge></div>
          <p className="mt-1.5 text-[12px] text-ink-faint">Currency: NGN</p>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Virtual account */}
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand"><Landmark className="h-5 w-5" /></span>
            <div>
              <h3 className="text-[15px] font-semibold text-ink">Virtual Account</h3>
              <p className="text-[13px] text-ink-soft">Receive transfers into your wallet from any bank app.</p>
            </div>
          </div>
          <button
            onClick={() => { void navigator.clipboard?.writeText(virtual); toast.success('Account number copied') }}
            className="mt-5 flex w-full items-center justify-between rounded-2xl border border-dashed border-brand/30 bg-brand-soft/40 px-5 py-4 transition-colors hover:bg-brand-soft/70"
          >
            <div className="text-left">
              <p className="font-mono text-2xl font-bold tabular tracking-wide text-ink">{virtual}</p>
              <p className="text-[13px] text-ink-soft">Haigha Pay · Providus Bank</p>
            </div>
            <Copy className="h-5 w-5 text-brand" />
          </button>
          <div className="mt-3 flex items-start gap-2 text-[13px] text-ink-soft">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            Credits to this account are applied automatically. No transfer fee from Haigha Pay.
          </div>
        </Card>

        {/* Limits */}
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><Lock className="h-5 w-5" /></span>
            <div>
              <h3 className="text-[15px] font-semibold text-ink">Limits & KYC</h3>
              <p className="text-[13px] text-ink-soft">Your current account tier</p>
            </div>
            <div className="ml-auto"><Badge tone={user?.kycStatus === 'verified' ? 'green' : 'amber'}>{user?.kycStatus === 'verified' ? `Level ${user.kycLevel} Verified` : 'KYC in progress'}</Badge></div>
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <LimitRow label="Max single transfer" value="₦500,000" />
            <LimitRow label="Daily limit" value="₦1,000,000" />
            <LimitRow label="Wallet funding (max)" value="₦2,000,000" />
            <LimitRow label="Wallet balance limit" value="₦10,000,000" />
          </div>
          <Link to="/app/profile/kyc">
            <Button variant="soft" className="mt-5 w-full">Upgrade my limits</Button>
          </Link>
        </Card>
      </div>

      {/* Today's movement */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="flex items-center gap-4 p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-status-success"><ArrowDownToLine className="h-5 w-5" /></span>
          <div>
            <p className="text-[13px] text-ink-soft">Money in today</p>
            <p className="text-xl font-bold tabular text-ink">{money(inflowToday)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-ink-soft"><ArrowUpFromLine className="h-5 w-5" /></span>
          <div>
            <p className="text-[13px] text-ink-soft">Money out today</p>
            <p className="text-xl font-bold tabular text-ink">{money(outflowToday)}</p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between px-5 pb-2 pt-5">
          <div>
            <h3 className="text-[15px] font-semibold text-ink">Recent funding</h3>
            <p className="text-[13px] text-ink-soft">Latest credits into this wallet</p>
          </div>
          <Link to="/app/transactions" className="flex items-center gap-1 text-sm font-medium text-brand hover:underline">View all</Link>
        </div>
        <div className="px-3 pb-4">
          {fundings.length === 0 && <p className="px-4 py-8 text-center text-sm text-ink-soft">No funding yet. <Link to="/app/wallet/fund" className="text-brand">Fund wallet</Link></p>}
          {fundings.map((t) => <TxListItem key={t.id} tx={t} />)}
        </div>
      </Card>
    </div>
  )
}

function LimitRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-line-soft/70 pb-2.5 last:border-0 last:pb-0">
      <span className="text-ink-soft">{label}</span>
      <span className="font-semibold tabular text-ink">{value}</span>
    </div>
  )
}
