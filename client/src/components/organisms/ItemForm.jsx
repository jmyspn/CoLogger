import { useState } from 'react'
import Input from '../atoms/Input.jsx'
import Button from '../atoms/Button.jsx'
import FavoriteButton from '../atoms/FavoriteButton.jsx'
import ImageUploader from '../molecules/ImageUploader.jsx'
import FormField from '../molecules/FormField.jsx'
import StatusMessage from '../molecules/StatusMessage.jsx'
import { CONDITIONS, CURRENCIES, hasErrors, todayIso, validateItem } from '../../lib/validation.js'

// The one form used by BOTH Add Item and Edit Item.
//
//   initialValues  the item being edited (from the API), or omitted for a new item
//   onSubmit       async (payload) => { ... }  saves through the API; the page
//                  decides where to go afterwards
//   onCancel       leave without saving
//
// The form keeps its own draft of the values while you type. Nothing is saved
// until Submit, and the saved result comes back from the API, which remains
// the single source of truth.

const EMPTY_VALUES = {
  name: '',
  image: '',
  estimatedValue: '',
  currency: 'PHP',
  purchasePrice: '',
  acquiredDate: '',
  acquiredFrom: '',
  condition: '',
  notes: '',
  isFavorite: false,
}

// Field name → input id, in the order the fields appear, so the first field
// with an error can be focused.
const FIELD_IDS = {
  name: 'item-name',
  image: 'item-image',
  estimatedValue: 'item-estimated-value',
  currency: 'item-currency',
  purchasePrice: 'item-purchase-price',
  acquiredDate: 'item-acquired-date',
  acquiredFrom: 'item-acquired-from',
  condition: 'item-condition',
  notes: 'item-notes',
}

// API item → form values. Inputs want strings, so null numbers become ''.
function toFormValues(item) {
  if (!item) return EMPTY_VALUES
  return {
    name: item.name ?? '',
    image: item.image ?? '',
    estimatedValue: item.estimatedValue ?? '',
    currency: item.currency || 'PHP',
    purchasePrice: item.purchasePrice ?? '',
    acquiredDate: item.acquiredDate ?? '',
    acquiredFrom: item.acquiredFrom ?? '',
    condition: item.condition ?? '',
    notes: item.notes ?? '',
    isFavorite: Boolean(item.isFavorite),
  }
}

// Form values → what the API expects: trimmed text, numbers or null.
function toPayload(values) {
  const money = (value) => (value === '' || value === null ? null : Number(value))
  return {
    name: values.name.trim(),
    image: values.image,
    estimatedValue: money(values.estimatedValue),
    currency: values.currency,
    purchasePrice: money(values.purchasePrice),
    acquiredDate: values.acquiredDate || null,
    acquiredFrom: values.acquiredFrom.trim(),
    condition: values.condition,
    notes: values.notes.trim(),
    isFavorite: values.isFavorite,
  }
}

function focusFirstError(errors) {
  const first = Object.keys(FIELD_IDS).find((field) => errors[field])
  if (first) document.getElementById(FIELD_IDS[first])?.focus()
}

export default function ItemForm({ initialValues, onSubmit, onCancel, submitLabel = 'Save Item' }) {
  const [values, setValues] = useState(() => toFormValues(initialValues))
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  function updateField(field, value) {
    setValues((current) => ({ ...current, [field]: value }))
    // Clear a field's error as soon as the user changes it.
    if (errors[field]) setErrors(({ [field]: _removed, ...rest }) => rest)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')

    const found = validateItem(values)
    setErrors(found)
    if (hasErrors(found)) {
      focusFirstError(found)
      return
    }

    setSaving(true)
    try {
      await onSubmit(toPayload(values))
      // On success the page navigates away, so there is nothing to reset.
    } catch (error) {
      const serverErrors = error.fields || {}
      setErrors(serverErrors)
      setFormError(error.message || 'Saving failed. Please try again.')
      focusFirstError(serverErrors)
      setSaving(false)
    }
  }

  const describedBy = (field) => (errors[field] ? `${FIELD_IDS[field]}-error` : undefined)
  const handle = (field) => (event) => updateField(field, event.target.value)

  return (
    <form className="item-form card" onSubmit={handleSubmit} noValidate>
      {formError && (
        <StatusMessage variant="error" title="The item was not saved">
          {formError}
        </StatusMessage>
      )}

      <p className="field-hint form-legend">
        Fields marked <span aria-hidden="true">*</span>
        <span className="visually-hidden">with an asterisk</span> are required.
      </p>

      <div className="form-grid">
        <div className="form-column">
          <Input
            id={FIELD_IDS.name}
            label="Item Name"
            value={values.name}
            onChange={handle('name')}
            error={errors.name}
            maxLength={120}
            autoComplete="off"
            required
          />

          <ImageUploader
            id={FIELD_IDS.image}
            image={values.image}
            itemName={values.name}
            onChange={(dataUrl) => updateField('image', dataUrl)}
            error={errors.image}
          />
        </div>

        <div className="form-column">
          <div className="form-row">
            <Input
              id={FIELD_IDS.estimatedValue}
              label="Estimated Value"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={values.estimatedValue}
              onChange={handle('estimatedValue')}
              error={errors.estimatedValue}
            />

            <FormField label="Currency" htmlFor={FIELD_IDS.currency} error={errors.currency}>
              <select
                id={FIELD_IDS.currency}
                value={values.currency}
                onChange={handle('currency')}
                aria-describedby={describedBy('currency')}
              >
                {CURRENCIES.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <Input
            id={FIELD_IDS.purchasePrice}
            label="Purchase Price"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={values.purchasePrice}
            onChange={handle('purchasePrice')}
            error={errors.purchasePrice}
            hint="In the same currency as the estimated value."
          />

          <div className="form-row">
            <Input
              id={FIELD_IDS.acquiredDate}
              label="Acquired Date"
              type="date"
              max={todayIso()}
              value={values.acquiredDate}
              onChange={handle('acquiredDate')}
              error={errors.acquiredDate}
            />

            <FormField label="Condition" htmlFor={FIELD_IDS.condition} error={errors.condition}>
              <select
                id={FIELD_IDS.condition}
                value={values.condition}
                onChange={handle('condition')}
                aria-describedby={describedBy('condition')}
              >
                <option value="">Select condition</option>
                {CONDITIONS.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <Input
            id={FIELD_IDS.acquiredFrom}
            label="Acquired From"
            value={values.acquiredFrom}
            onChange={handle('acquiredFrom')}
            error={errors.acquiredFrom}
            maxLength={120}
            placeholder="Store, seller or person"
          />

          <FormField label="Notes" htmlFor={FIELD_IDS.notes} error={errors.notes}>
            <textarea
              id={FIELD_IDS.notes}
              rows={4}
              maxLength={2000}
              value={values.notes}
              onChange={handle('notes')}
              aria-describedby={describedBy('notes')}
            />
          </FormField>

          <div className="favorite-field">
            <FavoriteButton
              isFavorite={values.isFavorite}
              itemName={values.name || 'this item'}
              onToggle={() => updateField('isFavorite', !values.isFavorite)}
            />
            <span aria-hidden="true">{values.isFavorite ? 'Marked as favorite' : 'Mark as favorite'}</span>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
