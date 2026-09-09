import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ReceiptText, RefreshCw } from 'lucide-react'
import { Badge, Button, Card, FieldError, Input, Modal, PageHeader, Select } from '../../components/ui'
import { DataTable, type Column } from '../../components/common/DataTable'
import { useCurrentMerchantPayments, useCurrentMerchantRefunds, useAppStore } from '../../store/appStore'
import { formatDateTime, money } from '../../lib/format'
import { useFakeLoading } from '../../hooks/useFakeLoading'
import type { Refund } from '../../types/merchant'
import { toast } from 'sonner'

const tone: Record<string, 'amber' | 'green' | 'red'> = { processing: 'amber', successful: 'green', failed: 'red' }

export default function MerchantRefunds() {
  const refunds = useCurrentMerchantRefunds()
  const payments = useCurrentMerchantPayments().filter((p) => p.status === 'successful')
  const createRefund = useAppStore((s) => s.createRefund)
  const merchantId = useAppStore((s) => s.activeMerchantId)
  const loading = useFakeLoading(400)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [payRef, setPayRef] = useState('')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('Customer requested cancellation')
  const [err, setErr] = useState('')

  const columns: Column<Refund>[] = [
    { key: 'r', label: 'Reference', render: (r) => <span className="font-mono text-xs font-medium">{r.reference}</span> },
    { key: 'p', label: 'Payment', render: (r) => <span className="font-mono text-xs text-ink-soft">{r.paymentReference}</span> },
    { key: 'a', label: 'Amount', sortValue: (r) => r.amount, render: (r) => <span className="font-semibold tabular">{money(r.amount)}</span> },
    { key: 's', label: 'Status', render: (r) => <Badge tone={tone[r.status]} dot>{r.status}</Badge> },
    { key: 'why', label: 'Reason', render: (r) => <span className="text-[13px] text-ink-soft">{r.reason}</span>, hideOnMobile: true },
    { key: 'd', label: 'Date', render: (r) => <span className="text-[13px] text-ink-soft">{formatDateTime(r.createdAt)}</span>, hideOnMobile: true },
  ]

  const submit = () => {
    setErr('')
    const amt = parseFloat(amount)
    if (!payRef) return setErr('Select a payment to refund.')
    if (Number.isNaN(amt) || amt <= 0) return setErr('Enter a valid amount.')
    const chosen = payments.find((p) => p.haighaRef === payRef)
    if (chosen && amt > chosen.amount) return setErr('Amount exceeds the payment.')
    createRefund(merchantId ?? '', payRef, amt, reason)
    setOpen(false); setAmount(''); setErr('')
    toast.success('Refund initiated')
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader title="Refunds" subtitle="Payments you have refunded to customers." actions={<Button onClick={() => setOpen(true)} icon={<ReceiptText className="h-4 w-4" />}>Create refund</Button>} />
      <div className="overflow-hidden rounded-2xl border border-line-soft bg-white shadow-card">
        <DataTable columns={columns} rows={refunds} loading={loading} pageSize={10} empty={{ icon: RefreshCw, title: 'No refunds yet', description: 'Refunds you create will appear here.' }} />
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Create a refund" subtitle="POST /v1/refunds (simulated)">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium">Successful payment</label>
            <Select value={payRef} onChange={(e) => { setPayRef(e.target.value); const p = payments.find((x) => x.haighaRef === e.target.value); if (p) setAmount(String(p.amount)) }}>
              <option value="">Choose a payment…</option>
              {payments.map((p) => <option key={p.id} value={p.haighaRef}>{p.merchantRef} · {money(p.amount)}</option>)}
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium">Amount</label>
            <Input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))} />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium">Reason</label>
            <Select value={reason} onChange={(e) => setReason(e.target.value)}>
              <option>Customer requested cancellation</option>
              <option>Duplicate order payment</option>
              <option>Product out of stock</option>
              <option>Fraud / unauthorized</option>
            </Select>
          </div>
          <FieldError>{err}</FieldError>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit}>Create refund</Button>
          </div>
        </div>
      </Modal>

      <Card className="flex items-center gap-3 p-4 text-sm text-ink-soft">
        <RefreshCw className="h-4 w-4 shrink-0 text-brand" />
        Refunds use the same lifecycle as real payments: processing → successful. Sandbox refunds never move real money.
      </Card>
    </div>
  )
}
