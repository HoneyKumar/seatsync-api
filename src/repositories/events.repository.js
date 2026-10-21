const pool = require('../config/db');

const BASE_SELECT = `
  SELECT e.id, e.name, e.venue_id, e.starts_at, e.total_seats, e.price, e.created_at,
         v.name AS venue_name, v.city
  FROM events AS e
  INNER JOIN venues AS v ON v.id = e.venue_id`;

const toEvent = (row) => ({
  id: row.id,
  name: row.name,
  venueId: row.venue_id,
  startsAt: row.starts_at,
  totalSeats: row.total_seats,
  price: row.price,
  createdAt: row.created_at,
  venueName: row.venue_name,
  city: row.city,
});

const findAll = async (filters = {}) => {
  const { venue, maxPrice, minPrice, from, to, search, city } = filters;
  const conditions = [];
  const values = [];
  if (venue) {
    values.push(venue);
    conditions.push(`lower(v.name) = lower($${values.length})`);
  }
  if (maxPrice) {
    values.push(maxPrice);
    conditions.push(`e.price <= $${values.length}`);
  }
  if (minPrice) {
    values.push(minPrice);
    conditions.push(`e.price >= $${values.length}`);
  }
  if (from) {
    values.push(from);
    conditions.push(`e.starts_at >= $${values.length}`);
  }
  if (to) {
    values.push(to);
    conditions.push(`e.starts_at < $${values.length}::date + INTERVAL '1 day'`);
  }
  if (search) {
    values.push(`%${search}%`);
    conditions.push(`e.name ILIKE $${values.length}`);
  }

  if (city) {
    values.push(city);
    conditions.push(`lower(v.city) =lower($${values.length})`);
  }
  const whereQuery = values.length > 0 ? `where ${conditions.join(' AND ')}` : '';

  const result = await pool.query(`${BASE_SELECT} ${whereQuery} ORDER BY e.id`, values);

  return result.rows.map((row) => toEvent(row));
};

const findById = async (id) => {
  const result = await pool.query(`${BASE_SELECT} where e.id=$1`, [id]);
  return result.rows.length > 0 ? toEvent(result.rows[0]) : null;
};

module.exports = { findAll, findById };
