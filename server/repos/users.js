// Data access for the users table. Every query is parameterised: values go in
// the array, never into the SQL string.

export function toPublicUser(row) {
  // Never send password_hash to the client, not even to its owner.
  return { id: row.id, name: row.name, email: row.email }
}

export async function findByEmail(pool, email) {
  const result = await pool.query(
    'SELECT * FROM users WHERE lower(email) = lower($1)',
    [email]
  )
  return result.rows[0] ?? null
}

export async function create(pool, { name, email, passwordHash }) {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, email, passwordHash]
  )
  return result.rows[0]
}
