// Search box. `label` is read by screen readers (the placeholder is not a
// label: it disappears as soon as you type).

export default function SearchBar({ id = 'search', value, onChange, label = 'Search', placeholder = 'Search…' }) {
  return (
    <div className="search-bar" role="search">
      <label htmlFor={id} className="visually-hidden">
        {label}
      </label>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  )
}
