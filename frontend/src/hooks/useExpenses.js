import { useCallback, useEffect, useState } from 'react'
import { listExpenses } from '../api/client.js'

export default function useExpenses({
  page,
  pageSize,
  refreshKey,
  search,
  category,
  from,
  to,
}) {
  const [rows, setRows] = useState(null)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadExpenses() {
      setLoading(true)
      setError('')
      setRows(null)

      try {
        const data = await listExpenses(
          {
            limit: pageSize,
            offset: page * pageSize,
            from,
            to,
            category,
            search,
          },
          { signal: controller.signal },
        )

        if (!controller.signal.aborted) {
          setRows(data.rows)
          setTotal(data.total)
        }
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message || 'Could not load expenses.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadExpenses()

    return () => controller.abort()
  }, [page, pageSize, refreshKey, retryKey, search, category, from, to])

  const retry = useCallback(() => {
    setRetryKey((current) => current + 1)
  }, [])

  return {
    rows: rows ?? [],
    total,
    loading,
    error,
    retry,
  }
}
