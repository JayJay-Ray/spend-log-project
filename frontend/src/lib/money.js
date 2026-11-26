import { CURRENCY, LOCALE } from './constants.js'

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const compactCurrencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  notation: 'compact',
  maximumFractionDigits: 1,
})

const numberFormatter = new Intl.NumberFormat(LOCALE, {
  maximumFractionDigits: 0,
})

const percentFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'percent',
  maximumFractionDigits: 1,
})

function numericValue(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

export function formatCurrency(value) {
  return currencyFormatter.format(numericValue(value))
}

export function formatCompactCurrency(value) {
  return compactCurrencyFormatter.format(numericValue(value))
}

export function formatCount(value) {
  return numberFormatter.format(numericValue(value))
}

export function formatPercent(value) {
  return percentFormatter.format(numericValue(value))
}

export function sumMoney(values) {
  const totalCents = values.reduce(
    (sum, value) => sum + Math.round(numericValue(value) * 100),
    0,
  )

  return totalCents / 100
}

export function toMoneyCents(value) {
  return Math.round(numericValue(value) * 100)
}

export const CURRENCY_SYMBOL =
  currencyFormatter
    .formatToParts(0)
    .find((part) => part.type === 'currency')?.value ?? CURRENCY
