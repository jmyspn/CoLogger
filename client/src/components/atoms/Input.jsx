// A labelled text input with an optional hint and error message.
//
// The label is tied to the input with htmlFor/id, and the error is announced
// through aria-invalid + aria-describedby, so screen readers read it out.
// Any extra props (min, step, maxLength, autoComplete...) go to the <input>.

export default function Input({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  hint,
  required = false,
  ...rest
}) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={`form-field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>
        {label}
        {required && <span className="required-mark" aria-hidden="true"> *</span>}
      </label>

      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        {...rest}
      />

      {hint && (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  )
}
