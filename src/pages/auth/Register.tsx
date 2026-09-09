import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Phone } from 'lucide-react'
import { AuthShell, BrandPanelMessage } from '../../components/common/AuthShell'
import { Button, FieldError, Input, Label } from '../../components/ui'

export default function Register() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
    terms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)
  const navigate = useNavigate()

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (form.firstName.trim().length < 2) errs.firstName = 'Enter your first name.'
    if (form.lastName.trim().length < 2) errs.lastName = 'Enter your last name.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email address.'
    if (form.phone.replace(/\D/g, '').length < 10) errs.phone = 'Enter a valid Nigerian phone number.'
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.'
    if (form.confirm !== form.password) errs.confirm = 'Passwords do not match.'
    if (!form.terms) errs.terms = 'You must accept the Terms of Service.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setLoading(true)
    setTimeout(() => {
      navigate('/verify-otp', {
        state: { firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone },
      })
    }, 700)
  }

  return (
    <AuthShell side={<BrandPanelMessage />}>
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">Create your account</h1>
      <p className="mt-2 text-ink-soft">Start sending money and paying bills in minutes.</p>

      <form onSubmit={submit} className="mt-7 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>First name</Label>
            <Input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="Ibrahim" invalid={!!errors.firstName} />
            <FieldError>{errors.firstName}</FieldError>
          </div>
          <div>
            <Label>Last name</Label>
            <Input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="Ali" invalid={!!errors.lastName} />
            <FieldError>{errors.lastName}</FieldError>
          </div>
        </div>
        <div>
          <Label>Email address</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@email.com" className="pl-10" invalid={!!errors.email} />
          </div>
          <FieldError>{errors.email}</FieldError>
        </div>
        <div>
          <Label>Phone number</Label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="803 456 7890" className="pl-10" invalid={!!errors.phone} />
          </div>
          <FieldError>{errors.phone}</FieldError>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Password</Label>
            <div className="relative">
              <Input type={show ? 'text' : 'password'} value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="Min. 8 characters" invalid={!!errors.password} className="pr-10" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <FieldError>{errors.password}</FieldError>
          </div>
          <div>
            <Label>Confirm password</Label>
            <Input type={show ? 'text' : 'password'} value={form.confirm} onChange={(e) => set('confirm', e.target.value)} placeholder="Repeat password" invalid={!!errors.confirm} />
            <FieldError>{errors.confirm}</FieldError>
          </div>
        </div>
        <div>
          <label className="flex items-start gap-2.5 text-[13px] text-ink-soft">
            <input type="checkbox" checked={form.terms} onChange={(e) => set('terms', e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-line accent-brand" />
            <span>
              I agree to the <span className="font-medium text-brand">Terms of Service</span> and{' '}
              <span className="font-medium text-brand">Privacy Policy</span>.
            </span>
          </label>
          <FieldError>{errors.terms}</FieldError>
        </div>
        <Button type="submit" loading={loading} size="lg" className="w-full">
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  )
}
