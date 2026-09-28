// Label + any form control (select, textarea...) + error message.
// The control itself must set id={htmlFor} and, when there is an error,
// aria-describedby={`${htmlFor}-error`} (see ItemForm for examples).

export default function FormField({ label, htmlFor, error, hint, required = false, children }) {
  return (
    <div className={`form-field ${error ? 'has-error' : ''}`}>
      <label htmlFor={htmlFor}>
        {label}
        {required && <span className="required-mark" aria-hidden="true"> *</span>}
      </label>
      {children}
      {hint && (
        <p id={`${htmlFor}-hint`} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${htmlFor}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  )
}
