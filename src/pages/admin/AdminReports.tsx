import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, FileSpreadsheet, FileText, TrendingUp, Users, Wallet, XCircle, Zap } from 'lucide-react'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { Badge, Button, Card, PageHeader, Skeleton } from '../../components/ui'
import { cn } from '../../lib/cn'
import { downloadTextFile, money, moneyShort } from '../../lib/format'
import { growthSeries, revenueSeries } from '../../data/seed'
import { useFakeLoading } from '../../hooks/useFakeLoading'
import { toast } from 'sonner'

type Range = 'today' | 'yesterday' | '7d' | '30d' | 'custom'

export default function AdminReports() {
  const [range, setRange] = useState<Range>('30d')
  const loading = useFakeLoading(500)

  const exportReport = (fmt: 'csv' | 'pdf') => {
    const rows = [
      ['Metric', 'Value'],
      ['Total transaction value', '84,650,230'],
      ['Successful payments', '12,482'],
      ['Failed payments', '184'],
      ['Active customers', '8,241'],
      ['Wallet liability', '312,540,000'],
    ]
    if (fmt === 'csv') {
      downloadTextFile(`haigha-report-${range}.csv`, rows.map((r) => r.join(',')).join('\n'))
      toast.success('Report downloaded as CSV')
    } else {
      toast.success('Report prepared successfully', { description: 'PDF export simulated — client-side only.' })
    }
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-9 w-56" />
        <div className="grid gap-3 sm:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    )
  }

  const rev = revenueSeries()
  const growth = growthSeries()

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Platform performance over any period."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => exportReport('csv')} icon={<FileSpreadsheet className="h-4 w-4" />}>Export CSV</Button>
            <Button variant="secondary" onClick={() => exportReport('pdf')} icon={<FileText className="h-4 w-4" />}>Export PDF</Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-1.5">
        {(['today', 'yesterday', '7d', '30d', 'custom'] as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={cn('rounded-lg px-3.5 py-2 text-sm font-medium capitalize transition-colors', range === r ? 'bg-ink text-white' : 'bg-white text-ink-soft shadow-sm hover:text-ink')}
          >
            {r === 'custom' ? 'Custom range' : r.replace('d', ' days')}
          </button>
        ))}
      </div>

      {/* Report cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { icon: Zap, label: 'Transaction Summary', value: `₦${moneyShort(84650230)}`, sub: 'Total processed value', link: '/admin/transactions' },
          { icon: TrendingUp, label: 'Revenue', value: `₦${moneyShort(3980000)}`, sub: 'Fees earned (30 days)', link: '/admin/settings' },
          { icon: Users, label: 'Customer Growth', value: '+864', sub: 'New customers this period', link: '/admin/customers' },
          { icon: Zap, label: 'Payment Success Rate', value: '98.4%', sub: 'Target: ≥ 97%', link: '/admin/payments' },
          { icon: XCircle, label: 'Failed Transactions', value: '184', sub: '1.4% of attempts', link: '/admin/transactions' },
          { icon: Wallet, label: 'Wallet Activity', value: `₦${moneyShort(312540000)}`, sub: 'Total wallet balance', link: '/admin/wallets' },
        ].map((c) => (
          <Link key={c.label} to={c.link}>
            <Card className="h-full p-5 transition-all hover:-translate-y-0.5 hover:shadow-pop">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-medium text-ink-soft">{c.label}</p>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-brand"><c.icon className="h-4 w-4" /></span>
              </div>
              <p className="mt-2 text-2xl font-bold tabular text-ink">{c.value}</p>
              <p className="mt-1 text-[12px] text-ink-faint">{c.sub}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-semibold text-ink">Revenue & Fees</h3>
              <p className="text-[13px] text-ink-soft">Last 6 months</p>
            </div>
            <Badge tone="green">₦{moneyShort(rev.reduce((a, b) => a + b.fees, 0))}</Badge>
          </div>
          <div className="mt-4 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rev} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="fee" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#049C47" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#049C47" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#98A2B3' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#98A2B3' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₦${moneyShort(v)}`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAECF0" />
                <Tooltip formatter={(v) => [money(Number(v)), 'Fees']} contentStyle={{ borderRadius: 12, border: '1px solid #EAECF0', fontSize: 12 }} />
                <Area type="monotone" dataKey="fees" stroke="#049C47" strokeWidth={2.5} fill="url(#fee)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-semibold text-ink">Customer Growth</h3>
              <p className="text-[13px] text-ink-soft">Registered customers vs funded wallets</p>
            </div>
            <Badge tone="brand">8,241 active</Badge>
          </div>
          <div className="mt-4 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growth} margin={{ top: 5, right: 5, left: -16, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#98A2B3' }} axisLine={false} tickLine={false} interval={3} />
                <YAxis tick={{ fontSize: 11, fill: '#98A2B3' }} axisLine={false} tickLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAECF0" />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #EAECF0', fontSize: 12 }} />
                <Bar dataKey="customers" name="Customers" fill="#086A37" radius={[4, 4, 0, 0]} />
                <Bar dataKey="wallets" name="Funded wallets" fill="#9FE3BC" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-line bg-white px-5 py-4 text-sm text-ink-soft shadow-card">
        <Download className="h-4 w-4 text-brand" />
        Reports are generated from live prototype state. Export buttons simulate the download — no server is involved.
      </div>
    </div>
  )
}
