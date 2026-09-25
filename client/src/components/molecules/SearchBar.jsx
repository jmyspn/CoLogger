export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
}) {
  return (
    <div className="search-bar">
      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label="Search"
      />
    </div>
  )
}