import { LOCALE } from './constants.js'

const fullDateFormatter = new Intl.DateTimeFormat(LOCALE, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const monthDayFormatter = new Intl.DateTimeFormat(LOCALE, {
  month: 'short',
  day: 'numeric',
})

const shortDateFormatter = new Intl.DateTimeFormat(LOCALE, {
  month: 'short',
  day: 'numeric',
})

const longMonthFormatter = new Intl.DateTimeFormat(LOCALE, {
  month: 'long',
  year: 'numeric',
})

const shortMonthFormatter = new Intl.DateTimeFormat(LOCALE, {
  month: 'short',
  year: '2-digit',
})

function pad2(value) {
  return String(value).padStart(2, '0')
}

function getISODateParts(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) {
    return null
  }

  return { year, month, day }
}

export function isValidISODate(value) {
  const parts = getISODateParts(value)

  if (!parts) {
    return false
  }

  const date = new Date(parts.year, parts.month - 1, parts.day)

  return (
    date.getFullYear() === parts.year &&
    date.getMonth() === parts.month - 1 &&
    date.getDate() === parts.day
  )
}

export function todayISO() {
  const today = new Date()
  return `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(
    today.getDate(),
  )}`
}

export function monthStartISO(reference = new Date()) {
  return `${reference.getFullYear()}-${pad2(reference.getMonth() + 1)}-01`
}

export function yearStartISO(reference = new Date()) {
  return `${reference.getFullYear()}-01-01`
}

export function shiftDaysISO(value, dayCount) {
  const parts = getISODateParts(value)

  if (!parts) {
    return value
  }

  const date = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day + dayCount),
  )

  return date.toISOString().slice(0, 10)
}

export function daysBetweenInclusive(from, to) {
  if (!isValidISODate(from) || !isValidISODate(to) || from > to) {
    return 0
  }

  const fromParts = getISODateParts(from)
  const toParts = getISODateParts(to)
  const fromTime = Date.UTC(
    fromParts.year,
    fromParts.month - 1,
    fromParts.day,
  )
  const toTime = Date.UTC(toParts.year, toParts.month - 1, toParts.day)

  return Math.round((toTime - fromTime) / 86_400_000) + 1
}

function toLocalDate(value) {
  const parts = getISODateParts(value)

  if (!parts) {
    return null
  }

  return new Date(parts.year, parts.month - 1, parts.day)
}

export function formatDate(value) {
  const date = toLocalDate(value)
  return date ? fullDateFormatter.format(date) : value
}

export function formatShortDate(value) {
  const date = toLocalDate(value)
  return date ? shortDateFormatter.format(date) : value
}

export function formatFullDate(value) {
  const date = toLocalDate(value)
  return date ? fullDateFormatter.format(date) : value
}

export function formatMonth(value) {
  const parts = getISODateParts(`${value}-01`)

  if (!parts) {
    return value
  }

  return longMonthFormatter.format(new Date(parts.year, parts.month - 1, 1))
}

export function formatMonthShort(value) {
  const parts = getISODateParts(`${value}-01`)

  if (!parts) {
    return value
  }

  return shortMonthFormatter.format(new Date(parts.year, parts.month - 1, 1))
}

export function formatDateRange(from, to) {
  if (!isValidISODate(from) || !isValidISODate(to)) {
    return 'Select a date range'
  }

  if (from === to) {
    return formatDate(from)
  }

  const fromParts = getISODateParts(from)
  const toParts = getISODateParts(to)

  if (fromParts.year === toParts.year) {
    return `${monthDayFormatter.format(
      new Date(fromParts.year, fromParts.month - 1, fromParts.day),
    )} – ${monthDayFormatter.format(
      new Date(toParts.year, toParts.month - 1, toParts.day),
    )}, ${toParts.year}`
  }

  return `${formatDate(from)} – ${formatDate(to)}`
}

export function formatDayCount(count) {
  return `${count} ${count === 1 ? 'day' : 'days'}`
}
