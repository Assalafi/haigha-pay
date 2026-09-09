import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Headphones, LifeBuoy, Mail, MessageCircle, PhoneCall, Send, ShieldAlert, X } from 'lucide-react'
import { Button, Card, Input, PageHeader, Textarea } from '../../components/ui'
import { cn } from '../../lib/cn'
import { timeAgo } from '../../lib/format'
import { toast } from 'sonner'

const faqs = [
  ['How do I fund my wallet?', 'Go to Payments → Fund Wallet, choose an amount and a payment method, then confirm. Your wallet is credited instantly after the gateway confirms.'],
  ['What is the transfer fee?', 'Transfers within Haigha Pay are free. Bank transfers attract a small fee (from ₦25) which is shown clearly before you confirm.'],
  ['When will a pending payment complete?', 'Pending payments are usually confirmed within a few minutes. You can tap “Check status” on the payment page to refresh it.'],
  ['How do I increase my transaction limits?', 'Complete your KYC verification under Profile → KYC. Higher levels unlock higher daily and single-transfer limits.'],
  ['Is my transaction PIN ever stored?', 'No. Your PIN is verified securely and is never stored on your device or in this prototype.'],
  ['How do I report a suspicious transaction?', 'Open the transaction and tap “Report transaction”. Our team reviews every report within 24 hours.'],
]

type ChatMsg = { id: number; from: 'user' | 'bot'; text: string }

const botReplies: Record<string, string> = {
  refund: 'To check the status of a refund, please share the transaction reference here and our team will follow up. (Demo)',
  card: 'For card issues, please ensure your card supports online (Nigerian) payments. Most declined charges are caused by bank 3DS settings.',
  verify: 'Verification usually completes within 24 hours. You can check the status under Profile → KYC.',
  human: 'Our team typically responds within 2 minutes. A support agent will join shortly. (Demo)',
  default: 'Thanks for your message! For this demo, I can help with: refunds, card issues, or verification. Or tap “Talk to an agent”.',
}

