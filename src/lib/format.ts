const nairaFmt = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const compactFmt = new Intl.NumberFormat('en-NG', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

export function money(value: number, fractionDigits = 2): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

export function moneyShort(value: number): string {
  return compactFmt.format(value)
}

export function nairaSymbol(): string {
  return '\u20A6'
}

/** Signed money: prefixes + for credits, - for debits. */
export function signedMoney(value: number, direction?: 'credit' | 'debit'): string {
  const abs = money(Math.abs(value))
  if (direction === 'debit') return `-${abs}`
  if (direction === 'credit' && value >= 0) return `+${abs}`
  if (value >= 0) return `+${abs}`
  return `-${abs}`
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-NG').format(value)
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} \u00B7 ${formatTime(iso)}`
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`
  return formatDate(iso)
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 8) return phone
  const start = digits.slice(0, 4)
  const end = digits.slice(-2)
  return `+${start}*** ***${end}`
}

export function maskAccount(account: string): string {
  if (account.length <= 4) return account
  return `${account.slice(0, 3)}•••••${account.slice(-2)}`
}

export function maskEmail(email: string): string {
  const [name, domain] = email.split('@')
  if (!domain) return email
  return `${name.charAt(0)}${'*'.repeat(Math.max(name.length - 1, 1))}@${domain}`
}

let refCounter = 1000

export function generateReference(prefix = 'HPY'): string {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  refCounter += 1
  return `${prefix}-${yy}${mm}${dd}-${refCounter}${String(Math.floor(Math.random() * 900) + 100)}`
}

export function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
