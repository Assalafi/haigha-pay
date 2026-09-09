import { Link } from 'react-router-dom'
import { ArrowRight, Plus, Send, ShieldCheck, Zap } from 'lucide-react'
import { PageHeader } from '../../components/ui'
import { BillCategoryIcon } from '../../components/common/Icons'
import { categoryMeta } from '../../data/static'
import type { BillCategory } from '../../types'
import { billers } from '../../data/static'

const order: BillCategory[] = ['airtime', 'data', 'electricity', 'cable_tv', 'internet', 'education', 'other']

export default function PaymentsHub() {
  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader title="Payments" subtitle="Fund your wallet, send money or pay a bill." />

      <div className="grid gap-3 sm:grid-cols-2">
        <Link to="/app/wallet/fund" className="group relative flex items-center gap-4 overflow-hidden rounded-2xl bg-brand p-5 text-white transition-all hover:-translate-y-0.5 hover:shadow-pop">
          <div className="absolute inset-0 brand-grid opacity-40" />
          <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <Plus className="h-6 w-6" />
          </span>
          <div className="relative">
            <p className="text-[15px] font-semibold">Fund Wallet</p>
            <p className="text-sm text-white/70">Add money by card or transfer</p>
          </div>
          <ArrowRight className="relative ml-auto h-5 w-5 text-white/60 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link to="/app/transfer" className="group flex items-center gap-4 rounded-2xl bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-pop">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-status-info">
            <Send className="h-6 w-6" />
          </span>
          <div>
            <p className="text-[15px] font-semibold text-ink">Send Money</p>
            <p className="text-sm text-ink-soft">Bank account or Haigha Pay</p>
          </div>
          <ArrowRight className="ml-auto h-5 w-5 text-ink-faint transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div>
        <h2 className="mb-3 text-[15px] font-semibold text-ink">Pay Bills</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {order.map((cat) => {
            const meta = categoryMeta[cat]
            const link = billers.find((b) => b.category === cat) ? `/app/bills/${cat}` : '/app/bills'
            return (
              <Link
                key={cat}
                to={link}
                className="group flex flex-col items-start gap-3 rounded-2xl border border-line-soft bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-pop"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}>
                  <BillCategoryIcon category={cat} className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold text-ink">{meta.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="flex items-start gap-4 rounded-2xl border border-brand/15 bg-brand-soft/50 p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand shadow-sm">
          <Zap className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-ink">Payment processing powered by ZainPay</p>
          <p className="mt-0.5 text-[13px] leading-relaxed text-ink-soft">
            Card funding and gateway operations will run through the ZainPay integration. This prototype simulates checkout —
            no real payment is requested.
          </p>
        </div>
        <ShieldCheck className="hidden h-5 w-5 shrink-0 text-brand sm:block" />
      </div>
    </div>
  )
}
