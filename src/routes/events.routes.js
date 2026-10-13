const express = require('express');

const eventsController = require('../controllers/events.controller');

const router = express.Router();
const { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent } = eventsController;

router.get('/', getAllEvents);

router.get('/:id', getEventById);

router.post('/', createEvent);

router.put('/:id', updateEvent);

router.delete('/:id', deleteEvent);

module.exports = router;
