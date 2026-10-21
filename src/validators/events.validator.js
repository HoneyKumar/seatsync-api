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

const isProvided = (value) => value !== undefined && value !== '';

const validateEventFilters = (filters = {}) => {
  const { minPrice, maxPrice, from, to } = filters;

  if (isProvided(minPrice)) {
    const min = Number(minPrice);
    if (Number.isNaN(min) || min < 0) {
      return { isValid: false, message: 'minPrice must be a number greater than or equal to 0' };
    }
  }

  if (isProvided(maxPrice)) {
    const max = Number(maxPrice);
    if (Number.isNaN(max) || max < 0) {
      return { isValid: false, message: 'maxPrice must be a number greater than or equal to 0' };
    }
  }

  if (isProvided(from) && Number.isNaN(new Date(from).getTime())) {
    return { isValid: false, message: 'from must be a valid date (YYYY-MM-DD)' };
  }

  if (isProvided(to) && Number.isNaN(new Date(to).getTime())) {
    return { isValid: false, message: 'to must be a valid date (YYYY-MM-DD)' };
  }

  if (isProvided(minPrice) && isProvided(maxPrice) && Number(minPrice) > Number(maxPrice)) {
    return { isValid: false, message: 'minPrice cannot be greater than maxPrice' };
  }

  if (isProvided(from) && isProvided(to) && new Date(from) > new Date(to)) {
    return { isValid: false, message: 'from cannot be later than to' };
  }

  // venue, city and search are free text: any string is a valid search
  return { isValid: true };
};

module.exports = { validateEvent, validateEventFilters };
