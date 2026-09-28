// Data access for collections.
//
// Every query includes "user_id = $1", so a user can only ever read or change
// their own collections. The ownership check is part of the query itself, not
// an if-statement that someone could forget to write.
//
// itemCount and coverImage are not stored: they are calculated from the items
// table each time, so they can never drift out of date.

const SELECT_COLLECTION = `
  SELECT c.id, c.name, c.description, c.created_at, c.updated_at,
         (SELECT count(*)::int FROM items i WHERE i.collection_id = c.id) AS item_count,
         (SELECT i.image FROM items i
           WHERE i.collection_id = c.id AND i.image <> ''
           ORDER BY i.created_at DESC, i.id DESC
           LIMIT 1) AS cover_image
  FROM collections c
  WHERE c.user_id = $1`

export function toCollection(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    itemCount: row.item_count,
    coverImage: row.cover_image ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function listForUser(pool, userId) {
  const result = await pool.query(
    `${SELECT_COLLECTION} ORDER BY lower(c.name), c.id`,
    [userId]
  )
  return result.rows.map(toCollection)
}

export async function getForUser(pool, userId, id) {
  const result = await pool.query(`${SELECT_COLLECTION} AND c.id = $2`, [userId, id])
  return result.rows[0] ? toCollection(result.rows[0]) : null
}

export async function create(pool, userId, { name, description }) {
  const result = await pool.query(
    `INSERT INTO collections (user_id, name, description)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [userId, name, description]
  )
  return getForUser(pool, userId, result.rows[0].id)
}

export async function update(pool, userId, id, { name, description }) {
  const result = await pool.query(
    `UPDATE collections
     SET name = $3, description = $4, updated_at = now()
     WHERE user_id = $1 AND id = $2
     RETURNING id`,
    [userId, id, name, description]
  )
  return result.rowCount > 0 ? getForUser(pool, userId, id) : null
}

// Deleting a collection also deletes its items (ON DELETE CASCADE in schema.sql).
export async function remove(pool, userId, id) {
  const result = await pool.query(
    'DELETE FROM collections WHERE user_id = $1 AND id = $2',
    [userId, id]
  )
  return result.rowCount > 0
}
