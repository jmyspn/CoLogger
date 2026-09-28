import { Link } from 'react-router-dom'

// One button style for the whole app.
//
//   <Button onClick={save}>Save</Button>             a real <button>
//   <Button to="/collections">Collections</Button>   a router <Link> that looks
//                                                    like a button (navigation
//                                                    should be a link, so it can
//                                                    be opened in a new tab)
//
// variant: 'primary' | 'secondary' | 'danger' | 'ghost'

export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  to,
  onClick,
  disabled = false,
  className = '',
  ...rest
}) {
  const classes = `button button-${variant} ${className}`.trim()

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled} {...rest}>
      {children}
    </button>
  )
}
