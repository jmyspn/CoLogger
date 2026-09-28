// Server-side validation.
//
// The React forms check the same rules first so people get instant feedback,
// but the browser can be bypassed (anyone can send a request with curl), so
// these checks are the ones that actually protect the database.
//
// Each function returns { errors, value }:
//   errors  { fieldName: 'message' }, empty when the input is valid
//   value   the cleaned-up input (trimmed strings, numbers, nulls)

export const CURRENCIES = ['PHP', 'USD', 'EUR', 'JPY', 'GBP']
export const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor']

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const IMAGE_PATTERN = /^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/]+=*$/
const MAX_MONEY = 9_999_999_999.99
// About 1.1 MB of image once decoded. The client resizes photos to well under
// this before uploading.
const MAX_IMAGE_LENGTH = 1_500_000

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function checkLength(errors, field, value, label, max, { required = false } = {}) {
  if (required && !value) errors[field] = `${label} is required.`
  else if (value.length > max) errors[field] = `${label} must be ${max} characters or fewer.`
}

// '' / null / undefined mean "not provided" and become null.
function money(errors, field, raw, label) {
  if (raw === '' || raw === null || raw === undefined) return null
  const number = typeof raw === 'number' ? raw : Number(String(raw).trim())
  if (!Number.isFinite(number)) errors[field] = `${label} must be a number.`
  else if (number < 0) errors[field] = `${label} cannot be negative.`
  else if (number > MAX_MONEY) errors[field] = `${label} is too large.`
  else if (Math.round(number * 100) / 100 !== number) {
    errors[field] = `${label} can have at most 2 decimal places.`
  }
  return number
}

export function isRealDate(value) {
  if (!DATE_PATTERN.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    year >= 1900
  )
}

export function validateRegistration(body) {
  const errors = {}
  const name = text(body.name)
  const email = text(body.email).toLowerCase()
  const password = typeof body.password === 'string' ? body.password : ''

  checkLength(errors, 'name', name, 'Name', 80, { required: true })
  if (!email) errors.email = 'Email is required.'
  else if (email.length > 254 || !EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address.'
  if (password.length < 8) errors.password = 'Password must be at least 8 characters.'
  // bcrypt only looks at the first 72 bytes, so longer passwords are refused
  // rather than silently truncated.
  else if (Buffer.byteLength(password) > 72) errors.password = 'Password must be 72 characters or fewer.'

  return { errors, value: { name, email, password } }
}

export function validateLogin(body) {
  const errors = {}
  const email = text(body.email).toLowerCase()
  const password = typeof body.password === 'string' ? body.password : ''
  if (!email) errors.email = 'Email is required.'
  if (!password) errors.password = 'Password is required.'
  return { errors, value: { email, password } }
}

export function validateCollection(body) {
  const errors = {}
  const name = text(body.name)
  const description = text(body.description)
  checkLength(errors, 'name', name, 'Collection name', 80, { required: true })
  checkLength(errors, 'description', description, 'Description', 500)
  return { errors, value: { name, description } }
}

export function validateItem(body) {
  const errors = {}
  const name = text(body.name)
  const acquiredFrom = text(body.acquiredFrom)
  const notes = text(body.notes)
  const currency = text(body.currency) || 'PHP'
  const condition = text(body.condition)
  const image = typeof body.image === 'string' ? body.image : ''
  const acquiredDate = text(body.acquiredDate) || null

  checkLength(errors, 'name', name, 'Item name', 120, { required: true })
  checkLength(errors, 'acquiredFrom', acquiredFrom, 'Acquired from', 120)
  checkLength(errors, 'notes', notes, 'Notes', 2000)

  const estimatedValue = money(errors, 'estimatedValue', body.estimatedValue, 'Estimated value')
  const purchasePrice = money(errors, 'purchasePrice', body.purchasePrice, 'Purchase price')

  if (!CURRENCIES.includes(currency)) errors.currency = 'Choose a currency from the list.'
  if (condition && !CONDITIONS.includes(condition)) errors.condition = 'Choose a condition from the list.'

  if (acquiredDate) {
    if (!isRealDate(acquiredDate)) {
      errors.acquiredDate = 'Enter a valid date.'
    } else {
      // Allow "today" in every time zone: compare against tomorrow in UTC.
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      if (acquiredDate > tomorrow) errors.acquiredDate = 'Acquired date cannot be in the future.'
    }
  }

  if (image && (image.length > MAX_IMAGE_LENGTH || !IMAGE_PATTERN.test(image))) {
    errors.image = image.length > MAX_IMAGE_LENGTH
      ? 'Image is too large. Choose a smaller image.'
      : 'Image must be a JPEG, PNG, WebP or GIF.'
  }

  if (body.isFavorite !== undefined && typeof body.isFavorite !== 'boolean') {
    errors.isFavorite = 'Favorite must be true or false.'
  }

  return {
    errors,
    value: {
      name,
      image,
      estimatedValue,
      currency,
      purchasePrice,
      acquiredDate,
      acquiredFrom,
      condition,
      notes,
      isFavorite: body.isFavorite === true,
    },
  }
}

// Route ids must be positive whole numbers. Anything else ("abc", "-1", "1.5")
// is treated as "not found" instead of reaching PostgreSQL and causing a 500.
export function parseId(raw) {
  return /^[1-9]\d{0,9}$/.test(String(raw)) && Number(raw) <= 2_147_483_647 ? Number(raw) : null
}

// A consistent 400 response: one summary message plus a message per field, so
// the client can show each error next to the input it belongs to.
export function sendValidationErrors(response, errors) {
  return response.status(400).json({
    error: 'Please fix the highlighted fields.',
    fields: errors,
  })
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0
}
