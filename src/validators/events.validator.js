const { SORT_FIELDS, SORT_DIRECTIONS, MAX_LIMIT } = require('../constants/events');

const isPositiveWholeNumber = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0;
};

const validateEvent = (body = {}) => {
  const { name, venueId, totalSeats, startsAt, price } = body;
  if (typeof name !== 'string' || name.trim() === '') {
    return { isValid: false, message: 'name is required' };
  }
  if (!isPositiveWholeNumber(venueId)) {
    return { isValid: false, message: 'venueId must be a positive whole number' };
  }
  if (!Number.isInteger(totalSeats) || totalSeats <= 0) {
    return { isValid: false, message: 'totalSeats must be a positive whole number' };
  }
  if (typeof startsAt !== 'string' || isNaN(new Date(startsAt))) {
    return {
      isValid: false,
      message: 'startsAt must be a valid date-time, e.g. 2026-12-30T19:00:00+05:30',
    };
  }
  if (typeof price !== 'number' || price < 0) {
    return { isValid: false, message: 'price must be a non-negative number' };
  }

  return { isValid: true };
};

const isProvided = (value) => value !== undefined && value !== '';

const validateEventFilters = (filters = {}) => {
  const { minPrice, maxPrice, from, to, sort, order, page, limit } = filters;

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

  if (isProvided(sort) && !SORT_FIELDS.includes(sort)) {
    return { isValid: false, message: `sort must be one of: ${SORT_FIELDS.join(', ')}` };
  }
  if (isProvided(order) && !SORT_DIRECTIONS.includes(order)) {
    return { isValid: false, message: `order must be one of: ${SORT_DIRECTIONS.join(', ')}` };
  }

  if (isProvided(page) && !isPositiveWholeNumber(page)) {
    return { isValid: false, message: `page must be greater than or equal to 1` };
  }
  if (isProvided(limit) && (!isPositiveWholeNumber(limit) || Number(limit) > MAX_LIMIT)) {
    return { isValid: false, message: `limit must be a whole number between 1 and ${MAX_LIMIT}` };
  }
  // venue, city and search are free text: any string is a valid search
  return { isValid: true };
};

module.exports = { validateEvent, validateEventFilters };
