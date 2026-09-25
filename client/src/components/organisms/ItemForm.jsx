import Input from '../atoms/Input.jsx'
import Button from '../atoms/Button.jsx'
import FavoriteButton from '../atoms/FavoriteButton.jsx'
import ImageUploader from '../molecules/ImageUploader.jsx'
import FormField from '../molecules/FormField.jsx'

export default function ItemForm({
  item,
  setItem,
  onSubmit,
  onCancel,
  submitLabel = 'Save Item',
}) {
  function updateField(field, value) {
    setItem({
      ...item,
      [field]: value,
    })
  }

  return (
    <form className="item-form" onSubmit={onSubmit}>
      <Input
        id="name"
        label="Item Name"
        value={item.name}
        onChange={(event) => updateField('name', event.target.value)}
        required
      />

      <ImageUploader
        image={item.image}
        onUpload={(event) => {
          const file = event.target.files?.[0]
          if (!file) return

          updateField('image', URL.createObjectURL(file))
        }}
        onRemove={() => updateField('image', '')}
      />

      <Input
        id="value"
        label="Estimated Value"
        type="number"
        value={item.value}
        onChange={(event) => updateField('value', event.target.value)}
      />

      <FormField label="Currency" htmlFor="currency">
        <select
          id="currency"
          value={item.currency}
          onChange={(event) => updateField('currency', event.target.value)}
        >
          <option value="PHP">PHP</option>
          <option value="USD">USD</option>
        </select>
      </FormField>

      <Input
        id="purchasePrice"
        label="Purchase Price"
        type="number"
        value={item.purchasePrice}
        onChange={(event) => updateField('purchasePrice', event.target.value)}
      />

      <Input
        id="acquiredDate"
        label="Acquired Date"
        type="date"
        value={item.acquiredDate}
        onChange={(event) => updateField('acquiredDate', event.target.value)}
      />

      <Input
        id="acquiredFrom"
        label="Acquired From"
        value={item.acquiredFrom}
        onChange={(event) => updateField('acquiredFrom', event.target.value)}
      />

      <FormField label="Condition" htmlFor="condition">
        <select
          id="condition"
          value={item.condition}
          onChange={(event) => updateField('condition', event.target.value)}
        >
          <option value="">Select condition</option>
          <option value="New">New</option>
          <option value="Like New">Like New</option>
          <option value="Good">Good</option>
          <option value="Fair">Fair</option>
          <option value="Poor">Poor</option>
        </select>
      </FormField>

      <FormField label="Notes" htmlFor="notes">
        <textarea
          id="notes"
          rows="4"
          value={item.notes}
          onChange={(event) => updateField('notes', event.target.value)}
        />
      </FormField>

      <div className="favorite-field">
        <span>Favorite</span>
        <FavoriteButton
          isFavorite={item.isFavorite}
          onToggle={() => updateField('isFavorite', !item.isFavorite)}
        />
      </div>

      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>

        <Button type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}