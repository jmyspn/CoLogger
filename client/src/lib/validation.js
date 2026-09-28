// Form validation in the browser, for instant feedback.
//
// These mirror the rules in server/validation.js. The server repeats every
// check because a browser can be bypassed; this copy exists so people see
// problems before pressing Save. Demo mode (mockApi.js) also uses it to reject
// bad input the same way the real API would.
//
// Every function returns { fieldName: 'message' }; an empty object means valid.

export const CURRENCIES = ['PHP', 'USD', 'EUR', 'JPY', 'GBP']
export const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor']

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_MONEY = 9_999_999_999.99

export function hasErrors(errors) {
  return Object.keys(errors).length > 0
}

function trimmed(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export function todayIso() {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

export function isRealDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    year >= 1900
  )
}

function checkMoney(errors, field, raw, label) {
  if (raw === '' || raw === null || raw === undefined) return
  const number = Number(raw)
  if (!Number.isFinite(number)) errors[field] = `${label} must be a number.`
  else if (number < 0) errors[field] = `${label} cannot be negative.`
  else if (number > MAX_MONEY) errors[field] = `${label} is too large.`
  else if (Math.round(number * 100) / 100 !== number) {
    errors[field] = `${label} can have at most 2 decimal places.`
  }
}

export function validateItem(values) {
  const errors = {}
  const name = trimmed(values.name)

  if (!name) errors.name = 'Item name is required.'
  else if (name.length > 120) errors.name = 'Item name must be 120 characters or fewer.'

  checkMoney(errors, 'estimatedValue', values.estimatedValue, 'Estimated value')
  checkMoney(errors, 'purchasePrice', values.purchasePrice, 'Purchase price')

  if (!CURRENCIES.includes(values.currency)) errors.currency = 'Choose a currency from the list.'
  if (values.condition && !CONDITIONS.includes(values.condition)) {
    errors.condition = 'Choose a condition from the list.'
  }

  if (values.acquiredDate) {
    if (!isRealDate(values.acquiredDate)) errors.acquiredDate = 'Enter a valid date.'
    else if (values.acquiredDate > todayIso()) {
      errors.acquiredDate = 'Acquired date cannot be in the future.'
    }
  }

  if (trimmed(values.acquiredFrom).length > 120) {
    errors.acquiredFrom = 'Acquired from must be 120 characters or fewer.'
  }
  if (trimmed(values.notes).length > 2000) errors.notes = 'Notes must be 2000 characters or fewer.'

  return errors
}

export function validateCollection(values) {
  const errors = {}
  const name = trimmed(values.name)
  if (!name) errors.name = 'Collection name is required.'
  else if (name.length > 80) errors.name = 'Collection name must be 80 characters or fewer.'
  if (trimmed(values.description).length > 500) {
    errors.description = 'Description must be 500 characters or fewer.'
  }
  return errors
}

export function validateRegistration(values) {
  const errors = {}
  const name = trimmed(values.name)
  const email = trimmed(values.email)

  if (!name) errors.name = 'Name is required.'
  else if (name.length > 80) errors.name = 'Name must be 80 characters or fewer.'

  if (!email) errors.email = 'Email is required.'
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address.'

  if ((values.password || '').length < 8) errors.password = 'Password must be at least 8 characters.'
  else if (values.password.length > 72) errors.password = 'Password must be 72 characters or fewer.'

  if (values.confirmPassword !== undefined && values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.'
  }
  return errors
}

export function validateLogin(values) {
  const errors = {}
  if (!trimmed(values.email)) errors.email = 'Email is required.'
  if (!values.password) errors.password = 'Password is required.'
  return errors
}
