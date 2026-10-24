const { isPositiveWholeNumber, isValidEmail } = require('../utils/validation');

const validateBooking = (body = {}) => {
  const { eventId, customer, seatIds } = body;
  if (!isPositiveWholeNumber(eventId)) {
    return { isValid: false, message: 'eventId must be a positive whole number' };
  }
  if (!customer || typeof customer !== 'object') {
    return { isValid: false, message: 'customer is required' };
  }
  if (typeof customer.name !== 'string' || customer.name.trim() === '') {
    return { isValid: false, message: 'customer.name is required' };
  }
  if (!isValidEmail(customer.email)) {
    return { isValid: false, message: 'customer.email must be a valid email' };
  }

  if (!Array.isArray(seatIds) || seatIds.length === 0) {
    return { isValid: false, message: 'seatIds must be a non-empty array' };
  }
  if (!seatIds.every(isPositiveWholeNumber)) {
    return { isValid: false, message: 'each seatId must be a positive whole number' };
  }
  if (new Set(seatIds).size !== seatIds.length) {
    return { isValid: false, message: 'seatIds must not contain duplicates' };
  }
  return { isValid: true };
};

module.exports = { validateBooking };
