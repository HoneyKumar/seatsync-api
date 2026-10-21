const events = require('../data/events');
const { validateEvent, validateEventFilters } = require('../validators/events.validator');
const eventsRepository = require('../repositories/events.repository');

const { findAll, findById } = eventsRepository;

const getAllEvents = async (req, res) => {
  const { venue, maxPrice, minPrice, from, to, search, city } = req.query;

  const { isValid, message } = validateEventFilters({
    maxPrice,
    minPrice,
    from,
    to,
  });
  if (!isValid) {
    return res.status(400).json({ message });
  }
  const results = await findAll({ venue, maxPrice, minPrice, from, to, search, city });

  res.json(results);
};

const getEventById = async (req, res) => {
  const eventId = parseInt(req.params.id, 10);
  const isValid = Number.isInteger(eventId) && eventId > 0;
  if (!isValid) {
    return res.status(400).json('id must be a positive whole number');
  }
  const foundEvent = await findById(eventId);

  if (!foundEvent) {
    return res.status(404).json({ message: 'Event not found' });
  }
  res.json(foundEvent);
};

const createEvent = (req, res) => {
  const { isValid, message } = validateEvent(req.body);
  if (!isValid) {
    return res.status(400).json({ message });
  }
  const newId = events.length ? Math.max(...events.map((event) => event.id)) + 1 : 1;
  const { name, venue, date, totalSeats, price } = req.body;
  const newEvent = { id: newId, name, venue, date, totalSeats, price };
  events.push(newEvent);
  res.status(201).json(newEvent);
};

const updateEvent = (req, res) => {
  const { isValid, message } = validateEvent(req.body);
  if (!isValid) {
    return res.status(400).json({ message });
  }
  const eventId = parseInt(req.params.id, 10);

  const index = events.findIndex((event) => event.id === eventId);
  if (index === -1) {
    return res.status(404).json({ message: 'Event not found' });
  }
  const { name, venue, date, totalSeats, price } = req.body;
  const updatedEvent = { id: eventId, name, venue, date, totalSeats, price };

  events[index] = updatedEvent;
  return res.json(updatedEvent);
};

const deleteEvent = (req, res) => {
  const eventId = parseInt(req.params.id, 10);
  const index = events.findIndex((event) => event.id === eventId);
  if (index === -1) {
    return res.status(404).json({ message: 'Event not found' });
  }
  events.splice(index, 1);
  return res.status(204).send();
};

module.exports = { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent };
