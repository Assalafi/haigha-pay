import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { AuthShell } from '../../components/common/AuthShell'
import { Button, FieldError } from '../../components/ui'
import { maskPhone } from '../../lib/format'
import { useAppStore } from '../../store/appStore'
import { toast } from 'sonner'

const DEMO_OTP = '123456'

export default function VerifyOtp() {
  const location = useLocation()
  const navigate = useNavigate()
  const registerUser = useAppStore((s) => s.registerUser)

  const draft = (location.state as { firstName?: string; lastName?: string; email?: string; phone?: string } | null) ?? {}
  const phoneToShow = draft.phone ? maskPhone(`+234${draft.phone.replace(/\D/g, '')}`) : '+23480*** ***54'

  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendIn, setResendIn] = useState(30)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (resendIn <= 0) return
    const t = setTimeout(() => setResendIn(resendIn - 1), 1000)
    return () => clearTimeout(t)
  }, [resendIn])

  useEffect(() => inputs.current[0]?.focus(), [])

  const value = useMemo(() => digits.join(''), [digits])

  const handleDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, '')
    if (!d) {
      setDigits((arr) => arr.map((x, j) => (j === i ? '' : x)))
      inputs.current[Math.max(0, i - 1)]?.focus()
      return
    }
    const digit = d.slice(-1)
    const next = digits.map((x, j) => (j === i ? digit : x))
    setDigits(next)
    if (i < 5) inputs.current[i + 1]?.focus()
    else inputs.current[i]?.blur()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      e.preventDefault()
      setDigits(text.split(''))
      inputs.current[5]?.focus()
    }
  }

  const resend = () => {
    setResendIn(30)
    toast.info('A fresh verification code has been sent (demo).')
  }

  const verify = () => {
    setError('')
    if (value.length !== 6) {
      setError('Enter the 6-digit code sent to your phone.')
      return
    }
    if (value !== DEMO_OTP) {
      setError('That code is incorrect. Please try again.')
      setDigits(Array(6).fill(''))
      inputs.current[0]?.focus()
      return
    }
    setLoading(true)
    setTimeout(() => {
      if (draft.firstName && draft.email && draft.phone) {
        registerUser(draft.firstName, draft.lastName ?? '', draft.email, draft.phone)
        toast.success('Account verified — welcome to Haigha Pay!')
        navigate('/app')
      } else {
        toast.success('Phone number verified')
        navigate('/app')
      }
    }, 900)
  }

  return (
    <AuthShell>
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft">
        <ShieldCheck className="h-7 w-7 text-brand" />
      </div>
      <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-ink">Verify your phone number</h1>
      <p className="mt-2 text-[15px] text-ink-soft">
        We sent a 6-digit code to <span className="font-semibold text-ink">{phoneToShow}</span>
      </p>

      <div className="mt-8 space-y-6">
        <div className="flex justify-between gap-2" onPaste={handlePaste} aria-label="OTP input">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el
              }}
              value={d}
              onChange={(e) => handleDigit(i, e.target.value)}
              onKeyDown={(e) => e.key === 'Backspace' && !d && i > 0 && inputs.current[i - 1]?.focus()}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={2}
              aria-label={`Digit ${i + 1}`}
              className="h-14 w-full max-w-[52px] rounded-xl border border-line bg-white text-center text-2xl font-bold tabular text-ink outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/15"
            />
          ))}
        </div>
        <FieldError>{error}</FieldError>

        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-soft">
            Didn't get it?{' '}
            <button
              disabled={resendIn > 0}
              onClick={resend}
              className="font-semibold text-brand hover:underline disabled:cursor-not-allowed disabled:text-ink-faint"
            >
              {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
            </button>
          </span>
          <span className="rounded-lg bg-brand-soft px-2 py-1 font-mono text-xs text-brand">Demo code: 123456</span>
        </div>

        <Button onClick={verify} loading={loading} size="lg" className="w-full">
          Verify & Continue
        </Button>
      </div>
      <p className="mt-6 text-center text-[13px] text-ink-soft">
        <Link to="/login" className="font-medium text-brand hover:underline">
          Use a different account
        </Link>
      </p>
    </AuthShell>
  )
}
