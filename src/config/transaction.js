const pool = require('./db');

const withTransaction = async (work) => {
  const client = await pool.connect(); // borrow ONE connection
  try {
    await client.query('BEGIN');
    const result = await work(client); // run the caller's queries on this client
    await client.query('COMMIT'); // save everything together
    return result; // hand back whatever `work` returned
  } catch (err) {
    await client.query('ROLLBACK'); // undo everything since BEGIN
    throw err; // let the caller handle the error
  } finally {
    client.release(); // always return the connection
  }
};

module.exports = { withTransaction };
