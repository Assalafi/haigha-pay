import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { PageHeader } from '../../components/ui'
import { billers, categoryMeta } from '../../data/static'
import { BillCategoryIcon } from '../../components/common/Icons'
import type { BillCategory } from '../../types'

const order: BillCategory[] = ['airtime', 'data', 'electricity', 'cable_tv', 'internet', 'education', 'other']

export default function BillsHub() {
  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader title="Pay Bills" subtitle="Choose a service to pay for." />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {order.map((cat) => {
          const meta = categoryMeta[cat]
          const biller = billers.find((b) => b.category === cat)
          return (
            <Link
              key={cat}
              to={`/app/bills/${cat}`}
              className="group relative flex flex-col items-start gap-4 overflow-hidden rounded-2xl border border-line-soft bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-pop"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-105" style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}>
                <BillCategoryIcon category={cat} className="h-6 w-6" />
              </span>
              <div>
                <p className="text-[15px] font-semibold text-ink">{meta.label}</p>
                <p className="mt-0.5 text-xs text-ink-soft">{biller?.providers.length ?? 0} providers</p>
              </div>
              <ArrowRight className="absolute right-4 top-5 h-4 w-4 text-ink-faint transition-all group-hover:translate-x-1 group-hover:text-brand" />
            </Link>
          )
        })}
      </div>
      <p className="rounded-2xl border border-brand/15 bg-brand-soft/40 px-5 py-4 text-sm text-ink-soft">
        Bills are paid instantly from your Haigha Pay wallet. You will be asked to confirm before any deduction.
      </p>
    </div>
  )
}
