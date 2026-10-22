const pool = require('../config/db');
const { DEFAULT_LIMIT } = require('../constants/events');

const BASE_SELECT = `
  SELECT e.id, e.name, e.venue_id, e.starts_at, e.total_seats, e.price, e.created_at,
         v.name AS venue_name, v.city
  FROM events AS e
  INNER JOIN venues AS v ON v.id = e.venue_id`;

const SORT_COLUMNS = new Map([
  ['date', 'e.starts_at'],
  ['price', 'e.price'],
  ['name', 'e.name'],
]);

const SORT_DIRECTIONS = new Map([
  ['asc', 'ASC'],
  ['desc', 'DESC'],
]);

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
  const { venue, maxPrice, minPrice, from, to, search, city, sort, order, limit, page } = filters;
  const conditions = [];
  const values = [];
  const limitNumber = Number(limit) || DEFAULT_LIMIT;
  const pageNumber = Number(page) || 1;
  const offset = (pageNumber - 1) * limitNumber;
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

  const column = SORT_COLUMNS.get(sort) ?? 'e.starts_at';
  const direction = SORT_DIRECTIONS.get(order) ?? 'ASC';
  const orderBy = `ORDER BY ${column} ${direction}, e.id`;

  const whereQuery = values.length > 0 ? `where ${conditions.join(' AND ')}` : '';

  values.push(limitNumber);
  const limitIndex = values.length;

  values.push(offset);
  const offsetIndex = values.length;
  const result = await pool.query(
    `${BASE_SELECT} ${whereQuery} ${orderBy} LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
    values
  );

  return result.rows.map((row) => toEvent(row));
};

const findById = async (id) => {
  const result = await pool.query(`${BASE_SELECT} where e.id=$1`, [id]);
  return result.rows.length > 0 ? toEvent(result.rows[0]) : null;
};

module.exports = { findAll, findById };
