import { useState, useEffect } from 'react'

/**
 * useDebounce – delays updating the value until after `delay` ms
 * Performance optimization: prevents API calls on every keystroke
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
