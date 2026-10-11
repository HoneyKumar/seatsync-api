const express = require('express');
const app = express();

const events = require('./data/events');

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'SeatSync API is running' });
});

app.get('/events', (req, res) => {
  const { venue, sort } = req.query;
  let results = [...events];
  if (venue) {
    results = results.filter((event) => event.venue.toLowerCase() === venue.toLowerCase());
  }
  if (sort && sort === 'price') {
    results.sort((a, b) => a.price - b.price);
  }
  res.json(results);
});

app.get('/events/:id', (req, res) => {
  const eventId = parseInt(req.params.id, 10);
  const event = events.find((e) => e.id === eventId);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }
  res.json(event);
});

app.post('/events', (req, res) => {
  const newId = events.length ? Math.max(...events.map((e) => e.id)) + 1 : 1;
  const { name, venue, date, totalSeats, price } = req.body;
  const newEvent = { id: newId, name, venue, date, totalSeats, price };
  events.push(newEvent);
  res.status(201).json(newEvent);
});

app.put('/events/:id', (req, res) => {
  const eventId = parseInt(req.params.id, 10);

  const index = events.findIndex((e) => e.id === eventId);
  if (index === -1) {
    return res.status(404).json({ message: 'Event not found' });
  }
  const { name, venue, date, totalSeats, price } = req.body;
  const updatedEvent = { id: eventId, name, venue, date, totalSeats, price };

  events[index] = updatedEvent;
  return res.json({ message: 'Event Updated', data: updatedEvent });
});

app.delete('/events/:id', (req, res) => {
  const eventId = parseInt(req.params.id, 10);
  const index = events.findIndex((event) => event.id === eventId);
  if (index === -1) {
    return res.status(404).json({ message: 'Event not found' });
  }
  events.splice(index, 1);
  return res.status(204).send();
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
