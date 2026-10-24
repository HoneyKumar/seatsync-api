const pool = require('../config/db');
const { withTransaction } = require('../config/transaction');
const { DEFAULT_LIMIT, FOREIGN_KEY_VIOLATION } = require('../constants/events');
const { domainError } = require('../utils/domainError');

const FROM_EVENTS = `
  FROM events AS e
  INNER JOIN venues AS v ON v.id = e.venue_id`;

const BASE_SELECT = `
  SELECT e.id, e.name, e.venue_id, e.starts_at, e.total_seats, e.price, e.created_at,
         v.name AS venue_name, v.city
  ${FROM_EVENTS}`;

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
  const countResult = await pool.query(
    `SELECT count(*) AS total ${FROM_EVENTS} ${whereQuery}`,
    values
  );
  values.push(limitNumber);
  const limitIndex = values.length;

  values.push(offset);
  const offsetIndex = values.length;

  const result = await pool.query(
    `${BASE_SELECT} ${whereQuery} ${orderBy} LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
    values
  );

  const total = Number(countResult.rows[0].total);
  const totalPages = Math.ceil(total / limitNumber);

  return {
    data: result.rows.map((row) => toEvent(row)),
    pagination: { page: pageNumber, limit: limitNumber, total, totalPages },
  };
};

const findById = async (id) => {
  const result = await pool.query(`${BASE_SELECT} where e.id=$1`, [id]);
  return result.rows.length > 0 ? toEvent(result.rows[0]) : null;
};

const create = async (event) => {
  const { name, venueId, startsAt, totalSeats, price } = event;
  let newId;
  try {
    newId = await withTransaction(async (client) => {
      const result = await client.query(
        `INSERT INTO events (name, venue_id, starts_at, total_seats, price)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id`,
        [name, venueId, startsAt, totalSeats, price]
      );
      const id = result.rows[0].id;
      await client.query(
        'INSERT INTO seats (event_id, seat_number) SELECT $1, generate_series(1, $2)',
        [id, totalSeats]
      );
      return id;
    });
  } catch (err) {
    if (err.code === FOREIGN_KEY_VIOLATION) {
      throw domainError('VENUE_NOT_FOUND', 'venueId does not exist');
    }
    throw err;
  }
  return findById(newId);
};

const update = async (event, id) => {
  const { name, venueId, startsAt, totalSeats, price } = event;
  let result;
  try {
    result = await pool.query(
      `UPDATE events
       SET name = $1, venue_id = $2, starts_at = $3, total_seats = $4, price = $5
       WHERE id = $6`,
      [name, venueId, startsAt, totalSeats, price, id]
    );
  } catch (err) {
    if (err.code === FOREIGN_KEY_VIOLATION) {
      throw domainError('VENUE_NOT_FOUND', 'venueId does not exist');
    }
    throw err;
  }

  if (result.rowCount === 0) {
    return null;
  }
  return findById(id);
};

const remove = async (id) => {
  try {
    const result = await pool.query('DELETE FROM events WHERE id = $1', [id]);
    return result.rowCount > 0;
  } catch (err) {
    if (err.code === FOREIGN_KEY_VIOLATION) {
      throw domainError('EVENT_HAS_BOOKINGS', 'event has bookings and cannot be deleted');
    }
    throw err;
  }
};

module.exports = { findAll, findById, create, update, remove };
