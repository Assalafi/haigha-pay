import { useEffect, useState } from 'react'

export function useFakeLoading(ms = 600): boolean {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms)
    return () => clearTimeout(t)
  }, [ms])
  return loading
}

export function useCountdown(initial: number): [number, () => void] {
  const [count, setCount] = useState(initial)
  const [resetKey, setResetKey] = useState(0)
  useEffect(() => {
    if (count <= 0) return
    const t = setTimeout(() => setCount((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [count, resetKey])
  const restart = () => {
    setCount(initial)
    setResetKey((k) => k + 1)
  }
  return [count, restart]
}
