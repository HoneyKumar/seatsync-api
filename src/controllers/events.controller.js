const events = require('../data/events');
const { validateEvent, validateEventFilters } = require('../validators/events.validator');
const eventsRepository = require('../repositories/events.repository');

const { findAll, findById, create, update, remove } = eventsRepository;

// Returns the id as a number, or null if it isn't a positive whole number
const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const getAllEvents = async (req, res) => {
  const { venue, maxPrice, minPrice, from, to, search, city, sort, order, page, limit } = req.query;

  const { isValid, message } = validateEventFilters({
    maxPrice,
    minPrice,
    from,
    to,
    sort,
    order,
    page,
    limit,
  });
  if (!isValid) {
    return res.status(400).json({ message });
  }
  const { data, pagination } = await findAll({
    venue,
    maxPrice,
    minPrice,
    from,
    to,
    search,
    city,
    sort,
    order,
    page,
    limit,
  });

  res.json({
    data,
    pagination,
  });
};

const getEventById = async (req, res) => {
  const eventId = parseId(req.params.id);
  if (!eventId) {
    return res.status(400).json({ message: 'id must be a positive whole number' });
  }
  const foundEvent = await findById(eventId);

  if (!foundEvent) {
    return res.status(404).json({ message: 'Event not found' });
  }
  res.json(foundEvent);
};

const createEvent = async (req, res) => {
  const { isValid, message } = validateEvent(req.body);
  if (!isValid) {
    return res.status(400).json({ message });
  }
  const { name, venueId, startsAt, totalSeats, price } = req.body;
  const newEvent = await create({ name, venueId, startsAt, totalSeats, price });
  res.status(201).json(newEvent);
};

const updateEvent = async (req, res) => {
  const { isValid, message } = validateEvent(req.body);
  if (!isValid) {
    return res.status(400).json({ message });
  }
  const eventId = parseId(req.params.id);
  if (!eventId) {
    return res.status(400).json({ message: 'id must be a positive whole number' });
  }

  const { name, venueId, startsAt, totalSeats, price } = req.body;
  const updatedEvent = await update({ name, venueId, startsAt, totalSeats, price }, eventId);

  if (!updatedEvent) {
    return res.status(404).json({ message: 'Event not found' });
  }
  return res.json(updatedEvent);
};

const deleteEvent = async (req, res) => {
  const eventId = parseId(req.params.id);
  if (!eventId) {
    return res.status(400).json({ message: 'id must be a positive whole number' });
  }

  const deleted = await remove(eventId);
  if (!deleted) {
    return res.status(404).json({ message: 'Event not found' });
  }
  return res.status(204).send();
};

module.exports = { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent };
