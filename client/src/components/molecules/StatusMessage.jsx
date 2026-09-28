// The loading, empty, error and notice states, drawn the same way everywhere.
//
//   variant 'loading'  role="status": announced politely
//   variant 'error'    role="alert": announced immediately
//   variant 'empty'    plain panel with an optional call to action
//   variant 'notice'   role="status": confirmation such as "Item deleted"

export default function StatusMessage({ variant = 'empty', title, children, action }) {
  const role = variant === 'error' ? 'alert' : variant === 'loading' || variant === 'notice' ? 'status' : undefined

  return (
    <div className={`status-message status-${variant}`} role={role}>
      {variant === 'loading' && <span className="spinner" aria-hidden="true" />}
      <div className="status-message-body">
        {title && <p className="status-message-title">{title}</p>}
        {children && <div className="status-message-text">{children}</div>}
        {action && <div className="status-message-action">{action}</div>}
      </div>
    </div>
  )
}
