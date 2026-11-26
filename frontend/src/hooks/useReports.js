import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getCategoryReport,
  getDailyReport,
  getMonthlyReport,
} from '../api/client.js'
import { daysBetweenInclusive } from '../lib/dates.js'
import { sumMoney } from '../lib/money.js'

const EMPTY_SUMMARY = {
  total: 0,
  averagePerDay: 0,
  activeDays: 0,
  topCategory: null,
  topCategoryShare: 0,
  days: 0,
}

export default function useReports(range, refreshKey) {
  const [reports, setReports] = useState(null)
  const [loading, setLoading] = useState(Boolean(range))
  const [error, setError] = useState('')
  const [retryKey, setRetryKey] = useState(0)
  const from = range?.from
  const to = range?.to

  useEffect(() => {
    if (!from || !to) {
      return undefined
    }

    const controller = new AbortController()

    async function loadReports() {
      setLoading(true)
      setError('')
      setReports(null)

      try {
        const [monthly, daily, categories] = await Promise.all([
          getMonthlyReport({ from, to }, { signal: controller.signal }),
          getDailyReport({ from, to }, { signal: controller.signal }),
          getCategoryReport({ from, to }, { signal: controller.signal }),
        ])

        if (!controller.signal.aborted) {
          setReports({
            monthly: monthly.rows,
            daily: daily.rows,
            categories: categories.rows,
          })
        }
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message || 'Could not load reports.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadReports()

    return () => controller.abort()
  }, [from, refreshKey, retryKey, to])

  const summary = useMemo(() => {
    if (!reports || !from || !to) {
      return EMPTY_SUMMARY
    }

    const total = sumMoney(reports.daily.map((row) => row.total))
    const days = daysBetweenInclusive(from, to)
    const activeDays = reports.daily.filter((row) => row.total > 0).length
    const topCategory = reports.categories[0] ?? null

    return {
      total,
      averagePerDay: days > 0 ? total / days : 0,
      activeDays,
      topCategory,
      topCategoryShare:
        topCategory && total > 0 ? topCategory.total / total : 0,
      days,
    }
  }, [from, reports, to])

  const displayableReports = range ? reports : null
  const displayableLoading = range ? loading : false
  const displayableError = range ? error : ''

  const retry = useCallback(() => {
    setRetryKey((current) => current + 1)
  }, [])

  return {
    reports: displayableReports,
    summary,
    loading: displayableLoading,
    error: displayableError,
    retry,
  }
}
