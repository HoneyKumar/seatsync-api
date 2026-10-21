require('dotenv').config();

const pool = require('../src/config/db');

async function seed() {
  // Safety guard: this script wipes all data, so never run it against production
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed a production database');
  }

  // One connection for the whole seed, so everything runs in a single transaction
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Clear old data so the seed can be run again and again.
    //    RESTART IDENTITY resets ids back to 1; CASCADE also empties dependent tables.
    await client.query(`
      TRUNCATE booking_seats, bookings, seats, customers, events, venues
      RESTART IDENTITY CASCADE
    `);

    // 2. Venues: one multi-row INSERT instead of three separate statements
    await client.query(`
      INSERT INTO venues (name, city) VALUES
        ('City Arena',    'Mumbai'),
        ('Downtown Club', 'Delhi'),
        ('Grand Theater', 'Bengaluru')
    `);

    // 3. Events: each venue_id is looked up by name with a subquery,
    //    so the seed doesn't depend on venues getting ids 1, 2, 3
    await client.query(`
      INSERT INTO events (name, venue_id, starts_at, total_seats, price) VALUES
        ('Rock Concert',
          (SELECT id FROM venues WHERE name = 'City Arena'),
          '2026-12-20 19:00+05:30', 50, 999.00),
        ('Comedy Night',
          (SELECT id FROM venues WHERE name = 'City Arena'),
          '2026-12-27 20:00+05:30', 30, 299.00),
        ('Jazz Night',
          (SELECT id FROM venues WHERE name = 'Downtown Club'),
          '2026-12-22 21:00+05:30', 40, 499.00),
        ('Classical Music Evening',
          (SELECT id FROM venues WHERE name = 'Grand Theater'),
          '2026-12-25 18:30+05:30', 60, 799.00),
        ('Indie Film Screening',
          (SELECT id FROM venues WHERE name = 'Grand Theater'),
          '2027-01-10 17:00+05:30', 25, 0.00)
    `);

    // 4. Customers
    await client.query(`
      INSERT INTO customers (name, email) VALUES
        ('Asha Verma', 'asha@example.com'),
        ('Rohan Mehta', 'rohan@example.com'),
        ('Neha Kapoor', 'neha@example.com')
    `);

    // 5. Seats for ALL events in ONE statement (set-based, no JavaScript loop).
    //    generate_series(1, total_seats) produces one row per seat number,
    //    and INSERT ... SELECT inserts the query result directly.
    await client.query(`
      INSERT INTO seats (event_id, seat_number)
      SELECT e.id, generate_series(1, e.total_seats)
      FROM events e
    `);

    // 6. Summary counts. pg returns count(*) as a string (bigint), so convert for display.
    const { rows } = await client.query(`
      SELECT
        (SELECT count(*) FROM venues)    AS venues,
        (SELECT count(*) FROM events)    AS events,
        (SELECT count(*) FROM seats)     AS seats,
        (SELECT count(*) FROM customers) AS customers
    `);

    await client.query('COMMIT');

    const counts = rows[0];
    console.log(
      `Seeded ${counts.venues} venues, ${counts.events} events, ` +
        `${counts.seats} seats, ${counts.customers} customers`
    );
  } catch (err) {
    await client.query('ROLLBACK'); // nothing is half-seeded if anything fails
    throw err;
  } finally {
    client.release(); // always give the connection back to the pool
  }
}

seed()
  .catch((err) => {
    console.error(`Seed failed: ${err.message}`);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
