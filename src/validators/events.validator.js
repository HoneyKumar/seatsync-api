const validateEvent = (body = {}) => {
  const { name, venue, totalSeats, date, price } = body;
  if (typeof name !== 'string' || name.trim() === '') {
    return { isValid: false, message: 'name is required' };
  }
  if (typeof venue !== 'string' || venue.trim() === '') {
    return { isValid: false, message: 'venue is required' };
  }
  if (!Number.isInteger(totalSeats) || totalSeats <= 0) {
    return { isValid: false, message: 'totalSeats must be a positive whole number' };
  }
  if (isNaN(new Date(date))) {
    return { isValid: false, message: 'date must be a valid date' };
  }
  if (typeof price !== 'number' || price < 0) {
    return { isValid: false, message: 'price must be a non-negative number' };
  }
  return { isValid: true };
};

module.exports = validateEvent;
