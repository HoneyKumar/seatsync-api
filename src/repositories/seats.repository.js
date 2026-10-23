const pool = require('../config/db');

const toSeat = (row) => ({
  id: row.id,
  seatNumber: row.seat_number,
  status: row.status,
});

const getSummary = async (eventId) => {
  const results = await pool.query(
    `Select count(*) as total,count(*) FILTER (WHERE status = 'booked') AS booked,count(*) FILTER (WHERE status = 'available') AS available,count(*) FILTER (WHERE status = 'held') AS held from seats Where event_id=$1`,
    [eventId]
  );
  return {
    total: Number(results.rows[0].total),
    booked: Number(results.rows[0].booked),
    available: Number(results.rows[0].available),
    held: Number(results.rows[0].held),
  };
};

const findByEventId = async (eventId) => {
  const results = await pool.query(
    'Select id,seat_number,status from seats Where event_id=$1 ORDER BY seat_number',
    [eventId]
  );

  return results.rows.map((row) => toSeat(row));
};

module.exports = { findByEventId, getSummary };
