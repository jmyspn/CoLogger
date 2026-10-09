// Data access for items.
//
// Items do not have a user_id of their own: an item belongs to a collection,
// and the collection belongs to a user. So every query joins collections and
// checks "c.user_id = $1". A request for someone else's item finds nothing,
// which the routes turn into a 404.

const SELECT_ITEM = `
  SELECT i.*, c.name AS collection_name
  FROM items i
  JOIN collections c ON c.id = i.collection_id
  WHERE c.user_id = $1`

const NEWEST_FIRST = 'ORDER BY i.created_at DESC, i.id DESC'

// PostgreSQL NUMERIC arrives as a string (to avoid losing precision). The
// values here are prices with two decimals, well inside what a JS number holds.
function toNumberOrNull(value) {
  return value === null || value === undefined ? null : Number(value)
}

export function toItem(row) {
  return {
    id: row.id,
    collectionId: row.collection_id,
    collectionName: row.collection_name,
    name: row.name,
    image: row.image,
    estimatedValue: toNumberOrNull(row.estimated_value),
    currency: row.currency,
    purchasePrice: toNumberOrNull(row.purchase_price),
    acquiredDate: row.acquired_date, // 'YYYY-MM-DD' or null, see db/pool.js
    acquiredFrom: row.acquired_from,
    condition: row.condition,
    notes: row.notes,
    isFavorite: row.is_favorite,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function listForCollection(pool, userId, collectionId) {
  const result = await pool.query(
    `${SELECT_ITEM} AND i.collection_id = $2 ${NEWEST_FIRST}`,
    [userId, collectionId]
  )
  return result.rows.map(toItem)
}

// Case-insensitive "name contains" search across all of a user's items.
// position() is used rather than ILIKE so that % and _ typed by the user are
// matched literally instead of acting as wildcards.
export async function search(pool, userId, text, limit = 50) {
  const result = await pool.query(
    `${SELECT_ITEM} AND position(lower($2) in lower(i.name)) > 0 ${NEWEST_FIRST} LIMIT $3`,
    [userId, text, limit]
  )
  return result.rows.map(toItem)
}

export async function listFavorites(pool, userId) {
  const result = await pool.query(`${SELECT_ITEM} AND i.is_favorite ${NEWEST_FIRST}`, [userId])
  return result.rows.map(toItem)
}

export async function recent(pool, userId, limit = 6) {
  const result = await pool.query(`${SELECT_ITEM} ${NEWEST_FIRST} LIMIT $2`, [userId, limit])
  return result.rows.map(toItem)
}

export async function getForUser(pool, userId, id) {
  const result = await pool.query(`${SELECT_ITEM} AND i.id = $2`, [userId, id])
  return result.rows[0] ? toItem(result.rows[0]) : null
}

// Returns null when the collection does not exist or belongs to someone else:
// the INSERT ... SELECT inserts nothing in that case.
export async function create(pool, userId, collectionId, value) {
  const result = await pool.query(
    `INSERT INTO items (collection_id, name, image, estimated_value, currency,
                        purchase_price, acquired_date, acquired_from, condition,
                        notes, is_favorite)
     SELECT c.id, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
     FROM collections c
     WHERE c.user_id = $1 AND c.id = $2
     RETURNING id`,
    [
      userId, collectionId, value.name, value.image, value.estimatedValue,
      value.currency, value.purchasePrice, value.acquiredDate, value.acquiredFrom,
      value.condition, value.notes, value.isFavorite,
    ]
  )
  return result.rows[0] ? getForUser(pool, userId, result.rows[0].id) : null
}

export async function update(pool, userId, id, value) {
  const result = await pool.query(
    `UPDATE items i
     SET name = $3, image = $4, estimated_value = $5, currency = $6,
         purchase_price = $7, acquired_date = $8, acquired_from = $9,
         condition = $10, notes = $11, is_favorite = $12, updated_at = now()
     FROM collections c
     WHERE c.id = i.collection_id AND c.user_id = $1 AND i.id = $2
     RETURNING i.id`,
    [
      userId, id, value.name, value.image, value.estimatedValue, value.currency,
      value.purchasePrice, value.acquiredDate, value.acquiredFrom, value.condition,
      value.notes, value.isFavorite,
    ]
  )
  return result.rowCount > 0 ? getForUser(pool, userId, id) : null
}

export async function setFavorite(pool, userId, id, isFavorite) {
  const result = await pool.query(
    `UPDATE items i
     SET is_favorite = $3, updated_at = now()
     FROM collections c
     WHERE c.id = i.collection_id AND c.user_id = $1 AND i.id = $2
     RETURNING i.id`,
    [userId, id, isFavorite]
  )
  return result.rowCount > 0 ? getForUser(pool, userId, id) : null
}

export async function remove(pool, userId, id) {
  const result = await pool.query(
    `DELETE FROM items i
     USING collections c
     WHERE c.id = i.collection_id AND c.user_id = $1 AND i.id = $2`,
    [userId, id]
  )
  return result.rowCount > 0
}

// The dashboard numbers, counted by the database rather than stored anywhere.
export async function stats(pool, userId) {
  const result = await pool.query(
    `SELECT
       (SELECT count(*)::int FROM collections WHERE user_id = $1) AS total_collections,
       count(i.id)::int AS total_items,
       count(i.id) FILTER (WHERE i.is_favorite)::int AS total_favorites
     FROM items i
     JOIN collections c ON c.id = i.collection_id
     WHERE c.user_id = $1`,
    [userId]
  )
  const row = result.rows[0]
  return {
    totalCollections: row.total_collections,
    totalItems: row.total_items,
    totalFavorites: row.total_favorites,
  }
}
