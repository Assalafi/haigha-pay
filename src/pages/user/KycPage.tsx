import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BadgeCheck, Camera, Check, FileText, IdCard, Loader2, UserRound } from 'lucide-react'
import { Button, Card, FieldError, Input, Label, Select, Steps } from '../../components/ui'
import { Avatar } from '../../components/ui'
import { cn } from '../../lib/cn'
import { useAppStore, useCurrentUser } from '../../store/appStore'
import { toast } from 'sonner'

const steps = ['Basic info', 'NIN / BVN', 'Identity doc', 'Selfie', 'Review']

export default function KycPage() {
  const user = useCurrentUser()
  const updateProfile = useAppStore((s) => s.updateProfile)
  const submitKyc = useAppStore((s) => s.submitKyc)
  const draft = useAppStore((s) => s.kycDraft)

  const [step, setStep] = useState(0)
  const [basic, setBasic] = useState({ dob: '', gender: 'Female', stateOfOrigin: '', occupation: '' })
  const [numbers, setNumbers] = useState({ nin: '', bvn: '' })
  const [doc, setDoc] = useState<{ type: string; fileName: string | null }>({ type: 'National ID', fileName: null })
  const [selfie, setSelfie] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const status = useMemo(() => {
    if (user?.kycStatus === 'verified') return 'verified'
    if (user?.kycStatus === 'in_review') return 'in_review'
    if (user?.kycStatus === 'rejected') return 'rejected'
    return 'not_started'
  }, [user])

  if (!user) return null

  if (status === 'verified') {
    return (
      <VerifiedKyc userKycLevel={user.kycLevel} email={user.email} fullName={`${user.firstName} ${user.lastName}`} phone={user.phone} />
    )
  }

  if (status === 'in_review') {
    return (
      <div className="mx-auto max-w-lg animate-fade-up">
        <Card className="p-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
            <Loader2 className="h-9 w-9 animate-spin text-amber-500" />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold text-ink">Verification in Review</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
            We've received your KYC application and our team is verifying your documents. This usually takes less than 24 hours. You'll be notified once it's complete.
          </p>
          <Link to="/app"><Button className="mt-6">Back to dashboard</Button></Link>
        </Card>
      </div>
    )
  }

  const rejected = status === 'rejected'

  const uploadFile = (key: 'doc' | 'selfie') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = key === 'doc' ? 'image/*,application/pdf' : 'image/*'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      if (key === 'doc') setDoc((d) => ({ ...d, fileName: file.name }))
      else {
        const reader = new FileReader()
        reader.onload = () => setSelfie(reader.result as string)
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const validateStep = () => {
    const e: Record<string, string> = {}
    if (step === 0) {
      if (!basic.dob) e.dob = 'Enter your date of birth.'
      if (!basic.stateOfOrigin) e.stateOfOrigin = 'Enter your state of origin.'
    }
    if (step === 1) {
      if (numbers.nin.length !== 11 && numbers.bvn.length !== 11) e.numbers = 'Enter a valid 11-digit NIN or BVN.'
    }
    if (step === 2 && !doc.fileName) e.doc = 'Upload a valid identity document.'
    if (step === 3 && !selfie) e.selfie = 'Capture your selfie to continue.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => {
    if (!validateStep()) return
    setStep((s) => Math.min(s + 1, 4))
  }

  const doSubmit = () => {
    setSubmitting(true)
    setTimeout(() => {
      submitKyc()
      setSubmitting(false)
      toast.success('KYC application submitted')
    }, 900)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Verify your identity</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Complete your KYC to unlock higher limits and full transfer access.
        </p>
      </div>

      {rejected && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
          <p className="font-semibold">Your previous application was rejected.</p>
          <p className="mt-0.5 text-red-700">Please re-submit with a clearer identity document and an up-to-date selfie.</p>
        </div>
      )}

      <Steps steps={steps} current={step} />

      <Card className="p-6">
        {/* STEP 0 */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <Label>Date of birth</Label>
              <Input type="date" value={basic.dob} onChange={(e) => setBasic({ ...basic, dob: e.target.value })} invalid={!!errors.dob} />
              <FieldError>{errors.dob}</FieldError>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Gender</Label>
                <Select value={basic.gender} onChange={(e) => setBasic({ ...basic, gender: e.target.value })}>
                  <option>Female</option>
                  <option>Male</option>
                </Select>
              </div>
              <div>
                <Label>State of origin</Label>
                <Input value={basic.stateOfOrigin} onChange={(e) => setBasic({ ...basic, stateOfOrigin: e.target.value })} placeholder="e.g. Kaduna" invalid={!!errors.stateOfOrigin} />
                <FieldError>{errors.stateOfOrigin}</FieldError>
              </div>
            </div>
            <div>
              <Label>Occupation (optional)</Label>
              <Input value={basic.occupation} onChange={(e) => setBasic({ ...basic, occupation: e.target.value })} placeholder="e.g. Civil servant" />
            </div>
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="rounded-xl bg-canvas px-4 py-3 text-[13px] text-ink-soft">
              We verify your identity with the national database. Enter either your NIN or BVN — never both on the same screen if you prefer.
            </p>
            <div>
              <Label>NIN</Label>
              <Input value={numbers.nin} onChange={(e) => setNumbers({ ...numbers, nin: e.target.value.replace(/\D/g, '').slice(0, 11) })} placeholder="11-digit NIN" inputMode="numeric" />
            </div>
            <div className="text-center text-xs text-ink-faint">OR</div>
            <div>
              <Label>BVN</Label>
              <Input value={numbers.bvn} onChange={(e) => setNumbers({ ...numbers, bvn: e.target.value.replace(/\D/g, '').slice(0, 11) })} placeholder="11-digit BVN" inputMode="numeric" />
            </div>
            <FieldError>{errors.numbers}</FieldError>
            <p className="flex items-center gap-1.5 text-[12px] text-ink-faint">
              <BadgeCheck className="h-4 w-4 text-brand" /> Demo only — no real lookup occurs.
            </p>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <Label>Identity document</Label>
            <Select value={doc.type} onChange={(e) => setDoc({ ...doc, type: e.target.value })}>
              <option>National ID</option>
              <option>International Passport</option>
              <option>Driver's Licence</option>
              <option>Voter's Card</option>
            </Select>
            <button
              onClick={() => uploadFile('doc')}
              className={cn(
                'flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 transition-colors',
                doc.fileName ? 'border-brand bg-brand-soft/30' : 'border-line hover:border-brand/40',
              )}
            >
              {doc.fileName ? (
                <>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white"><Check className="h-6 w-6" /></span>
                  <span className="text-sm font-semibold text-ink">{doc.fileName}</span>
                  <span className="text-xs text-brand">Tap to change document</span>
                </>
              ) : (
                <>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-ink-faint"><FileText className="h-6 w-6" /></span>
                  <span className="text-sm font-medium text-ink">Upload your {doc.type.toLowerCase()}</span>
                  <span className="text-xs text-ink-faint">JPG, PNG or PDF · max 5MB</span>
                </>
              )}
            </button>
            <FieldError>{errors.doc}</FieldError>
            <p className="text-[13px] text-ink-soft">Make sure all four corners of the document are visible and details are legible.</p>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <Label>Take a selfie</Label>
            <button
              onClick={() => uploadFile('selfie')}
              className={cn(
                'flex w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed transition-colors',
                selfie ? 'border-brand p-0' : 'border-line px-6 py-10 hover:border-brand/40',
              )}
            >
              {selfie ? (
                <>
                  <img src={selfie} alt="Selfie preview" className="h-52 w-full object-cover" />
                  <span className="w-full py-3 text-center text-xs text-brand">Tap to retake</span>
                </>
              ) : (
                <>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-ink-faint"><Camera className="h-6 w-6" /></span>
                  <span className="text-sm font-medium text-ink">Capture your selfie</span>
                  <span className="text-xs text-ink-faint">Look straight at the camera, in good lighting</span>
                </>
              )}
            </button>
            <FieldError>{errors.selfie}</FieldError>
          </div>
        )}

        {/* STEP 4 Review */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-[15px] font-semibold text-ink">Review your details</h3>
            <div className="flex items-center gap-4 rounded-2xl bg-canvas p-4">
              <Avatar firstName={user.firstName} lastName={user.lastName} size="lg" color={user.avatarColor} />
              <div>
                <p className="text-sm font-semibold text-ink">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-ink-soft">{user.email} · {user.phone}</p>
              </div>
            </div>
            <dl className="divide-y divide-line-soft/70 rounded-2xl border border-line px-5 text-sm">
              <Row k="Date of birth" v={basic.dob || '—'} />
              <Row k="Gender" v={basic.gender} />
              <Row k="State of origin" v={basic.stateOfOrigin || '—'} />
              <Row k="NIN / BVN" v={numbers.nin ? `NIN ••••${numbers.nin.slice(-4)}` : numbers.bvn ? `BVN ••••${numbers.bvn.slice(-4)}` : '—'} mono />
              <Row k="Identity document" v={`${doc.type}${doc.fileName ? ' · uploaded' : ''}`} />
              <Row k="Selfie" v={selfie ? 'Captured' : '—'} />
            </dl>
            <p className="flex items-start gap-2 rounded-xl bg-brand-soft/50 px-4 py-3 text-[13px] text-brand">
              <IdCard className="mt-0.5 h-4 w-4 shrink-0" />
              This is a prototype. Documents are never uploaded to a server.
            </p>
          </div>
        )}
      </Card>

      <div className="flex justify-between gap-3">
        <Button variant="secondary" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        {step < 4 ? (
          <Button onClick={next}>Continue <ArrowRight className="h-4 w-4" /></Button>
        ) : (
          <Button onClick={doSubmit} loading={submitting}>
            Submit application
          </Button>
        )}
      </div>
    </div>
  )
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-ink-soft">{k}</dt>
      <dd className={cn('font-medium text-ink', mono && 'font-mono text-xs')}>{v}</dd>
    </div>
  )
}

