const express = require('express');

const eventsController = require('../controllers/events.controller');

const router = express.Router();
const { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent, getEventSeats } =
  eventsController;

router.get('/', getAllEvents);

router.get('/:id', getEventById);

router.post('/', createEvent);

router.put('/:id', updateEvent);

router.delete('/:id', deleteEvent);

router.get('/:id/seats', getEventSeats);

module.exports = router;
