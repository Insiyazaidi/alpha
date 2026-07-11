import { useSearchParams } from 'react-router-dom'
import { useCallback } from 'react'

/**
 * useURLState – bidirectional sync between UI state and URL search params
 * All filters, search, sort, and page are preserved in the URL.
 */
export function useURLState() {
  const [searchParams, setSearchParams] = useSearchParams()

  const getParam = useCallback((key, defaultValue = '') => {
    return searchParams.get(key) ?? defaultValue
  }, [searchParams])

  const getArrayParam = useCallback((key) => {
    return searchParams.getAll(key)
  }, [searchParams])

  const getNumberParam = useCallback((key, defaultValue = 0) => {
    const val = searchParams.get(key)
    return val !== null ? Number(val) : defaultValue
  }, [searchParams])

  const setParam = useCallback((key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value === '' || value === null || value === undefined) {
        next.delete(key)
      } else {
        next.set(key, value)
      }
      return next
    }, { replace: true })
  }, [setSearchParams])

  const setArrayParam = useCallback((key, values) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete(key)
      values.forEach((v) => next.append(key, v))
      return next
    }, { replace: true })
  }, [setSearchParams])

  const setMultipleParams = useCallback((updates) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      Object.entries(updates).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          next.delete(key)
          value.forEach((v) => next.append(key, v))
        } else if (value === '' || value === null || value === undefined) {
          next.delete(key)
        } else {
          next.set(key, value)
        }
      })
      return next
    }, { replace: true })
  }, [setSearchParams])

  return { getParam, getArrayParam, getNumberParam, setParam, setArrayParam, setMultipleParams, searchParams }
}
