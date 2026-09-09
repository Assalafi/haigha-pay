import { Link } from 'react-router-dom'
import {
  Activity, ArrowDownToLine, ArrowUpRight, BadgeCheck, Banknote, CreditCard, TrendingUp, Users, Wallet, XCircle, Zap,
} from 'lucide-react'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { Badge, Card, PageLoader, Skeleton, StatCard } from '../../components/ui'
import { cn } from '../../lib/cn'
import { money, moneyShort, timeAgo } from '../../lib/format'
import { gatewayChartData, channelChartData, volumeSeries } from '../../data/seed'
import { useFakeLoading } from '../../hooks/useFakeLoading'
import { useAdminNotifications } from '../../store/appStore'

const activity = [
  { icon: Banknote, tone: 'bg-emerald-50 text-emerald-600', title: 'High-value transfer of ₦2,450,000', sub: 'CUS-000421 → GTBank', at: '2026-09-09T11:02:00.000Z', toneBar: 'green' },
  { icon: BadgeCheck, tone: 'bg-blue-50 text-blue-600', title: 'New KYC submission', sub: 'Sani Lawal · Level 2', at: '2026-09-09T10:41:00.000Z' },
  { icon: XCircle, tone: 'bg-red-50 text-red-600', title: 'Failed gateway transaction', sub: 'HPY-260909-100112 · declined by issuer', at: '2026-09-09T10:12:00.000Z' },
  { icon: Users, tone: 'bg-brand-soft text-brand', title: 'Admin login', sub: 'A. Admin · Chrome / Windows', at: '2026-09-09T09:30:00.000Z' },
  { icon: Wallet, tone: 'bg-amber-50 text-amber-600', title: 'Wallet adjustment', sub: 'CUS-0034 · +₦5,000 correction', at: '2026-09-09T08:55:00.000Z' },
]

export default function AdminDashboard() {
  const loading = useFakeLoading(600)
  const adminNotifs = useAdminNotifications()

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-9 w-72" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Good morning, A. Admin</h1>
          <p className="mt-1 text-sm text-ink-soft">Here's your platform overview for today, 9 Sep 2026.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/reports" className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-sm transition-colors hover:bg-canvas">Reports</Link>
          <Link to="/admin/payments" className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-dark">Gateway monitor</Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Transaction Value" value={`₦${moneyShort(84650230)}`} sub={<span className="flex items-center gap-1 text-emerald-600"><TrendingUp className="h-3.5 w-3.5" /> +4.2% vs yesterday</span>} icon={Banknote} tone="brand" />
        <StatCard label="Successful Payments" value="12,482" sub={<span className="text-status-success">98.4% success rate</span>} icon={ArrowDownToLine} tone="green" />
        <StatCard label="Failed Payments" value="184" sub={<span className="text-status-danger">0.7% of volume</span>} icon={XCircle} tone="red" />
        <StatCard label="Active Customers" value="8,241" sub={<span className="text-emerald-600">+126 this week</span>} icon={Users} tone="blue" />
        <StatCard label="Wallet Liability" value={`₦${moneyShort(312540000)}`} sub={<span className="text-ink-soft">Across all customer wallets</span>} icon={Wallet} tone="amber" />
        <StatCard label="Revenue / Fees" value={`₦${moneyShort(1298000)}`} sub={<span className="text-ink-soft">Today</span>} icon={Activity} tone="gray" />
      </div>

      {/* Charts row */}
      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-semibold text-ink">Transaction Volume</h3>
              <p className="text-[13px] text-ink-soft">Daily processed value · last 14 days</p>
            </div>
            <Badge tone="green">Live</Badge>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeSeries(14)} margin={{ top: 5, right: 5, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="tv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#086A37" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#086A37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#98A2B3' }} axisLine={false} tickLine={false} interval={1} />
                <YAxis tick={{ fontSize: 11, fill: '#98A2B3' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₦${moneyShort(v)}`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAECF0" />
                <Tooltip formatter={(v) => [money(Number(v)), 'Value']} contentStyle={{ borderRadius: 12, border: '1px solid #EAECF0', fontSize: 12 }} />
                <Area type="monotone" dataKey="value" stroke="#086A37" strokeWidth={2.5} fill="url(#tv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Donut */}
        <Card className="p-5">
          <h3 className="text-[15px] font-semibold text-ink">Payment Status</h3>
          <p className="text-[13px] text-ink-soft">Today's gateway outcomes</p>
          <div className="relative mx-auto mt-2 h-48 w-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={gatewayChartData()} dataKey="value" nameKey="name" innerRadius={60} outerRadius={82} paddingAngle={2} strokeWidth={0}>
                  {gatewayChartData().map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #EAECF0', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-extrabold tabular text-ink">12,939</p>
              <p className="text-[11px] text-ink-faint">Total today</p>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
            {gatewayChartData().map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[12px]">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-ink-soft">{d.name}</span>
                <span className="ml-auto font-semibold tabular text-ink">{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        {/* Channels */}
        <Card className="p-5 xl:col-span-1">
          <h3 className="text-[15px] font-semibold text-ink">Payment Channels</h3>
          <p className="text-[13px] text-ink-soft">Volume by channel</p>
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelChartData()} layout="vertical" margin={{ left: 8, right: 16 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={92} tick={{ fontSize: 12, fill: '#667085' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [Number(v).toLocaleString(), 'Payments']} cursor={{ fill: '#F7F9F8' }} contentStyle={{ borderRadius: 12, border: '1px solid #EAECF0', fontSize: 12 }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
                  {channelChartData().map((d) => <Cell key={d.name} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent activity */}
        <Card className="p-5 xl:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-ink">Recent Activity</h3>
            <Link to="/admin/audit-logs" className="text-[13px] font-medium text-brand hover:underline">Audit log</Link>
          </div>
          <div className="mt-3 space-y-1">
            {activity.map((a, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-canvas">
                <span className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', a.tone)}><a.icon className="h-4.5 w-4.5 h-5 w-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{a.title}</p>
                  <p className="truncate text-xs text-ink-faint">{a.sub}</p>
                </div>
                <span className="shrink-0 text-[11px] text-ink-faint">{timeAgo(a.at)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Alerts */}
        <Card className="p-5">
          <h3 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
            <Zap className="h-4 w-4 text-amber-500" /> Alerts
          </h3>
          <div className="mt-3 space-y-2.5">
            <button className="w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left transition-colors hover:bg-amber-100/70">
              <p className="text-sm font-semibold text-amber-900">14 payments awaiting reconciliation</p>
              <p className="mt-0.5 text-xs text-amber-700">Gateway returned but wallet not credited. Review in Payments.</p>
            </button>
            <button className="w-full rounded-xl border border-brand/15 bg-brand-soft/50 px-4 py-3 text-left transition-colors hover:bg-brand-soft">
              <p className="text-sm font-semibold text-ink">3 KYC reviews require attention</p>
              <p className="mt-0.5 text-xs text-ink-soft">Applications older than 4 hours.</p>
            </button>
            {adminNotifs.slice(0, 1).map((n) => (
              <div key={n.id} className="rounded-xl border border-line-soft px-4 py-3">
                <p className="text-sm font-semibold text-ink">{n.title}</p>
                <p className="mt-0.5 text-xs text-ink-soft">{n.body}</p>
              </div>
            ))}
          </div>
          <Link to="/admin/notifications" className="mt-4 block text-center text-[13px] font-medium text-brand hover:underline">View all alerts</Link>
        </Card>
      </div>
    </div>
  )
}