export default function Support() {
  const [faqOpen, setFaqOpen] = useState<number | null>(0)
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: 1, from: 'bot', text: "Hi, I'm the Haigha Pay assistant. How can I help today?" },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [ticketSent, setTicketSent] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  const send = (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || typing) return
    setInput('')
    setMessages((m) => [...m, { id: Date.now(), from: 'user', text: msg }])
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      const lower = msg.toLowerCase()
      const reply = lower.includes('refund') || lower.includes('money back') || lower.includes('charge')
        ? botReplies.refund
        : lower.includes('card') || lower.includes('decline')
          ? botReplies.card
          : lower.includes('verif') || lower.includes('kyc')
            ? botReplies.verify
            : lower.includes('agent') || lower.includes('human')
              ? botReplies.human
              : botReplies.default
      setMessages((m) => [...m, { id: Date.now() + 1, from: 'bot', text: reply }])
      requestAnimationFrame(() => boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: 'smooth' }))
    }, 900)
    requestAnimationFrame(() => boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: 'smooth' }))
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader title="Help & Support" subtitle="We're here whenever you need us." />

      {/* Contact cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: Mail, title: 'Email us', sub: 'support@haighapay.ng', body: 'We reply within 24 hours.' },
          { icon: PhoneCall, title: 'Call us', sub: '+234 700 000 0000', body: 'Mon–Sat, 8am–8pm WAT' },
          { icon: MessageCircle, title: 'Live chat', sub: 'Online now', body: 'Average reply under 2 minutes.' },
        ].map((c) => (
          <Card key={c.title} className="p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand"><c.icon className="h-5 w-5" /></span>
            <h3 className="mt-3 text-sm font-semibold text-ink">{c.title}</h3>
            <p className="text-[13px] font-medium text-brand">{c.sub}</p>
            <p className="mt-1 text-xs text-ink-faint">{c.body}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* FAQs */}
        <Card className="p-5">
          <h3 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
            <LifeBuoy className="h-4 w-4 text-brand" /> Frequently asked questions
          </h3>
          <div className="mt-4 space-y-2">
            {faqs.map(([q, a], i) => (
              <div key={q} className="overflow-hidden rounded-xl border border-line-soft">
                <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
                  <span className="text-sm font-medium text-ink">{q}</span>
                  <ChevronDown className={cn('h-4 w-4 shrink-0 text-ink-faint transition-transform', faqOpen === i && 'rotate-180')} />
                </button>
                {faqOpen === i && <p className="border-t border-line-soft bg-canvas/50 px-4 py-3 text-[13px] leading-relaxed text-ink-soft">{a}</p>}
              </div>
            ))}
          </div>
        </Card>

        {/* Ticket form */}
        <Card className="p-5">
          <h3 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
            <Headphones className="h-4 w-4 text-brand" /> Send us a message
          </h3>
          {!ticketSent ? (
            <form
              className="mt-4 space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                setTicketSent(true)
                toast.success('Message sent')
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="mb-1.5 block text-[13px] font-medium">Your name</label><Input required placeholder="Ibrahim Ali" /></div>
                <div><label className="mb-1.5 block text-[13px] font-medium">Email</label><Input type="email" required placeholder="you@email.com" /></div>
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium">Topic</label>
                <select className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10">
                  <option>Transfer issue</option>
                  <option>Card payment failed</option>
                  <option>Refund / reconciliation</option>
                  <option>KYC & verification</option>
                  <option>Report a transaction</option>
                  <option>Something else</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium">How can we help?</label>
                <Textarea required placeholder="Tell us what happened…" />
              </div>
              <Button type="submit" className="w-full">Send message</Button>
            </form>
          ) : (
            <div className="py-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                <ShieldAlert className="h-7 w-7 text-status-success" />
              </div>
              <h4 className="mt-4 text-lg font-bold text-ink">Message sent</h4>
              <p className="mx-auto mt-1 max-w-xs text-sm text-ink-soft">Our team will reply to your email within 24 hours. Reference <span className="font-mono">SPT-{Date.now().toString().slice(-6)}</span></p>
              <Button variant="secondary" className="mt-5" onClick={() => setTicketSent(false)}>Send another message</Button>
            </div>
          )}
        </Card>
      </div>

      <p className="text-[13px] text-ink-soft">
        Something wrong with a transaction? <Link to="/app/transactions" className="font-medium text-brand hover:underline">Open it and tap “Report transaction”</Link> for a faster investigation.
      </p>

      {/* Chat launcher */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-brand/30 transition-transform hover:scale-105 md:bottom-8 md:right-8"
        aria-label="Open live chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {chatOpen && (
        <div className="fixed bottom-0 right-0 z-50 flex h-[85vh] w-full flex-col overflow-hidden bg-white shadow-pop sm:bottom-6 sm:right-6 sm:h-[560px] sm:w-[380px] sm:rounded-3xl sm:border sm:border-line animate-scale-in">
          <div className="flex items-center gap-3 bg-brand px-5 py-4 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15"><Headphones className="h-5 w-5" /></span>
            <div className="flex-1">
              <p className="text-sm font-bold">Haigha Pay Support</p>
              <p className="flex items-center gap-1.5 text-[11px] text-white/75"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Online · replies instantly</p>
            </div>
            <button onClick={() => setChatOpen(false)} className="rounded-lg p-1.5 hover:bg-white/10" aria-label="Close chat"><X className="h-5 w-5" /></button>
          </div>
          <div ref={boxRef} className="flex-1 space-y-3 overflow-y-auto bg-canvas/50 px-4 py-4">
            {messages.map((m) => (
              <div key={m.id} className={cn('max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed', m.from === 'user' ? 'ml-auto rounded-br-md bg-brand text-white' : 'rounded-bl-md border border-line-soft bg-white text-ink shadow-sm')}>
                {m.text}
              </div>
            ))}
            {typing && (
              <div className="flex w-16 items-center justify-center gap-1 rounded-2xl rounded-bl-md border border-line-soft bg-white px-3 py-2.5 shadow-sm">
                {[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint" style={{ animationDelay: `${i * 120}ms` }} />)}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 border-t border-line-soft bg-white p-3">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message…" onKeyDown={(e) => e.key === 'Enter' && send()} className="h-10" />
            <button onClick={() => send()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white transition-colors hover:bg-brand-dark" aria-label="Send">
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="flex justify-center gap-2 bg-canvas/50 px-3 pb-2.5">
            {[
              { label: 'Refund status', key: 'refund' },
              { label: 'Card issue', key: 'card' },
              { label: 'Verification', key: 'verify' },
              { label: 'Talk to agent', key: 'human' },
            ].map((c) => (
              <button key={c.key} onClick={() => send(botReplies[c.key as keyof typeof botReplies] ? `I need help with ${c.label.toLowerCase()}` : '')} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-ink-soft shadow-sm transition-colors hover:text-brand">
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
