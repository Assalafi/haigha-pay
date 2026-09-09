import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Landmark, Loader2, Mail, ShieldCheck, Sparkles } from 'lucide-react'
import { Button, Card, FieldError, Input, Label, Modal, Select, Steps } from '../../components/ui'
import { cn } from '../../lib/cn'
import { toast } from 'sonner'

const steps = ['Account', 'Business', 'KYB', 'Bank', 'Review']

export default function MerchantOnboarding() {
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '', phone: '',
    businessName: '', legalName: '', industry: 'E-commerce', website: '', country: 'Nigeria', rcNumber: '',
    docType: 'Certificate of Incorporation', docName: null as string | null,
    directorDoc: null as string | null,
    bank: 'Access Bank', accountName: '', accountNumber: '',
  })
  const [err, setErr] = useState('')
  const navigate = useNavigate()

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const upload = (key: 'docName' | 'directorDoc') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.onchange = () => {
      const file = input.files?.[0]
      if (file) set(key, file.name)
    }
    input.click()
  }

  const validate = () => {
    setErr('')
    if (step === 0 && !/^\S+@\S+\.\S+$/.test(form.email)) return setErr('Enter a valid business email.')
    if (step === 1 && (form.businessName.trim().length < 2 || form.legalName.trim().length < 2)) return setErr('Enter your business and legal names.')
    if (step === 2 && (!form.docName || !form.directorDoc)) return setErr('Upload the incorporation document and a director ID.')
    if (step === 3 && form.accountNumber.replace(/\D/g, '').length !== 10) return setErr('Enter a valid 10-digit settlement account number.')
    return true
  }

  const next = () => {
    if (!validate()) return
    if (step < 4) setStep(step + 1)
    else submit()
  }

  const submit = () => {
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      setDone(true)
    }, 1400)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-canvas px-5 py-14">
        <div className="mx-auto max-w-xl animate-fade-up rounded-3xl border border-line-soft bg-white p-8 text-center shadow-card">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-9 w-9 text-status-success" />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold text-ink">Business submitted for verification</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
            Your KYB documents are under review. Once approved you'll get sandbox access instantly — live access requires
            admin approval after you complete your integration tests.
          </p>
          <div className="mt-6 space-y-2 rounded-2xl bg-canvas px-5 py-4 text-left text-sm">
            <Row k="Business" v={form.businessName || '—'} />
            <Row k="Industry" v={form.industry} />
            <Row k="KYB status" v={<span className="font-medium text-amber-600">Pending review</span>} />
            <Row k="Sandbox base URL" v={<span className="font-mono text-xs">https://sandbox-api.haighapay.com/v1</span>} />
          </div>
          <Button className="mt-6 w-full" onClick={() => navigate('/merchant/login')}>Continue to sign in</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto max-w-2xl px-5 py-10">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-white"><Building2 className="h-5 w-5" /></span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">Start accepting payments</h1>
            <p className="text-sm text-ink-soft">Set up your business on Haigha Pay in under 5 minutes.</p>
          </div>
        </div>

        <Steps steps={steps} current={step} />
        <Card className="mt-6 space-y-5 p-6 animate-fade-up">
          {step === 0 && (
            <>
              <Field label="Business email"><Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="billing@yourbusiness.ng" /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name"><Input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="Your first name" /></Field>
                <Field label="Last name"><Input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="Your last name" /></Field>
              </div>
              <Field label="Phone number"><Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="0803 000 0000" /></Field>
            </>
          )}

          {step === 1 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Business name"><Input value={form.businessName} onChange={(e) => set('businessName', e.target.value)} placeholder="e.g. Greenline Stores" /></Field>
                <Field label="Legal name"><Input value={form.legalName} onChange={(e) => set('legalName', e.target.value)} placeholder="Registered company name" /></Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Industry">
                  <Select value={form.industry} onChange={(e) => set('industry', e.target.value)}>
                    {['E-commerce', 'School Portal', 'ERP', 'Government Portal', 'SaaS', 'Marketplace', 'Other'].map((x) => <option key={x}>{x}</option>)}
                  </Select>
                </Field>
                <Field label="RC Number"><Input value={form.rcNumber} onChange={(e) => set('rcNumber', e.target.value)} placeholder="RC 1234567" /></Field>
              </div>
              <Field label="Website URL (optional)"><Input value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://" /></Field>
            </>
          )}

          {step === 2 && (
            <>
              <p className="flex items-center gap-2 rounded-xl bg-canvas px-4 py-3 text-[13px] text-ink-soft">
                <ShieldCheck className="h-4 w-4 text-brand" /> KYB helps us verify your business. Documents are never uploaded in this demo.
              </p>
              <Field label="Document type">
                <Select value={form.docType} onChange={(e) => set('docType', e.target.value)}>
                  <option>Certificate of Incorporation</option>
                  <option>Business registration (BN)</option>
                  <option>Form CAC 2.1 / 2.2</option>
                </Select>
              </Field>
              <UploadRow label={`Upload ${form.docType}`} fileName={form.docName} onPick={() => upload('docName')} />
              <UploadRow label="Director government ID" fileName={form.directorDoc} onPick={() => upload('directorDoc')} />
            </>
          )}

          {step === 3 && (
            <>
              <Field label="Settlement bank"><Select value={form.bank} onChange={(e) => set('bank', e.target.value)}>{['Access Bank', 'GTBank', 'Zenith Bank', 'First Bank', 'UBA', 'Moniepoint'].map((b) => <option key={b}>{b}</option>)}</Select></Field>
              <Field label="Account number"><Input value={form.accountNumber} onChange={(e) => set('accountNumber', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="0112345678" /></Field>
              <Field label="Account name"><Input value={form.accountName} onChange={(e) => set('accountName', e.target.value)} placeholder="Registered account name" /></Field>
              <p className="flex items-center gap-2 text-[13px] text-ink-faint"><Landmark className="h-4 w-4" /> Settlements are paid to this account on your settlement schedule.</p>
            </>
          )}

          {step === 4 && (
            <>
              <h3 className="text-[15px] font-semibold text-ink">Review your application</h3>
              <dl className="divide-y divide-line-soft/70 rounded-2xl border border-line px-5 text-sm">
                <Row k="Business email" v={form.email || '—'} />
                <Row k="Business name" v={form.businessName || '—'} />
                <Row k="Legal name" v={form.legalName || '—'} />
                <Row k="Industry" v={form.industry} />
                <Row k="KYB document" v={form.docName ? `${form.docType} · uploaded` : '—'} />
                <Row k="Director ID" v={form.directorDoc ?? '—'} />
                <Row k="Settlement" v={`${form.bank} · ${form.accountNumber}`} />
              </dl>
              <p className="flex items-start gap-2 rounded-xl bg-brand-soft/50 px-4 py-3 text-[13px] text-brand">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0" /> Sandbox access is granted immediately after review. Live access requires completing integration tests.
              </p>
            </>
          )}
          <FieldError>{err}</FieldError>
        </Card>

        <div className="mt-5 flex items-center justify-between gap-3">
          <Button variant="secondary" disabled={step === 0} onClick={() => setStep(Math.max(0, step - 1))} icon={<ArrowLeft className="h-4 w-4" />}>Back</Button>
          <p className="text-[13px] text-ink-faint">Step {step + 1} of 5</p>
          <Button onClick={next}>
            {step === 4 ? 'Submit for review' : 'Continue'} {step < 4 && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <Modal open={processing} onClose={() => undefined} hideClose>
        <div className="flex flex-col items-center py-8 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-brand" />
          <h3 className="mt-5 text-lg font-bold text-ink">Submitting your KYB…</h3>
          <p className="mt-1 text-sm text-ink-soft">Verifying your business details (simulated).</p>
        </div>
      </Modal>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function UploadRow({ label, fileName, onPick }: { label: string; fileName: string | null; onPick: () => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <button type="button" onClick={onPick} className={cn('flex w-full items-center justify-between rounded-xl border-2 border-dashed px-4 py-3.5 transition-colors', fileName ? 'border-brand bg-brand-soft/30' : 'border-line hover:border-brand/40')}>
        <span className="text-sm font-medium text-ink">{fileName ?? 'Choose file'}</span>
        <span className="text-[13px] font-semibold text-brand">{fileName ? 'Change' : 'Upload'}</span>
      </button>
    </div>
  )
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-ink-soft">{k}</dt>
      <dd className="text-right font-medium text-ink">{v}</dd>
    </div>
  )
}
