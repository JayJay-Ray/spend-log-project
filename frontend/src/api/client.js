const configuredBaseUrl =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export const API_BASE_URL = configuredBaseUrl.replace(/\/+$/, '')

export class ApiError extends Error {
  constructor(message, status = 0, details = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = Array.isArray(details) ? details : []
  }
}

function buildQuery(path, params = {}) {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  }

  const query = searchParams.toString()
  return query ? `${path}?${query}` : path
}

async function request(path, { method = 'GET', body, signal } = {}) {
  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error
    }

    throw new ApiError(
      'Could not reach the server. Check that the API is running.',
    )
  }

  if (response.status === 204) {
    return null
  }

  const text = await response.text()
  let payload = null

  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = null
    }
  }

  if (!response.ok) {
    throw new ApiError(
      payload?.error || `Request failed with status ${response.status}.`,
      response.status,
      payload?.details,
    )
  }

  return payload
}

export function listExpenses(params = {}, { signal } = {}) {
  return request(
    buildQuery('/api/expenses', {
      limit: params.limit,
      offset: params.offset,
      from: params.from,
      to: params.to,
      category: params.category,
      search: params.search,
    }),
    { signal },
  )
}

export function createExpense(expense) {
  return request('/api/expenses', {
    method: 'POST',
    body: expense,
  })
}

export function updateExpense(id, updates) {
  return request(`/api/expenses/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: updates,
  })
}

export function deleteExpense(id) {
  return request(`/api/expenses/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

function getReport(reportPath, { from, to }, { signal } = {}) {
  return request(buildQuery(`/api/reports/${reportPath}`, { from, to }), {
    signal,
  })
}

export function getMonthlyReport(range, options) {
  return getReport('monthly', range, options)
}

export function getDailyReport(range, options) {
  return getReport('daily', range, options)
}

export function getCategoryReport(range, options) {
  return getReport('categories', range, options)
}
