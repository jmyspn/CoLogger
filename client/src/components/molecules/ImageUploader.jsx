import { useState } from 'react'
import { ACCEPT_ATTRIBUTE, resizeImage } from '../../lib/image.js'

// Pick, preview, replace or remove an item's image.
//
// The chosen file is resized in the browser (lib/image.js) and handed to the
// form as a data URL, which is saved with the item when the form is submitted.
// The file input stays in the page at all times so it can always be reached
// with the keyboard.

export default function ImageUploader({ id = 'item-image', image, itemName, onChange, error }) {
  const [processing, setProcessing] = useState(false)
  const [readError, setReadError] = useState('')
  const shownError = readError || error
  const errorId = shownError ? `${id}-error` : undefined

  async function handleFile(event) {
    const file = event.target.files?.[0]
    event.target.value = '' // allow choosing the same file again later
    if (!file) return

    setReadError('')
    setProcessing(true)
    try {
      onChange(await resizeImage(file))
    } catch (problem) {
      setReadError(problem.message)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className={`form-field image-uploader ${shownError ? 'has-error' : ''}`}>
      <span className="field-label" id={`${id}-label`}>
        Item Image
      </span>

      <div className="image-uploader-body">
        <div className="image-preview">
          {image ? (
            <img src={image} alt={itemName ? `Preview of ${itemName}` : 'Selected item preview'} />
          ) : (
            <div className="image-placeholder" aria-hidden="true">
              No image
            </div>
          )}
        </div>

        <div className="image-uploader-controls">
          {/* The real file input is visually hidden but still focusable; the
              styled label next to it is what people see and click. CSS draws
              the focus ring on the label when the input has focus. */}
          <input
            id={id}
            type="file"
            accept={ACCEPT_ATTRIBUTE}
            className="visually-hidden-file"
            onChange={handleFile}
            aria-describedby={[`${id}-hint`, errorId].filter(Boolean).join(' ')}
            disabled={processing}
          />
          <label htmlFor={id} className="button button-secondary file-button">
            {image ? 'Replace image' : 'Choose image'}
          </label>

          {image && (
            <button type="button" className="button button-ghost" onClick={() => onChange('')}>
              Remove image
            </button>
          )}

          <p id={`${id}-hint`} className="field-hint">
            {processing
              ? 'Preparing image…'
              : 'JPEG, PNG, WebP or GIF. Large photos are resized to 800 px before saving.'}
          </p>
          {shownError && (
            <p id={errorId} className="field-error" role="alert">
              {shownError}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
