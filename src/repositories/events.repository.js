const pool = require('../config/db');

const toEvent = (row) => ({
  id: row.id,
  name: row.name,
  venueId: row.venue_id,
  startsAt: row.starts_at,
  totalSeats: row.total_seats,
  price: row.price,
  createdAt: row.created_at,
});

const findAll = async () => {
  const result = await pool.query(
    'SELECT id, name,venue_id,starts_at,total_seats,price,created_at from events ORDER BY id'
  );

  return result.rows.map((row) => toEvent(row));
};

const findById = async (id) => {
  const result = await pool.query(
    `SELECT id, name,venue_id,starts_at,total_seats,price,created_at from events where id=$1`,
    [id]
  );
  return result.rows.length > 0 ? toEvent(result.rows[0]) : null;
};

module.exports = { findAll, findById };
