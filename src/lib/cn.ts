export type ClassValue = string | number | null | undefined | false | Record<string, unknown>

export function cn(...values: ClassValue[]): string {
  const out: string[] = []
  for (const v of values) {
    if (!v) continue
    if (typeof v === 'string') {
      out.push(v)
    } else if (typeof v === 'number') {
      out.push(String(v))
    } else {
      for (const [k, val] of Object.entries(v)) {
        if (val) out.push(k)
      }
    }
  }
  return out.join(' ')
}
