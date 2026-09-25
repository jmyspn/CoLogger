export default function ImageUploader({
  image,
  onUpload,
  onRemove,
}) {
  return (
    <div className="image-uploader">
      <label htmlFor="item-image">Item Image</label>

      {image ? (
        <div className="image-preview">
          <img src={image} alt="Selected item preview" />

          <button type="button" onClick={onRemove}>
            Remove Image
          </button>
        </div>
      ) : (
        <input
          id="item-image"
          type="file"
          accept="image/*"
          onChange={onUpload}
        />
      )}
    </div>
  )
}