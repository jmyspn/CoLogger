// Data access for collections.

const SELECT_COLLECTION = `
  SELECT c.id, c.name, c.description, c.image, c.created_at, c.updated_at,
         (SELECT count(*)::int FROM items i WHERE i.collection_id = c.id) AS item_count
  FROM collections c
  WHERE c.user_id = $1`

export function toCollection(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    itemCount: row.item_count,
    coverImage: row.image ?? '',
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

export async function create(pool, userId, { name, description, image }) {
  const result = await pool.query(
    `INSERT INTO collections (user_id, name, description, image)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [userId, name, description, image]
  )
  return getForUser(pool, userId, result.rows[0].id)
}

export async function update(pool, userId, id, { name, description, image }) {
  const result = await pool.query(
    `UPDATE collections
     SET name = $3, description = $4, image = $5, updated_at = now()
     WHERE user_id = $1 AND id = $2
     RETURNING id`,
    [userId, id, name, description, image]
  )
  return result.rowCount > 0 ? getForUser(pool, userId, id) : null
}

export async function remove(pool, userId, id) {
  const result = await pool.query(
    'DELETE FROM collections WHERE user_id = $1 AND id = $2',
    [userId, id]
  )
  return result.rowCount > 0
}
