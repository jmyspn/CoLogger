import { useEffect, useRef, useState } from 'react'
import Input from '../atoms/Input.jsx'
import Button from '../atoms/Button.jsx'
import FormField from '../molecules/FormField.jsx'
import StatusMessage from '../molecules/StatusMessage.jsx'
import { hasErrors, validateCollection } from '../../lib/validation.js'

// Create or rename a collection, in a modal dialog.
//
// It uses the browser's own <dialog> element with showModal(), which traps
// keyboard focus inside the dialog, closes on Escape, and returns focus to the
// button that opened it. Render it only while it should be open:
//
//   {creating && <CollectionForm title="New Collection" onSubmit={...} onClose={...} />}

export default function CollectionForm({
  title,
  initialValues,
  submitLabel = 'Save',
  onSubmit,
  onClose,
}) {
  const dialogRef = useRef(null)
  const [values, setValues] = useState({
    name: initialValues?.name ?? '',
    description: initialValues?.description ?? '',
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
    return () => {
      if (dialog?.open) dialog.close()
    }
  }, [])

  function update(field) {
    return (event) => {
      setValues((current) => ({ ...current, [field]: event.target.value }))
      if (errors[field]) setErrors(({ [field]: _removed, ...rest }) => rest)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')
    const found = validateCollection(values)
    setErrors(found)
    if (hasErrors(found)) {
      document.getElementById(found.name ? 'collection-name' : 'collection-description')?.focus()
      return
    }

    setSaving(true)
    try {
      await onSubmit({ name: values.name.trim(), description: values.description.trim() })
    } catch (error) {
      setErrors(error.fields || {})
      setFormError(error.fields && hasErrors(error.fields) ? '' : error.message)
      setSaving(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby="collection-form-title"
      onCancel={(event) => {
        // Escape key: let React decide, so the dialog is removed cleanly.
        event.preventDefault()
        if (!saving) onClose()
      }}
    >
      <form onSubmit={handleSubmit} noValidate>
        <h2 id="collection-form-title">{title}</h2>

        {formError && <StatusMessage variant="error">{formError}</StatusMessage>}

        <Input
          id="collection-name"
          label="Collection Name"
          value={values.name}
          onChange={update('name')}
          error={errors.name}
          maxLength={80}
          placeholder="e.g. Watches"
          autoComplete="off"
          autoFocus
          required
        />

        <FormField label="Description" htmlFor="collection-description" error={errors.description} hint="Optional.">
          <textarea
            id="collection-description"
            rows={3}
            maxLength={500}
            value={values.description}
            onChange={update('description')}
            aria-describedby={errors.description ? 'collection-description-error' : 'collection-description-hint'}
          />
        </FormField>

        <div className="form-actions">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : submitLabel}
          </Button>
        </div>
      </form>
    </dialog>
  )
}
