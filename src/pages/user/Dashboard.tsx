import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowDownToLine, ArrowUpFromLine, Clock3, Plus, ReceiptText, Send, Wallet } from 'lucide-react'
import {
  Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { Card, CountUp, PageLoader, Skeleton } from '../../components/ui'
import { WalletBalanceCard } from '../../components/common/WalletBalanceCard'
import { TxListItem } from '../../components/common/TxListItem'
import { greeting, timeAgo, money } from '../../lib/format'
import { useCurrentTransactions, useCurrentUser } from '../../store/appStore'
import { series7Days } from '../../data/seed'
import { useFakeLoading } from '../../hooks/useFakeLoading'
import { StatusIcon } from '../../components/common/Icons'

export default function UserDashboard() {
  const user = useCurrentUser()
  const txns = useCurrentTransactions()
  const loading = useFakeLoading(500)
  const navigate = useNavigate()

  const recent = txns.filter((t) => t.status === 'successful').slice(0, 5)
  const moneyIn = txns.filter((t) => t.direction === 'credit' && t.status === 'successful').reduce((a, b) => a + b.amount, 0)
  const moneyOut = txns.filter((t) => t.direction === 'debit' && t.status === 'successful').reduce((a, b) => a + b.amount, 0)
  const pending = txns.filter((t) => t.status === 'pending').length
  const pendingAmount = txns.filter((t) => t.status === 'pending').reduce((a, b) => a + b.amount, 0)

  const firstName = user?.firstName ?? 'there'

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-56 w-full rounded-3xl" />
        <div className="grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {greeting()}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Here's what's happening with your money today.
          </p>
        </div>
        <span className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink-soft">
          {new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
      </div>

      <WalletBalanceCard />

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Fund Wallet', to: '/app/wallet/fund', icon: Plus, desc: 'Add money' },
          { label: 'Send Money', to: '/app/transfer', icon: Send, desc: 'To anyone' },
          { label: 'Pay Bills', to: '/app/bills', icon: ReceiptText, desc: 'All services' },
          { label: 'Transactions', to: '/app/transactions', icon: ArrowDownToLine, desc: 'View history' },
        ].map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="group flex flex-col items-start gap-3 rounded-2xl border border-line-soft bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-pop"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-white">
              <a.icon className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink">{a.label}</span>
              <span className="block text-xs text-ink-faint">{a.desc}</span>
            </span>
          </Link>
        ))}
      </div>

      {/* Money summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="flex items-center gap-4 p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-status-success">
            <ArrowDownToLine className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[13px] font-medium text-ink-soft">Money In</p>
            <p className="text-xl font-bold tabular text-ink">₦<CountUp value={moneyIn} /></p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-ink-soft">
            <ArrowUpFromLine className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[13px] font-medium text-ink-soft">Money Out</p>
            <p className="text-xl font-bold tabular text-ink">₦<CountUp value={moneyOut} /></p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Clock3 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[13px] font-medium text-ink-soft">Pending</p>
            <p className="text-xl font-bold tabular text-ink">
              {pending > 0 ? `${pending} · ₦${money(pendingAmount)}` : 'None'}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Recent */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between px-5 pb-1 pt-5">
            <div>
              <h3 className="text-[15px] font-semibold text-ink">Recent Transactions</h3>
              <p className="mt-0.5 text-[13px] text-ink-soft">Latest activity on your wallet</p>
            </div>
            <Link to="/app/transactions" className="flex items-center gap-1 text-sm font-medium text-brand hover:underline">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="px-3 pb-4 pt-2">
            {recent.length === 0 && (
              <div className="px-4 py-10 text-center">
                <StatusIcon name="success" className="mx-auto h-16 w-16" />
                <p className="mt-3 text-sm font-medium text-ink">No transactions yet</p>
                <p className="text-[13px] text-ink-soft">Your payments and transfers will appear here.</p>
              </div>
            )}
            {recent.map((t) => (
              <TxListItem key={t.id} tx={t} onClick={() => navigate(`/app/transactions/${t.id}`)} />
            ))}
          </div>
        </Card>

        {/* Chart */}
        <Card className="p-5">
          <h3 className="text-[15px] font-semibold text-ink">Spending Activity</h3>
          <p className="mt-0.5 text-[13px] text-ink-soft">Last 7 days</p>
          <div className="mt-4 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series7Days()} margin={{ top: 6, right: 4, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="spend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#086A37" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#086A37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#98A2B3' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#98A2B3' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₦${v / 1000}k`} />
                <Tooltip
                  formatter={(v) => [money(Number(v)), 'Spent']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #EAECF0', fontSize: 12, boxShadow: '0 8px 30px rgba(16,24,40,.12)' }}
                />
                <Area type="monotone" dataKey="spent" stroke="#086A37" strokeWidth={2.5} fill="url(#spend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1.5 border-t border-line-soft pt-3 text-[13px]">
            <div className="flex justify-between">
              <span className="text-ink-soft">Total spent (7 days)</span>
              <span className="font-semibold tabular text-ink">₦{money(series7Days().reduce((a, b) => a + b.spent, 0))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Received (7 days)</span>
              <span className="font-semibold tabular text-status-success">₦{money(series7Days().reduce((a, b) => a + b.received, 0))}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
