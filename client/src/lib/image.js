// Turn a photo the user picked into a small image that can be saved with the item.
//
// Phone photos are often 3–10 MB. Sending and storing that for a thumbnail is
// wasteful, so the image is redrawn on a canvas at most MAX_SIZE pixels on its
// longest side and re-encoded as JPEG. The result is a data URL
// ("data:image/jpeg;base64,...") of roughly 50–200 KB, which is what the API
// stores in the items.image column. It survives refreshes because it is saved
// in the database (or, in demo mode, in this browser's storage). Unlike a
// URL.createObjectURL() link, it does not disappear when the page reloads.

const MAX_SIZE = 800
const QUALITY = 0.82
const MAX_INPUT_BYTES = 15 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export const ACCEPT_ATTRIBUTE = ACCEPTED_TYPES.join(',')

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file) // temporary, only while we read it
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('That file could not be read as an image.'))
    }
    image.src = url
  })
}

export async function resizeImage(file) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error('Choose a JPEG, PNG, WebP or GIF image.')
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error('That image is larger than 15 MB. Choose a smaller one.')
  }

  const image = await loadImage(file)
  const scale = Math.min(1, MAX_SIZE / Math.max(image.naturalWidth, image.naturalHeight))
  const width = Math.max(1, Math.round(image.naturalWidth * scale))
  const height = Math.max(1, Math.round(image.naturalHeight * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  // JPEG has no transparency; paint white so transparent PNGs do not turn black.
  context.fillStyle = '#FFFFFF'
  context.fillRect(0, 0, width, height)
  context.drawImage(image, 0, 0, width, height)

  return canvas.toDataURL('image/jpeg', QUALITY)
}