function VerifiedKyc({ userKycLevel, fullName, email, phone }: { userKycLevel: number; fullName: string; email: string; phone: string }) {
  return (
    <div className="mx-auto max-w-lg space-y-5 animate-fade-up">
      <div className="rounded-3xl bg-gradient-to-br from-brand via-brand-dark to-brand-deep p-8 text-center text-white brand-grid">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15">
          <BadgeCheck className="h-8 w-8 text-brand-green" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold">KYC Level {userKycLevel} — Verified</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-white/75">Your identity has been verified. You have full access to transfers and higher transaction limits.</p>
      </div>
      <Card className="p-6">
        <h3 className="text-[15px] font-semibold text-ink">Verification details</h3>
        <dl className="mt-3 divide-y divide-line-soft/70 text-sm">
          <Row k="Verified name" v={fullName} />
          <Row k="Email" v={email} />
          <Row k="Phone" v={phone} />
          <Row k="KYC tier" v={`Level ${userKycLevel}`} />
          <Row k="Documents" v="NIN · Passport · Selfie" />
          <Row k="Status" v="Verified" />
        </dl>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-line-soft bg-white p-5 shadow-card">
          <p className="text-[13px] text-ink-soft">Max single transfer</p>
          <p className="mt-1 text-lg font-bold tabular text-ink">₦5,000,000</p>
        </div>
        <div className="rounded-2xl border border-line-soft bg-white p-5 shadow-card">
          <p className="text-[13px] text-ink-soft">Daily limit</p>
          <p className="mt-1 text-lg font-bold tabular text-ink">₦10,000,000</p>
        </div>
      </div>
      <Link to="/app"><Button variant="secondary" className="w-full">Back to profile</Button></Link>
    </div>
  )
}
