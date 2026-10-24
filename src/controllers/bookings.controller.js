const { validateBooking } = require('../validators/bookings.validator');
const { create } = require('../repositories/bookings.repository');
const ERROR_STATUS = { EVENT_NOT_FOUND: 404, SEATS_UNAVAILABLE: 409 };

const createBooking = async (req, res) => {
  const { isValid, message } = validateBooking(req.body);
  if (!isValid) {
    return res.status(400).json({ message });
  }
  try {
    const booking = await create(req.body);
    return res.status(201).json(booking);
  } catch (err) {
    if (ERROR_STATUS[err.code]) {
      return res.status(ERROR_STATUS[err.code]).json({ message: err.message });
    }
    throw err;
  }
};

module.exports = { createBooking };
