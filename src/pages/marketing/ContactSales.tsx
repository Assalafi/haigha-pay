import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Headphones, Mail, MapPin, PhoneCall } from 'lucide-react'
import { Logo } from '../../components/common/Logo'
import { Button } from '../../components/ui'
import { toast } from 'sonner'

export default function ContactSales() {
  const [form, setForm] = useState({ name: '', org: '', email: '', message: '' })
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-line">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5">
          <Link to="/"><Logo size={40} /></Link>
          <Link to="/register" className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark">Create Account</Link>
        </div>
      </header>
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3.5 py-1.5 text-[13px] font-medium text-brand">
            <Headphones className="h-4 w-4" /> We reply within one business day
          </span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight">Talk to the Haigha Pay team</h1>
          <p className="mt-3 text-lg text-ink-soft">Questions about the prototype, integration roadmap or a pilot for your organisation? We'd love to hear from you.</p>
          <ul className="mt-8 space-y-4">
            {[
              { icon: Mail, text: 'support@haighapay.ng', sub: 'General support' },
              { icon: PhoneCall, text: '+234 700 000 0000', sub: 'Mon–Sat, 8am–8pm WAT' },
              { icon: MapPin, text: 'Kaduna, Nigeria', sub: 'Haigha head office' },
            ].map((c) => (
              <li key={c.sub} className="flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand"><c.icon className="h-5 w-5" /></span>
                <div>
                  <p className="font-semibold text-ink">{c.text}</p>
                  <p className="text-sm text-ink-soft">{c.sub}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-8 rounded-2xl border border-brand/15 bg-brand-soft/40 p-5">
            <p className="text-sm font-semibold text-ink">What happens next?</p>
            <ul className="mt-2 space-y-2 text-sm text-ink-soft">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-brand" /> Our team reviews your request</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-brand" /> We schedule a 30-minute walkthrough</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-brand" /> You get a tailored integration plan</li>
            </ul>
          </div>
        </div>
        <div className="rounded-3xl border border-line-soft bg-canvas/50 p-6 sm:p-8">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              toast.success('Message sent', { description: 'Our team will get back to you within one business day.' })
              setForm({ name: '', org: '', email: '', message: '' })
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="mb-1.5 block text-[13px] font-medium">Full name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11 w-full rounded-xl border border-line px-3.5 outline-none focus:border-brand focus:ring-4 focus:ring-brand/10" /></div>
              <div><label className="mb-1.5 block text-[13px] font-medium">Organisation</label><input value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} className="h-11 w-full rounded-xl border border-line px-3.5 outline-none focus:border-brand focus:ring-4 focus:ring-brand/10" /></div>
            </div>
            <div><label className="mb-1.5 block text-[13px] font-medium">Work email</label><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-11 w-full rounded-xl border border-line px-3.5 outline-none focus:border-brand focus:ring-4 focus:ring-brand/10" /></div>
            <div><label className="mb-1.5 block text-[13px] font-medium">How can we help?</label><textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="min-h-[120px] w-full rounded-xl border border-line px-3.5 py-2.5 outline-none focus:border-brand focus:ring-4 focus:ring-brand/10" /></div>
            <Button type="submit" size="lg" className="w-full" icon={<ArrowRight className="h-4 w-4" />}>Send message</Button>
          </form>
        </div>
      </section>
      <footer className="border-t border-line py-6 text-center text-[13px] text-ink-faint">
        © 2026 Haigha Pay · Prototype
      </footer>
    </div>
  )
}
