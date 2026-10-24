const { withTransaction } = require('../config/transaction');
const { UNIQUE_VIOLATION } = require('../constants/db');
const { domainError } = require('../utils/domainError');
const { SEAT_STATUS } = require('../constants/seats');

const create = async ({ eventId, customer, seatIds }) => {
  try {
    return await withTransaction(async (client) => {
      const customerDetails = await client.query(
        `INSERT into customers (name, email) Values($1,$2) On CONFLICT ((lower(email))) DO UPDATE set name=Excluded.name Returning id`,
        [customer.name.trim(), customer.email]
      );
      const eventDetails = await client.query('Select id from events where id=$1', [eventId]);
      if (eventDetails.rows.length === 0) {
        throw domainError('EVENT_NOT_FOUND', 'event does not exist');
      }
      const availableSeats = await client.query(
        `Select id from seats where event_id=$1 and status=$2 AND id=ANY($3)`,
        [eventId, SEAT_STATUS.AVAILABLE, seatIds]
      );
      if (availableSeats.rows.length !== seatIds.length) {
        throw domainError('SEATS_UNAVAILABLE', 'one or more seats are unavailable');
      }

      const bookingDetails = await client.query(
        `INSERT INTO bookings (customer_id, event_id, total_amount) SELECT $1, id, price * $3 FROM events WHERE id = $2 RETURNING id, status, total_amount, created_at`,
        [customerDetails.rows[0].id, eventId, seatIds.length]
      );

      await client.query(
        `INSERT INTO booking_seats (booking_id, seat_id) SELECT $1, unnest($2::int[])`,
        [bookingDetails.rows[0].id, seatIds]
      );
      await client.query(`Update seats SET status = $1 where id=ANY($2)`, [
        SEAT_STATUS.BOOKED,
        seatIds,
      ]);
      return {
        id: bookingDetails.rows[0].id,
        eventId: eventId,
        customerId: customerDetails.rows[0].id,
        seatIds: seatIds,
        status: bookingDetails.rows[0].status,
        totalAmount: Number(bookingDetails.rows[0].total_amount),
        createdAt: bookingDetails.rows[0].created_at,
      };
    });
  } catch (err) {
    if (err.code === UNIQUE_VIOLATION) {
      throw domainError('SEATS_UNAVAILABLE', 'one or more seats are unavailable');
    }
    throw err;
  }
};

module.exports = { create };
