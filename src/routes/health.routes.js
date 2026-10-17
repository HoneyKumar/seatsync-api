const express = require('express');

const pool = require('../config/db');

const router = express.Router();

router.get('/db', async (req, res) => {
  let result;
  try {
    result = await pool.query('SELECT Now() as time');
  } catch (err) {
    console.error('Database health check failed:', err.message);
    return res.status(503).json({ status: 'error', message: 'Database unreachable' });
  }
  res.json({ status: 'ok', time: result.rows[0].time });
});

module.exports = router;
